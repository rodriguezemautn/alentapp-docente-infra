# Reports Specification

## Purpose

Define los reportes agregados del club social: ingresos, estado de casilleros, material deportivo y socios. Controlador unificado ReportController con 4 endpoints de solo lectura.

## Requirements

### Requirement: IncomeReport — Ingresos

`GET /api/v1/reportes/ingresos?from=&to=&groupBy=day|month|year`

```ts
interface IncomeReportItem {
  period: string;
  total: number;
  byType: { Cuota: number; Mensualidad: number; Inscripcion: number; Otro: number };
  canceledCount: number;
}
```

- Excluye pagos cancelados del total
- `groupBy`: día, mes o año

#### Scenario: Reporte de ingresos con datos

- GIVEN pagos registrados en el período
- WHEN se llama a `GET /api/v1/reportes/ingresos?from=2026-01-01&to=2026-12-31&groupBy=month`
- THEN retorna `200` con `IncomeReportItem[]`
- AND cada item tiene `period`, `total`, `byType`, `canceledCount`

#### Scenario: Reporte de ingresos sin datos

- GIVEN no hay pagos en el período
- WHEN se llama a `GET /api/v1/reportes/ingresos?from=2025-01-01&to=2025-01-01`
- THEN retorna `200` con arreglo vacío o items con totales en 0

#### Scenario: Fechas inválidas

- GIVEN `from` > `to`
- WHEN se llama al endpoint
- THEN retorna `400 Bad Request`

### Requirement: LockerReport — Estado de Casilleros

`GET /api/v1/reportes/casilleros`

```ts
interface LockerReportResponse {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  occupancyRate: number;  // 0-100
  details: { available: LockerDTO[]; occupied: LockerDetailDTO[]; maintenance: LockerDTO[] };
}
```

#### Scenario: Reporte de casilleros

- GIVEN casilleros en varios estados
- WHEN se llama a `GET /api/v1/reportes/casilleros`
- THEN retorna `200` con conteo por estado y `occupancyRate`
- AND detalles agrupados por estado

### Requirement: MaterialReport — Material Deportivo

`GET /api/v1/reportes/material`

```ts
interface MaterialReportResponse {
  totalLoans: number;
  byStatus: { active: number; returned: number; lost: number };
  activeLoans: EquipmentLoanDetailDTO[];
  lostItems: EquipmentLoanDetailDTO[];
  topMember?: { memberId: string; memberName: string; activeLoans: number };
}
```

#### Scenario: Reporte de material

- GIVEN préstamos de equipamiento registrados
- WHEN se llama a `GET /api/v1/reportes/material`
- THEN retorna `200` con totales, desglose por estado y socio con más préstamos activos

### Requirement: MemberReport — Socios

`GET /api/v1/reportes/socios`

```ts
interface MemberReportResponse {
  total: number;
  byCategory: { Pleno: number; Cadete: number; Honorario: number };
  byStatus: { Activo: number; Moroso: number; Suspendido: number };
  delinquencyRate: number;  // 0-100
  monthlyRegistrations: { month: string; count: number }[];
}
```

#### Scenario: Reporte de socios

- GIVEN socios registrados
- WHEN se llama a `GET /api/v1/reportes/socios`
- THEN retorna `200` con distribución por categoría, estado, tasa de morosidad y altas mensuales

### Requirement: Reglas Comunes

1. Todos los reportes DEVUELVEN `200` incluso si los resultados son cero
2. Fechas inválidas (from > to) → `400 Bad Request`
3. Sin datos → reporte con totales en 0 y listas vacías
