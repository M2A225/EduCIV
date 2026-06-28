import { test, expect } from '@playwright/test';

const cashierUser = {
  id: 6,
  name: 'M. Bogaert',
  email: 'cashier@educiv.com',
  role: 'CASHIER',
  school_id: 1,
  school_ids: [1],
  roles: ['CASHIER'],
  primary_school_id: 1,
};

test.describe('Cashier Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-access-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
      window.localStorage.setItem('currentSchoolId', '1');
    });

    await page.route('**/auth/refresh', async route => {
      await route.fulfill({
        json: { success: true, data: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: cashierUser }, error: null },
      });
    });

    await page.route('**/schools/me**', async route => {
      await route.fulfill({ json: { success: true, data: { id: 1, name: 'EduCIV Test', school_type: 'SECONDAIRE', setup_complete: true } } });
    });

    await page.route('**/schools/setup-status**', async route => {
      await route.fulfill({ json: { success: true, data: { setup_complete: true, director_completed: true, accountant_completed: true, school_type: 'SECONDAIRE' } } });
    });
  });

  test('should redirect to cashier dashboard', async ({ page }) => {
    await page.goto('/cashier');
    await expect(page).toHaveURL(/\/cashier/);
  });

  test('should display cashier dashboard', async ({ page }) => {
    await page.goto('/cashier');
    await expect(page.locator('h1, h2, [class*="heading"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to cashier search', async ({ page }) => {
    await page.goto('/cashier/search');
    await expect(page).toHaveURL(/\/cashier\/search/);
  });
});
