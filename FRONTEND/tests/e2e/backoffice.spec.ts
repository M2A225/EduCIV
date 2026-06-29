import { test, expect } from '@playwright/test';

const backofficeUser = {
  id: 2,
  name: 'Admin Backoffice',
  email: 'admin@educiv.com',
  role: 'BACKOFFICE',
  school_id: 1,
  school_ids: [1],
  roles: ['BACKOFFICE'],
  primary_school_id: 1,
};

test.describe.skip('Backoffice Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-access-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
      window.localStorage.setItem('currentSchoolId', '1');
    });

    await page.route('**/auth/refresh', async route => {
      await route.fulfill({
        json: { success: true, data: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: backofficeUser }, error: null },
      });
    });

    await page.route('**/schools/me**', async route => {
      await route.fulfill({ json: { success: true, data: { id: 1, name: 'EduCIV Test', school_type: 'SECONDAIRE', setup_complete: true } } });
    });

    await page.route('**/schools/setup-status**', async route => {
      await route.fulfill({ json: { success: true, data: { setup_complete: true, director_completed: true, accountant_completed: true, school_type: 'SECONDAIRE' } } });
    });
  });

  test('should redirect to backoffice dashboard', async ({ page }) => {
    await page.goto('/backoffice');
    await expect(page).toHaveURL(/\/backoffice/);
  });

  test('should display backoffice dashboard', async ({ page }) => {
    await page.goto('/backoffice');
    await expect(page.locator('h1, h2, [class*="heading"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to backoffice users', async ({ page }) => {
    await page.route('**/users**', async route => {
      await route.fulfill({ json: { success: true, data: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 } } });
    });

    await page.goto('/backoffice/users');
    await expect(page).toHaveURL(/\/backoffice\/users/);
  });

  test('should navigate to backoffice schools', async ({ page }) => {
    await page.route('**/schools**', async route => {
      await route.fulfill({ json: { success: true, data: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 } } });
    });

    await page.goto('/backoffice/schools');
    await expect(page).toHaveURL(/\/backoffice\/schools/);
  });

  test('should navigate to backoffice audit', async ({ page }) => {
    await page.goto('/backoffice/audit');
    await expect(page).toHaveURL(/\/backoffice\/audit/);
  });
});
