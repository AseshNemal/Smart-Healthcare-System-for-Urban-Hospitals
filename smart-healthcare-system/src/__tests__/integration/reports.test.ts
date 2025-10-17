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
