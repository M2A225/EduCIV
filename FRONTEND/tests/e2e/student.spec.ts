import { test, expect } from '@playwright/test';

const studentUser = {
  id: 10,
  name: 'Kouassi Jean',
  email: 'student@educiv.com',
  role: 'STUDENT',
  school_id: 1,
  school_ids: [1],
  roles: ['STUDENT'],
  primary_school_id: 1,
};

const mockGrades = [
  { id: 1, value: 15, type: 'EXAMEN', status: 'VALIDE', subject: { name: 'Mathématiques' }, period: { name: 'Trimestre 1' } },
  { id: 2, value: 12, type: 'DEVOIR', status: 'VALIDE', subject: { name: 'Français' }, period: { name: 'Trimestre 1' } },
];

const mockAttendance = [
  { id: 1, status: 'PRESENT', created_at: '2026-06-20T08:00:00Z' },
  { id: 2, status: 'ABSENT', created_at: '2026-06-21T08:00:00Z' },
];

const mockPayments = [
  { id: 1, amount_fcfa: 50000, payment_type: 'SCOLARITE', status: 'VALIDE', receipt_number: 'REC-001', payment_date: '2026-06-01T10:00:00Z' },
];

const mockTimetables = [
  { id: 1, slot: 'Lun-8:00', subject: { name: 'Mathématiques' }, teacher: { name: 'M. Kouamé' }, class: { name: '6ème A' } },
  { id: 2, slot: 'Lun-9:00', subject: { name: 'Français' }, teacher: { name: 'Mme Diallo' }, class: { name: '6ème A' } },
];

test.describe('Student Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-access-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
      window.localStorage.setItem('currentSchoolId', '1');
    });

    await page.route('**/auth/refresh', async route => {
      await route.fulfill({
        json: { success: true, data: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: studentUser }, error: null },
      });
    });

    await page.route('**/schools/me**', async route => {
      await route.fulfill({ json: { success: true, data: { id: 1, name: 'EduCIV Test', school_type: 'SECONDAIRE', setup_complete: true } } });
    });

    await page.route('**/schools/setup-status**', async route => {
      await route.fulfill({ json: { success: true, data: { setup_complete: true, director_completed: true, accountant_completed: true, school_type: 'SECONDAIRE' } } });
    });
  });

  test('should redirect to student dashboard', async ({ page }) => {
    await page.goto('/student');
    await expect(page).toHaveURL(/\/student/);
  });

  test('should display student dashboard with stats', async ({ page }) => {
    await page.route('**/notes**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockGrades, total: 2, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.route('**/timetables**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockTimetables, total: 2, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.route('**/payments**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockPayments, total: 1, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.route('**/attendance**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockAttendance, total: 2, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.goto('/student');
    await expect(page.locator('text=Mon Tableau de bord')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to student notes', async ({ page }) => {
    await page.route('**/students/me', async route => {
      await route.fulfill({ json: { success: true, data: { id: 10, name: 'Kouassi Jean', class_id: 1 } } });
    });

    await page.route('**/notes**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockGrades, total: 2, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.goto('/student/notes');
    await expect(page.locator('text=Mes notes')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to student attendance', async ({ page }) => {
    await page.route('**/attendance**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockAttendance, total: 2, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.goto('/student/attendance');
    await expect(page.locator('text=Mes absences')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to student payments', async ({ page }) => {
    await page.route('**/payments**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockPayments, total: 1, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.goto('/student/payments');
    await expect(page.locator('text=Mes Paiements')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to student timetable', async ({ page }) => {
    await page.route('**/students/me', async route => {
      await route.fulfill({ json: { success: true, data: { id: 10, name: 'Kouassi Jean', class_id: 1 } } });
    });

    await page.route('**/timetables**', async route => {
      await route.fulfill({ json: { success: true, data: { items: mockTimetables, total: 2, page: 1, limit: 20, totalPages: 1 } } });
    });

    await page.goto('/student/timetable');
    await expect(page.locator('text=Mon emploi du temps')).toBeVisible({ timeout: 10000 });
  });
});
