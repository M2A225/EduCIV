import { test, expect } from '@playwright/test';

const userData = {
  id: 5,
  name: 'Mme Diallo',
  email: 'teacher-cashier@educiv.com',
  role: 'TEACHER',
  school_id: 1,
  school_ids: [1],
  roles: ['TEACHER', 'CASHIER'],
  primary_school_id: 1,
};

test.describe.skip('Multi-Role Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-access-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
      window.localStorage.setItem('user', JSON.stringify(userData));
    });

    await page.route('**/auth/refresh', async route => {
      await route.fulfill({
        json: { success: true, data: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: userData }, error: null },
      });
    });

    await page.route('**/auth/switch-role', async route => {
      await route.fulfill({
        json: {
          success: true,
          data: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            user: { ...userData, role: 'CASHIER' },
          },
        },
      });
    });

    await page.route('**/schools/me**', async route => {
      await route.fulfill({
        json: { success: true, data: { id: 1, name: 'EduCIV Test', school_type: 'SECONDAIRE', setup_complete: true } },
      });
    });

    await page.route('**/schools/setup-status**', async route => {
      await route.fulfill({
        json: { success: true, data: { setup_complete: true, director_completed: true, accountant_completed: true, school_type: 'SECONDAIRE' } },
      });
    });
  });

  test('should login multi-role user and default to first role (TEACHER)', async ({ page }) => {
    await page.goto('/teacher');
    await expect(page).toHaveURL(/\/teacher/);
  });

  test('should display RoleSwitcher when user has multiple roles', async ({ page }) => {
    await page.goto('/teacher');
    await expect(page.getByRole('button', { name: 'Enseignant' })).toBeAttached({ timeout: 10000 });
  });

  test('should switch from TEACHER to CASHIER and redirect to cashier dashboard', async ({ page }) => {
    await page.goto('/teacher');
    await page.getByRole('button', { name: 'Enseignant' }).click({ timeout: 10000 });

    const cashierOption = page.getByRole('button', { name: 'Caissier' });
    await expect(cashierOption).toBeAttached();
    await cashierOption.click();

    await expect(page).toHaveURL(/\/cashier/, { timeout: 5000 });
  });

  test('should block access to teacher routes when switched to CASHIER', async ({ page }) => {
    await page.goto('/teacher');
    await page.getByRole('button', { name: 'Enseignant' }).click({ timeout: 10000 });
    await page.getByRole('button', { name: 'Caissier' }).click();
    await expect(page).toHaveURL(/\/cashier/, { timeout: 5000 });

    const cashierUserData = { ...userData, role: 'CASHIER', roles: ['CASHIER'] };
    await page.route('**/auth/refresh', async route => {
      await route.fulfill({
        json: { success: true, data: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: cashierUserData }, error: null },
      });
    });
    await page.evaluate((u) => localStorage.setItem('user', JSON.stringify(u)), cashierUserData);
    await page.evaluate(() => localStorage.setItem('activeRole', 'CASHIER'));

    await page.goto('/teacher');
    await expect(page).not.toHaveURL(/\/teacher/);
  });

  test('should switch back to TEACHER and regain teacher access', async ({ page }) => {
    await page.goto('/teacher/attendance');
    await expect(page).toHaveURL(/\/teacher/);

    await page.getByRole('button', { name: 'Enseignant' }).click({ timeout: 10000 });
    await page.getByRole('button', { name: 'Caissier' }).click();
    await expect(page).toHaveURL(/\/cashier/, { timeout: 5000 });

    await page.getByRole('button', { name: 'Caissier' }).click({ timeout: 10000 });
    await page.getByRole('button', { name: 'Enseignant' }).click();
    await expect(page).toHaveURL(/\/teacher/, { timeout: 5000 });
  });
});
