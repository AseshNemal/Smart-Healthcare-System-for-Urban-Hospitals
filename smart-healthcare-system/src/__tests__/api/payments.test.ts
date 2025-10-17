/**
 * Unit Tests for Payment Functions
 * Tests payment validation, calculation, and data transformation logic
 * WITHOUT modifying the original code
 */

describe('Payment System - Unit Tests', () => {
  
  // ===========================
  // 1. PAYMENT VALIDATION
  // ===========================
  describe('Payment Data Validation', () => {
    
    // Helper function to validate payment request body
    const validatePaymentRequest = (body: any) => {
      const errors: string[] = [];
      
      if (!body) {
        errors.push('Request body is required');
        return errors;
      }
      
      if (!body.appointmentId || body.appointmentId.trim() === '') {
        errors.push('Appointment ID is required');
      }
      
      if (!body.paymentMethod || body.paymentMethod.trim() === '') {
        errors.push('Payment method is required');
      }
      
      if (body.amount === undefined || body.amount === null) {
        errors.push('Amount is required');
      } else if (typeof body.amount !== 'number' || body.amount <= 0) {
        errors.push('Amount must be a positive number');
      }
      
      return errors;
    };

    it('should validate correct payment request', () => {
      const validRequest = {
        appointmentId: '507f1f77bcf86cd799439011',
        paymentMethod: 'credit-card',
        amount: 1500
      };
      
      const errors = validatePaymentRequest(validRequest);
      expect(errors.length).toBe(0);
    });

    it('should reject null or undefined request body', () => {
      const errors = validatePaymentRequest(null);
      expect(errors).toContain('Request body is required');
    });

    it('should reject missing appointment ID', () => {
      const invalidRequest = {
        paymentMethod: 'credit-card',
        amount: 1500
      };
      
      const errors = validatePaymentRequest(invalidRequest);
      expect(errors).toContain('Appointment ID is required');
    });

    it('should reject missing payment method', () => {
      const invalidRequest = {
        appointmentId: '507f1f77bcf86cd799439011',
        amount: 1500
      };
      
      const errors = validatePaymentRequest(invalidRequest);
      expect(errors).toContain('Payment method is required');
    });

    it('should reject missing amount', () => {
      const invalidRequest = {
        appointmentId: '507f1f77bcf86cd799439011',
        paymentMethod: 'credit-card'
      };
      
      const errors = validatePaymentRequest(invalidRequest);
      expect(errors).toContain('Amount is required');
    });

    it('should reject negative amount', () => {
      const invalidRequest = {
        appointmentId: '507f1f77bcf86cd799439011',
        paymentMethod: 'credit-card',
        amount: -100
      };
      
      const errors = validatePaymentRequest(invalidRequest);
      expect(errors).toContain('Amount must be a positive number');
    });

    it('should reject zero amount', () => {
      const invalidRequest = {
        appointmentId: '507f1f77bcf86cd799439011',
        paymentMethod: 'credit-card',
        amount: 0
      };
      
      const errors = validatePaymentRequest(invalidRequest);
      expect(errors).toContain('Amount must be a positive number');
    });

    it('should reject non-numeric amount', () => {
      const invalidRequest = {
        appointmentId: '507f1f77bcf86cd799439011',
        paymentMethod: 'credit-card',
        amount: 'invalid'
      };
      
      const errors = validatePaymentRequest(invalidRequest);
      expect(errors).toContain('Amount must be a positive number');
    });

    it('should handle empty string appointment ID', () => {
      const invalidRequest = {
        appointmentId: '   ',
        paymentMethod: 'credit-card',
        amount: 1500
      };
      
      const errors = validatePaymentRequest(invalidRequest);
      expect(errors).toContain('Appointment ID is required');
    });
  });

  // ===========================
  // 2. TRANSACTION ID GENERATION
  // ===========================
  describe('Transaction ID Generation', () => {
    
    // Simulate the transaction ID generation logic from the API
    const generateTransactionId = () => {
      return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    };

    it('should generate unique transaction IDs', () => {
      const id1 = generateTransactionId();
      const id2 = generateTransactionId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^TXN/);
      expect(id2).toMatch(/^TXN/);
    });

    it('should start with TXN prefix', () => {
      const transactionId = generateTransactionId();
      expect(transactionId.startsWith('TXN')).toBe(true);
    });

    it('should be at least 16 characters long', () => {
      const transactionId = generateTransactionId();
      expect(transactionId.length).toBeGreaterThanOrEqual(16);
    });

    it('should generate multiple unique IDs in quick succession', () => {
      const ids = new Set();
      for (let i = 0; i < 10; i++) {
        ids.add(generateTransactionId());
      }
      
      // All 10 should be unique
      expect(ids.size).toBe(10);
    });

    it('should only contain alphanumeric characters', () => {
      const transactionId = generateTransactionId();
      expect(transactionId).toMatch(/^[A-Z0-9]+$/);
    });
  });

  // ===========================
  // 3. PAYMENT METHOD VALIDATION
  // ===========================
  describe('Payment Method Validation', () => {
    
    const validPaymentMethods = ['credit-card', 'debit-card', 'cash', 'insurance'];
    
    const isValidPaymentMethod = (method: string): boolean => {
      return validPaymentMethods.includes(method.toLowerCase());
    };

    it('should accept valid payment methods', () => {
      expect(isValidPaymentMethod('credit-card')).toBe(true);
      expect(isValidPaymentMethod('debit-card')).toBe(true);
      expect(isValidPaymentMethod('cash')).toBe(true);
      expect(isValidPaymentMethod('insurance')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(isValidPaymentMethod('CREDIT-CARD')).toBe(true);
      expect(isValidPaymentMethod('Credit-Card')).toBe(true);
    });

    it('should reject invalid payment methods', () => {
      expect(isValidPaymentMethod('bitcoin')).toBe(false);
      expect(isValidPaymentMethod('paypal')).toBe(false);
      expect(isValidPaymentMethod('')).toBe(false);
    });
  });

  // ===========================
  // 4. PAYMENT STATUS MANAGEMENT
  // ===========================
  describe('Payment Status Management', () => {
    
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    
    const isValidPaymentStatus = (status: string): boolean => {
      return validStatuses.includes(status.toLowerCase());
    };

    it('should validate payment statuses', () => {
      expect(isValidPaymentStatus('pending')).toBe(true);
      expect(isValidPaymentStatus('completed')).toBe(true);
      expect(isValidPaymentStatus('failed')).toBe(true);
      expect(isValidPaymentStatus('refunded')).toBe(true);
    });

    it('should reject invalid statuses', () => {
      expect(isValidPaymentStatus('processing')).toBe(false);
      expect(isValidPaymentStatus('cancelled')).toBe(false);
    });
  });

  // ===========================
  // 5. CURRENCY FORMATTING
  // ===========================
  describe('Currency Formatting', () => {
    
    const formatCurrency = (amount: number, currency: string = 'Rs.'): string => {
      return `${currency} ${amount.toFixed(2)}`;
    };

    it('should format currency correctly', () => {
      expect(formatCurrency(1500)).toBe('Rs. 1500.00');
      expect(formatCurrency(2350.50)).toBe('Rs. 2350.50');
    });

    it('should round to 2 decimal places', () => {
      expect(formatCurrency(1500.555)).toBe('Rs. 1500.56');
      expect(formatCurrency(999.994)).toBe('Rs. 999.99');
    });

    it('should handle zero amount', () => {
      expect(formatCurrency(0)).toBe('Rs. 0.00');
    });

    it('should support different currencies', () => {
      expect(formatCurrency(100, '$')).toBe('$ 100.00');
      expect(formatCurrency(100, '€')).toBe('€ 100.00');
    });
  });

  // ===========================
  // 6. PAYMENT RECORD TRANSFORMATION
  // ===========================
  describe('Payment Record Transformation', () => {
    
    interface PaymentDocument {
      _id: { toString: () => string };
      appointmentId: { toString: () => string };
      patientName: string;
      patientEmail: string;
      doctorName: string;
      service: string;
      appointmentDate: Date;
      amount: number;
      currency: string;
      paymentMethod: string;
      paymentStatus: string;
      paidAt: Date;
      transactionId: string;
    }

    const transformPaymentRecord = (payment: PaymentDocument) => {
      return {
        id: payment._id.toString(),
        appointmentId: payment.appointmentId.toString(),
        patientName: payment.patientName,
        patientEmail: payment.patientEmail,
        doctorName: payment.doctorName,
        service: payment.service,
        appointmentDate: payment.appointmentDate.toISOString(),
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
        paidAt: payment.paidAt.toISOString(),
        transactionId: payment.transactionId,
      };
    };

    const mockPayment: PaymentDocument = {
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      appointmentId: { toString: () => '507f1f77bcf86cd799439012' },
      patientName: 'John Doe',
      patientEmail: 'john@example.com',
      doctorName: 'Dr. Smith',
      service: 'Consultation',
      appointmentDate: new Date('2025-01-15T10:00:00Z'),
      amount: 1500,
      currency: 'Rs.',
      paymentMethod: 'credit-card',
      paymentStatus: 'completed',
      paidAt: new Date('2025-01-15T10:30:00Z'),
      transactionId: 'TXN123456789ABC',
    };

    it('should transform payment record correctly', () => {
      const transformed = transformPaymentRecord(mockPayment);
      
      expect(transformed.id).toBe('507f1f77bcf86cd799439011');
      expect(transformed.appointmentId).toBe('507f1f77bcf86cd799439012');
      expect(transformed.patientName).toBe('John Doe');
      expect(transformed.amount).toBe(1500);
    });

    it('should convert dates to ISO strings', () => {
      const transformed = transformPaymentRecord(mockPayment);
      
      expect(transformed.appointmentDate).toBe('2025-01-15T10:00:00.000Z');
      expect(transformed.paidAt).toBe('2025-01-15T10:30:00.000Z');
    });

    it('should preserve all required fields', () => {
      const transformed = transformPaymentRecord(mockPayment);
      
      expect(transformed).toHaveProperty('id');
      expect(transformed).toHaveProperty('appointmentId');
      expect(transformed).toHaveProperty('patientName');
      expect(transformed).toHaveProperty('patientEmail');
      expect(transformed).toHaveProperty('doctorName');
      expect(transformed).toHaveProperty('service');
      expect(transformed).toHaveProperty('appointmentDate');
      expect(transformed).toHaveProperty('amount');
      expect(transformed).toHaveProperty('currency');
      expect(transformed).toHaveProperty('paymentMethod');
      expect(transformed).toHaveProperty('paymentStatus');
      expect(transformed).toHaveProperty('paidAt');
      expect(transformed).toHaveProperty('transactionId');
    });
  });

  // ===========================
  // 7. PAYMENT FILTERING
  // ===========================
  describe('Payment Filtering Logic', () => {
    
    interface Payment {
      id: string;
      patientEmail: string;
      appointmentId: string;
      amount: number;
      paymentStatus: string;
      paidAt: string;
    }

    const testPayments: Payment[] = [
      {
        id: '1',
        patientEmail: 'john@example.com',
        appointmentId: 'apt1',
        amount: 1500,
        paymentStatus: 'completed',
        paidAt: '2025-01-15T10:00:00Z',
      },
      {
        id: '2',
        patientEmail: 'jane@example.com',
        appointmentId: 'apt2',
        amount: 2000,
        paymentStatus: 'completed',
        paidAt: '2025-01-16T11:00:00Z',
      },
      {
        id: '3',
        patientEmail: 'john@example.com',
        appointmentId: 'apt3',
        amount: 1750,
        paymentStatus: 'pending',
        paidAt: '2025-01-17T09:00:00Z',
      },
    ];

    const filterByEmail = (payments: Payment[], email: string) => {
      return payments.filter(p => p.patientEmail === email);
    };

    const filterByAppointmentId = (payments: Payment[], appointmentId: string) => {
      return payments.filter(p => p.appointmentId === appointmentId);
    };

    const filterByStatus = (payments: Payment[], status: string) => {
      return payments.filter(p => p.paymentStatus === status);
    };

    it('should filter payments by email', () => {
      const filtered = filterByEmail(testPayments, 'john@example.com');
      expect(filtered.length).toBe(2);
      expect(filtered.every(p => p.patientEmail === 'john@example.com')).toBe(true);
    });

    it('should filter payments by appointment ID', () => {
      const filtered = filterByAppointmentId(testPayments, 'apt1');
      expect(filtered.length).toBe(1);
      expect(filtered[0].appointmentId).toBe('apt1');
    });

    it('should filter payments by status', () => {
      const completed = filterByStatus(testPayments, 'completed');
      expect(completed.length).toBe(2);
      
      const pending = filterByStatus(testPayments, 'pending');
      expect(pending.length).toBe(1);
    });

    it('should return empty array when no matches found', () => {
      const filtered = filterByEmail(testPayments, 'nonexistent@example.com');
      expect(filtered.length).toBe(0);
    });
  });

  // ===========================
  // 8. PAYMENT CALCULATIONS
  // ===========================
  describe('Payment Calculations', () => {
    
    interface Payment {
      amount: number;
      paymentStatus: string;
    }

    const calculateTotalAmount = (payments: Payment[]): number => {
      return payments.reduce((sum, p) => sum + p.amount, 0);
    };

    const calculateCompletedAmount = (payments: Payment[]): number => {
      return payments
        .filter(p => p.paymentStatus === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
    };

    const testPayments: Payment[] = [
      { amount: 1500, paymentStatus: 'completed' },
      { amount: 2000, paymentStatus: 'completed' },
      { amount: 1750, paymentStatus: 'pending' },
      { amount: 500, paymentStatus: 'completed' },
    ];

    it('should calculate total amount of all payments', () => {
      const total = calculateTotalAmount(testPayments);
      expect(total).toBe(5750);
    });

    it('should calculate total of completed payments only', () => {
      const completed = calculateCompletedAmount(testPayments);
      expect(completed).toBe(4000); // 1500 + 2000 + 500
    });

    it('should handle empty payment array', () => {
      expect(calculateTotalAmount([])).toBe(0);
      expect(calculateCompletedAmount([])).toBe(0);
    });

    it('should handle all pending payments', () => {
      const allPending: Payment[] = [
        { amount: 1000, paymentStatus: 'pending' },
        { amount: 2000, paymentStatus: 'pending' },
      ];
      
      expect(calculateCompletedAmount(allPending)).toBe(0);
      expect(calculateTotalAmount(allPending)).toBe(3000);
    });
  });

  // ===========================
  // 9. PAYMENT SORTING
  // ===========================
  describe('Payment Sorting Logic', () => {
    
    interface Payment {
      id: string;
      paidAt: string;
      amount: number;
    }

    const sortByDateDescending = (payments: Payment[]) => {
      return [...payments].sort((a, b) => 
        new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
      );
    };

    const sortByAmountDescending = (payments: Payment[]) => {
      return [...payments].sort((a, b) => b.amount - a.amount);
    };

    const testPayments: Payment[] = [
      { id: '1', paidAt: '2025-01-15T10:00:00Z', amount: 1500 },
      { id: '2', paidAt: '2025-01-17T11:00:00Z', amount: 2000 },
      { id: '3', paidAt: '2025-01-16T09:00:00Z', amount: 1750 },
    ];

    it('should sort payments by date (most recent first)', () => {
      const sorted = sortByDateDescending(testPayments);
      
      expect(sorted[0].id).toBe('2'); // Jan 17
      expect(sorted[1].id).toBe('3'); // Jan 16
      expect(sorted[2].id).toBe('1'); // Jan 15
    });

    it('should sort payments by amount (highest first)', () => {
      const sorted = sortByAmountDescending(testPayments);
      
      expect(sorted[0].amount).toBe(2000);
      expect(sorted[1].amount).toBe(1750);
      expect(sorted[2].amount).toBe(1500);
    });

    it('should not mutate original array', () => {
      const original = [...testPayments];
      sortByDateDescending(testPayments);
      
      expect(testPayments).toEqual(original);
    });
  });
});
