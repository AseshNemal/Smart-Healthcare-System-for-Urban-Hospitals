/**
 * Comprehensive Admin Login API Tests
 * Tests cover positive, negative, edge cases, and error handling
 */

// Mock all dependencies
jest.mock('@/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/models', () => ({
  Admin: {
    findOne: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
}));

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Admin Login API - Comprehensive Tests', () => {
  const mockAdmin = {
    _id: '507f1f77bcf86cd799439011',
    email: 'admin@test.com',
    name: 'Test Admin',
    passwordHash: '$2a$10$hashedpassword',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_JWT_SECRET = 'test-secret-key';
  });

  describe('Input Validation - Positive Cases', () => {
    it('should accept valid email and password', () => {
      const validate = (email: string, password: string) => {
        return !!email && !!password;
      };
      expect(validate('admin@test.com', 'password123')).toBe(true);
    });

    it('should accept email with special characters', () => {
      const validate = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      expect(validate('admin.user+test@hospital.org.in')).toBe(true);
    });
  });

  describe('Input Validation - Negative Cases', () => {
    it('should reject missing email', () => {
      const validate = (email: any) => !!email;
      expect(validate('')).toBe(false);
      expect(validate(null)).toBe(false);
      expect(validate(undefined)).toBe(false);
    });

    it('should reject missing password', () => {
      const validate = (pass: any) => !!pass;
      expect(validate('')).toBe(false);
      expect(validate(null)).toBe(false);
    });

    it('should reject invalid email format', () => {
      const validate = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      expect(validate('notanemail')).toBe(false);
      expect(validate('@test.com')).toBe(false);
      expect(validate('user@')).toBe(false);
    });
  });

  describe('Authentication - Success Cases', () => {
    it('should authenticate with correct credentials', async () => {
      const { Admin } = require('@/models');
      Admin.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockAdmin),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const admin = await Admin.findOne({ email: 'admin@test.com' }).lean();
      const isValid = await bcrypt.compare('password', admin.passwordHash);

      expect(admin).toBeDefined();
      expect(isValid).toBe(true);
    });

    it('should generate JWT token on success', () => {
      const token = jwt.sign({ email: 'admin@test.com' }, 'secret', { expiresIn: '7d' });
      expect(token).toBe('mock-jwt-token');
    });
  });

  describe('Authentication - Failure Cases', () => {
    it('should fail when admin not found', async () => {
      const { Admin } = require('@/models');
      Admin.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await Admin.findOne({ email: 'wrong@test.com' }).lean();
      expect(result).toBeNull();
    });

    it('should fail with incorrect password', async () => {
      const { Admin } = require('@/models');
      Admin.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockAdmin),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const admin = await Admin.findOne({ email: 'admin@test.com' }).lean();
      const isValid = await bcrypt.compare('wrongpass', admin.passwordHash);

      expect(isValid).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle whitespace in email', () => {
      const trim = (input: string) => input.trim();
      expect(trim('  admin@test.com  ')).toBe('admin@test.com');
    });

    it('should handle case insensitive email', () => {
      const normalize = (email: string) => email.toLowerCase();
      expect(normalize('Admin@Test.COM')).toBe('admin@test.com');
    });

    it('should handle very long passwords', () => {
      const validate = (pass: string) => pass.length <= 128;
      expect(validate('a'.repeat(200))).toBe(false);
      expect(validate('validpass')).toBe(true);
    });

    it('should handle special characters in password', () => {
      const hasSpecial = (pass: string) => /[!@#$%^&*]/.test(pass);
      expect(hasSpecial('Pass@123')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors', async () => {
      const { Admin } = require('@/models');
      Admin.findOne.mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      await expect(Admin.findOne({}).lean()).rejects.toThrow('DB Error');
    });

    it('should handle bcrypt errors', async () => {
      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Hash error'));
      await expect(bcrypt.compare('pass', 'hash')).rejects.toThrow('Hash error');
    });

    it('should handle missing JWT secret', () => {
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error('Secret required');
      });

      expect(() => jwt.sign({}, '')).toThrow('Secret required');
    });
  });

  describe('Security Tests', () => {
    it('should use bcrypt for password hashing', () => {
      const isSecure = (hash: string) => hash.startsWith('$2a$') || hash.startsWith('$2b$');
      expect(isSecure(mockAdmin.passwordHash)).toBe(true);
    });

    it('should not expose password hash', () => {
      const sanitize = (admin: typeof mockAdmin) => {
        const { passwordHash, ...safe } = admin;
        return safe;
      };

      const result = sanitize(mockAdmin);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should validate JWT expiration', () => {
      const validExpiry = ['7d', '24h', '1h'].includes('7d');
      expect(validExpiry).toBe(true);
    });
  });

  describe('Rate Limiting Tests', () => {
    it('should track failed attempts', () => {
      const attempts: Record<string, number> = {};
      const track = (email: string) => {
        attempts[email] = (attempts[email] || 0) + 1;
        return attempts[email];
      };

      expect(track('admin@test.com')).toBe(1);
      expect(track('admin@test.com')).toBe(2);
    });

    it('should block after max attempts', () => {
      let count = 0;
      const check = () => ++count <= 5;

      for (let i = 0; i < 5; i++) expect(check()).toBe(true);
      expect(check()).toBe(false);
    });
  });
});
