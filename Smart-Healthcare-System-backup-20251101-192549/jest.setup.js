// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db'
process.env.ADMIN_JWT_SECRET = 'test-secret-key-for-testing'
process.env.ADMIN_EMAIL = 'test@admin.com'
process.env.ADMIN_NAME = 'Test Admin'
process.env.ADMIN_PASSWORD = 'testpassword'
