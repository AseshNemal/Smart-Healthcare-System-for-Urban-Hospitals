// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db'
process.env.ADMIN_JWT_SECRET = 'test-secret-key-for-testing'
process.env.ADMIN_EMAIL = 'test@admin.com'
process.env.ADMIN_NAME = 'Test Admin'
process.env.ADMIN_PASSWORD = 'testpassword'

// Mock mongoose to avoid BSON ESM issues
jest.mock('mongoose', () => {
  const mockSchema = class {
    constructor() {
      this.paths = {}
    }
    path(fieldName) {
      return this.paths[fieldName] || { options: {} }
    }
  }

  const mockModel = (name, schema) => {
    return class {
      constructor(data = {}) {
        Object.assign(this, data)
        this.schema = schema
      }
      validateSync() {
        const errors = {}
        // Simulate validation logic based on model name
        if (name === 'Doctor') {
          if (!this.name) errors.name = { message: 'Path `name` is required.' }
          if (!this.specialty) errors.specialty = { message: 'Path `specialty` is required.' }
        } else if (name === 'Appointment') {
          if (!this.doctorId) errors.doctorId = { message: 'Path `doctorId` is required.' }
          if (!this.patientName) errors.patientName = { message: 'Path `patientName` is required.' }
          if (!this.patientEmail) errors.patientEmail = { message: 'Path `patientEmail` is required.' }
          if (!this.date) errors.date = { message: 'Path `date` is required.' }
          if (!this.timeSlot) errors.timeSlot = { message: 'Path `timeSlot` is required.' }
          if (!this.service) errors.service = { message: 'Path `service` is required.' }
          else if (!['Consultation', 'Follow-up', 'Emergency', 'Surgery', 'Checkup'].includes(this.service)) {
            errors.service = { message: `\`${this.service}\` is not a valid enum value for path \`service\`.` }
          }
          // Set defaults
          if (this.paymentStatus === undefined) this.paymentStatus = false
          if (this.deleted === undefined) this.deleted = false
        } else if (name === 'Patient') {
          if (this.bloodGroup && !['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].includes(this.bloodGroup)) {
            errors.bloodGroup = { message: `\`${this.bloodGroup}\` is not a valid enum value for path \`bloodGroup\`.` }
          }
        } else if (name === 'Payment') {
          if (!this.appointmentId) errors.appointmentId = { message: 'Path `appointmentId` is required.' }
          if (!this.amount) errors.amount = { message: 'Path `amount` is required.' }
          if (!this.transactionId) errors.transactionId = { message: 'Path `transactionId` is required.' }
          if (this.paymentMethod && !['cash', 'credit-card', 'debit-card', 'insurance'].includes(this.paymentMethod)) {
            errors.paymentMethod = { message: `\`${this.paymentMethod}\` is not a valid enum value for path \`paymentMethod\`.` }
          }
          // Set defaults
          if (!this.currency) this.currency = 'Rs.'
          if (!this.paymentStatus) this.paymentStatus = 'completed'
        } else if (name === 'Admin') {
          if (!this.email) errors.email = { message: 'Path `email` is required.' }
          if (!this.name) errors.name = { message: 'Path `name` is required.' }
          if (!this.passwordHash) errors.passwordHash = { message: 'Path `passwordHash` is required.' }
        }
        
        return Object.keys(errors).length > 0 ? { errors } : undefined
      }
      save() {
        return Promise.resolve(this)
      }
    }
  }

  return {
    __esModule: true,
    default: {
      connect: jest.fn().mockResolvedValue(true),
      connection: {
        readyState: 1,
        close: jest.fn(),
      },
      model: mockModel,
      Schema: mockSchema,
      models: {},
    },
    connect: jest.fn().mockResolvedValue(true),
    model: mockModel,
    Schema: mockSchema,
  }
})
