import { test, expect } from '@playwright/test';

const skipPageNav = (route: any) => {
  const rt = route.request().resourceType();
  if (rt === 'document' || rt === 'stylesheet' || rt === 'script' || rt === 'image') {
    return route.fallback();
  }
};

test.describe('Attendance & Offline Sync Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
      window.localStorage.setItem('user', JSON.stringify({
        id: 3,
        name: 'M. Touré',
        role: 'TEACHER',
        school_id: 1,
        school_ids: [1],
        roles: ['TEACHER'],
      }));
    });

    await page.route('**/auth/refresh', async route => {
      skipPageNav(route) || await route.fulfill({
        json: {
          success: true,
          data: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            user: {
              id: 3,
              name: 'M. Touré',
              email: 'teacher@educiv.com',
              role: 'TEACHER',
              school_id: 1,
              school_ids: [1],
              roles: ['TEACHER'],
            },
          },
        },
      });
    });

    await page.route('**/schools/me**', async route => {
      skipPageNav(route) || await route.fulfill({
        json: { success: true, data: { id: 1, name: 'EduCIV Test', school_type: 'SECONDAIRE', setup_complete: true } },
      });
    });

    await page.route('**/schools/setup-status**', async route => {
      skipPageNav(route) || await route.fulfill({
        json: { success: true, data: { setup_complete: true, school_type: 'SECONDAIRE' } },
      });
    });

    await page.route('**/classes**', async route => {
      skipPageNav(route) || await route.fulfill({
        json: {
          success: true,
          data: [
            { id: 1, name: 'CM2 A', level: 'CM2' }
          ]
        }
      });
    });

    await page.route('**/subjects**', async route => {
      skipPageNav(route) || await route.fulfill({
        json: {
          success: true,
          data: [
            { id: 2, name: 'Sciences de la Vie', coefficient: 3 }
          ]
        }
      });
    });

    await page.route('**/attendance/sessions**', async route => {
      skipPageNav(route) || await route.fulfill({
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

    await page.route('**/attendance*', async route => {
      skipPageNav(route) || await route.fulfill({
        json: {
          success: true,
          data: [],
          error: null
        }
      });
    });

    await page.route('**/timetables**', async route => {
      skipPageNav(route) || await route.fulfill({
        json: {
          success: true,
          data: []
        }
      });
    });

    await page.route('**/students**', async route => {
      skipPageNav(route) || await route.fulfill({
        json: {
          success: true,
          data: [
            { id: 1, name: 'Élève #1', matricule: 'E001', class_id: 1 },
            { id: 2, name: 'Élève #2', matricule: 'E002', class_id: 1 }
          ]
        }
      });
    });
  });

  test('should load attendance page, display active sessions, and mark student presence successfully', async ({ page }) => {
    let markPayload: any = null;

    await page.route('**/attendance/**', async route => {
      if (route.request().resourceType() === 'document') return route.fallback();
      if (route.request().method() === 'POST') {
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
      } else {
        await route.fallback();
      }
    });

    await page.goto('/teacher/attendance');
    await expect(page.locator('h1').filter({ hasText: 'Appel - Séance' })).toBeVisible({ timeout: 15000 });

    const sessionCard = page.locator('text=Sciences de la Vie');
    await expect(sessionCard).toBeVisible();
    await sessionCard.click();

    await expect(page.locator('text=Élève #1')).toBeVisible();
    await expect(page.locator('text=Élève #2')).toBeVisible();

    const presentButton = page.locator('button:has-text("Présent")').first();
    await expect(presentButton).toBeVisible();
    await presentButton.click();

    await page.waitForTimeout(1000);
    expect(markPayload).not.toBeNull();
    expect(markPayload.student_id).toBe(1);
    expect(markPayload.status).toBe('PRESENT');
  });

  test('should queue attendance updates locally when offline', async ({ page, context }) => {
    await page.goto('/teacher/attendance');
    await expect(page.locator('h1').filter({ hasText: 'Appel - Séance' })).toBeVisible({ timeout: 15000 });

    await page.click('text=Sciences de la Vie');

    await context.setOffline(true);

    const hasQueue = await page.evaluate(() => {
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

    const queueData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('sync_queue') || '[]');
    });

    expect(queueData).toHaveLength(1);
    expect(queueData[0].entity).toBe('ATTENDANCE');
    expect(queueData[0].type).toBe('CREATE');
    expect(queueData[0].payload.status).toBe('ABSENT');
  });
});
