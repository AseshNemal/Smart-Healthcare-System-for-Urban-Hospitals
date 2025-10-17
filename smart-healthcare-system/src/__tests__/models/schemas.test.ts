/**
 * Unit Tests for Mongoose Models
 * Tests schema validation and model functionality
 */

describe('Mongoose Models', () => {
  describe('Doctor Model', () => {
    it('should require name field', () => {
      const { Doctor } = require('@/models');
      const doctor = new Doctor({
        specialty: 'Cardiology',
        email: 'doctor@test.com',
      });

      const error = doctor.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.name.message).toContain('required');
    });

    it('should require specialty field', () => {
      const { Doctor } = require('@/models');
      const doctor = new Doctor({
        name: 'Dr. Test',
        email: 'doctor@test.com',
      });

      const error = doctor.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.specialty).toBeDefined();
    });

    it('should create valid doctor with all required fields', () => {
      const { Doctor } = require('@/models');
      const doctor = new Doctor({
        name: 'Dr. Test',
        specialty: 'Cardiology',
        email: 'doctor@test.com',
        userId: 'firebase-uid-123',
      });

      const error = doctor.validateSync();
      expect(error).toBeUndefined();
      expect(doctor.name).toBe('Dr. Test');
      expect(doctor.specialty).toBe('Cardiology');
    });
  });

  describe('Appointment Model', () => {
    it('should require all mandatory fields', () => {
      const { Appointment } = require('@/models');
      const appointment = new Appointment({});

      const error = appointment.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.doctorId).toBeDefined();
      expect(error.errors.patientName).toBeDefined();
      expect(error.errors.patientEmail).toBeDefined();
      expect(error.errors.date).toBeDefined();
      expect(error.errors.timeSlot).toBeDefined();
      expect(error.errors.service).toBeDefined();
    });

    it('should only accept valid service types', () => {
      const { Appointment } = require('@/models');
      const appointment = new Appointment({
        doctorId: '507f1f77bcf86cd799439011',
        patientName: 'John Doe',
        patientEmail: 'john@test.com',
        date: new Date(),
        timeSlot: '10:00 AM',
        service: 'Invalid Service',
      });

      const error = appointment.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.service).toBeDefined();
    });

    it('should set default values for optional fields', () => {
      const { Appointment } = require('@/models');
      const appointment = new Appointment({
        doctorId: '507f1f77bcf86cd799439011',
        patientName: 'John Doe',
        patientEmail: 'john@test.com',
        date: new Date(),
        timeSlot: '10:00 AM',
        service: 'Consultation',
      });

      expect(appointment.paymentStatus).toBe(false);
      expect(appointment.deleted).toBe(false);
    });
  });

  describe('Patient Model', () => {
    it('should validate blood group enum', () => {
      const { Patient } = require('@/models');
      const patient = new Patient({
        name: 'Jane Doe',
        email: 'jane@test.com',
        phone: '1234567890',
        dateOfBirth: new Date('1990-01-01'),
        bloodGroup: 'Invalid',
      });

      const error = patient.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.bloodGroup).toBeDefined();
    });

    it('should accept valid blood group', () => {
      const { Patient } = require('@/models');
      const patient = new Patient({
        name: 'Jane Doe',
        email: 'jane@test.com',
        phone: '1234567890',
        dateOfBirth: new Date('1990-01-01'),
        bloodGroup: 'A+',
        gender: 'Female',
      });

      const error = patient.validateSync();
      expect(error).toBeUndefined();
      expect(patient.bloodGroup).toBe('A+');
    });

    it('should require unique email', () => {
      const { Patient } = require('@/models');
      const patient = new Patient({
        name: 'Jane Doe',
        email: 'jane@test.com',
        phone: '1234567890',
        dateOfBirth: new Date('1990-01-01'),
      });

      expect(patient.schema.path('email').options.unique).toBe(true);
    });
  });

  describe('Payment Model', () => {
    it('should require all mandatory payment fields', () => {
      const { Payment } = require('@/models');
      const payment = new Payment({});

      const error = payment.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.appointmentId).toBeDefined();
      expect(error.errors.amount).toBeDefined();
      expect(error.errors.transactionId).toBeDefined();
    });

    it('should validate payment method enum', () => {
      const { Payment } = require('@/models');
      const payment = new Payment({
        appointmentId: '507f1f77bcf86cd799439011',
        patientName: 'John Doe',
        patientEmail: 'john@test.com',
        doctorId: '507f1f77bcf86cd799439011',
        doctorName: 'Dr. Smith',
        service: 'Consultation',
        appointmentDate: new Date(),
        amount: 1500,
        paymentMethod: 'invalid-method',
        transactionId: 'TXN123',
      });

      const error = payment.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.paymentMethod).toBeDefined();
    });

    it('should set default currency to Rs.', () => {
      const { Payment } = require('@/models');
      const payment = new Payment({
        appointmentId: '507f1f77bcf86cd799439011',
        patientName: 'John Doe',
        patientEmail: 'john@test.com',
        doctorId: '507f1f77bcf86cd799439011',
        doctorName: 'Dr. Smith',
        service: 'Consultation',
        appointmentDate: new Date(),
        amount: 1500,
        paymentMethod: 'credit-card',
        transactionId: 'TXN123',
      });

      expect(payment.currency).toBe('Rs.');
      expect(payment.paymentStatus).toBe('completed');
    });
  });

  describe('Admin Model', () => {
    it('should require email, name, and passwordHash', () => {
      const { Admin } = require('@/models');
      const admin = new Admin({});

      const error = admin.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.passwordHash).toBeDefined();
    });

    it('should require unique email', () => {
      const { Admin } = require('@/models');
      const admin = new Admin({
        email: 'admin@test.com',
        name: 'Admin',
        passwordHash: 'hashed',
      });

      expect(admin.schema.path('email').options.unique).toBe(true);
    });
  });
});
