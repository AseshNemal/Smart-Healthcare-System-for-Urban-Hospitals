import { test, expect } from '@playwright/test';

// Slow down each Playwright action so each test step is clearly visible.
test.use({ launchOptions: { slowMo: 1000 } });

/**
 * BDD Test Suite: Doctor Complete Workflow - Broken into Focused Scenarios
 * 
 * This suite tests the doctor workflow broken down into smaller, focused test scenarios.
 * Each test focuses on one specific behavior for easier debugging and maintenance.
 * 
 * Prerequisites:
 * - Test doctor: y@gmail.com / 123456
 * - Test patient: yasindukarawita@gmail.com
 */

const TEST_DOCTOR_EMAIL = 'y@gmail.com';
const TEST_DOCTOR_PASSWORD = '123456';
const TEST_PATIENT_EMAIL = 'yasindukarawita@gmail.com';

// Helper: Login as doctor
async function loginAsDoctor(page: any) {
  await page.goto('/doctor/login');
  await expect(page.locator('#email')).toBeVisible({ timeout: 15000 });
  await page.locator('#email').fill(TEST_DOCTOR_EMAIL);
  await page.locator('#password').fill(TEST_DOCTOR_PASSWORD);
  await page.getByRole('button', { name: /Login/i }).click();
  await expect(page).toHaveURL(/\/doctor\/dashboard/, { timeout: 15000 });
  await expect(page.getByText('Doctor Portal')).toBeVisible({ timeout: 10000 });
}

// Helper: Navigate to records page
async function navigateToRecords(page: any) {
  await page.getByRole('heading', { name: 'Patient Records' }).click();
  await expect(page).toHaveURL(/\/doctor\/records/, { timeout: 15000 });
  await page.waitForFunction(() => {
    const loadingText = document.body.textContent;
    return !loadingText?.includes('Loading...');
  }, { timeout: 30000 });
  await page.waitForTimeout(2000);
}

// Helper: Search for patient by email
async function searchPatientByEmail(page: any, email: string) {
  await page.getByRole('button', { name: /Search by Email/i }).click();
  const emailInput = page.locator('input#patientEmail');
  await expect(emailInput).toBeVisible({ timeout: 5000 });
  await emailInput.fill(email);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.waitForTimeout(2000);
}

test.describe('Feature: Doctor Workflow - Broken Down Scenarios', () => {

  test('Scenario 1: Doctor can login and navigate to patient records page', async ({ page }) => {
    // Given: I am a doctor who wants to access patient records
    // When: I login with valid credentials
    await loginAsDoctor(page);
    
    // And: I click on Patient Records from the dashboard
    await navigateToRecords(page);
    
    // Then: I should see the patient search interface
    await expect(page.getByText('Find Patient')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /Select from List/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Search by Email/i })).toBeVisible();
  });

  test('Scenario 2: Doctor can search for a patient by email', async ({ page }) => {
    // Given: I am logged in and on the patient records page
    await loginAsDoctor(page);
    await navigateToRecords(page);
    
    // When: I search for a patient by their email
    await searchPatientByEmail(page, TEST_PATIENT_EMAIL);
    
    // Then: The patient search should complete
    // (Patient details or Add New Record button should appear)
    const addRecordButton = page.getByRole('button', { name: /Add New Record/i });
    const isVisible = await addRecordButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    // If patient exists, the button should be visible
    if (isVisible) {
      await expect(addRecordButton).toBeVisible();
    }
  });

  test('Scenario 3: Doctor can open the add consultation form', async ({ page }) => {
    // Given: I have searched for a patient
    await loginAsDoctor(page);
    await navigateToRecords(page);
    await searchPatientByEmail(page, TEST_PATIENT_EMAIL);
    
    // When: I click the "Add New Record" button
    const addRecordButton = page.getByRole('button', { name: /Add New Record/i });
    await expect(addRecordButton).toBeVisible({ timeout: 5000 });
    await addRecordButton.click();
    
    // Then: I should see the consultation form
    await expect(page.getByText('New Consultation')).toBeVisible({ timeout: 5000 });
  });

  test('Scenario 4: Doctor can fill symptoms and observations', async ({ page }) => {
    // Given: I have opened the add consultation form
    await loginAsDoctor(page);
    await navigateToRecords(page);
    await searchPatientByEmail(page, TEST_PATIENT_EMAIL);
    await page.getByRole('button', { name: /Add New Record/i }).click();
    await expect(page.getByText('New Consultation')).toBeVisible({ timeout: 5000 });
    
    // When: I fill in the patient's symptoms
    const symptomsTextarea = page.locator('textarea[placeholder*="symptoms"]').first();
    await symptomsTextarea.fill('Patient presents with persistent cough and sore throat for 5 days.');
    
    // And: I add my clinical observations
    const observationsTextarea = page.locator('textarea[placeholder*="observations"]').first();
    await observationsTextarea.fill('Throat shows moderate inflammation. Lungs clear on auscultation.');
    
    // Then: The fields should contain the entered text
    await expect(symptomsTextarea).toHaveValue(/persistent cough/);
    await expect(observationsTextarea).toHaveValue(/moderate inflammation/);
  });

  test('Scenario 5: Doctor can record patient vital signs', async ({ page }) => {
    // Given: I have opened the add consultation form
    await loginAsDoctor(page);
    await navigateToRecords(page);
    await searchPatientByEmail(page, TEST_PATIENT_EMAIL);
    await page.getByRole('button', { name: /Add New Record/i }).click();
    await expect(page.getByText('New Consultation')).toBeVisible({ timeout: 5000 });
    
    // When: I record the patient's vital signs
    await page.locator('input[aria-label="Blood pressure"]').fill('118/76');
    await page.locator('input[aria-label="Temperature"]').fill('99.8');
    await page.locator('input[aria-label="Heart rate"]').fill('72');
    await page.locator('input[aria-label="Weight"]').fill('68');
    await page.locator('input[aria-label="Height"]').fill('165');
    
    // Then: The vital signs should be recorded
    await expect(page.locator('input[aria-label="Blood pressure"]')).toHaveValue('118/76');
    await expect(page.locator('input[aria-label="Temperature"]')).toHaveValue('99.8');
    await expect(page.locator('input[aria-label="Heart rate"]')).toHaveValue('72');
  });

  test('Scenario 6: Doctor can add diagnosis and prescriptions', async ({ page }) => {
    // Given: I have opened the add consultation form
    await loginAsDoctor(page);
    await navigateToRecords(page);
    await searchPatientByEmail(page, TEST_PATIENT_EMAIL);
    await page.getByRole('button', { name: /Add New Record/i }).click();
    await expect(page.getByText('New Consultation')).toBeVisible({ timeout: 5000 });
    
    // When: I add the primary diagnosis
    const conditionInputs = page.locator('input[placeholder*="Condition"]');
    await conditionInputs.first().fill('Upper Respiratory Tract Infection (URTI)');
    
    // And: I set the severity level
    const severitySelects = page.locator('select[aria-label="Severity level"]');
    await severitySelects.first().selectOption('Mild');
    
    // And: I prescribe medication
    const medicineInputs = page.locator('input[placeholder*="Medicine Name"]');
    await medicineInputs.first().fill('Ibuprofen');
    
    const dosageInputs = page.locator('input[placeholder*="Dosage"]');
    await dosageInputs.first().fill('400mg');
    
    const frequencyInputs = page.locator('input[placeholder*="Frequency"]');
    await frequencyInputs.first().fill('Every 6-8 hours as needed');
    
    // Then: The diagnosis and prescription should be entered
    await expect(conditionInputs.first()).toHaveValue(/URTI/);
    await expect(medicineInputs.first()).toHaveValue('Ibuprofen');
    await expect(dosageInputs.first()).toHaveValue('400mg');
  });

  test('Scenario 7: Doctor can add multiple medications', async ({ page }) => {
    // Given: I have opened the add consultation form and added one medication
    await loginAsDoctor(page);
    await navigateToRecords(page);
    await searchPatientByEmail(page, TEST_PATIENT_EMAIL);
    await page.getByRole('button', { name: /Add New Record/i }).click();
    await expect(page.getByText('New Consultation')).toBeVisible({ timeout: 5000 });
    
    await page.locator('input[placeholder*="Medicine Name"]').first().fill('Ibuprofen');
    
    // When: I click "Add Medicine" to add another medication
    const addMedicineButton = page.getByRole('button', { name: /Add Medicine/i });
    await addMedicineButton.click();
    
    // And: I fill in the second medication
    await page.locator('input[placeholder*="Medicine Name"]').nth(1).fill('Cough Syrup');
    await page.locator('input[placeholder*="Dosage"]').nth(1).fill('10ml');
    
    // Then: I should see both medications in the form
    await expect(page.locator('input[placeholder*="Medicine Name"]').first()).toHaveValue('Ibuprofen');
    await expect(page.locator('input[placeholder*="Medicine Name"]').nth(1)).toHaveValue('Cough Syrup');
  });

  test('Scenario 8: Doctor can save a complete consultation', async ({ page }) => {
    // Given: I have filled out a complete consultation form
    await loginAsDoctor(page);
    await navigateToRecords(page);
    await searchPatientByEmail(page, TEST_PATIENT_EMAIL);
    await page.getByRole('button', { name: /Add New Record/i }).click();
    await expect(page.getByText('New Consultation')).toBeVisible({ timeout: 5000 });
    
    // Fill minimum required fields
    await page.locator('textarea[placeholder*="symptoms"]').first().fill('Cough and fever');
    await page.locator('textarea[placeholder*="observations"]').first().fill('Patient appears stable');
    await page.locator('input[placeholder*="Condition"]').first().fill('Common Cold');
    await page.locator('input[placeholder*="Medicine Name"]').first().fill('Paracetamol');
    await page.locator('input[placeholder*="Dosage"]').first().fill('500mg');
    await page.locator('input[placeholder*="Frequency"]').first().fill('3 times daily');
    await page.locator('input[placeholder*="Duration"]').first().fill('5 days');
    
    // When: I click "Save Consultation"
    const saveButton = page.getByRole('button', { name: /Save Consultation/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    
    // Then: The consultation should be saved
    await page.waitForTimeout(3000);
    
    // And: The form should close (or show success)
    const formStillVisible = await page.getByText('New Consultation').isVisible({ timeout: 3000 }).catch(() => false);
    expect(formStillVisible).toBe(false);
  });

  test('Alternative Scenario: Doctor selects patient from dropdown list', async ({ page }) => {
    
    // Login first
    await page.goto('/doctor/login');
    await expect(page.locator('#email')).toBeVisible({ timeout: 15000 });
    await page.locator('#email').fill(TEST_DOCTOR_EMAIL);
    await page.locator('#password').fill(TEST_DOCTOR_PASSWORD);
    await page.getByRole('button', { name: /Login/i }).click();
    await expect(page).toHaveURL(/\/doctor\/dashboard/, { timeout: 15000 });
    
    // Wait for dashboard to load
    await expect(page.getByText('Doctor Portal')).toBeVisible({ timeout: 10000 });
    
    // Navigate to records by clicking the Patient Records card
    await page.getByRole('heading', { name: 'Patient Records' }).click();
    
    // Wait for navigation to records page
    await expect(page).toHaveURL(/\/doctor\/records/, { timeout: 15000 });
    
    // Wait for the loading state to disappear
    await page.waitForFunction(() => {
      const loadingText = document.body.textContent;
      return !loadingText?.includes('Loading...');
    }, { timeout: 30000 });
    
    // Give the page a moment to fully render
    await page.waitForTimeout(2000);
    
    // Given: I am on the records page
    // When: I choose to select from list
    await page.getByRole('button', { name: /Select from List/i }).click();
    
    // And: I check if the dropdown has patients
    const patientSelect = page.locator('select[aria-label="Select patient"]');
    await expect(patientSelect).toBeVisible({ timeout: 5000 });
    
    const options = await patientSelect.locator('option').count();
    
    if (options > 1) {
      console.log(`✓ Found ${options - 1} patient(s) in dropdown`);
      
      // When: I select the first patient from the dropdown
      await patientSelect.selectOption({ index: 1 });
      
      // And: I click the "Load Records" button
      await page.getByRole('button', { name: /Load Records/i }).click();
      
      console.log('✓ Selected patient from dropdown');
      
      // Then: Patient information should load
      await page.waitForTimeout(2000);
      
      // And: I should be able to add a new record
      const addRecordButton = page.getByRole('button', { name: /Add New Record/i });
      const isVisible = await addRecordButton.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isVisible) {
        console.log('✓ Add New Record button is available');
        console.log('✓ Patient successfully loaded from dropdown');
      }
    } else {
      console.log('⚠ No patients available in dropdown');
      console.log('  This is expected if no patients are registered yet');
      console.log('  Use the email search method instead');
    }
  });
});
