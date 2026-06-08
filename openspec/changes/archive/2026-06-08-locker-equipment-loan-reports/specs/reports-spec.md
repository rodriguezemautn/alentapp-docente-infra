---
schema: spec-driven
phase: spec
status: draft
change: locker-equipment-loan-reports
entidad: Reports
tdds: [0026, 0027, 0028, 0030]
---

# Especificación: Reports (Reportes)

## IncomeReport — Ingresos

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
- groupBy: día, mes o año

## LockerReport — Estado de Casilleros

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

## MaterialReport — Material Deportivo

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

## MemberReport — Socios

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

## Reglas Comunes

1. Todos los reportes DEVUELVEN `200` incluso si los resultados son cero
2. Fechas inválidas (from > to) → `400 Bad Request`
3. Sin datos → reporte con totales en 0 y listas vacías
