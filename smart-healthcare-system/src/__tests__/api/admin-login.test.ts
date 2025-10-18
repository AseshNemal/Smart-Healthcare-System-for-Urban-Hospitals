/**
 * Unit Tests for Admin Authentication API
 * Tests the admin login endpoint functionality
 */

import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('@/lib/mongodb');
jest.mock('@/models');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Admin Login API', () => {
  const mockAdmin = {
    _id: '507f1f77bcf86cd799439011',
    email: 'admin@test.com',
    name: 'Test Admin',
    passwordHash: '$2a$10$hashedpassword',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_JWT_SECRET = 'test-secret';
  });

  describe('POST /api/admin/login', () => {
    it('should return 400 when email is missing', async () => {
      const { POST } = require('@/app/api/admin/login/route');
      
      const req = {
        json: async () => ({ password: 'test123' }),
      } as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });

    it('should return 400 when password is missing', async () => {
      const { POST } = require('@/app/api/admin/login/route');
      
      const req = {
        json: async () => ({ email: 'admin@test.com' }),
      } as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });

    it('should return 401 when admin not found', async () => {
      const { Admin } = require('@/models');
      Admin.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const { POST } = require('@/app/api/admin/login/route');
      
      const req = {
        json: async () => ({ email: 'nonexistent@test.com', password: 'test123' }),
      } as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid credentials');
    });

    it('should return 401 when password is incorrect', async () => {
      const { Admin } = require('@/models');
      Admin.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockAdmin),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const { POST } = require('@/app/api/admin/login/route');
      
      const req = {
        json: async () => ({ email: 'admin@test.com', password: 'wrongpassword' }),
      } as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid credentials');
    });

    it('should return 200 and set cookie when credentials are valid', async () => {
      const { Admin } = require('@/models');
      Admin.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockAdmin),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      const { POST } = require('@/app/api/admin/login/route');
      
      const req = {
        json: async () => ({ email: 'admin@test.com', password: 'correctpassword' }),
      } as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toEqual({
        name: 'Test Admin',
        email: 'admin@test.com',
        role: 'admin',
      });
    });
  });
});
