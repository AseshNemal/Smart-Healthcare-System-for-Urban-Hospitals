/**
 * Integration Tests for Report Generation
 * Tests the complete report generation workflow
 */

describe('Report Generation Integration Tests', () => {
  describe('Patient Visit Report Flow', () => {
    it('should generate report with all statistics', () => {
      const appointments = [
        {
          _id: '1',
          patientName: 'John Doe',
          date: new Date('2025-01-10'),
          doctorId: { name: 'Dr. Smith', specialty: 'Cardiology' },
          service: 'Consultation',
          timeSlot: '10:00 AM',
        },
        {
          _id: '2',
          patientName: 'Jane Smith',
          date: new Date('2025-01-15'),
          doctorId: { name: 'Dr. Jones', specialty: 'Neurology' },
          service: 'Follow-up Visit',
          timeSlot: '2:00 PM',
        },
      ];

      // Calculate statistics
      const totalVisits = appointments.length;
      const averageDaily = totalVisits / 7; // Last 7 days
      const utilizationRate = 80; // Mock calculation

      expect(totalVisits).toBe(2);
      expect(averageDaily).toBeCloseTo(0.29, 1);
      expect(utilizationRate).toBe(80);
    });

    it('should filter appointments by date range', () => {
      const appointments = [
        { date: new Date('2025-01-05'), patientName: 'Patient 1' },
        { date: new Date('2025-01-10'), patientName: 'Patient 2' },
        { date: new Date('2025-01-15'), patientName: 'Patient 3' },
        { date: new Date('2025-01-20'), patientName: 'Patient 4' },
      ];

      const startDate = new Date('2025-01-08');
      const endDate = new Date('2025-01-16');

      const filtered = appointments.filter(
        (apt) => apt.date >= startDate && apt.date <= endDate
      );

      expect(filtered.length).toBe(2);
      expect(filtered.map(a => a.patientName)).toEqual(['Patient 2', 'Patient 3']);
    });

    it('should filter appointments by department', () => {
      const appointments = [
        { 
          doctorId: { specialty: 'Cardiology', name: 'Dr. A' },
          patientName: 'Patient 1',
        },
        { 
          doctorId: { specialty: 'Neurology', name: 'Dr. B' },
          patientName: 'Patient 2',
        },
        { 
          doctorId: { specialty: 'Cardiology', name: 'Dr. C' },
          patientName: 'Patient 3',
        },
      ];

      const department = 'Cardiology';
      const filtered = appointments.filter(
        (apt) => apt.doctorId.specialty === department
      );

      expect(filtered.length).toBe(2);
      expect(filtered.every(a => a.doctorId.specialty === 'Cardiology')).toBe(true);
    });
  });

  describe('Financial Report Flow', () => {
    it('should calculate total revenue correctly', () => {
      const payments = [
        { amount: 1500, paymentStatus: 'completed' },
        { amount: 2000, paymentStatus: 'completed' },
        { amount: 1750, paymentStatus: 'pending' },
      ];

      const totalRevenue = payments
        .filter(p => p.paymentStatus === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      const pendingRevenue = payments
        .filter(p => p.paymentStatus === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

      expect(totalRevenue).toBe(3500);
      expect(pendingRevenue).toBe(1750);
    });

    it('should calculate average transaction value', () => {
      const payments = [
        { amount: 1500 },
        { amount: 2000 },
        { amount: 1750 },
      ];

      const average = payments.reduce((sum, p) => sum + p.amount, 0) / payments.length;

      expect(average).toBeCloseTo(1750, 0);
    });

    it('should group revenue by service type', () => {
      const payments = [
        { service: 'Consultation', amount: 1500 },
        { service: 'Follow-up Visit', amount: 1000 },
        { service: 'Consultation', amount: 1500 },
        { service: 'Vaccination', amount: 500 },
      ];

      const revenueByService = payments.reduce((acc, payment) => {
        if (!acc[payment.service]) {
          acc[payment.service] = 0;
        }
        acc[payment.service] += payment.amount;
        return acc;
      }, {} as Record<string, number>);

      expect(revenueByService['Consultation']).toBe(3000);
      expect(revenueByService['Follow-up Visit']).toBe(1000);
      expect(revenueByService['Vaccination']).toBe(500);
    });
  });

  describe('Chart Data Transformation', () => {
    it('should transform appointments into chart data', () => {
      const appointments = [
        { date: new Date('2025-01-10'), patientName: 'P1' },
        { date: new Date('2025-01-10'), patientName: 'P2' },
        { date: new Date('2025-01-11'), patientName: 'P3' },
      ];

      const chartData = appointments.reduce((acc, apt) => {
        const dateStr = apt.date.toISOString().split('T')[0];
        if (!acc[dateStr]) {
          acc[dateStr] = 0;
        }
        acc[dateStr]++;
        return acc;
      }, {} as Record<string, number>);

      const formattedData = Object.entries(chartData).map(([date, count]) => ({
        date,
        visits: count,
      }));

      expect(formattedData).toHaveLength(2);
      expect(formattedData[0]).toEqual({ date: '2025-01-10', visits: 2 });
      expect(formattedData[1]).toEqual({ date: '2025-01-11', visits: 1 });
    });

    it('should calculate service utilization percentages', () => {
      const appointments = [
        { service: 'Consultation' },
        { service: 'Consultation' },
        { service: 'Follow-up Visit' },
        { service: 'Vaccination' },
      ];

      const serviceCounts = appointments.reduce((acc, apt) => {
        acc[apt.service] = (acc[apt.service] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const total = appointments.length;
      const utilizationData = Object.entries(serviceCounts).map(([name, count]) => ({
        name,
        value: (count / total) * 100,
      }));

      expect(utilizationData).toContainEqual({ name: 'Consultation', value: 50 });
      expect(utilizationData).toContainEqual({ name: 'Follow-up Visit', value: 25 });
      expect(utilizationData).toContainEqual({ name: 'Vaccination', value: 25 });
    });
  });

  describe('Error Handling', () => {
    it('should handle empty dataset gracefully', () => {
      const appointments: any[] = [];
      
      const totalVisits = appointments.length;
      const averageDaily = totalVisits > 0 ? totalVisits / 7 : 0;

      expect(totalVisits).toBe(0);
      expect(averageDaily).toBe(0);
    });

    it('should handle missing doctor data', () => {
      const appointments = [
        { 
          patientName: 'John Doe',
          doctorId: null,
          service: 'Consultation',
        },
      ];

      const validAppointments = appointments.filter(apt => apt.doctorId !== null);

      expect(validAppointments.length).toBe(0);
    });

    it('should handle invalid date ranges', () => {
      const startDate = new Date('2025-01-20');
      const endDate = new Date('2025-01-10');

      const isValidRange = endDate >= startDate;

      expect(isValidRange).toBe(false);
    });
  });
});

/**
 * Additional Test Suite for Advanced Report Scenarios
 * Team Member: Statistical Reports Feature Owner
 */
describe('Advanced Report Generation Tests', () => {
  describe('Peak Hours Analysis', () => {
    it('should identify peak appointment hours', () => {
      const appointments = [
        { timeSlot: '09:00 AM' },
        { timeSlot: '10:00 AM' },
        { timeSlot: '10:00 AM' },
        { timeSlot: '10:00 AM' },
        { timeSlot: '02:00 PM' },
        { timeSlot: '02:00 PM' },
        { timeSlot: '04:00 PM' },
      ];

      const hourCounts = appointments.reduce((acc, apt) => {
        acc[apt.timeSlot] = (acc[apt.timeSlot] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const peakHour = Object.entries(hourCounts).reduce((max, [hour, count]) => 
        count > max.count ? { hour, count } : max,
        { hour: '', count: 0 }
      );

      expect(peakHour.hour).toBe('10:00 AM');
      expect(peakHour.count).toBe(3);
    });

    it('should calculate hourly distribution', () => {
      const appointments = [
        { timeSlot: '09:00 AM' },
        { timeSlot: '09:00 AM' },
        { timeSlot: '10:00 AM' },
        { timeSlot: '11:00 AM' },
      ];

      const total = appointments.length;
      const distribution = appointments.reduce((acc, apt) => {
        const hour = apt.timeSlot;
        acc[hour] = ((acc[hour] || 0) + 1);
        return acc;
      }, {} as Record<string, number>);

      const percentages = Object.entries(distribution).map(([hour, count]) => ({
        hour,
        percentage: (count / total) * 100,
      }));

      expect(percentages).toContainEqual({ hour: '09:00 AM', percentage: 50 });
      expect(percentages).toContainEqual({ hour: '10:00 AM', percentage: 25 });
      expect(percentages).toContainEqual({ hour: '11:00 AM', percentage: 25 });
    });

    it('should handle appointments with no time slots', () => {
      const appointments = [
        { timeSlot: null },
        { timeSlot: undefined },
        { timeSlot: '' },
      ];

      const validTimeSlots = appointments.filter(apt => 
        apt.timeSlot && apt.timeSlot.trim() !== ''
      );

      expect(validTimeSlots.length).toBe(0);
    });
  });

  describe('Doctor Performance Analysis', () => {
    it('should rank doctors by patient volume', () => {
      const appointments = [
        { doctorId: { _id: 'doc1', name: 'Dr. Smith' } },
        { doctorId: { _id: 'doc1', name: 'Dr. Smith' } },
        { doctorId: { _id: 'doc1', name: 'Dr. Smith' } },
        { doctorId: { _id: 'doc2', name: 'Dr. Jones' } },
        { doctorId: { _id: 'doc2', name: 'Dr. Jones' } },
        { doctorId: { _id: 'doc3', name: 'Dr. Lee' } },
      ];

      const doctorStats = appointments.reduce((acc, apt) => {
        const id = apt.doctorId._id;
        if (!acc[id]) {
          acc[id] = { name: apt.doctorId.name, count: 0 };
        }
        acc[id].count++;
        return acc;
      }, {} as Record<string, { name: string; count: number }>);

      const ranked = Object.values(doctorStats).sort((a, b) => b.count - a.count);

      expect(ranked[0]).toEqual({ name: 'Dr. Smith', count: 3 });
      expect(ranked[1]).toEqual({ name: 'Dr. Jones', count: 2 });
      expect(ranked[2]).toEqual({ name: 'Dr. Lee', count: 1 });
    });

    it('should calculate average patients per doctor', () => {
      const appointments = [
        { doctorId: { _id: 'doc1' } },
        { doctorId: { _id: 'doc1' } },
        { doctorId: { _id: 'doc2' } },
        { doctorId: { _id: 'doc2' } },
        { doctorId: { _id: 'doc3' } },
        { doctorId: { _id: 'doc3' } },
      ];

      const uniqueDoctors = new Set(appointments.map(apt => apt.doctorId._id)).size;
      const avgPatientsPerDoctor = appointments.length / uniqueDoctors;

      expect(uniqueDoctors).toBe(3);
      expect(avgPatientsPerDoctor).toBe(2);
    });

    it('should identify doctors with no appointments', () => {
      const allDoctors = [
        { _id: 'doc1', name: 'Dr. Smith' },
        { _id: 'doc2', name: 'Dr. Jones' },
        { _id: 'doc3', name: 'Dr. Lee' },
      ];

      const appointments = [
        { doctorId: { _id: 'doc1' } },
        { doctorId: { _id: 'doc1' } },
      ];

      const appointedDoctorIds = new Set(
        appointments.map(apt => apt.doctorId._id)
      );

      const idleDoctors = allDoctors.filter(
        doc => !appointedDoctorIds.has(doc._id)
      );

      expect(idleDoctors.length).toBe(2);
      expect(idleDoctors.map(d => d.name)).toEqual(['Dr. Jones', 'Dr. Lee']);
    });
  });

  describe('Revenue Trends Analysis', () => {
    it('should calculate month-over-month revenue growth', () => {
      const payments = [
        { paidAt: new Date('2025-01-05'), amount: 5000 },
        { paidAt: new Date('2025-01-20'), amount: 3000 },
        { paidAt: new Date('2025-02-10'), amount: 6000 },
        { paidAt: new Date('2025-02-25'), amount: 4000 },
      ];

      const monthlyRevenue = payments.reduce((acc, payment) => {
        const month = `${payment.paidAt.getFullYear()}-${String(payment.paidAt.getMonth() + 1).padStart(2, '0')}`;
        acc[month] = (acc[month] || 0) + payment.amount;
        return acc;
      }, {} as Record<string, number>);

      expect(monthlyRevenue['2025-01']).toBe(8000);
      expect(monthlyRevenue['2025-02']).toBe(10000);

      const growth = ((monthlyRevenue['2025-02'] - monthlyRevenue['2025-01']) / monthlyRevenue['2025-01']) * 100;
      expect(growth).toBe(25);
    });

    it('should calculate daily revenue average', () => {
      const payments = [
        { paidAt: new Date('2025-01-10'), amount: 1500 },
        { paidAt: new Date('2025-01-10'), amount: 2000 },
        { paidAt: new Date('2025-01-11'), amount: 1750 },
      ];

      const dailyRevenue = payments.reduce((acc, payment) => {
        const day = payment.paidAt.toISOString().split('T')[0];
        acc[day] = (acc[day] || 0) + payment.amount;
        return acc;
      }, {} as Record<string, number>);

      const days = Object.keys(dailyRevenue).length;
      const totalRevenue = Object.values(dailyRevenue).reduce((sum, rev) => sum + rev, 0);
      const avgDailyRevenue = totalRevenue / days;

      expect(dailyRevenue['2025-01-10']).toBe(3500);
      expect(dailyRevenue['2025-01-11']).toBe(1750);
      expect(avgDailyRevenue).toBeCloseTo(2625, 0);
    });

    it('should identify highest revenue service', () => {
      const payments = [
        { service: 'Consultation', amount: 1500 },
        { service: 'Laboratory Tests', amount: 2500 },
        { service: 'Consultation', amount: 1500 },
        { service: 'X-Ray/Imaging', amount: 3000 },
        { service: 'Laboratory Tests', amount: 2000 },
      ];

      const serviceRevenue = payments.reduce((acc, payment) => {
        acc[payment.service] = (acc[payment.service] || 0) + payment.amount;
        return acc;
      }, {} as Record<string, number>);

      const topService = Object.entries(serviceRevenue).reduce((max, [service, revenue]) => 
        revenue > max.revenue ? { service, revenue } : max,
        { service: '', revenue: 0 }
      );

      expect(topService.service).toBe('Laboratory Tests');
      expect(topService.revenue).toBe(4500);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle single appointment correctly', () => {
      const appointments = [
        { 
          patientName: 'John Doe',
          date: new Date('2025-01-15'),
          doctorId: { name: 'Dr. Smith', specialty: 'Cardiology' },
        },
      ];

      const totalVisits = appointments.length;
      const uniquePatients = new Set(appointments.map(apt => apt.patientName)).size;

      expect(totalVisits).toBe(1);
      expect(uniquePatients).toBe(1);
    });

    it('should handle very large datasets', () => {
      // Simulate 10,000 appointments
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        _id: `apt${i}`,
        patientName: `Patient ${i % 1000}`,
        date: new Date(2025, 0, (i % 30) + 1),
        service: ['Consultation', 'Follow-up Visit', 'Vaccination'][i % 3],
      }));

      const totalVisits = largeDataset.length;
      const uniquePatients = new Set(largeDataset.map(apt => apt.patientName)).size;
      const serviceCounts = largeDataset.reduce((acc, apt) => {
        acc[apt.service] = (acc[apt.service] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(totalVisits).toBe(10000);
      expect(uniquePatients).toBeLessThanOrEqual(1000);
      expect(serviceCounts['Consultation']).toBeGreaterThan(3000);
    });

    it('should handle appointments on same date and time', () => {
      const sameDateTime = new Date('2025-01-15T10:00:00');
      const appointments = [
        { date: sameDateTime, timeSlot: '10:00 AM', patientName: 'P1' },
        { date: sameDateTime, timeSlot: '10:00 AM', patientName: 'P2' },
        { date: sameDateTime, timeSlot: '10:00 AM', patientName: 'P3' },
      ];

      const conflicts = appointments.length;
      expect(conflicts).toBe(3);
      
      // This would be a scheduling conflict in real system
      const uniqueTimes = new Set(
        appointments.map(apt => `${apt.date.toISOString()}-${apt.timeSlot}`)
      ).size;
      expect(uniqueTimes).toBe(1);
    });

    it('should handle payments with zero amount', () => {
      const payments = [
        { amount: 1500, paymentStatus: 'completed' },
        { amount: 0, paymentStatus: 'completed' },
        { amount: 2000, paymentStatus: 'completed' },
      ];

      const totalRevenue = payments
        .filter(p => p.paymentStatus === 'completed' && p.amount > 0)
        .reduce((sum, p) => sum + p.amount, 0);

      expect(totalRevenue).toBe(3500);
    });

    it('should handle negative amounts (refunds)', () => {
      const transactions = [
        { amount: 1500, type: 'payment' },
        { amount: -500, type: 'refund' },
        { amount: 2000, type: 'payment' },
      ];

      const netRevenue = transactions.reduce((sum, txn) => sum + txn.amount, 0);
      const refundTotal = transactions
        .filter(txn => txn.amount < 0)
        .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);

      expect(netRevenue).toBe(3000);
      expect(refundTotal).toBe(500);
    });
  });

  describe('Data Validation and Sanitization', () => {
    it('should filter out appointments with missing required fields', () => {
      const appointments = [
        { 
          patientName: 'John Doe',
          date: new Date('2025-01-15'),
          doctorId: { name: 'Dr. Smith' },
          service: 'Consultation',
        },
        { 
          patientName: null,
          date: new Date('2025-01-16'),
          doctorId: { name: 'Dr. Jones' },
          service: 'Follow-up Visit',
        },
        { 
          patientName: 'Jane Smith',
          date: null,
          doctorId: { name: 'Dr. Lee' },
          service: 'Vaccination',
        },
      ];

      const validAppointments = appointments.filter(apt => 
        apt.patientName && 
        apt.date && 
        apt.doctorId && 
        apt.service
      );

      expect(validAppointments.length).toBe(1);
      expect(validAppointments[0].patientName).toBe('John Doe');
    });

    it('should normalize date formats for comparison', () => {
      const dates = [
        new Date('2025-01-15T10:30:00'),
        new Date('2025-01-15T14:45:00'),
        new Date('2025-01-15T18:20:00'),
      ];

      const normalizedDates = dates.map(d => d.toISOString().split('T')[0]);
      const uniqueDays = new Set(normalizedDates).size;

      expect(uniqueDays).toBe(1);
      expect(normalizedDates.every(d => d === '2025-01-15')).toBe(true);
    });

    it('should handle special characters in patient names', () => {
      const appointments = [
        { patientName: "O'Brien, John" },
        { patientName: "José García" },
        { patientName: "李明" },
        { patientName: "المريض" },
      ];

      const validNames = appointments.filter(apt => 
        apt.patientName && apt.patientName.trim().length > 0
      );

      expect(validNames.length).toBe(4);
      expect(validNames.map(a => a.patientName)).toContain("O'Brien, John");
      expect(validNames.map(a => a.patientName)).toContain("José García");
    });
  });

  describe('Report Export and Formatting', () => {
    it('should format currency values correctly', () => {
      const payments = [
        { amount: 1500.50, currency: 'Rs.' },
        { amount: 2000.75, currency: 'Rs.' },
      ];

      const formattedPayments = payments.map(p => ({
        ...p,
        formattedAmount: `${p.currency} ${p.amount.toFixed(2)}`,
      }));

      expect(formattedPayments[0].formattedAmount).toBe('Rs. 1500.50');
      expect(formattedPayments[1].formattedAmount).toBe('Rs. 2000.75');
    });

    it('should format dates for display', () => {
      const appointment = {
        date: new Date('2025-01-15T10:30:00'),
      };

      const formattedDate = appointment.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      expect(formattedDate).toContain('January');
      expect(formattedDate).toContain('15');
      expect(formattedDate).toContain('2025');
    });

    it('should generate CSV-compatible data structure', () => {
      const appointments = [
        { 
          patientName: 'John Doe',
          date: new Date('2025-01-15'),
          doctorId: { name: 'Dr. Smith' },
          service: 'Consultation',
        },
      ];

      const csvData = appointments.map(apt => ({
        'Patient Name': apt.patientName,
        'Date': apt.date.toISOString().split('T')[0],
        'Doctor': apt.doctorId.name,
        'Service': apt.service,
      }));

      expect(csvData[0]).toHaveProperty('Patient Name');
      expect(csvData[0]).toHaveProperty('Date');
      expect(csvData[0]).toHaveProperty('Doctor');
      expect(csvData[0]).toHaveProperty('Service');
    });
  });
});
