---
tema: Notas Académicas — Implementación de Payment (Actividad 2)
fecha: 2026-05-23
docente: Emanuel Rodriguez
---

# Notas Académicas: Implementación de Payment con SDD

## Resumen

Implementación de la entidad **Payment** (Pagos) siguiendo el patrón SDD establecido con Sport. Payment introduce variaciones respecto al CRUD estándar: **no tiene DELETE** (solo cancelación vía transición de estado), **filtros con paginación**, y **monto como Decimal**.

## Proceso

| Fase | Artefacto |
|------|-----------|
| Spec | `openspec/changes/spec-payment.md` |
| Design | `openspec/changes/design-payment.md` |
| Tasks | `openspec/changes/tasks-payment.md` |
| Backend PR | #6 — mergeado |
| Frontend PR | #7 — mergeado |

## Decisiones Clave

| Decisión | Opción | Fundamento |
|----------|--------|------------|
| Ruta frontend | `/pagos` (español) | TDDs y UI usan "Pagos" consistentemente |
| PaginatedResponse\<T\> | Genérico en shared | Reutilizable por otras entidades |
| Decimal → number | Mapeo en repositorio | El dominio no conoce tipos de Prisma |
| Cancel en vez de Delete | PaymentValidator.validateCancel | Payments son inmutables |

## Diferencias con Sport

| Aspecto | Sport | Payment |
|---------|-------|---------|
| Operaciones | CRUD completo | Create, Read, Cancel (no Delete) |
| Listado | Array simple | Paginado con filtros |
| GET individual | No | Sí (`GetPaymentByIdUseCase`) |
| Tipo de monto | Int | Decimal (2 decimales) |
| DTO de detalle | SportDetailDTO (disciplineCount) | PaymentDetailDTO (memberName) |

## Métricas

- Commits: 10 backend + 3 frontend = 13 totales
- Archivos: 20 backend + 5 frontend = 25
- Tests nuevos: ~50 (validator 16 + use cases 13 + controller 15 + integration 8 + frontend 10)
- PRs mergeados: 2

## Lecciones

1. El genérico `PaginatedResponse<T>` fue la decisión correcta — lo van a usar Locker y EquipmentLoan también.
2. La ruta en español `/pagos` generó menos fricción que `/sports` en inglés porque la UI (labels, botones) está toda en español.
3. El `PostgresPaymentRepository.findAll` con `where` dinámico y `skip/take` es significativamente más complejo que el `findAll` de Sport.
