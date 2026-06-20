import { test, expect } from '@playwright/test';

test.describe('Multi-Role Switching', () => {
  const TEACHER_CASHIER_EMAIL = 'teacher-cashier@educiv.com';
  const TEACHER_CASHIER_PASSWORD = 'TeacherCashier123!';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="email"]', TEACHER_CASHIER_EMAIL);
    await page.fill('input[placeholder*="•••"]', TEACHER_CASHIER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/teacher/, { timeout: 10000 });
  });

  test('should login multi-role user and default to first role (TEACHER)', async ({ page }) => {
    await expect(page).toHaveURL(/\/teacher/);
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should display RoleSwitcher when user has multiple roles', async ({ page }) => {
    const roleSwitcher = page.locator('button').filter({ hasText: /Enseignant|Caissier|Directeur|Parent|Super Admin/ }).first();
    await expect(roleSwitcher).toBeVisible();
  });

  test('should switch from TEACHER to CASHIER and redirect to cashier dashboard', async ({ page }) => {
    const roleSwitcher = page.locator('button').filter({ hasText: /Enseignant|Caissier/ }).first();
    await roleSwitcher.click();

    const cashierOption = page.getByRole('button', { name: /Caissier/ });
    await expect(cashierOption).toBeVisible();
    await cashierOption.click();

    await expect(page).toHaveURL(/\/cashier/, { timeout: 5000 });
  });

  test('should block access to teacher routes when switched to CASHIER', async ({ page }) => {
    const roleSwitcher = page.locator('button').filter({ hasText: /Enseignant|Caissier/ }).first();
    await roleSwitcher.click();
    await page.getByRole('button', { name: /Caissier/ }).click();
    await expect(page).toHaveURL(/\/cashier/, { timeout: 5000 });

    await page.goto('/teacher');
    await expect(page).toHaveURL(/\//, { timeout: 5000 });
    await expect(page).not.toHaveURL(/\/teacher/);
  });

  test('should switch back to TEACHER and regain teacher access', async ({ page }) => {
    await page.goto('/teacher/attendance');
    await expect(page).toHaveURL(/\/teacher\/attendance/);

    const roleSwitcher = page.locator('button').filter({ hasText: /Enseignant|Caissier/ }).first();
    await roleSwitcher.click();
    await page.getByRole('button', { name: /Caissier/ }).click();
    await expect(page).toHaveURL(/\/cashier/, { timeout: 5000 });

    await roleSwitcher.click();
    await page.getByRole('button', { name: /Enseignant/ }).click();
    await expect(page).toHaveURL(/\/teacher/, { timeout: 5000 });
  });

  test('should store both roles in JWT payload', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();

    const payload = JSON.parse(atob(token!.split('.')[1]));
    expect(payload.roles).toContain('TEACHER');
    expect(payload.roles).toContain('CASHIER');
    expect(payload.role).toBe(payload.roles[0]);
  });
});
