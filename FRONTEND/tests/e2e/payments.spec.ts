import { test, expect } from '@playwright/test';

test.describe.skip('Cashier & Payments Management', () => {
  test.beforeEach(async ({ page }) => {
    const userData = {
      id: 2,
      name: 'Awa Koné',
      email: 'cashier@educiv.com',
      role: 'CASHIER',
      school_id: 1,
      school_ids: [1],
      roles: ['CASHIER'],
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

    await page.route('**/api/students**', async route => {
      await route.fulfill({
        json: {
          success: true,
          data: [
            { id: 201, name: 'Sékou Touré', matricule: 'ST2025', class_id: 1 },
            { id: 202, name: 'Fatou Sylla', matricule: 'FS2025', class_id: 1 }
          ]
        }
      });
    });

    await page.route('**/api/payments**', async route => {
      await route.fulfill({
        json: {
          success: true,
          data: [
            {
              id: 50,
              amount_fcfa: 50000,
              payment_type: 'SCOLARITE',
              payment_date: '2026-05-10T00:00:00.000Z',
              receipt_number: 'REC-00123',
              status: 'VALIDE',
              student_id: 201
            }
          ]
        }
      });
    });

    await page.route('**/api/payment-plans**', async route => {
      await route.fulfill({
        json: {
          success: true,
          data: [
            { id: 1, name: 'Trimestriel', total_amount: 150000, school_id: 1 }
          ]
        }
      });
    });

    await page.route(/\/api\/schools$/, async route => {
      await route.fulfill({
        json: { success: true, data: { id: 1, name: 'EduCIV Test', school_type: 'SECONDAIRE', setup_complete: true } }
      });
    });
  });

  test('should search for student, display payment file, and record new payment successfully', async ({ page }) => {
    let paymentPayload: any = null;

    await page.route('**/api/payments', async route => {
      if (route.request().method() === 'POST') {
        paymentPayload = route.request().postDataJSON();
        await route.fulfill({
          json: {
            success: true,
            data: {
              id: 51,
              amount_fcfa: 100000,
              payment_type: 'SCOLARITE',
              payment_date: '2026-05-28',
              receipt_number: 'REC-00124',
              status: 'VALIDE',
              student_id: 201
            },
            error: null
          }
        });
      } else {
        await route.fallback();
      }
    });

    await page.goto('/cashier/search');
    await expect(page.locator('h1')).toContainText('Encaissement', { timeout: 15000 });

    await page.fill('input[placeholder="Rechercher par nom ou matricule..."]', 'Sékou');

    const suggestion = page.locator('text=Sékou Touré');
    await expect(suggestion).toBeVisible();

    await page.click('text=Sékou Touré');

    await expect(page.locator('text=Fiche élève')).toBeVisible();
    await expect(page.locator('text=Sékou Touré').first()).toBeVisible();
    await expect(page.locator('text=ST2025')).toBeVisible();
    await expect(page.locator('text=/50[,.]?\\s?000\\s*FCFA/').first()).toBeVisible();
    await expect(page.locator('text=REC-00123')).toBeVisible();

    await page.click('button:has-text("Encaisser un paiement")');

    await expect(page.locator('text=Encaissement - Sékou Touré')).toBeVisible();

    const receiptInput = page.locator('label:has-text("Numéro de reçu")').locator('..').locator('input');
    const amountInput = page.locator('label:has-text("Montant")').locator('..').locator('input');
    const typeSelect = page.locator('label:has-text("Type de paiement")').locator('..').locator('select');
    const planSelect = page.locator('label:has-text("Plan de paiement")').locator('..').locator('select');

    await receiptInput.fill('REC-00124');
    await amountInput.fill('100000');
    await typeSelect.selectOption('SCOLARITE');
    await planSelect.selectOption('1');

    await page.click('button[type="submit"]');

    expect(paymentPayload).not.toBeNull();
    expect(paymentPayload.receipt_number).toBe('REC-00124');
    expect(paymentPayload.amount_fcfa).toBe(100000);
    expect(paymentPayload.payment_type).toBe('SCOLARITE');
    expect(paymentPayload.student_id).toBe(201);
  });
});
