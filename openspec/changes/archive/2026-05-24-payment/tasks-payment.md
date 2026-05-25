# Tareas: Entidad Payment

## Fase 1: Fundamentos
- [x] T-01: Schema de Prisma + migración para Payment
- [x] T-02: DTOs compartidos (PaymentDTO, PaymentDetailDTO, CreatePaymentRequest, PaymentFilters, PaginatedResponse)

## Fase 2: Dominio
- [x] T-03: Interfaz del puerto PaymentRepository
- [x] T-04: PaymentValidator + PaymentValidator.test.ts (TDD estricto)

## Fase 3: Aplicación
- [x] T-05: CreatePaymentUseCase + test (TDD estricto)
- [x] T-06: GetPaymentsUseCase + test (TDD estricto)
- [x] T-07: GetPaymentByIdUseCase + test (TDD estricto)
- [x] T-08: CancelPaymentUseCase + test (TDD estricto)

## Fase 4: Delivery + Infraestructura
- [x] T-09: PostgresPaymentRepository
- [x] T-10: PaymentController + tests (TDD estricto)
- [x] T-10b: Wire de Payment en app.ts

## Fase 5: Frontend
- [x] T-11: Servicio payments.ts
- [x] T-12: Payments.tsx + Payments.test.tsx (TDD estricto)
- [x] T-13: Registro de ruta (/pagos)

## Fase 6: Documentación
- [ ] T-14: Notas académicas + PR

## Estrategia de PR
- PR #6: Backend (T-01 a T-10b) → feat/payment-backend
- PR #7: Frontend (T-11 a T-13) → feat/payment-frontend

## Pronóstico de Revisión
- Estimado: ~1200 líneas backend + ~400 frontend
- Presupuesto: 400 líneas — dividir en PRs de backend/frontend
