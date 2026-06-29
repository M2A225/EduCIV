import { test, expect } from '@playwright/test';

test.describe.skip('Notes & Evaluations Management', () => {
  test.beforeEach(async ({ page }) => {
    const userData = {
      id: 1,
      name: 'Directeur Test',
      email: 'director@educiv.com',
      role: 'DIRECTOR',
      school_id: 1,
      school_ids: [1],
      roles: ['DIRECTOR'],
      primary_school_id: 1,
    };

    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
      window.localStorage.setItem('currentSchoolId', '1');
      window.localStorage.setItem('user', JSON.stringify(userData));
    });

    await page.route('**/api/auth/refresh', async route => {
      await route.fulfill({
        json: { success: true, data: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: userData }, error: null },
      });
    });

    await page.route('**/api/schools/me**', async route => {
      await route.fulfill({ json: { success: true, data: { id: 1, name: 'EduCIV Test', school_type: 'SECONDAIRE', setup_complete: true } } });
    });

    await page.route('**/api/schools/setup-status**', async route => {
      await route.fulfill({ json: { success: true, data: { setup_complete: true, director_completed: true, accountant_completed: true, school_type: 'SECONDAIRE' } } });
    });

    await page.route('**/api/schools/stats**', async route => {
      await route.fulfill({ json: { success: true, data: { totalStudents: 120, totalClasses: 8, todayPayments: 5, attendanceRate: 92, alerts: [] } } });
    });

    await page.route('**/api/classes**', async route => {
      await route.fulfill({
        json: {
          success: true,
          data: [
            { id: 1, name: 'CM2 A', level: 'CM2', capacity: 40 },
            { id: 2, name: 'CM2 B', level: 'CM2', capacity: 35 }
          ]
        }
      });
    });

    await page.route('**/api/periods**', async route => {
      await route.fulfill({
        json: {
          success: true,
          data: [
            { id: 1, name: 'Trimestre 1', start_date: '2025-09-01', end_date: '2025-12-05' },
            { id: 2, name: 'Trimestre 2', start_date: '2025-12-06', end_date: '2026-03-06' }
          ]
        }
      });
    });

    await page.route('**/api/notes/pending**', async route => {
      await route.fulfill({
        json: { success: true, data: [] }
      });
    });

    await page.route(/\/api\/schools$/, async route => {
      await route.fulfill({
        json: { success: true, data: { id: 1, name: 'EduCIV Test', school_type: 'SECONDAIRE', setup_complete: true } }
      });
    });
  });

  test('should load note grid and submit bulk grades successfully', async ({ page }) => {
    await page.route('**/api/notes/class/1/period/1', async route => {
      await route.fulfill({
        json: {
          success: true,
          data: {
            students: [
              { id: 101, name: 'Koffi Yao' },
              { id: 102, name: 'Amina Diop' }
            ],
            subjects: [
              { id: 1, name: 'Mathématiques', coefficient: 5, max_score: 20 },
              { id: 2, name: 'Français', coefficient: 4, max_score: 20 }
            ],
            grades: {
              '101-1': { id: 10, value: 15, max_score: 20, comment: 'Très bien' },
              '101-2': { id: 11, value: 12, max_score: 20, comment: 'Assez bien' }
            },
            classConfig: { grade_total_max: 40, grade_avg_scale: 20 }
          }
        }
      });
    });

    let bulkSaveCalled = false;
    await page.route('**/api/notes/bulk', async route => {
      bulkSaveCalled = true;
      await route.fulfill({
        json: {
          success: true,
          data: { count: 4 },
          error: null
        }
      });
    });

    await page.goto('/notes');
    await expect(page.locator('h1')).toContainText('Saisie des notes', { timeout: 15000 });

    const classeSelect = page.locator('label', { hasText: 'Classe' }).locator('..').locator('select');
    const periodeSelect = page.locator('label', { hasText: 'Période' }).locator('..').locator('select');
    await classeSelect.selectOption('1');
    await periodeSelect.selectOption('1');

    await page.click('button:has-text("Charger")');

    await expect(page.locator('tbody tr')).toHaveCount(2);
    await expect(page.locator('tbody tr:first-child td:first-child')).toContainText('Koffi Yao');

    const inputs = page.locator('input[type="number"]');
    await expect(inputs).toHaveCount(4);
    await inputs.nth(2).fill('16');

    const commentTextareas = page.locator('textarea[placeholder="..."]');
    await expect(commentTextareas).toHaveCount(2);
    await commentTextareas.nth(1).fill('Excellent trimestre');

    await page.click('button:has-text("Enregistrer tout")');

    expect(bulkSaveCalled).toBe(true);
  });

  test('should display and validate pending notes successfully', async ({ page }) => {
    await page.route('**/api/notes/pending**', async route => {
      await route.fulfill({
        json: {
          success: true,
          data: [
            {
              id: 99,
              value: 17,
              type: 'DEVOIR',
              period_id: 1,
              student_id: 101,
              subject_id: 1,
              status: 'EN_ATTENTE',
              student: { id: 101, name: 'Koffi Yao' },
              subject: { id: 1, name: 'Mathématiques' },
              period: { id: 1, name: 'Trimestre 1' }
            }
          ]
        }
      });
    });

    let validateCalled = false;
    await page.route('**/api/notes/99/validate', async route => {
      validateCalled = true;
      await route.fulfill({
        json: {
          success: true,
          data: { id: 99, status: 'VALIDE' },
          error: null
        }
      });
    });

    await page.goto('/notes');

    await expect(page.locator('text=Notes en attente de validation')).toBeVisible();
    await expect(page.locator('text=Koffi Yao - Mathématiques')).toBeVisible();
    await expect(page.locator('text=Note: 17/20')).toBeVisible();

    await page.click('button:has-text("Valider")');

    expect(validateCalled).toBe(true);
  });

  test('should display and reject pending notes with feedback', async ({ page }) => {
    await page.route('**/api/notes/pending**', async route => {
      await route.fulfill({
        json: {
          success: true,
          data: [
            {
              id: 99,
              value: 17,
              type: 'DEVOIR',
              period_id: 1,
              student_id: 101,
              subject_id: 1,
              status: 'EN_ATTENTE',
              student: { id: 101, name: 'Koffi Yao' },
              subject: { id: 1, name: 'Mathématiques' },
              period: { id: 1, name: 'Trimestre 1' }
            }
          ]
        }
      });
    });

    let rejectReasonSent: string | undefined = undefined;
    await page.route('**/api/notes/99/reject', async route => {
      const body = route.request().postDataJSON();
      rejectReasonSent = body.rejection_reason;
      await route.fulfill({
        json: {
          success: true,
          data: { id: 99, status: 'REJETE' },
          error: null
        }
      });
    });

    await page.goto('/notes');

    await page.click('button:has-text("Rejeter")');

    await expect(page.locator('text=Rejeter la note')).toBeVisible();

    await page.fill('textarea[placeholder="Motif du rejet..."]', 'Copie non conforme');

    await page.click('button:has-text("Confirmer le rejet")');

    expect(rejectReasonSent).toBe('Copie non conforme');
  });
});
