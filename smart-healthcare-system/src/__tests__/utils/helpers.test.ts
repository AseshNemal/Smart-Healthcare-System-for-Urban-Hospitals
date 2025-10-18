/**
 * Unit Tests for Utility Functions
 * Tests helper functions and utilities
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Utility Functions', () => {
  describe('Password Hashing (bcrypt)', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hash = await bcrypt.hash(password, 10);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(30);
    });

    it('should verify correct password', async () => {
      const password = 'testpassword123';
      const hash = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hash = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(wrongPassword, hash);

      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    const secret = 'test-secret-key';

    it('should generate valid JWT token', () => {
      const payload = {
        id: '123',
        email: 'test@example.com',
        role: 'admin',
      };

      const token = jwt.sign(payload, secret, { expiresIn: '7d' });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should verify and decode valid token', () => {
      const payload = {
        id: '123',
        email: 'test@example.com',
        role: 'admin',
      };

      const token = jwt.sign(payload, secret, { expiresIn: '7d' });
      const decoded = jwt.verify(token, secret) as any;

      expect(decoded.id).toBe('123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('admin');
    });

    it('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        jwt.verify(invalidToken, secret);
      }).toThrow();
    });

    it('should reject token with wrong secret', () => {
      const payload = { id: '123', email: 'test@example.com' };
      const token = jwt.sign(payload, secret);
      const wrongSecret = 'wrong-secret';

      expect(() => {
        jwt.verify(token, wrongSecret);
      }).toThrow();
    });
  });

  describe('Date Utilities', () => {
    it('should calculate age from date of birth', () => {
      const calculateAge = (dob: Date): number => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        return age;
      };

      const dob = new Date('1990-01-01');
      const age = calculateAge(dob);

      expect(age).toBeGreaterThanOrEqual(34);
      expect(age).toBeLessThan(36);
    });

    it('should format date correctly', () => {
      const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
      };

      const date = new Date('2025-01-15');
      const formatted = formatDate(date);

      expect(formatted).toBe('2025-01-15');
    });
  });

  describe('Data Validation', () => {
    it('should validate email format', () => {
      const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });

    it('should validate phone number format', () => {
      const isValidPhone = (phone: string): boolean => {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone);
      };

      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('123456789')).toBe(false);
      expect(isValidPhone('12345678901')).toBe(false);
      expect(isValidPhone('abcdefghij')).toBe(false);
    });
  });

  describe('Statistics Calculations', () => {
    it('should calculate average correctly', () => {
      const calculateAverage = (numbers: number[]): number => {
        if (numbers.length === 0) return 0;
        const sum = numbers.reduce((acc, num) => acc + num, 0);
        return sum / numbers.length;
      };

      expect(calculateAverage([10, 20, 30])).toBe(20);
      expect(calculateAverage([5, 10, 15, 20])).toBe(12.5);
      expect(calculateAverage([])).toBe(0);
    });

    it('should calculate total revenue', () => {
      const payments = [
        { amount: 1500 },
        { amount: 2000 },
        { amount: 1750 },
      ];

      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

      expect(totalRevenue).toBe(5250);
    });

    it('should filter appointments by date range', () => {
      const appointments = [
        { date: new Date('2025-01-10') },
        { date: new Date('2025-01-15') },
        { date: new Date('2025-01-20') },
      ];

      const startDate = new Date('2025-01-12');
      const endDate = new Date('2025-01-18');

      const filtered = appointments.filter(
        (apt) => apt.date >= startDate && apt.date <= endDate
      );

      expect(filtered.length).toBe(1);
      expect(filtered[0].date.toISOString()).toContain('2025-01-15');
    });
  });
});
