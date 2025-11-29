import { test, expect } from '@playwright/test';

test.describe('Phase 5 - Booking Flow', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/Golf/i);
  });

  test('inquiry form appears on booking intent', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const chatInput = page.locator('textarea, input[type="text"]').first();
    await chatInput.fill('I want to book a golf trip');
    await chatInput.press('Enter');
    // Wait for inquiry form
    const inquiryForm = page.locator('text=Request Booking').or(page.locator('form'));
    await expect(inquiryForm).toBeVisible({ timeout: 30000 });
  });

  test('inquiry form has required fields', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const chatInput = page.locator('textarea, input[type="text"]').first();
    await chatInput.fill('request a quote');
    await chatInput.press('Enter');
    // Check form fields exist
    const nameField = page.locator('input[type="text"]').or(page.locator('input[name="name"]'));
    const emailField = page.locator('input[type="email"]');
    await expect(nameField.first()).toBeVisible({ timeout: 30000 });
    await expect(emailField.first()).toBeVisible({ timeout: 30000 });
  });

  test('API endpoint returns 400 for invalid inquiry', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/inquiries', {
      data: { email: 'invalid' } // Missing required name field
    });
    expect(response.status()).toBe(400);
  });
});
