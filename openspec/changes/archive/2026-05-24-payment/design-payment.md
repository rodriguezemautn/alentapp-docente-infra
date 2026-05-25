# Diseño: Entidad Payment

## Enfoque Técnico

Implementar Payment siguiendo el patrón hexagonal establecido por Member y Sport, con las variaciones específicas de Payment:
1. Sin endpoint DELETE (cancelación mediante transición de estado)
2. Filtros + paginación en GET de lista
3. Amount decimal (Prisma) mapeado a number (DTO)
4. Dos casos de uso separados para GET: `GetPaymentsUseCase` (lista + filtros) y `GetPaymentByIdUseCase` (detalle con nombre del miembro)

## Vista General de Arquitectura

```
Prisma schema [payments table + enums]
    ↓
Shared DTOs [PaymentDTO, PaymentDetailDTO, CreatePaymentRequest, PaymentFilters, PaginatedResponse]
    ↓
Domain:
  PaymentRepository (port: create, findById, findAll, update)
  PaymentValidator (validate amount, member existence, cancel preconditions)
    ↓
Application:
  CreatePaymentUseCase | GetPaymentsUseCase | GetPaymentByIdUseCase | CancelPaymentUseCase
    ↓
Delivery:
  PaymentController (POST/GET/GET:id/PUT:id/cancel)
    ↓
Infrastructure:
  PostgresPaymentRepository (Prisma)
    ↓
Frontend:
  services/payments.ts → views/Payments.tsx → routes.ts (/pagos)
```

## Decisiones de Arquitectura

### Decisión: Ruta del frontend como `/pagos` (español)
**Elección**: `/pagos` (español).
**Justificación**: Los TDDs usan consistentemente `/pagos` para la ruta de API, y el nombre de la entidad aparece en etiquetas de UI como "Pagos". Usar español para la ruta es más natural para esta entidad dada la convención existente en los TDDs.
**Compensación**: Ligeramente inconsistente con `/sports` (inglés), pero más alineado con el idioma de la interfaz de usuario.

### Decisión: PaginatedResponse\<T\> como tipo genérico
**Elección**: `PaginatedResponse<T>` genérico en tipos compartidos.
**Justificación**: Múltiples entidades pueden necesitar paginación en el futuro (EquipmentLoan, historial de Locker). Hacerlo genérico desde el inicio evita duplicación.

### Decisión: Conversión Decimal → number en el repositorio
**Elección**: Prisma almacena `amount` como `Decimal(10,2)`. El repositorio lo mapea a `number` mediante `Number(record.amount)` en `mapToDTO()`.
**Justificación**: El DTO usa `number` para serialización JSON. El mapeo ocurre en la capa de infraestructura, manteniendo las capas de dominio y aplicación sin conocimiento de los tipos de Prisma.

### Decisión: Sin DeleteSportUseCase — CancelPaymentUseCase en su lugar
**Elección**: `CancelPaymentUseCase` reemplaza lo que sería `DeletePaymentUseCase`.
**Justificación**: Según TDD-0013, los pagos son registros inmutables. El único cambio de estado permitido es `Completed → Canceled`. No hay eliminación física.

## Cambios en el Schema de Prisma

```prisma
enum PaymentType {
  Cuota
  Mensualidad
  Inscripcion
  Otro
}

enum PaymentStatus {
  Completed
  Canceled
}

model Payment {
  id          String        @id @default(uuid())
  memberId    String
  member      Member        @relation(fields: [memberId], references: [id])
  amount      Decimal       @db.Decimal(10, 2)
  paymentDate DateTime      @default(now())
  paymentType PaymentType
  status      PaymentStatus @default(Completed)
  created_at  DateTime      @default(now())

  @@map("payments")
}
```

## Componentes de Arquitectura

### Capa de Dominio

**PaymentRepository** (puerto — 4 métodos):
- `create(data)` → `PaymentDTO`
- `findById(id)` → `PaymentDetailDTO | null` (incluye memberName mediante include)
- `findAll(filters)` → `PaginatedResponse<PaymentDTO>` (con Prisma where + skip/take)
- `update(id, data)` → `PaymentDTO` (usado solo para cambio de estado por cancelación)

**PaymentValidator** (servicio de dominio):
- `validateAmount(amount)`: requerido, decimal positivo
- `validatePaymentType(type)`: debe ser un valor válido del enum PaymentType
- `validateCancel(payment)`: no encontrado → error, ya cancelado → error
- `validateMemberExists(memberId)`: verifica mediante MemberRepository inyectado

### Capa de Aplicación

**CreatePaymentUseCase**: validar → verificar miembro → repo.create → devolver DTO
**GetPaymentsUseCase**: validar rango de fechas → repo.findAll → devolver paginado
**GetPaymentByIdUseCase**: repo.findById → devolver o 404
**CancelPaymentUseCase**: repo.findById → validateCancel → repo.update status → devolver DTO

### Capa de Delivery

**PaymentController**:
- `POST /api/v1/pagos` → create(req)
- `GET /api/v1/pagos` → getAll(req) — lee parámetros de query para filtros
- `GET /api/v1/pagos/:id` → getById(req)
- `PUT /api/v1/pagos/:id/cancel` → cancel(req)
- No hay ruta DELETE registrada

### Capa de Infraestructura

**PostgresPaymentRepository**:
- `create`: `prisma.payment.create({ data: { memberId, amount, paymentDate, paymentType } })` → mapToDTO
- `findById`: `prisma.payment.findUnique({ where: { id }, include: { member: { select: { name: true } } } })` → mapToDetailDTO
- `findAll`: Construir cláusula `where` dinámica a partir de filtros + `skip`/`take` para paginación + `_count` para total
- `update`: `prisma.payment.update({ where: { id }, data: { status } })`

## Archivos Afectados

**Archivos nuevos (backend)**:
- packages/api/src/domain/PaymentRepository.ts
- packages/api/src/domain/services/PaymentValidator.ts + test
- packages/api/src/application/CreatePaymentUseCase.ts + test
- packages/api/src/application/GetPaymentsUseCase.ts + test
- packages/api/src/application/GetPaymentByIdUseCase.ts + test
- packages/api/src/application/CancelPaymentUseCase.ts + test
- packages/api/src/delivery/PaymentController.ts + test + integration test
- packages/api/src/infrastructure/PostgresPaymentRepository.ts

**Archivos modificados**:
- packages/api/prisma/schema.prisma (agregar modelo Payment + enums)
- packages/shared/index.ts (agregar DTOs de Payment + filtros + PaginatedResponse)
- packages/api/src/app.ts (wiring)

**Archivos nuevos (frontend)**:
- packages/web/src/services/payments.ts
- packages/web/src/views/Payments.tsx + test

**Archivos modificados (frontend)**:
- packages/web/src/routes.ts

## Orden de Implementación

1. Schema de Prisma + migración (modelo Payment + enums)
2. DTOs compartidos (PaymentDTO, CreatePaymentRequest, PaymentFilters, PaginatedResponse)
3. Puerto PaymentRepository
4. PaymentValidator + tests (TDD)
5. CreatePaymentUseCase + test (TDD)
6. GetPaymentsUseCase + test (TDD)
7. GetPaymentByIdUseCase + test (TDD)
8. CancelPaymentUseCase + test (TDD)
9. PostgresPaymentRepository
10. PaymentController + tests (TDD) + integración
11. Wire en app.ts
12. Servicio frontend
13. Vista frontend + tests (TDD)
14. Registro de ruta

## Validación

### Backend
| Campo | Regla | Capa |
|-------|-------|------|
| amount | Requerido, decimal positivo | Validator |
| paymentType | Requerido, debe ser valor válido del enum | Validator |
| memberId | Requerido, debe existir | Validator (via MemberRepository) |
| cancel | Payment no encontrado, o ya cancelado | Validator |

### Frontend
| Campo | Regla | Pantalla |
|-------|-------|----------|
| amount | Requerido, número positivo | Mensaje de error |
| paymentType | Select requerido | Campo obligatorio |
| memberId | Requerido, búsqueda/selección de miembro | Typeahead o lista de miembros |
| Botón Cancelar | Diálogo de confirmación | Confirmar antes de cancelar |
| Sin botón de eliminar | No se renderiza | N/A |
