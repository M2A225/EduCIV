import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.route('**/auth/refresh', async route => {
      await route.fulfill({ json: { success: false, data: null, error: 'Unauthorized' } });
    });

    await page.goto('/');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h3')).toContainText('EduCIV');
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        json: { success: false, data: null, error: 'Identifiants incorrects' },
        status: 401,
      });
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*login/);
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.route('**/auth/login', async route => {
      const json = {
        success: true,
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: 1,
            name: 'Admin Test',
            email: 'admin@educiv.com',
            role: 'DIRECTOR',
            school_id: 1,
            school_ids: [1],
            roles: ['DIRECTOR'],
          },
        },
        error: null,
      };
      await route.fulfill({ json });
    });

    await page.route('**/schools/me**', async route => {
      await route.fulfill({
        json: { success: true, data: { id: 1, name: 'EduCIV Test', school_type: 'SECONDAIRE', setup_complete: true } },
      });
    });

    await page.route('**/schools/setup-status**', async route => {
      await route.fulfill({
        json: { success: true, data: { setup_complete: true, school_type: 'SECONDAIRE' } },
      });
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@educiv.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard|directeur/, { timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    await page.route('**/auth/refresh', async route => {
      await route.fulfill({
        json: {
          success: true,
          data: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            user: {
              id: 1,
              name: 'Admin Test',
              email: 'admin@educiv.com',
              role: 'DIRECTOR',
              school_id: 1,
              school_ids: [1],
              roles: ['DIRECTOR'],
            },
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
        json: { success: true, data: { setup_complete: true, school_type: 'SECONDAIRE' } },
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
    });

    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Tableau de bord', { timeout: 10000 });

    await page.click('button:has-text("Déconnexion")');
    await expect(page).toHaveURL(/.*login/);
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  });
});
