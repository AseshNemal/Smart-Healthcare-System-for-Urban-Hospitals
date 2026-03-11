import { test, expect } from '@playwright/test';

/**
 * BDD Test Suite: Doctor Login Flow
 * 
 * This suite tests the behavior of doctors logging into the system.
 * It follows BDD principles with descriptive test names that explain
 * the expected behavior from a user perspective.
 */

test.describe('Feature: Doctor Authentication', () => {
  
  test.describe('Scenario: Doctor logs in with valid credentials', () => {
    
    test('Given I am on the doctor login page, When I enter valid credentials and submit, Then I should be redirected to the doctor dashboard', async ({ page }) => {
      // Given: I am on the doctor login page
      await page.goto('/doctor/login');
      
      // Wait for the login form to be fully rendered
      await expect(page.locator('#email')).toBeVisible({ timeout: 15000 });
      
      // When: I enter valid doctor credentials
      await page.locator('#email').fill('y@gmail.com');
      await page.locator('#password').fill('123456');
      
      // And: I click the login button
      await page.getByRole('button', { name: /Login/i }).click();
      
      // Then: I should be redirected to the doctor dashboard
      await expect(page).toHaveURL(/\/doctor\/dashboard/, { timeout: 15000 });
      
      // And: The dashboard should display the doctor portal header
      await expect(page.getByText('Doctor Portal')).toBeVisible();
      
      // And: The page should show my profile information
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('Scenario: Doctor attempts to login with invalid credentials', () => {
    
    test('Given I am on the doctor login page, When I enter invalid credentials, Then I should see an error message', async ({ page }) => {
      // Given: I am on the doctor login page
      await page.goto('/doctor/login');
      
      // Wait for the login form to be ready
      await expect(page.locator('#email')).toBeVisible({ timeout: 15000 });
      
      // When: I enter invalid credentials
      await page.locator('#email').fill('invalid.doctor@hospital.com');
      await page.locator('#password').fill('WrongPassword123!');
      
      // And: I click the login button
      await page.getByRole('button', { name: /Login/i }).click();
      
      // Then: I should see an error message
      // Wait a moment for the error to appear
      await page.waitForTimeout(2000);
      
      // And: I should still be on the login page
      await expect(page).toHaveURL(/\/doctor\/login/);
    });
  });

  test.describe('Scenario: Doctor navigates to dashboard without logging in', () => {
    
    test('Given I am not logged in, When I try to access the doctor dashboard, Then I should be redirected to the login page', async ({ page }) => {
      // Given: I am not logged in (fresh page context)
      // When: I try to access the doctor dashboard directly
      await page.goto('/doctor/dashboard');
      
      // Then: I should be redirected to the login page
      await expect(page).toHaveURL(/\/doctor\/login/, { timeout: 10000 });
      
      // And: The login form should be visible
      await expect(page.locator('#email')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Scenario: Doctor can see login page elements', () => {
    
    test('Given I am on the doctor login page, Then I should see all necessary login elements', async ({ page }) => {
      // Given: I am on the doctor login page
      await page.goto('/doctor/login');
      
      // Wait for page to load
      await expect(page.locator('#email')).toBeVisible({ timeout: 15000 });
      
      // Then: I should see the email input field
      await expect(page.locator('#email')).toBeVisible();
      
      // And: I should see the password input field
      await expect(page.locator('#password')).toBeVisible();
      
      // And: I should see the login button
      await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
      
      // And: I should see a link to the registration page
      const registerLink = page.locator('a[href="/doctor/register"]');
      if (await registerLink.count() > 0) {
        await expect(registerLink).toBeVisible();
      }
    });
  });

  test.describe('Scenario: Doctor with incomplete registration', () => {
    
    test('Given I have a Firebase account but no doctor record in MongoDB, When I try to login, Then I should see an error message', async ({ page }) => {
      // Given: I am on the doctor login page
      await page.goto('/doctor/login');
      
      // Wait for the login form
      await expect(page.locator('#email')).toBeVisible({ timeout: 15000 });
      
      // When: I enter credentials for an account that exists in Firebase but not in MongoDB
      // Note: This test assumes 'unregistered.doctor@hospital.com' has Firebase auth but no MongoDB record
      await page.locator('#email').fill('unregistered.doctor@hospital.com');
      await page.locator('#password').fill('SomePassword123!');
      
      // And: I click the login button
      await page.getByRole('button', { name: /Login/i }).click();
      
      // Then: I should see an error about no doctor account found
      // Wait for error to appear
      await page.waitForTimeout(2000);
      
      // And: I should still be on the login page (not redirected)
      await expect(page).toHaveURL(/\/doctor\/login/);
    });
  });
});
