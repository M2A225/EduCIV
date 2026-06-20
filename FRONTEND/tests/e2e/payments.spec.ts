import { test, expect } from '@playwright/test';

test.describe('Cashier & Payments Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
      window.localStorage.setItem('user', JSON.stringify({
        id: 2,
        name: 'Awa Koné',
        role: 'CASHIER',
        school_id: 1
      }));
    });

    // Mock students list search API
    await page.route('**/students*', async route => {
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

    // Mock payments search API
    await page.route('**/payments*', async route => {
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

    // Mock payment plans API
    await page.route('**/payment-plans*', async route => {
      await route.fulfill({
        json: {
          success: true,
          data: [
            { id: 1, name: 'Trimestriel', total_amount: 150000, school_id: 1 }
          ]
        }
      });
    });
  });

  test('should search for student, display payment file, and record new payment successfully', async ({ page }) => {
    let paymentPayload: any = null;

    // Mock payment creation API
    await page.route('**/payments', async route => {
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
    });

    await page.goto('/cashier/search');
    await expect(page.locator('h1')).toContainText('Encaissement');

    // 1. Search for Sékou
    await page.fill('input[placeholder="Rechercher par nom ou matricule..."]', 'Sékou');

    // Verify search suggestion list displays the result
    const suggestion = page.locator('text=Sékou Touré');
    await expect(suggestion).toBeVisible();

    // Click on suggestion to load student file
    await page.click('text=Sékou Touré');

    // 2. Verify Student File details and payment history card is loaded
    await expect(page.locator('text=Fiche élève')).toBeVisible();
    await expect(page.locator('text=Sékou Touré').first()).toBeVisible();
    await expect(page.locator('text=ST2025')).toBeVisible();
    await expect(page.locator('text=50 000 FCFA')).toBeVisible(); // total paid
    await expect(page.locator('text=REC-00123')).toBeVisible(); // payment history

    // 3. Open Payment Modal
    await page.click('button:has-text("Encaisser un paiement")');

    // Check that checkout modal is opened
    await expect(page.locator('text=Encaissement - Sékou Touré')).toBeVisible();

    // 4. Fill in payment form
    await page.fill('input:near(label:has-text("Numéro de reçu"))', 'REC-00124');
    await page.fill('input:near(label:has-text("Montant"))', '100000');
    await page.selectOption('select:near(label:has-text("Type de paiement"))', 'SCOLARITE');
    await page.selectOption('select:near(label:has-text("Plan de paiement"))', '1'); // select plan Trimestriel

    // Submit payment
    await page.click('button[type="submit"]');

    // 5. Verify the payment API was called with the correct payload
    expect(paymentPayload).not.toBeNull();
    expect(paymentPayload.receipt_number).toBe('REC-00124');
    expect(paymentPayload.amount_fcfa).toBe(100000);
    expect(paymentPayload.payment_type).toBe('SCOLARITE');
    expect(paymentPayload.student_id).toBe(201);
  });
});
