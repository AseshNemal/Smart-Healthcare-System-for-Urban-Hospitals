/**
 * Patient Medical Records API Tests
 * Covers GET (authorization, skeleton creation), POST (add consultation), and PUT (update record)
 */

// Mock Next.js server APIs similar to existing tests
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: (body: any, init?: { status?: number }) => {
        return {
          status: (init && init.status) || 200,
          json: async () => body,
        } as any;
      },
    },
  } as any;
});

// Mock DB connection
jest.mock('@/lib/mongodb', () => jest.fn().mockResolvedValue(undefined));

// Mock models with constructor behavior for MedicalRecord and static methods
const mockSave = jest.fn();
const mockAuditCreate = jest.fn();
const mockPatientFindOne = jest.fn();
const mockPatientFindById = jest.fn();
const mockPatientCreate = jest.fn();
const mockMRFindOne = jest.fn();
const mockMRFindOneAndUpdate = jest.fn();

jest.mock('@/models', () => {
  // Constructor-like mock for MedicalRecord used with `new`
  const MedicalRecord = function (this: any, init: any) {
    Object.assign(this, init);
    this.consultations = this.consultations || [];
    // Provide a fake ObjectId so route can use toString()
    this._id = this._id || '64f1f77bcf86cd799439099';
    this.save = mockSave;
  } as any;
  // Attach static methods used by the route
  (MedicalRecord as any).findOne = (...args: any[]) => mockMRFindOne(...args);
  (MedicalRecord as any).findOneAndUpdate = (...args: any[]) => mockMRFindOneAndUpdate(...args);

  return {
    MedicalRecord,
    Patient: {
      findOne: (...args: any[]) => mockPatientFindOne(...args),
      findById: (...args: any[]) => mockPatientFindById(...args),
      create: (...args: any[]) => mockPatientCreate(...args),
    },
    AuditLog: {
      create: (...args: any[]) => mockAuditCreate(...args),
    },
  };
});

describe('Medical Records API', () => {
  const baseUrl = 'http://localhost/api/medical-records';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/medical-records', () => {
    it('returns 400 when no email or patientId is provided', async () => {
      const { GET } = require('@/app/api/medical-records/route');
      const req: any = { url: baseUrl }; // no query params
      const res = await GET(req);
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.error).toMatch(/Email or Patient ID required/i);
    });

    it('returns 403 when requestedBy does not match email', async () => {
      const { GET } = require('@/app/api/medical-records/route');
      const req: any = { url: `${baseUrl}?email=a@x.com&requestedBy=b@x.com` };
      const res = await GET(req);
      const data = await res.json();
      expect(res.status).toBe(403);
      expect(data.error).toMatch(/Unauthorized/i);
    });

    it('returns skeleton record when no record exists but patient exists', async () => {
      const { GET } = require('@/app/api/medical-records/route');
      // No record found
      (mockMRFindOne as jest.Mock).mockReturnValue({
        populate: () => ({
          lean: async () => null,
        }),
      });
      // Patient exists
      (mockPatientFindOne as jest.Mock).mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        email: 'john@example.com',
        name: 'John Doe',
      });

      const req: any = { url: `${baseUrl}?email=john@example.com&requestedBy=john@example.com` };
      const res = await GET(req);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.patientEmail).toBe('john@example.com');
      expect(Array.isArray(data.consultations)).toBe(true);
      expect(Array.isArray(data.allergies)).toBe(true);
    });

    it('returns 404 when no record and patient not found', async () => {
      const { GET } = require('@/app/api/medical-records/route');
      (mockMRFindOne as jest.Mock).mockReturnValue({
        populate: () => ({ lean: async () => null }),
      });
      (mockPatientFindOne as jest.Mock).mockResolvedValue(null);

      const req: any = { url: `${baseUrl}?email=ghost@example.com&requestedBy=ghost@example.com` };
      const res = await GET(req);
      const data = await res.json();
      expect(res.status).toBe(404);
      expect(data.error).toMatch(/Patient not found/i);
    });

    it('returns 200 with record when record exists', async () => {
      const { GET } = require('@/app/api/medical-records/route');
      const record = {
        _id: '64f1f77bcf86cd799439099',
        patientId: '507f1f77bcf86cd799439011',
        patientEmail: 'john@example.com',
        patientName: 'John Doe',
        consultations: [],
        allergies: ['Peanuts'],
      };
      (mockMRFindOne as jest.Mock).mockReturnValue({
        populate: () => ({
          lean: async () => record,
        }),
      });

      const req: any = { url: `${baseUrl}?email=john@example.com&requestedBy=john@example.com` };
      const res = await GET(req);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.patientEmail).toBe('john@example.com');
      expect(data._id).toBe(record._id);
    });
  });

  describe('POST /api/medical-records', () => {
    it('returns 400 when required fields are missing', async () => {
      const { POST } = require('@/app/api/medical-records/route');
      const req: any = { json: async () => ({}) };
      const res = await POST(req);
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.error).toMatch(/Missing required fields/i);
    });

    it('returns 400 when consultation lacks symptoms and observations', async () => {
      const { POST } = require('@/app/api/medical-records/route');
      const req: any = {
        json: async () => ({
          patientEmail: 'john@example.com',
          doctorId: '507f1f77bcf86cd799439022',
          doctorName: 'Dr. House',
          consultation: { symptoms: '', observations: '' },
        }),
      };
      const res = await POST(req);
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.error).toMatch(/must include symptoms or observations/i);
    });

    it('creates new patient and record when not existing, adds consultation, logs audit', async () => {
      const { POST } = require('@/app/api/medical-records/route');
      // Patient not found initially -> created
      (mockPatientFindOne as jest.Mock).mockResolvedValue(null);
      (mockPatientCreate as jest.Mock).mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        email: 'john@example.com',
        name: 'john',
      });
      // No medical record initially
      (mockMRFindOne as jest.Mock).mockResolvedValue(null);
      // Save succeeds
      (mockSave as jest.Mock).mockResolvedValue(undefined);
      // Audit log created
      (mockAuditCreate as jest.Mock).mockResolvedValue(undefined);

      const req: any = {
        json: async () => ({
          patientEmail: 'john@example.com',
          doctorId: '507f1f77bcf86cd799439022',
          doctorName: 'Dr. House',
          consultation: {
            symptoms: 'Fever and cough',
            observations: 'High temp',
            vitalSigns: { temperature: '101F' },
            diagnoses: [{ condition: 'Flu', severity: 'Mild', notes: '' }],
            prescriptions: [{ medicineName: 'Paracetamol', dosage: '500mg', frequency: 'TID', duration: '5d' }],
          },
        }),
      };
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.message).toMatch(/Consultation added successfully/i);
      expect(mockPatientCreate).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(mockAuditCreate).toHaveBeenCalled();
    });
  });

  describe('PUT /api/medical-records', () => {
    it('returns 400 when patientEmail or updates missing', async () => {
      const { PUT } = require('@/app/api/medical-records/route');
      const req1: any = { json: async () => ({ updates: { allergies: ['Dust'] } }) };
      const res1 = await PUT(req1);
      const data1 = await res1.json();
      expect(res1.status).toBe(400);
      expect(data1.error).toMatch(/Missing required fields/i);

      const req2: any = { json: async () => ({ patientEmail: 'john@example.com' }) };
      const res2 = await PUT(req2);
      const data2 = await res2.json();
      expect(res2.status).toBe(400);
      expect(data2.error).toMatch(/Missing required fields/i);
    });

    it('returns 404 when record to update is not found', async () => {
      const { PUT } = require('@/app/api/medical-records/route');
      (mockMRFindOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const req: any = { json: async () => ({ patientEmail: 'ghost@example.com', updates: { allergies: ['Dust'] } }) };
      const res = await PUT(req);
      const data = await res.json();
      expect(res.status).toBe(404);
      expect(data.error).toMatch(/not found/i);
    });

    it('updates record and logs audit when doctor info provided', async () => {
      const { PUT } = require('@/app/api/medical-records/route');
      const updated = { _id: '64f1', patientEmail: 'john@example.com', allergies: ['Dust'] };
      (mockMRFindOneAndUpdate as jest.Mock).mockResolvedValue(updated);
      (mockAuditCreate as jest.Mock).mockResolvedValue(undefined);

      const req: any = {
        json: async () => ({
          patientEmail: 'john@example.com',
          updates: { allergies: ['Dust'] },
          doctorId: '507f1f77bcf86cd799439022',
          doctorName: 'Dr. House',
        }),
      };
      const res = await PUT(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toMatch(/updated successfully/i);
      expect(data.record).toEqual(updated);
      expect(mockAuditCreate).toHaveBeenCalled();
    });
  });
});
