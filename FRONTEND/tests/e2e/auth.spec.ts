import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h3')).toContainText('EduCIV');
  });

  test('should show error on invalid credentials', async ({ page }) => {
    // Listen for the alert dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Erreur de connexion');
      await dialog.dismiss();
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*login/);
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Mock the login API response to make tests independent of backend state
    await page.route('**/auth/login', async route => {
      const json = {
        success: true,
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        },
        error: null
      };
      await route.fulfill({ json });
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@educiv.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Tableau de bord');
  });

  test('should logout successfully', async ({ page }) => {
    // Setup authenticated state via mock
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
    });

    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Tableau de bord');

    // Click logout button
    await page.click('button:has-text("Déconnexion")');

    // Should be redirected to login
    await expect(page).toHaveURL(/.*login/);
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  });
});
