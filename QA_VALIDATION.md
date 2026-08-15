# Forecast — QA Validation

## Project overview

**Project name:** Forecast  
**Domain:** Automotive industry  
**Purpose:** Forecast is an interface for automotive operations that predicts employee absenteeism and supports workforce relocation when an employee is absent. Relocation candidates can be prioritized according to their competencies, helping maintain continuity in the production process.

## Backend

### Route 1 — Absenteeism forecast by team

| Attribute | Value |
|---|---|
| Method | `GET` |
| Route | `https://hackathon-backend-ispm.onrender.com/api/v1/motor1/previsao-absenteismo/equipe/{equipe_numero}` |
| Path parameter | `equipe_numero` |
| Expected response format | JSON |

#### Test case BE-001 — Retrieve the absenteeism forecast for team 2

**Objective:** Verify that the endpoint returns the absenteeism forecast and employee risk data for the team identified by `equipe_numero = 2`.

**Request**

```http
GET https://hackathon-backend-ispm.onrender.com/api/v1/motor1/previsao-absenteismo/equipe/2
Accept: application/json
```

**Parameters**

| Name | Location | Type | Required | Test value |
|---|---|---|---|---|
| `equipe_numero` | Path | Integer | Yes | `2` |

**Expected result**

- The API responds successfully.
- The response body is valid JSON.
- `equipe_numero` equals `2`.
- `equipe` identifies team `L002`.
- `data_referencia` uses the `YYYY-MM-DD` date format.
- `total_funcionarios` matches the number of objects in `funcionarios`.
- Each employee contains identification, shift, status, absence probability, risk classification, and contributing factors.
- `probabilidade_falta` is numeric and within the range `0` to `100`.
- `algoritmo_versao` identifies the forecast algorithm version.

#### Supplied response evidence

**Body type:** JSON

```json
{
  "equipe": "Equipe L002",
  "equipe_numero": 2,
  "data_referencia": "2026-08-15",
  "total_funcionarios": 30,
  "funcionarios": [
    {
      "id": "2aea58f7-b42c-3790-464a-d4d4e3c98a23",
      "matricula": "AUT-00039",
      "nome": "Operador L002-T1-P09",
      "turno": "TURNO_1",
      "status": "ATIVO",
      "probabilidade_falta": 17.66,
      "classificacao": "BAIXO_RISCO",
      "fatores": {
        "iha": 0.0,
        "idt": 58.86
      }
    },
    {
      "id": "c7a2819c-80cb-06c9-c67d-e0917e3fa5ea",
      "matricula": "AUT-00032",
      "nome": "Operador L002-T1-P02",
      "turno": "TURNO_1",
      "status": "ATIVO",
      "probabilidade_falta": 3.96,
      "classificacao": "BAIXO_RISCO",
      "fatores": {
        "iha": 0.0,
        "idt": 13.21
      }
    }
  ],
  "algoritmo_versao": "absenteismo-v1"
}
```

> The response excerpt shows the first and last employees. The supplied source payload contains all 30 employee objects.

#### Validation results

| ID | Validation | Evidence | Result |
|---|---|---|---|
| BE-001-01 | Response body is valid JSON | Supplied payload parsed as a JSON object | Pass |
| BE-001-02 | Requested team number is returned | `equipe_numero: 2` | Pass |
| BE-001-03 | Team identity matches the request | `equipe: "Equipe L002"` | Pass |
| BE-001-04 | Reference date has the expected format | `2026-08-15` | Pass |
| BE-001-05 | Employee total matches the array size | Declared: 30; counted: 30 | Pass |
| BE-001-06 | Employee probabilities are valid percentages | Supplied values range from `3.96` to `17.66` | Pass |
| BE-001-07 | Risk classification is supplied | All 30 records: `BAIXO_RISCO` | Pass |
| BE-001-08 | Employee status is supplied | All 30 records: `ATIVO` | Pass |
| BE-001-09 | All operating shifts are represented | `TURNO_1`, `TURNO_2`, and `TURNO_3`; 10 employees each | Pass |
| BE-001-10 | Algorithm version is supplied | `absenteismo-v1` | Pass |
| BE-001-11 | HTTP status is successful | Status code was not included in the supplied evidence | Not verified |
| BE-001-12 | Content-Type is JSON | Response headers were not included in the supplied evidence | Not verified |
| BE-001-13 | Response time meets the service target | No SLA or timing evidence was supplied | Not verified |

#### Response field contract

| Field | Expected type | Required | Notes |
|---|---|---|---|
| `equipe` | String | Yes | Human-readable team name |
| `equipe_numero` | Integer | Yes | Must match the path parameter |
| `data_referencia` | String (date) | Yes | Format: `YYYY-MM-DD` |
| `total_funcionarios` | Integer | Yes | Must equal `funcionarios.length` |
| `funcionarios` | Array | Yes | Forecast records for the team |
| `funcionarios[].id` | String | Yes | Employee identifier |
| `funcionarios[].matricula` | String | Yes | Employee registration number |
| `funcionarios[].nome` | String | Yes | Employee name |
| `funcionarios[].turno` | String | Yes | Operating shift |
| `funcionarios[].status` | String | Yes | Employee status |
| `funcionarios[].probabilidade_falta` | Number | Yes | Expected range: `0–100` |
| `funcionarios[].classificacao` | String | Yes | Absence risk category |
| `funcionarios[].fatores.iha` | Number | Yes | Forecast factor |
| `funcionarios[].fatores.idt` | Number | Yes | Forecast factor |
| `algoritmo_versao` | String | Yes | Version of the forecasting algorithm |

#### Overall test status

**Partially passed.** The supplied response body satisfies all validations that can be performed from the payload. HTTP status, response headers, and performance remain unverified because that evidence was not provided.
