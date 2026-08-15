import { expect, test } from '@playwright/test';

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3333';

const predictionUrl = (teamId: number) =>
  new URL(
    `/api/v1/motor1/previsao-absenteismo/equipe/${teamId}`,
    backendUrl,
  ).toString();

test.describe('Backend prediction (motor 1)', () => {
  test('returns a successful JSON response for a valid team ID', async ({
    request,
  }) => {
    const response = await request.get(predictionUrl(1));

    expect(response.ok()).toBe(true);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('returns 404 and HTML for a negative team ID', async ({ request }) => {
    const response = await request.get(predictionUrl(-1));

    expect(response.ok()).toBe(false);
    expect(response.status()).toBe(404);
    expect(response.headers()['content-type']).toContain('text/html');
  });

  test('returns an empty JSON array for a team ID greater than 30', async ({
    request,
  }) => {
    const response = await request.get(predictionUrl(31));

    expect(response.ok()).toBe(true);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    expect(body).toHaveLength(0);
    expect(body).toEqual([]);
  });
});
