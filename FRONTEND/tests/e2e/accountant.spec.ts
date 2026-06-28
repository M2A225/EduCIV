import { test, expect } from '@playwright/test';

const accountantUser = {
  id: 4,
  name: 'Mme Koné',
  email: 'accountant@educiv.com',
  role: 'ACCOUNTANT',
  school_id: 1,
  school_ids: [1],
  roles: ['ACCOUNTANT'],
  primary_school_id: 1,
};

const mockPayments = [
  { id: 1, amount_fcfa: 50000, payment_type: 'SCOLARITE', status: 'VALIDE', receipt_number: 'REC-001', payment_date: '2026-06-01T10:00:00Z' },
  { id: 2, amount_fcfa: 30000, payment_type: 'CANTINE', status: 'VALIDE', receipt_number: 'REC-002', payment_date: '2026-06-05T14:00:00Z' },
];

test.describe('Accountant Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-access-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
      window.localStorage.setItem('currentSchoolId', '1');
    });

    await page.route('**/auth/refresh', async route => {
      await route.fulfill({
        json: { success: true, data: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: accountantUser }, error: null },
      });
    });

    await page.route('**/schools/me**', async route => {
      await route.fulfill({ json: { success: true, data: { id: 1, name: 'EduCIV Test', school_type: 'SECONDAIRE', setup_complete: true } } });
    });

    await page.route('**/schools/setup-status**', async route => {
      await route.fulfill({ json: { success: true, data: { setup_complete: true, director_completed: true, accountant_completed: true, school_type: 'SECONDAIRE' } } });
    });
  });

  test('should redirect to accountant dashboard', async ({ page }) => {
    await page.goto('/accountant');
    await expect(page).toHaveURL(/\/accountant/);
  });

  test('should display accountant dashboard', async ({ page }) => {
    await page.route('**/payments**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockPayments, total: 2, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.goto('/accountant');
    await expect(page.locator('h1, h2, [class*="heading"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to accountant settings', async ({ page }) => {
    await page.goto('/accountant/settings');
    await expect(page).toHaveURL(/\/accountant\/settings/);
  });

  test('should navigate to payment plans', async ({ page }) => {
    await page.route('**/payment-plans**', async route => {
      await route.fulfill({ json: { success: true, data: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 } } });
    });

    await page.goto('/accountant/settings/plans');
    await expect(page).toHaveURL(/\/accountant\/settings\/plans/);
  });
});
