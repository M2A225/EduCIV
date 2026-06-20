import { test, expect } from '@playwright/test';

test.describe('Notes & Evaluations Management', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock authentication states via localstorage
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
      window.localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Directeur Test',
        role: 'DIRECTOR',
        school_id: 1
      }));
    });

    // Mock general API calls
    await page.route('**/classes*', async route => {
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

    await page.route('**/periods*', async route => {
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
  });

  test('should load note grid and submit bulk grades successfully', async ({ page }) => {
    // Mock the grid fetch API
    await page.route('**/notes/class/1/period/1', async route => {
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

    // Mock bulk notes save API
    let bulkSaveCalled = false;
    await page.route('**/notes/bulk', async route => {
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
    await expect(page.locator('h1')).toContainText('Saisie des notes');

    // Select Class and Period
    await page.selectOption('select[label="Classe"]', '1');
    await page.selectOption('select[label="Période"]', '1');

    // Click on load notes
    await page.click('button:has-text("Charger")');

    // Check if table contains students and grades
    await expect(page.locator('tbody tr')).toHaveCount(2);
    await expect(page.locator('tbody tr:first-child td:first-child')).toContainText('Koffi Yao');

    // Change a grade value
    const inputs = page.locator('input[type="number"]');
    await expect(inputs).toHaveCount(4);
    await inputs.nth(2).fill('16'); // Change Amina's Math grade to 16

    // Change an appreciation comment
    const commentTextareas = page.locator('textarea[placeholder="..."]');
    await expect(commentTextareas).toHaveCount(2);
    await commentTextareas.nth(1).fill('Excellent trimestre');

    // Click "Enregistrer tout"
    await page.click('button:has-text("Enregistrer tout")');

    // Check if save API was called
    expect(bulkSaveCalled).toBe(true);
  });

  test('should display and validate pending notes successfully', async ({ page }) => {
    // Mock the pending grades API
    await page.route('**/notes/pending*', async route => {
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
    await page.route('**/notes/99/validate', async route => {
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

    // Verify the pending card shows the pending grade
    await expect(page.locator('text=Notes en attente de validation')).toBeVisible();
    await expect(page.locator('text=Koffi Yao - Mathématiques')).toBeVisible();
    await expect(page.locator('text=Note: 17/20')).toBeVisible();

    // Click validate button
    await page.click('button:has-text("Valider")');

    // Verify validation API was called
    expect(validateCalled).toBe(true);
  });

  test('should display and reject pending notes with feedback', async ({ page }) => {
    // Mock the pending grades API
    await page.route('**/notes/pending*', async route => {
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
    await page.route('**/notes/99/reject', async route => {
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

    // Click reject button
    await page.click('button:has-text("Rejeter")');

    // Check that reject modal is displayed
    await expect(page.locator('text=Rejeter la note')).toBeVisible();

    // Fill reject reason
    await page.fill('textarea[placeholder="Motif du rejet..."]', 'Copie non conforme');

    // Click confirm reject
    await page.click('button:has-text("Confirmer le rejet")');

    // Verify reject API was called and correct payload was sent
    expect(rejectReasonSent).toBe('Copie non conforme');
  });
});
