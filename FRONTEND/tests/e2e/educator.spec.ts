import { test, expect } from '@playwright/test';

const educatorUser = {
  id: 7,
  name: 'M. Touré',
  email: 'educator@educiv.com',
  role: 'EDUCATOR',
  school_id: 1,
  school_ids: [1],
  roles: ['EDUCATOR'],
  primary_school_id: 1,
};

const mockSessions = [
  { id: 1, class_id: 1, subject_id: 1, date: '2026-06-28', start_time: '08:00', end_time: '09:00', records: [] },
];

const mockIncidents = [
  { id: 1, type: 'RETARD', status: 'EN_COURS', description: 'Retard répété', student: { name: 'Kouassi Jean' } },
];

test.describe.skip('Educator Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-access-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
      window.localStorage.setItem('currentSchoolId', '1');
    });

    await page.route('**/auth/refresh', async route => {
      await route.fulfill({
        json: { success: true, data: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: educatorUser }, error: null },
      });
    });

    await page.route('**/schools/me**', async route => {
      await route.fulfill({ json: { success: true, data: { id: 1, name: 'EduCIV Test', school_type: 'SECONDAIRE', setup_complete: true } } });
    });

    await page.route('**/schools/setup-status**', async route => {
      await route.fulfill({ json: { success: true, data: { setup_complete: true, director_completed: true, accountant_completed: true, school_type: 'SECONDAIRE' } } });
    });
  });

  test('should redirect to educator dashboard', async ({ page }) => {
    await page.goto('/educator');
    await expect(page).toHaveURL(/\/educator/);
  });

  test('should display educator dashboard', async ({ page }) => {
    await page.goto('/educator');
    await expect(page.locator('h1, h2, [class*="heading"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to educator attendance', async ({ page }) => {
    await page.route('**/attendance/session**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockSessions, total: 1, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.goto('/educator/attendance');
    await expect(page).toHaveURL(/\/educator\/attendance/);
  });

  test('should navigate to educator incidents', async ({ page }) => {
    await page.route('**/incidents**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockIncidents, total: 1, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.goto('/educator/incidents');
    await expect(page).toHaveURL(/\/educator\/incidents/);
  });
});
