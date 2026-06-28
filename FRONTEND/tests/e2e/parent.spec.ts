import { test, expect } from '@playwright/test';

const parentUser = {
  id: 8,
  name: 'Mme Kouamé',
  email: 'parent@educiv.com',
  role: 'PARENT',
  school_id: 1,
  school_ids: [1],
  roles: ['PARENT'],
  primary_school_id: 1,
};

const mockGrades = [
  { id: 1, value: 15, type: 'EXAMEN', status: 'VALIDE', subject: { name: 'Mathématiques' }, period: { name: 'Trimestre 1' } },
];

const mockAttendance = [
  { id: 1, status: 'PRESENT', created_at: '2026-06-20T08:00:00Z' },
  { id: 2, status: 'ABSENT', created_at: '2026-06-21T08:00:00Z' },
];

const mockPayments = [
  { id: 1, amount_fcfa: 50000, payment_type: 'SCOLARITE', status: 'VALIDE', receipt_number: 'REC-001', payment_date: '2026-06-01T10:00:00Z' },
];

test.describe('Parent Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-access-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
      window.localStorage.setItem('currentSchoolId', '1');
    });

    await page.route('**/auth/refresh', async route => {
      await route.fulfill({
        json: { success: true, data: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: parentUser }, error: null },
      });
    });

    await page.route('**/schools/me**', async route => {
      await route.fulfill({ json: { success: true, data: { id: 1, name: 'EduCIV Test', school_type: 'SECONDAIRE', setup_complete: true } } });
    });

    await page.route('**/schools/setup-status**', async route => {
      await route.fulfill({ json: { success: true, data: { setup_complete: true, director_completed: true, accountant_completed: true, school_type: 'SECONDAIRE' } } });
    });
  });

  test('should redirect to parent dashboard', async ({ page }) => {
    await page.goto('/parent');
    await expect(page).toHaveURL(/\/parent/);
  });

  test('should display parent dashboard', async ({ page }) => {
    await page.route('**/notes**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockGrades, total: 1, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.route('**/attendance**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockAttendance, total: 2, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.route('**/payments**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockPayments, total: 1, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.goto('/parent');
    await expect(page.locator('h1, h2, [class*="heading"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to parent notes', async ({ page }) => {
    await page.route('**/notes**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockGrades, total: 1, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.goto('/parent/notes');
    await expect(page).toHaveURL(/\/parent\/notes/);
  });

  test('should navigate to parent attendance', async ({ page }) => {
    await page.route('**/attendance**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockAttendance, total: 2, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.goto('/parent/attendance');
    await expect(page).toHaveURL(/\/parent\/attendance/);
  });

  test('should navigate to parent payments', async ({ page }) => {
    await page.route('**/payments**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockPayments, total: 1, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.goto('/parent/payments');
    await expect(page).toHaveURL(/\/parent\/payments/);
  });

  test('should navigate to parent timetable', async ({ page }) => {
    await page.route('**/timetables**', async route => {
      await route.fulfill({ json: { success: true, data: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 } } });
    });

    await page.goto('/parent/timetable');
    await expect(page).toHaveURL(/\/parent\/timetable/);
  });
});
