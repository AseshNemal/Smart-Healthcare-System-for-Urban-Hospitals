# Doctor BDD Tests

This folder contains Behavior-Driven Development (BDD) tests for the doctor portal functionality using Playwright.

## Test Coverage

The test suite covers the complete doctor workflow including:
- **Doctor Authentication**: Login flow with valid and invalid credentials
- **Patient Records Navigation**: Accessing patient records from dashboard
- **Patient Search**: Finding patients by email or selecting from dropdown
- **Medical Consultation**: Opening consultation forms and adding records
- **Data Entry**: Filling symptoms, observations, vital signs, diagnoses, and prescriptions
- **Form Validation**: Testing required fields and multiple entries
- **Complete Workflow**: End-to-end scenarios from login to saving consultations

## Prerequisites

Before running these tests, ensure:

1. **Application is running** on `http://localhost:3000` 
   ```bash
   npm run dev
   ```

2. **MongoDB is connected** and accessible

3. **Test accounts exist** in Firebase Authentication and MongoDB:

### Test Doctor Account
- **Email**: `y@gmail.com`
- **Password**: `123456`
- Must be registered in both Firebase and MongoDB

### Test Patient Account
- **Email**: `yasindukarawita@gmail.com`
- Must exist in the database for patient search/selection tests

To set up test accounts:
1. Register doctor via `/doctor/register`
2. Register patient via `/register`
3. Or use admin seeding tools

## Running the Tests

### Run All Tests
```bash
# All doctor BDD tests (headless)
npx playwright test tests/doctor-bdd-tests

# All tests with visible browser
npx playwright test tests/doctor-bdd-tests --headed
```

### Run Specific Test Files
```bash
# Doctor login tests
npx playwright test tests/doctor-bdd-tests/doctor-login.spec.ts --headed

# Patient records management tests
npx playwright test tests/doctor-bdd-tests/doctor-patient-records.spec.ts --headed

# End-to-end workflow tests (broken into 8 scenarios + 1 alternative)
npx playwright test tests/doctor-bdd-tests/doctor-e2e-workflow.spec.ts --headed
```

### Run Specific Scenarios
```bash
# Run a specific scenario by name
npx playwright test tests/doctor-bdd-tests/doctor-e2e-workflow.spec.ts -g "Scenario 1" --headed

# Run the alternative dropdown scenario
npx playwright test tests/doctor-bdd-tests/doctor-e2e-workflow.spec.ts -g "Alternative Scenario" --headed
```

### Debug Mode
```bash
# Run with Playwright UI for interactive debugging
npx playwright test tests/doctor-bdd-tests --ui

# Run with debug mode
npx playwright test tests/doctor-bdd-tests --debug
```

## Test Files

### Core Test Files

- **`doctor-fixtures.ts`**  
  Shared Playwright fixtures for authenticated doctor sessions. Provides `authenticatedDoctorPage` fixture that automatically logs in the doctor before each test.

- **`doctor-login.spec.ts`**  
  Tests doctor authentication functionality including:
  - Successful login with valid credentials
  - Failed login with invalid credentials
  - Login form validation
  - Redirect to dashboard after login

- **`doctor-patient-records.spec.ts`**  
  Tests patient records management using authenticated fixture:
  - Searching patients by email
  - Selecting patients from dropdown
  - Opening consultation forms
  - Filling symptoms and observations
  - Recording vital signs
  - Adding diagnoses and prescriptions
  - Adding multiple medications
  - Saving consultations
  - Form validation and cancellation

- **`doctor-e2e-workflow.spec.ts`**  
  Complete workflow tests broken into 8 focused scenarios + 1 alternative:
  1. **Scenario 1**: Doctor can login and navigate to patient records page
  2. **Scenario 2**: Doctor can search for a patient by email
  3. **Scenario 3**: Doctor can open the add consultation form
  4. **Scenario 4**: Doctor can fill symptoms and observations
  5. **Scenario 5**: Doctor can record patient vital signs
  6. **Scenario 6**: Doctor can add diagnosis and prescriptions
  7. **Scenario 7**: Doctor can add multiple medications
  8. **Scenario 8**: Doctor can save a complete consultation
  9. **Alternative Scenario**: Doctor selects patient from dropdown list

### Documentation Files

- **`README.md`** - This file, comprehensive guide to the test suite
- **`QUICK_START_GUIDE.md`** - Quick reference for running tests
- **`TEST_SETUP_GUIDE.ts`** - Detailed setup instructions for test environment

## Test Structure

All tests follow BDD (Behavior-Driven Development) principles with:
- **Given-When-Then** structure in test descriptions
- Clear, readable test names describing behavior
- Focused scenarios testing one specific behavior
- Reusable helper functions to avoid duplication

### Helper Functions (in doctor-e2e-workflow.spec.ts)

```typescript
loginAsDoctor(page) - Logs in with test doctor credentials
navigateToRecords(page) - Clicks Patient Records card from dashboard
searchPatientByEmail(page, email) - Searches for patient by email
```

## Troubleshooting

### Tests Fail to Find Elements

**Issue**: Tests report elements not found or timeout errors

**Solutions**:
1. Ensure dev server is running on `http://localhost:3000`
2. Check MongoDB connection is active
3. Verify test accounts exist in Firebase and MongoDB
4. Run tests with `--headed` flag to see what's happening visually
5. Check network tab for API errors

### Login Tests Fail

**Issue**: Doctor cannot login

**Solutions**:
1. Verify doctor account exists: `y@gmail.com` / `123456`
2. Check Firebase Authentication is configured
3. Ensure MongoDB has matching doctor record
4. Check browser console for authentication errors

### Patient Search Fails

**Issue**: Patient not found during search

**Solutions**:
1. Verify patient exists: `yasindukarawita@gmail.com`
2. Check patient is in MongoDB patients collection
3. Ensure patient record is properly formatted
4. Check API endpoint `/api/patients` is working

### Form Submission Fails

**Issue**: Consultation form doesn't save

**Solutions**:
1. Verify all required fields are filled (symptoms, observations, condition, medicine, dosage, frequency, duration)
2. Check MongoDB write permissions
3. Look for validation errors in browser console
4. Verify API endpoint `/api/medical-records` is responding

## Best Practices

1. **Always run with dev server active** - Tests require the application to be running
2. **Use `--headed` during development** - Easier to debug when you can see the browser
3. **Run individual scenarios** - Use `-g "Scenario X"` to test specific behaviors
4. **Check fixtures first** - If all tests fail, the issue is likely in `doctor-fixtures.ts`
5. **Verify test data** - Ensure test accounts exist before running tests

## CI/CD Integration

To run these tests in a CI/CD pipeline:

```bash
# Install dependencies
npm install

# Start dev server in background
npm run dev &

# Wait for server to be ready
npx wait-on http://localhost:3000

# Run tests
npx playwright test tests/doctor-bdd-tests

# Stop dev server
pkill -f "next dev"
```

## Further Reading

- [Playwright Documentation](https://playwright.dev)
- [BDD with Playwright](https://playwright.dev/docs/test-annotations)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
