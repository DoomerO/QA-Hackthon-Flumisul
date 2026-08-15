import { expect, test } from '@playwright/test';

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3333';
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Substitution {
  funcionario_ausente_id: string;
  funcionario_ausente_nome: string;
  funcionario_substituto_id: string;
  funcionario_substituto_nome: string;
  posto_destino_id: string;
  posto_destino_codigo: string;
  score: number;
  equipe_id: string;
  equipe_nome: string;
  tech_lead_nome: string;
  tech_lead_email: string;
}

interface AbsencePlanningResponse {
  data_referencia: string;
  total_ausentes: number;
  total_cobertos: number;
  total_sem_cobertura: number;
  substituicoes: Substitution[];
}

test.describe('Backend absence planning (motor 2)', () => {
  test('POST /planejar-ausencias returns the expected plan', async ({
    request,
  }) => {
    test.setTimeout(150_000);

    const endpoint = new URL(
      '/api/v1/motor2/substituicoes/planejar-ausencias',
      backendUrl,
    ).toString();

    const response = await request.post(endpoint, { timeout: 120_000 });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const responseBody: AbsencePlanningResponse = await response.json();

    expect(responseBody).toMatchObject({
      data_referencia: '2026-08-15',
      total_ausentes: expect.any(Number),
      total_cobertos: expect.any(Number),
      total_sem_cobertura: expect.any(Number),
      substituicoes: expect.any(Array),
    });
    expect(responseBody.total_cobertos + responseBody.total_sem_cobertura).toBe(
      responseBody.total_ausentes,
    );
    expect(responseBody.substituicoes).toHaveLength(
      responseBody.total_cobertos,
    );

    for (const substitution of responseBody.substituicoes) {
      expect(substitution).toMatchObject({
        funcionario_ausente_id: expect.stringMatching(uuidPattern),
        funcionario_ausente_nome: expect.any(String),
        funcionario_substituto_id: expect.stringMatching(uuidPattern),
        funcionario_substituto_nome: expect.any(String),
        posto_destino_id: expect.stringMatching(uuidPattern),
        posto_destino_codigo: expect.any(String),
        score: expect.any(Number),
        equipe_id: expect.stringMatching(uuidPattern),
        equipe_nome: expect.any(String),
        tech_lead_nome: expect.any(String),
        tech_lead_email: expect.any(String),
      });
    }
  });
});
