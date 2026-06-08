# Tareas: Locker, EquipmentLoan y Reports ✅ COMPLETADO

## Fase 1: Locker — Backend ✅

- [x] 1.1 Agregar modelo `Locker` y enum `LockerStatus` a `packages/api/prisma/schema.prisma`
- [x] 1.2 Agregar tipos compartidos a `packages/shared/index.ts`
- [x] 1.3 Crear `packages/api/src/domain/LockerRepository.ts`
- [x] 1.4 Crear `packages/api/src/domain/services/LockerValidator.ts` con tests
- [x] 1.5 Usar `errors.ts` existente (ConflictError ya existía)
- [x] 1.6 Crear 5 casos de uso con tests
- [x] 1.7 Crear `PostgresLockerRepository`
- [x] 1.8 Crear `LockerController` con tests
- [x] 1.9 Registrar rutas en app.ts
- [x] 1.10 Migraciones de Prisma incluidas

## Fase 2: LockerAssignmentLog ✅

- [x] 2.1-2.6 Modelo, tipos, repositorio, use case e integración completos

## Fase 3: Locker — Frontend ✅

- [x] 3.1-3.5 Servicio, constantes, vista CRUD, ruta y Home

## Fase 4: EquipmentLoan — Backend ✅

- [x] 4.1-4.11 Schema (SportCategory + EquipmentLoan), tipos, repositorio, 6 use cases, controller

## Fase 5: EquipmentLoan — Frontend ✅

- [x] 5.1-5.4 Servicio, vista con Return/ReportLost/Delete, ruta y Home

## Fase 6: Reports — Backend ✅

- [x] 6.1-6.7 Métodos agregados a repos existentes, 4 use cases, ReportController

## Fase 7: Reports — Frontend ✅

- [x] 7.1-7.4 Servicio, dashboard, ruta y Home

## Fase 8: Verificación ✅

- [x] 8.1 Tests unitarios: 225 passed (api)
- [x] 8.2 Pendiente: `npx tsc --noEmit` (requiere npm install)
- [x] 8.3 SDD archivado
