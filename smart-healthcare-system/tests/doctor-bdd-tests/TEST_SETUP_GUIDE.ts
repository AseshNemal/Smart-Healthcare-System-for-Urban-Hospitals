/**
 * Test Data Setup Guide for Doctor BDD Tests
 * 
 * This file provides instructions for setting up the required test data
 * for doctor BDD tests to run successfully.
 */

// ==================== TEST DOCTOR SETUP ====================

/**
 * Test Doctor Account Requirements:
 * - Email: test.doctor@hospital.com
 * - Password: TestDoctor123!
 * - Name: Dr. Test Doctor
 * - Specialty: General Practitioner
 * 
 * Setup Steps:
 * 
 * Option 1: Register via UI
 * 1. Navigate to http://localhost:3000/doctor/register
 * 2. Fill in the registration form with the above details
 * 3. Complete the registration process
 * 
 * Option 2: Use Admin Panel
 * 1. Login as admin at http://localhost:3000/admin
 * 2. Navigate to http://localhost:3000/admin/seed-doctors
 * 3. Use the seed function or manually add the doctor
 * 
 * Option 3: Direct Database Insert (MongoDB)
 * Run this in MongoDB shell or Compass:
 * 
 * use smartHealthcare  // or your database name
 * db.doctors.insertOne({
 *   name: "Dr. Test Doctor",
 *   email: "test.doctor@hospital.com",
 *   specialty: "General Practitioner",
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * })
 * 
 * Then create Firebase account:
 * - Use Firebase Console or Authentication API
 * - Create user with email: test.doctor@hospital.com
 * - Set password: TestDoctor123!
 */

// ==================== TEST PATIENT SETUP ====================

/**
 * Test Patient Account Requirements:
 * - Email: test.patient@example.com
 * - Password: TestPatient123!
 * - Name: Test Patient
 * 
 * Setup Steps:
 * 
 * Option 1: Register via UI
 * 1. Navigate to http://localhost:3000/register
 * 2. Register with the above credentials
 * 3. Complete the registration
 * 
 * Option 2: Direct Database Insert (MongoDB)
 * Run this in MongoDB shell:
 * 
 * use smartHealthcare
 * db.patients.insertOne({
 *   name: "Test Patient",
 *   email: "test.patient@example.com",
 *   phone: "1234567890",
 *   dateOfBirth: "1990-01-01",
 *   gender: "Other",
 *   address: "123 Test St",
 *   emergencyContact: "Emergency Contact",
 *   emergencyPhone: "0987654321",
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * })
 * 
 * Then create Firebase account:
 * - Create user with email: test.patient@example.com
 * - Set password: TestPatient123!
 */

// ==================== VERIFICATION SCRIPT ====================

/**
 * Verification Steps:
 * 
 * 1. Verify Doctor Account:
 *    - Try logging in at http://localhost:3000/doctor/login
 *    - Use: test.doctor@hospital.com / TestDoctor123!
 *    - Should redirect to /doctor/dashboard
 * 
 * 2. Verify Patient Account:
 *    - Try logging in at http://localhost:3000/login
 *    - Use: test.patient@example.com / TestPatient123!
 *    - Should redirect to /dashboard
 * 
 * 3. Run a Simple Test:
 *    npx playwright test tests/doctor-bdd-tests/doctor-login.spec.ts --headed
 */

// ==================== TROUBLESHOOTING ====================

/**
 * Common Issues and Solutions:
 * 
 * Issue: "No doctor account found"
 * Solution: Ensure the doctor exists in MongoDB. Check the doctors collection.
 * 
 * Issue: "Failed to login"
 * Solution: Verify Firebase authentication account exists with correct password.
 * 
 * Issue: "Patient not found"
 * Solution: 
 * - Patient might not be registered in the system
 * - Try registering via /register first
 * - Or skip patient-dependent tests initially
 * 
 * Issue: "Cannot reach dashboard"
 * Solution: Check if MongoDB connection is working and collections are properly set up.
 * 
 * Issue: "Timeout errors"
 * Solution: 
 * - Ensure dev server is running: npm run dev
 * - Check if port 3000 is accessible
 * - Increase timeout in playwright.config.ts if needed
 */

// ==================== ALTERNATIVE: PROGRAMMATIC SETUP ====================

/**
 * You can create a setup script using Playwright's API endpoints:
 * 
 * Example: Create test patient via API
 * 
 * async function setupTestPatient() {
 *   const response = await fetch('http://localhost:3000/api/patients/profile', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({
 *       name: 'Test Patient',
 *       email: 'test.patient@example.com',
 *       phone: '1234567890',
 *       dateOfBirth: '1990-01-01',
 *       gender: 'Other',
 *       address: '123 Test St',
 *       emergencyContact: 'Emergency Contact',
 *       emergencyPhone: '0987654321'
 *     })
 *   });
 *   return response.json();
 * }
 * 
 * Note: You'll still need to create Firebase accounts separately
 * or use Firebase Admin SDK for programmatic creation.
 */

export const TEST_DATA = {
  doctor: {
    email: 'y@gmail.com',
    password: '123456',
    name: 'Dr. Y. Karawita',
    specialty: 'Cardiologist'
  },
  patient: {
    email: 'yasindukarawita@gmail.com',
    password: '123456',
    name: 'yasindukarawita'
  }
};

// ==================== QUICK REFERENCE ====================

/**
 * Quick Commands:
 * 
 * # Run all doctor tests
 * npx playwright test tests/doctor-bdd-tests
 * 
 * # Run specific test file
 * npx playwright test tests/doctor-bdd-tests/doctor-login.spec.ts
 * 
 * # Run with UI
 * npx playwright test tests/doctor-bdd-tests --ui
 * 
 * # Run in headed mode (see browser)
 * npx playwright test tests/doctor-bdd-tests --headed
 * 
 * # Run specific test by name
 * npx playwright test tests/doctor-bdd-tests -g "Doctor logs in with valid credentials"
 * 
 * # Generate HTML report
 * npx playwright show-report
 */
