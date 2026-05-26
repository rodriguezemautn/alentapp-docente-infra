# Tareas: Locker, EquipmentLoan y Reports

## Fase 1: Locker — Backend

- [ ] 1.1 Agregar modelo `Locker` y enum `LockerStatus` a `packages/api/prisma/schema.prisma`
- [ ] 1.2 Agregar tipos `LockerStatus`, `LockerDTO`, `LockerDetailDTO`, `CreateLockerRequest`, `UpdateLockerRequest` a `packages/shared/index.ts`
- [ ] 1.3 Crear `packages/api/src/domain/LockerRepository.ts` (interfaz)
- [ ] 1.4 Crear `packages/api/src/domain/services/LockerValidator.ts` con tests
- [ ] 1.5 Crear `packages/api/src/domain/errors.ts` (si no existe con ConflictError)
- [ ] 1.6 Crear `CreateLockerUseCase`, `GetLockersUseCase`, `GetLockerByIdUseCase`, `UpdateLockerUseCase`, `DeleteLockerUseCase` en `application/` con tests
- [ ] 1.7 Crear `PostgresLockerRepository` en `infrastructure/`
- [ ] 1.8 Crear `LockerController` en `delivery/` con tests
- [ ] 1.9 Registrar rutas en `packages/api/src/app.ts`
- [ ] 1.10 Crear migración de Prisma

## Fase 2: LockerAssignmentLog (Historial)

- [ ] 2.1 Agregar modelo `LockerAssignmentLog` y enum `LockerEventType` a schema.prisma
- [ ] 2.2 Agregar tipos compartidos para el historial en `shared/index.ts`
- [ ] 2.3 Crear `LockerAssignmentLogRepository` en `domain/`
- [ ] 2.4 Integrar logging en `UpdateLockerUseCase` (transacción al asignar/liberar)
- [ ] 2.5 Crear `GetLockerHistoryUseCase`
- [ ] 2.6 Agregar ruta `GET /api/v1/historial/casilleros` en controller

## Fase 3: Locker — Frontend

- [ ] 3.1 Crear `packages/web/src/services/lockers.ts`
- [ ] 3.2 Agregar constantes de LockerStatus a `packages/web/src/constants.ts`
- [ ] 3.3 Crear `packages/web/src/views/Lockers.tsx` con tabla CRUD + filtros
- [ ] 3.4 Agregar ruta `/casilleros` en `packages/web/src/routes.tsx`
- [ ] 3.5 Agregar tarjeta de Locker en `Home.tsx`

## Fase 4: EquipmentLoan — Backend

- [ ] 4.1 Agregar `SportCategory` enum y `sportCategory` a `Member` en schema.prisma
- [ ] 4.2 Agregar modelos `EquipmentLoan` y `LoanStatus` a schema.prisma
- [ ] 4.3 Agregar tipos `SportCategory`, `LoanStatus`, `EquipmentLoanDTO`, `EquipmentLoanDetailDTO`, `CreateEquipmentLoanRequest`, `ReturnEquipmentLoanRequest` a `shared/index.ts`
- [ ] 4.4 Extender `MemberDTO` con `sportCategory`
- [ ] 4.5 Crear `EquipmentLoanRepository` en `domain/`
- [ ] 4.6 Crear `EquipmentLoanValidator` con tests
- [ ] 4.7 Crear `CreateEquipmentLoanUseCase`, `GetEquipmentLoansUseCase`, `GetEquipmentLoanByIdUseCase`, `ReturnEquipmentLoanUseCase`, `ReportLostEquipmentLoanUseCase`, `DeleteEquipmentLoanUseCase` con tests
- [ ] 4.8 Crear `PostgresEquipmentLoanRepository` en `infrastructure/`
- [ ] 4.9 Crear `EquipmentLoanController` en `delivery/` con tests
- [ ] 4.10 Registrar rutas en `app.ts`
- [ ] 4.11 Crear migraciones de Prisma

## Fase 5: EquipmentLoan — Frontend

- [ ] 5.1 Crear `packages/web/src/services/equipment-loans.ts`
- [ ] 5.2 Crear `packages/web/src/views/EquipmentLoans.tsx` con tabla + acciones (Return/ReportLost)
- [ ] 5.3 Agregar ruta `/prestamos-equipamiento` en `routes.tsx`
- [ ] 5.4 Agregar tarjeta en `Home.tsx`

## Fase 6: Reports — Backend

- [ ] 6.1 Agregar método `getIncomeReport()` a `PostgresPaymentRepository`
- [ ] 6.2 Agregar método `getLockerReport()` a `PostgresLockerRepository`
- [ ] 6.3 Agregar método `getMaterialReport()` a `PostgresEquipmentLoanRepository`
- [ ] 6.4 Agregar método `getMemberReport()` a `PostgresMemberRepository`
- [ ] 6.5 Crear `GetIncomeReportUseCase`, `GetLockerReportUseCase`, `GetMaterialReportUseCase`, `GetMemberReportUseCase`
- [ ] 6.6 Crear `ReportController` con rutas GET para cada reporte
- [ ] 6.7 Registrar rutas en `app.ts`

## Fase 7: Reports — Frontend

- [ ] 7.1 Crear `packages/web/src/services/reports.ts`
- [ ] 7.2 Crear `packages/web/src/views/Reports.tsx` con dashboard de reportes
- [ ] 7.3 Agregar ruta `/reportes` en `routes.tsx`
- [ ] 7.4 Agregar tarjeta en `Home.tsx`

## Fase 8: Verificación y Limpieza

- [ ] 8.1 Ejecutar tests unitarios: `npx vitest run` en api y web
- [ ] 8.2 Verificar compilación TypeScript: `npx tsc --noEmit`
- [ ] 8.3 Archivar cambio SDD (sync specs a main, mover a archive)
