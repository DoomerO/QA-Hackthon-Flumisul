import { expect, test } from '@playwright/test';

const backendUrl = process.env.BACKEND_URL ?? 'https://playwright.dev';

test.describe('backend examples', () => {
  test('GET / returns a successful response', async ({ request }) => {
    const response = await request.get(new URL('/', backendUrl).toString());

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
  });
});
