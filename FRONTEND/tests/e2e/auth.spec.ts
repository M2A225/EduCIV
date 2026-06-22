import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.route('**/auth/refresh', async route => {
      await route.fulfill({ json: { success: false, data: null, error: 'Unauthorized' } });
    });

    await page.goto('/');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1').filter({ hasText: 'Bienvenue' })).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        json: { success: false, data: null, error: 'Identifiants incorrects' },
        status: 401,
      });
    });

    await page.goto('/login');
    await page.fill('input[name="identifier"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*login/);
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    const userData = {
      id: 1,
      name: 'Admin Test',
      email: 'admin@educiv.com',
      role: 'DIRECTOR',
      school_id: 1,
      school_ids: [1],
      roles: ['DIRECTOR'],
      primary_school_id: 1,
    };

    await page.route('**/auth/login', async route => {
      await route.fulfill({
        json: { success: true, data: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: userData }, error: null },
      });
    });

    await page.route('**/auth/refresh', async route => {
      await route.fulfill({ json: { success: false, data: null, error: 'Unauthorized' } });
    });

    await page.goto('/login');
    await expect(page.locator('input[name="identifier"]')).toBeVisible({ timeout: 10000 });
    await page.fill('input[name="identifier"]', 'admin@educiv.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');

    await expect(page).not.toHaveURL(/.*login/, { timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    const userData = {
      id: 1,
      name: 'Admin Test',
      email: 'admin@educiv.com',
      role: 'DIRECTOR',
      school_id: 1,
      school_ids: [1],
      roles: ['DIRECTOR'],
      primary_school_id: 1,
    };

    await page.route('**/auth/refresh', async route => {
      await route.fulfill({
        json: { success: true, data: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: userData }, error: null },
      });
    });

    await page.route('**/schools/me**', async route => {
      await route.fulfill({ json: { success: true, data: { id: 1, name: 'EduCIV Test', school_type: 'SECONDAIRE', setup_complete: true } } });
    });

    await page.route('**/schools/setup-status**', async route => {
      await route.fulfill({ json: { success: true, data: { setup_complete: true, director_completed: true, accountant_completed: true, school_type: 'SECONDAIRE' } } });
    });

    await page.route('**/schools/stats**', async route => {
      await route.fulfill({ json: { success: true, data: { totalStudents: 120, totalClasses: 8, todayPayments: 5, attendanceRate: 92, alerts: [] } } });
    });

    await page.route('**/auth/logout', async route => {
      await route.fulfill({ json: { success: true, data: null, error: null } });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
      window.localStorage.setItem('currentSchoolId', '1');
    });

    await page.goto('/');
    await expect(page.locator('h1').filter({ hasText: 'Tableau de bord' })).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Déconnexion' }).first().click();
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
  });
});
