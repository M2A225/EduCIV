import { test, expect } from '@playwright/test';

const directorUser = {
  id: 1,
  name: 'Directeur Test',
  email: 'director@educiv.com',
  role: 'DIRECTOR',
  school_id: 1,
  school_ids: [1],
  roles: ['DIRECTOR'],
  primary_school_id: 1,
};

test.describe.skip('Settings & Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-access-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
      window.localStorage.setItem('currentSchoolId', '1');
    });

    await page.route('**/auth/refresh', async route => {
      await route.fulfill({
        json: { success: true, data: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: directorUser }, error: null },
      });
    });

    await page.route('**/schools/me**', async route => {
      await route.fulfill({ json: { success: true, data: { id: 1, name: 'EduCIV Test', school_type: 'SECONDAIRE', setup_complete: true } } });
    });

    await page.route('**/schools/setup-status**', async route => {
      await route.fulfill({ json: { success: true, data: { setup_complete: true, director_completed: true, accountant_completed: true, school_type: 'SECONDAIRE' } } });
    });
  });

  test('should navigate to profile page', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('text=Mon Profil')).toBeVisible({ timeout: 10000 });
  });

  test('should display user profile information', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('input[value="Directeur Test"]')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to user settings page', async ({ page }) => {
    await page.goto('/user-settings');
    await expect(page.locator('text=Paramètres')).toBeVisible({ timeout: 10000 });
  });

  test('should display theme options', async ({ page }) => {
    await page.goto('/user-settings');
    await expect(page.locator('text=Clair')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Sombre')).toBeVisible();
    await expect(page.locator('text=Système')).toBeVisible();
  });

  test('should switch theme to dark', async ({ page }) => {
    await page.goto('/user-settings');
    await page.getByRole('button', { name: 'Sombre' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should switch theme back to light', async ({ page }) => {
    await page.goto('/user-settings');
    await page.getByRole('button', { name: 'Sombre' }).click();
    await page.getByRole('button', { name: 'Clair' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});
