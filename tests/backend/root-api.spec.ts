import { expect, test } from '@playwright/test';

const backendUrl = process.env.BACKEND_URL ?? 'https://playwright.dev';

test.describe('backend root', () => {
  test('GET / reports that no root route is defined', async ({ request }) => {
    const response = await request.get(new URL('/', backendUrl).toString());

    expect(response.ok()).toBe(false);
    expect(response.status()).toBe(404);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(await response.json()).toEqual({ detail: 'Not Found' });
  });
});
