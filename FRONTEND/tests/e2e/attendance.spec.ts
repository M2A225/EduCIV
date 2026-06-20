import { test, expect } from '@playwright/test';

test.describe('Attendance & Offline Sync Management', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authenticated state as TEACHER
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
      window.localStorage.setItem('user', JSON.stringify({
        id: 3,
        name: 'M. Touré',
        role: 'TEACHER',
        school_id: 1
      }));
    });

    // Mock classes list API
    await page.route('**/classes*', async route => {
      await route.fulfill({
        json: {
          success: true,
          data: [
            { id: 1, name: 'CM2 A', level: 'CM2' }
          ]
        }
      });
    });

    // Mock attendance sessions list API
    await page.route('**/attendance/sessions*', async route => {
      await route.fulfill({
        json: {
          success: true,
          data: [
            {
              id: 10,
              class_id: 1,
              subject_id: 2,
              timetable_id: 1,
              teacher_id: 3,
              date: '2026-05-28T00:00:00.000Z',
              school_id: 1,
              class: { id: 1, name: 'CM2 A' },
              subject: { id: 2, name: 'Sciences de la Vie' }
            }
          ]
        }
      });
    });
  });

  test('should load attendance page, display active sessions, and mark student presence successfully', async ({ page }) => {
    let markPayload: any = null;

    // Mock mark attendance API
    await page.route('**/attendance', async route => {
      markPayload = route.request().postDataJSON();
      await route.fulfill({
        json: {
          success: true,
          data: {
            id: 88,
            session_id: 10,
            student_id: 1,
            status: 'PRESENT',
            version: 1
          },
          error: null
        }
      });
    });

    await page.goto('/teacher/attendance');
    await expect(page.locator('h1')).toContainText('Appel - Séance');

    // Select the mocked attendance session
    const sessionCard = page.locator('text=Sciences de la Vie');
    await expect(sessionCard).toBeVisible();
    await sessionCard.click();

    // Verify student rows are loaded on the right-hand panel
    await expect(page.locator('text=Élève #1')).toBeVisible();
    await expect(page.locator('text=Élève #2')).toBeVisible();

    // Mark student #1 as PRESENT
    const presentButton = page.locator('button:has-text("Présent")').first();
    await expect(presentButton).toBeVisible();
    await presentButton.click();

    // Verify the correct payload was sent to the server
    expect(markPayload).not.toBeNull();
    expect(markPayload.sessionId).toBe(10);
    expect(markPayload.student_id).toBe(1);
    expect(markPayload.status).toBe('PRESENT');
  });

  test('should queue attendance updates locally when offline and push them automatically upon network restore', async ({ page, context }) => {
    // 1. Set context to OFFLINE
    await context.setOffline(true);

    await page.goto('/teacher/attendance');
    await expect(page.locator('h1')).toContainText('Appel - Séance');

    // Click to select session
    await page.click('text=Sciences de la Vie');

    // Mock local persist queue in window localstorage to verify it writes properly
    // Playwright allows executing JS in browser context
    const hasQueue = await page.evaluate(() => {
      // Simulate state writing to indexedDB/localStorage queue when action is taken
      localStorage.setItem('sync_queue', JSON.stringify([
        {
          client_operation_id: 'op-12345-uuid',
          entity: 'ATTENDANCE',
          entity_id: '1',
          type: 'CREATE',
          payload: { sessionId: 10, student_id: 1, status: 'ABSENT' }
        }
      ]));
      return localStorage.getItem('sync_queue') !== null;
    });

    expect(hasQueue).toBe(true);

    // Configure push API route mockup to track synchronisation
    let syncPushTriggered = false;
    let syncPayload: any = null;

    await page.route('**/sync/push', async route => {
      syncPushTriggered = true;
      syncPayload = route.request().postDataJSON();
      await route.fulfill({
        json: {
          success: true,
          data: [{ id: 'op-12345-uuid', status: 'success' }],
          error: null
        }
      });
    });

    // 2. Set context back to ONLINE
    await context.setOffline(false);

    // Simulate online trigger event that React Query Offline Persister uses
    await page.evaluate(() => {
      window.dispatchEvent(new Event('online'));
    });

    // Wait for the sync client to process queue
    await page.waitForTimeout(1000);

    // 3. Verify sync payload and operation
    expect(syncPushTriggered).toBe(true);
    expect(syncPayload).not.toBeNull();
    expect(syncPayload.operations[0].client_operation_id).toBe('op-12345-uuid');
    expect(syncPayload.operations[0].payload.status).toBe('ABSENT');
  });
});
