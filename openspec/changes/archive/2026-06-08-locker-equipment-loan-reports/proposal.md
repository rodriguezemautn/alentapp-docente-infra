---
schema: spec-driven
phase: proposal
status: draft
change: "Implementación de Locker, EquipmentLoan y Reports"
fecha: 2026-05-25
---

# Propuesta: Locker, EquipmentLoan y Reports

## Intención

Implementar las 3 entidades del DER del club social que aún no tienen código:
**Locker** (casilleros), **EquipmentLoan** (préstamos de equipamiento) y
**Reports** (reportes agregados). Cada una sigue el patrón hexagonal
existente (domain → application → delivery → infrastructure) más frontend
(services + views). Se incluye **LockerAssignmentLog** como modelo de
auditoría para el historial de asignaciones de casilleros.

## Alcance

### Incluye

| # | Entidad | Operaciones (TDDs) |
|---|---------|--------------------|
| 1 | **Locker** | Create, Update, Delete, GetAll, GetById |
| 2 | **LockerAssignmentLog** | Create on assign/release, GetByLocker, GetByMember |
| 3 | **EquipmentLoan** | Create, Return, ReportLost, Delete, GetAll, GetById |
| 4 | **IncomeReport** | Get por período, desglose por tipo de pago |
| 5 | **LockerReport** | Conteo por estado, % de ocupación |
| 6 | **MaterialReport** | Conteo por estado, material perdido, top socio |
| 7 | **MemberReport** | Distribución por categoría/estado, morosidad, altas mensuales |

### Excluye

- Autenticación y autorización (fuera de alcance)
- LockerHistory como endpoint separado (`/api/v1/historial/casilleros`)
- EquipmentLoan requiere extender `Member` con `sportCategory`

## Enfoque

Cada entidad sigue el patrón hexagonal de Member. Se implementan
secuencialmente en feature branches independientes:

```
1. Locker → rama feat/locker (incluye LockerAssignmentLog)
2. EquipmentLoan → rama feat/equipment-loan (extiende Member con sportCategory)
3. Reports → rama feat/reports (usa controlador unificado ReportController)
```

Cada feature branch se mergea a main vía PR individual con auto-merge
(sin necesidad de reviewer externo).

## Archivos Afectados

| Área | Impacto | Descripción |
|------|---------|-------------|
| `packages/api/prisma/schema.prisma` | Modificado | +Locker, +LockerAssignmentLog, +EquipmentLoan, +SportCategory en Member |
| `packages/shared/index.ts` | Modificado | +DTOs de Locker, EquipmentLoan, Reports |
| `packages/api/src/domain/` | Nuevo | +LockerRepository, +EquipmentLoanRepository, +validators |
| `packages/api/src/application/` | Nuevo | +14 use cases |
| `packages/api/src/delivery/` | Nuevo | +LockerController, +EquipmentLoanController, +ReportController |
| `packages/api/src/infrastructure/` | Nuevo | +PostgresLockerRepository, +PostgresEquipmentLoanRepository |
| `packages/web/src/services/` | Nuevo | +lockers.ts, +equipment-loans.ts |
| `packages/web/src/views/` | Nuevo | +Lockers.tsx, +EquipmentLoans.tsx, +Reports.tsx |
| `packages/web/src/routes.tsx` | Modificado | +rutas nuevas |
| `packages/web/src/constants.ts` | Modificado | +constantes de Locker |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| EquipmentLoan requiere migración que agrega columna a Member | Media | Migración separada, testear rollback |
| LockerAssignmentLog necesita transacción en UpdateLockerUseCase | Media | Usar $transaction de Prisma |
| Cantidad de archivos excede 400 líneas por entidad | Alta | Dividir backend/frontend en PRs separados si es necesario |

## Plan de Rollback

Por cada feature branch: `git revert <merge-commit>` y `prisma migrate down`
sobre la migración correspondiente.

## Criterios de Éxito

- [ ] Tests unitarios pasan: `npx vitest run` en packages/api y packages/web
- [ ] Cada entidad tiene al menos un test de integración por operación
- [ ] Frontend muestra las vistas de Locker, EquipmentLoan y Reports
- [ ] Rutas registradas en app.ts y accesibles via HTTP
