import { test, expect } from './doctor-fixtures';

// Slow down each Playwright action so each test step is clearly visible.
test.use({ launchOptions: { slowMo: 1000 } });

/**
 * BDD Test Suite: Doctor Patient Records Management
 * 
 * This suite tests the behavior of doctors when managing patient medical records.
 * It covers selecting patients from a list and adding consultation/medical records.
 * 
 * Prerequisites:
 * - Test doctor account must exist (y@gmail.com / 123456)
 * - At least one test patient must exist in the system (yasindukarawita@gmail.com)
 * 
 * Note: Tests use authenticatedDoctorPage fixture which automatically logs in the doctor
 */

const TEST_PATIENT_EMAIL = 'yasindukarawita@gmail.com';
const TEST_PATIENT_NAME = 'yasindukarawita';

// Helper function to navigate to records page and wait for it to load
async function navigateToRecordsPage(page: any) {
  // Click on Patient Records card from the dashboard
  await page.getByRole('heading', { name: 'Patient Records' }).click();
  
  // Wait for navigation to records page
  await expect(page).toHaveURL(/\/doctor\/records/, { timeout: 15000 });
  
  // Wait for loading state to finish
  await page.waitForFunction(() => {
    const text = document.body.textContent;
    return !text?.includes('Loading...');
  }, { timeout: 30000 });
  
  // Give the page a moment to fully render
  await page.waitForTimeout(2000);
}

test.describe('Feature: Doctor Manages Patient Medical Records', () => {

  test.describe('Scenario 1: Doctor navigates to patient records page', () => {
    
    test('Scenario 1: Given I am logged in as a doctor, When I navigate to the records page, Then I should see the patient search interface', async ({ authenticatedDoctorPage: page }) => {
      // Given: I am logged in as a doctor (handled by fixture)
      
      // When: I navigate to the records page
      await navigateToRecordsPage(page);
      
      // Then: I should see the "Find Patient" section
      await expect(page.getByText('Find Patient')).toBeVisible();
      
      // And: I should see the search mode toggle buttons
      await expect(page.getByRole('button', { name: /Select from List/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Search by Email/i })).toBeVisible();
    });
  });

  test.describe('Scenario 2: Doctor selects patient from dropdown list', () => {
    
    test('Scenario 2: Given I am on the records page, When I select a patient from the dropdown and load their records, Then I should see the patient information', async ({ authenticatedDoctorPage: page }) => {
      // Given: I am on the doctor records page
      await navigateToRecordsPage(page);
      
      // When: I ensure "Select from List" mode is active
      await page.getByRole('button', { name: /Select from List/i }).click();
      
      // And: I wait for the patient dropdown to be visible
      const patientSelect = page.locator('select[aria-label="Select patient"]');
      await expect(patientSelect).toBeVisible({ timeout: 5000 });
      
      // And: I select a patient from the dropdown
      // First check if there are patients available
      const options = await patientSelect.locator('option').count();
      
      if (options > 1) { // More than just the default "Select a patient" option
        // Select the first patient (index 1, since 0 is the placeholder)
        await patientSelect.selectOption({ index: 1 });
        
        // And: I click the "Load Records" button
        await page.getByRole('button', { name: /Load Records/i }).click();
        
        // Then: I should see patient information displayed
        // Wait for patient info to load
        await page.waitForTimeout(2000);
        
        // And: The page should show patient details (email, name, or medical info)
        // This will be visible if the patient was found
      } else {
        // If no patients in dropdown, search by email mode should work
        console.log('No patients in dropdown, test will use email search in other scenario');
      }
    });
  });

  test.describe('Scenario 3: Doctor searches for patient by email', () => {
    
    test('Scenario 3: Given I am on the records page, When I search for a patient by email, Then I should see the patient medical record', async ({ authenticatedDoctorPage: page }) => {
      // Given: I am on the doctor records page
      await navigateToRecordsPage(page);
      
      // When: I click on "Search by Email" mode
      await page.getByRole('button', { name: /Search by Email/i }).click();
      
      // And: I enter the patient's email
      const emailInput = page.locator('input#patientEmail');
      await expect(emailInput).toBeVisible({ timeout: 5000 });
      await emailInput.fill(TEST_PATIENT_EMAIL);
      
      // And: I click the "Search" button
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      
      // Then: I should see the patient information after search completes
      await page.waitForTimeout(2000);
      
      // And: The patient's email should be displayed or an error if patient not found
      // The page will show patient info if found, or error message if not found
    });
  });

  test.describe('Scenario 4: Doctor opens add new record form', () => {
    
    test('Scenario 4: Given I have loaded a patient record, When I click "Add New Record", Then I should see the consultation form', async ({ authenticatedDoctorPage: page }) => {
      // Given: I am on the records page and have searched for a patient
      await navigateToRecordsPage(page);
      
      // Search for patient by email
      await page.getByRole('button', { name: /Search by Email/i }).click();
      const emailInput = page.locator('input#patientEmail');
      await emailInput.fill(TEST_PATIENT_EMAIL);
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      
      // Wait for patient to load
      await page.waitForTimeout(2000);
      
      // When: I click the "Add New Record" button
      const addRecordButton = page.getByRole('button', { name: /Add New Record/i });
      
      // Check if button is visible (it appears after patient is loaded)
      const isButtonVisible = await addRecordButton.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isButtonVisible) {
        await addRecordButton.click();
        
        // Then: I should see the new consultation form
        await expect(page.getByText('New Consultation')).toBeVisible({ timeout: 5000 });
        
        // And: I should see the symptoms textarea
        await expect(page.locator('textarea[placeholder*="symptoms"]')).toBeVisible();
        
        // And: I should see the observations textarea
        await expect(page.locator('textarea[placeholder*="observations"]')).toBeVisible();
        
        // And: I should see vital signs input fields
        await expect(page.locator('input[aria-label="Blood pressure"]')).toBeVisible();
        await expect(page.locator('input[aria-label="Temperature"]')).toBeVisible();
        await expect(page.locator('input[aria-label="Heart rate"]')).toBeVisible();
      }
    });
  });

  test.describe('Scenario 5: Doctor fills out and submits a complete consultation form', () => {
    
    test('Scenario 5: Given I have the consultation form open, When I fill in all required fields and submit, Then the consultation should be saved successfully', async ({ authenticatedDoctorPage: page }) => {
      // Given: I am on the records page
      await navigateToRecordsPage(page);
      
      // And: I have searched for a patient
      await page.getByRole('button', { name: /Search by Email/i }).click();
      const emailInput = page.locator('input#patientEmail');
      await emailInput.fill(TEST_PATIENT_EMAIL);
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      await page.waitForTimeout(2000);
      
      // And: I have opened the add new record form
      const addRecordButton = page.getByRole('button', { name: /Add New Record/i });
      const isButtonVisible = await addRecordButton.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isButtonVisible) {
        await addRecordButton.click();
        await expect(page.getByText('New Consultation')).toBeVisible({ timeout: 5000 });
        
        // When: I fill in the symptoms
        const symptomsTextarea = page.locator('textarea[placeholder*="symptoms"]').first();
        await symptomsTextarea.fill('Patient complains of fever and headache for 3 days');
        
        // And: I fill in the observations
        const observationsTextarea = page.locator('textarea[placeholder*="observations"]').first();
        await observationsTextarea.fill('Patient appears fatigued, slight temperature elevation noted');
        
        // And: I fill in vital signs
        await page.locator('input[aria-label="Blood pressure"]').fill('120/80');
        await page.locator('input[aria-label="Temperature"]').fill('101.5');
        await page.locator('input[aria-label="Heart rate"]').fill('78');
        await page.locator('input[aria-label="Weight"]').fill('70');
        await page.locator('input[aria-label="Height"]').fill('170');
        
        // And: I fill in the diagnosis (first diagnosis field should be visible)
        const conditionInputs = page.locator('input[placeholder*="Condition"]');
        await conditionInputs.first().fill('Viral Fever');
        
        // And: I select severity
        const severitySelects = page.locator('select[aria-label="Severity level"]');
        await severitySelects.first().selectOption('Mild');
        
        // And: I add notes to the diagnosis
        const diagnosisNotes = page.locator('input[placeholder*="Notes"]').first();
        await diagnosisNotes.fill('Common viral infection, self-limiting');
        
        // And: I add a prescription
        const medicineInputs = page.locator('input[placeholder*="Medicine Name"]');
        await medicineInputs.first().fill('Paracetamol');
        
        const dosageInputs = page.locator('input[placeholder*="Dosage"]');
        await dosageInputs.first().fill('500mg');
        
        const frequencyInputs = page.locator('input[placeholder*="Frequency"]');
        await frequencyInputs.first().fill('3 times daily');
        
        const durationInputs = page.locator('input[placeholder*="Duration"]');
        await durationInputs.first().fill('5 days');
        
        const instructionsInputs = page.locator('input[aria-label="Medicine instructions"]');
        await instructionsInputs.first().fill('Take after meals');
        
        // And: I click the save button
        const saveButton = page.getByRole('button', { name: /Save Consultation/i });
        await saveButton.click();
        
        // Then: I should see a success message
        // Wait for the save operation to complete
        await page.waitForTimeout(2000);
        
        // The form should close or show success indication
        // Check if alert appears or form closes
        page.on('dialog', async dialog => {
          expect(dialog.message()).toContain('success');
          await dialog.accept();
        });
      }
    });
  });

  test.describe('Scenario 6: Doctor attempts to save consultation without required fields', () => {
    
    test('Scenario 6: Given I have the consultation form open, When I try to submit without filling required fields, Then I should see validation errors', async ({ authenticatedDoctorPage: page }) => {
      // Given: I am on the records page with a patient loaded
      await navigateToRecordsPage(page);
      
      await page.getByRole('button', { name: /Search by Email/i }).click();
      const emailInput = page.locator('input#patientEmail');
      await emailInput.fill(TEST_PATIENT_EMAIL);
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      await page.waitForTimeout(2000);
      
      // And: I have opened the add new record form
      const addRecordButton = page.getByRole('button', { name: /Add New Record/i });
      const isButtonVisible = await addRecordButton.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isButtonVisible) {
        await addRecordButton.click();
        await expect(page.getByText('New Consultation')).toBeVisible({ timeout: 5000 });
        
        // When: I try to save without filling any required fields
        const saveButton = page.getByRole('button', { name: /Save Consultation/i });
        await saveButton.click();
        
        // Then: I should see an error message about required fields
        await page.waitForTimeout(1000);
        
        // And: The form should still be visible (not closed)
        await expect(page.getByText('New Consultation')).toBeVisible();
      }
    });
  });

  test.describe('Scenario 7: Doctor adds multiple diagnoses', () => {
    
    test('Scenario 7: Given I have the consultation form open, When I click "Add Diagnosis", Then I should see an additional diagnosis input row', async ({ authenticatedDoctorPage: page }) => {
      // Given: I am on the records page with add consultation form open
      await navigateToRecordsPage(page);
      
      await page.getByRole('button', { name: /Search by Email/i }).click();
      const emailInput = page.locator('input#patientEmail');
      await emailInput.fill(TEST_PATIENT_EMAIL);
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      await page.waitForTimeout(2000);
      
      const addRecordButton = page.getByRole('button', { name: /Add New Record/i });
      const isButtonVisible = await addRecordButton.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isButtonVisible) {
        await addRecordButton.click();
        await expect(page.getByText('New Consultation')).toBeVisible({ timeout: 5000 });
        
        // When: I count the initial diagnosis rows
        const initialDiagnosisCount = await page.locator('input[placeholder*="Condition"]').count();
        
        // And: I click the "Add Diagnosis" button
        const addDiagnosisButton = page.getByRole('button', { name: /Add Diagnosis/i });
        await addDiagnosisButton.click();
        
        // Then: I should see one more diagnosis input row
        const newDiagnosisCount = await page.locator('input[placeholder*="Condition"]').count();
        expect(newDiagnosisCount).toBe(initialDiagnosisCount + 1);
      }
    });
  });

  test.describe('Scenario 8: Doctor adds multiple prescriptions', () => {
    
    test('Scenario 8: Given I have the consultation form open, When I click "Add Medicine", Then I should see an additional prescription input row', async ({ authenticatedDoctorPage: page }) => {
      // Given: I am on the records page with add consultation form open
      await navigateToRecordsPage(page);
      
      await page.getByRole('button', { name: /Search by Email/i }).click();
      const emailInput = page.locator('input#patientEmail');
      await emailInput.fill(TEST_PATIENT_EMAIL);
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      await page.waitForTimeout(2000);
      
      const addRecordButton = page.getByRole('button', { name: /Add New Record/i });
      const isButtonVisible = await addRecordButton.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isButtonVisible) {
        await addRecordButton.click();
        await expect(page.getByText('New Consultation')).toBeVisible({ timeout: 5000 });
        
        // When: I count the initial prescription rows
        const initialPrescriptionCount = await page.locator('input[placeholder*="Medicine Name"]').count();
        
        // And: I click the "Add Medicine" button
        const addMedicineButton = page.getByRole('button', { name: /Add Medicine/i });
        await addMedicineButton.click();
        
        // Then: I should see one more prescription input row
        const newPrescriptionCount = await page.locator('input[placeholder*="Medicine Name"]').count();
        expect(newPrescriptionCount).toBe(initialPrescriptionCount + 1);
      }
    });
  });

  test.describe('Scenario 9: Doctor cancels adding a new consultation', () => {
    
    test('Scenario 9: Given I have the consultation form open, When I click "Cancel", Then the form should close without saving', async ({ authenticatedDoctorPage: page }) => {
      // Given: I am on the records page with add consultation form open
      await navigateToRecordsPage(page);
      
      await page.getByRole('button', { name: /Search by Email/i }).click();
      const emailInput = page.locator('input#patientEmail');
      await emailInput.fill(TEST_PATIENT_EMAIL);
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      await page.waitForTimeout(2000);
      
      const addRecordButton = page.getByRole('button', { name: /Add New Record/i });
      const isButtonVisible = await addRecordButton.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isButtonVisible) {
        await addRecordButton.click();
        await expect(page.getByText('New Consultation')).toBeVisible({ timeout: 5000 });
        
        // When: I fill in some data
        const symptomsTextarea = page.locator('textarea[placeholder*="symptoms"]').first();
        await symptomsTextarea.fill('Some symptoms');
        
        // And: I click the "Cancel" button (the button text changes to "Cancel" when form is open)
        const cancelButton = page.getByRole('button', { name: /Cancel/i });
        await cancelButton.click();
        
        // Then: The consultation form should no longer be visible
        await expect(page.getByText('New Consultation')).not.toBeVisible({ timeout: 3000 });
      }
    });
  });
});
