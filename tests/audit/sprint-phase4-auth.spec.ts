import { test, expect } from '@playwright/test';

test.describe('Phase 4 - Authentication', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/Golf/i);
  });

  test('auth modal appears on save intent message', async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Type a save intent message
    const chatInput = page.locator('textarea, input[type="text"]').first();
    await chatInput.fill('I want to save this course');
    await chatInput.press('Enter');
    // Wait for auth modal (may take time for AI response)
    const authModal = page.locator('text=Save your golf trip').or(page.locator('text=Save this course'));
    await expect(authModal).toBeVisible({ timeout: 30000 });
  });

  test('Google OAuth button is present in auth modal', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const chatInput = page.locator('textarea, input[type="text"]').first();
    await chatInput.fill('save my trip');
    await chatInput.press('Enter');
    const googleButton = page.locator('text=Continue with Google');
    await expect(googleButton).toBeVisible({ timeout: 30000 });
  });

  test('Maybe later button dismisses auth modal', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const chatInput = page.locator('textarea, input[type="text"]').first();
    await chatInput.fill('I want to bookmark this');
    await chatInput.press('Enter');
    const maybeLater = page.locator('text=Maybe later');
    await expect(maybeLater).toBeVisible({ timeout: 30000 });
    await maybeLater.click();
    // Modal should be dismissed
    await expect(maybeLater).not.toBeVisible();
  });
});
