---
schema: spec-driven
phase: proposal
status: draft
change: "Actividad 2 – Implementación de Entidades del TP Integrador"
fecha: 2026-05-23
docente: Emanuel Rodriguez
---

# SDD Proposal: Actividad 2 — Implementación de Entidades

## Executive Summary

Implementar todas las entidades del DER del club social y deportivo que están
especificadas en los TDDs (TDD 0004–TDD 0030) pero no tienen código aún.
6 entidades: Payment, MedicalCertificate, Locker, Sport, Discipline,
EquipmentLoan. Cada una sigue el patrón hexagonal de Member, con su propio
Prisma schema, backend completo (domain → application → delivery →
infrastructure), frontend (services + views) y tests.

## Problema

El proyecto tiene 30 TDDs que especifican el comportamiento completo de 7
entidades del sistema, pero solo **Member** está implementado. Las otras 6
entidades no existen en ninguna capa: no hay schema de Prisma, no hay
endpoints, no hay vistas, no hay tests.

## Motivación

- Es requisito directo de la Actividad 2 del TP Integrador
- Los TDDs ya están escritos y aprobados; falta la implementación
- El proyecto necesita código ejecutable para que los estudiantes puedan
  hacer pruebas funcionales y E2E

## Alcance

### Incluye

| # | Entidad | Operaciones (TDDs) |
|---|---------|--------------------|
| 1 | **Sport** | Create, Update, Delete, GetAll |
| 2 | **Discipline** | Create, Update, Delete, GetAll |
| 3 | **Payment** | Create, Cancel, GetWithFilters |
| 4 | **MedicalCertificate** | Create, GetActiveByMember (no update, no delete) |
| 5 | **Locker** | Create, Update, Delete, GetAll + LockerAssignmentLog (historial) |
| 6 | **EquipmentLoan** | Create, Return, ReportLost, Delete (si Returned/Lost), GetAll |
| 7 | **Reports** | IncomeReport, LockerReport, MaterialReport, MemberReport, LockerHistory |

### Excluye

- Autenticación y autorización (fuera del alcance de esta actividad)
- Migración de datos existentes (no hay datos)
- CI/CD pipelines (se configura por separado)
- EquipmentLoan: la modificación a Member (agregar `sportCategory`) se
  trata como parte de la implementación de EquipmentLoan

## Enfoque

### Patrón

Cada entidad sigue EXACTAMENTE el patrón de implementación de Member:

```
Prisma schema + migración
  → Shared DTOs
    → Domain: Repository interface + Validator service
      → Application: Create, Get, Update, Delete use cases
        → Delivery: Controller con rutas Fastify
          → Infrastructure: PostgresRepository
            → Frontend: services/ + views/
              → Tests: unitarios, integración, E2E
```

### Orden de Implementación

Basado en dependencias entre entidades:

| Orden | Entidad | Depende de | Rama |
|-------|---------|-----------|------|
| 1 | Sport | — | `feat/sport` |
| 2 | Payment | Member (existe) | `feat/payment` |
| 3 | MedicalCertificate | Member (existe) | `feat/medical-certificate` |
| 4 | Discipline | Sport (#1) | `feat/discipline` |
| 5 | Locker | Member (existe) | `feat/locker` |
| 6 | EquipmentLoan | Sport (#1) + Member | `feat/equipment-loan` |
| 7 | Reports | Todas (#1–#6) | `feat/reports` |

Payment, MedicalCertificate y Discipline son independientes entre sí y
podrían implementarse en paralelo si se desea.

### Estrategia de PRs

**Chained PRs a main** — cada entidad en su propia rama y PR individual,
mergeado secuencialmente. Cada PR se mantiene dentro del budget de 400
líneas (o se justifica excepción).

## Estimación de Esfuerzo

| Entidad | Archivos | Líneas estimadas | Complejidad |
|---------|----------|------------------|-------------|
| Sport | ~15 | ~600 | Baja |
| Payment | ~16 | ~700 | Baja-Media |
| MedicalCertificate | ~15 | ~650 | Media |
| Discipline | ~15 | ~650 | Media |
| Locker | ~18 | ~900 | Media-Alta |
| EquipmentLoan | ~18 | ~900 | Alta |
| Reports | ~8 | ~500 | Media |
| **Total** | **~105** | **~4900** | |

## Riesgos

1. **EquipmentLoan requiere modificar Member**: agregar `sportCategory`
   implica migración de Prisma y cambio en MemberDTO (shared).
2. **LockerAssignmentLog**: modelo nuevo no contemplado en schema actual
   — requiere tabla adicional.
3. **MedicalCertificate transacción**: desactivar certificados anteriores
   + crear nuevo en una transacción de Prisma.
4. **Budget de 400 líneas**: cada entidad individual excede el budget de
   400 líneas, requiriendo excepción o división adicional dentro de la
   entidad (ej: backend por un lado, frontend por otro).

## Próximo Paso Recomendado

SDD Spec → Definir especificaciones detalladas para la primera entidad
(Sport), incluyendo contratos de API, reglas de negocio y casos de prueba.
