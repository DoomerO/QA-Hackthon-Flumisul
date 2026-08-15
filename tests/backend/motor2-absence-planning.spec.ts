import { expect, test } from '@playwright/test';

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3333';
const uuid = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

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

const expectedResponse= {
  data_referencia: '2026-08-15',
  total_ausentes: 0,
  total_cobertos: 0,
  total_sem_cobertura: 0,
  substituicoes: [
    {
      funcionario_ausente_id: uuid,
      funcionario_ausente_nome: 'string',
      funcionario_substituto_id: uuid,
      funcionario_substituto_nome: 'string',
      posto_destino_id: uuid,
      posto_destino_codigo: 'string',
      score: 0,
      equipe_id: uuid,
      equipe_nome: 'string',
      tech_lead_nome: 'string',
      tech_lead_email: 'string',
    },
  ],
} satisfies AbsencePlanningResponse;

test.describe('Backend absence planning (motor 2)', () => {
  test('POST /planejar-ausencias returns the expected plan', async ({
    request,
  }) => {
    const endpoint = new URL(
      '/api/v1/motor2/substituicoes/planejar-ausencias',
      backendUrl,
    ).toString();

    const response = await request.post(endpoint);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const responseBody: AbsencePlanningResponse = await response.json();
    expect(responseBody).toMatchObject(expectedResponse);
  });
});
