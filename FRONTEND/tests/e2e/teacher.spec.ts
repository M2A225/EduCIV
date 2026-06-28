import { test, expect } from '@playwright/test';

const teacherUser = {
  id: 5,
  name: 'Mme Diallo',
  email: 'teacher@educiv.com',
  role: 'TEACHER',
  school_id: 1,
  school_ids: [1],
  roles: ['TEACHER'],
  primary_school_id: 1,
};

const mockTimetables = [
  { id: 1, slot: 'Lun-8:00', subject: { name: 'Mathématiques' }, teacher: { name: 'Mme Diallo' }, class: { name: '6ème A', id: 1 } },
  { id: 2, slot: 'Lun-9:00', subject: { name: 'Mathématiques' }, teacher: { name: 'Mme Diallo' }, class: { name: '5ème B', id: 2 } },
];

const mockSessions = [
  { id: 1, class_id: 1, subject_id: 1, date: '2026-06-28', start_time: '08:00', end_time: '09:00', records: [] },
];

test.describe('Teacher Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-access-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
      window.localStorage.setItem('currentSchoolId', '1');
    });

    await page.route('**/auth/refresh', async route => {
      await route.fulfill({
        json: { success: true, data: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: teacherUser }, error: null },
      });
    });

    await page.route('**/schools/me**', async route => {
      await route.fulfill({ json: { success: true, data: { id: 1, name: 'EduCIV Test', school_type: 'SECONDAIRE', setup_complete: true } } });
    });

    await page.route('**/schools/setup-status**', async route => {
      await route.fulfill({ json: { success: true, data: { setup_complete: true, director_completed: true, accountant_completed: true, school_type: 'SECONDAIRE' } } });
    });
  });

  test('should redirect to teacher dashboard', async ({ page }) => {
    await page.goto('/teacher');
    await expect(page).toHaveURL(/\/teacher/);
  });

  test('should display teacher dashboard', async ({ page }) => {
    await page.route('**/timetables**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockTimetables, total: 2, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.goto('/teacher');
    await expect(page.locator('h1, h2, [class*="heading"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to teacher attendance page', async ({ page }) => {
    await page.route('**/attendance/session**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockSessions, total: 1, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.goto('/teacher/attendance');
    await expect(page).toHaveURL(/\/teacher\/attendance/);
  });

  test('should navigate to teacher notes page', async ({ page }) => {
    await page.route('**/notes**', async route => {
      await route.fulfill({ json: { success: true, data: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 } } });
    });

    await page.goto('/teacher/notes');
    await expect(page).toHaveURL(/\/teacher\/notes/);
  });

  test('should navigate to teacher timetable', async ({ page }) => {
    await page.route('**/timetables**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockTimetables, total: 2, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.goto('/teacher/timetable');
    await expect(page).toHaveURL(/\/teacher\/timetable/);
  });

  test('should navigate to teacher progression vote', async ({ page }) => {
    await page.route('**/progression**', async route => {
      await route.fulfill({ json: { success: true, data: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 } } });
    });

    await page.goto('/teacher/progression');
    await expect(page).toHaveURL(/\/teacher\/progression/);
  });
});
