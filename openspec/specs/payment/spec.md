# Especificación de Payment

## Propósito

La entidad Payment representa una transacción financiera registrada por el tesorero del club. Los pagos están asociados a un Member y son inmutables — no pueden ser actualizados ni eliminados. La única transición de estado permitida es la cancelación (Completed → Canceled), preservando el registro original para fines de auditoría.

## Requisitos Funcionales

### RF-01: Crear Payment
El sistema DEBE permitir crear un pago con `memberId`, `amount`, `paymentDate` (opcional) y `paymentType`.
- Éxito → HTTP `201` con `PaymentDTO`
- Member no encontrado → HTTP `404`
- Amount ≤ 0 → HTTP `400`
- paymentType inválido → HTTP `400`

### RF-02: Obtener Payment por ID
El sistema DEBE devolver un pago por su ID.
- Éxito → HTTP `200` con `PaymentDetailDTO` (incluye `memberName`)
- No encontrado → HTTP `404`

### RF-03: Obtener Payments (con filtros + paginación)
El sistema DEBE devolver una lista paginada de pagos, filtrable por `memberId`, `paymentType`, `status` y rango de fechas (`from`, `to`).
- Éxito → HTTP `200` con `PaginatedResponse<PaymentDTO>`
- `from > to` → HTTP `400`
- Sin resultados → HTTP `200` con arreglo vacío y total 0

### RF-04: Cancelar Payment
El sistema DEBE permitir cancelar un pago cambiando su estado de `Completed` a `Canceled`.
- Éxito → HTTP `200` con `PaymentDTO` actualizado
- Payment no encontrado → HTTP `404`
- Payment ya cancelado → HTTP `400`
- El endpoint DELETE NO DEBE existir (405 si se intenta)

## Reglas de Negocio

| ID | Regla | Obligatoriedad |
|----|-------|----------------|
| RN-01 | Los registros de Payment NO DEBEN ser eliminados (solo cancelación suave) | OBLIGATORIO |
| RN-02 | `amount` DEBE ser un decimal positivo con 2 decimales | OBLIGATORIO |
| RN-03 | Un pago cancelado NO DEBE ser reactivado | OBLIGATORIO |
| RN-04 | `memberId` DEBE referenciar un Member existente | OBLIGATORIO |
| RN-05 | `paymentDate` por defecto es now() si no se proporciona | OPCIONAL |
| RN-06 | `status` por defecto es `Completed` al crearse | OBLIGATORIO |

## Contrato de API

Base: `/api/v1/pagos`

| Método | Ruta | Request | Response | Errores |
|--------|------|---------|----------|---------|
| POST | `/api/v1/pagos` | `CreatePaymentRequest` | `201` `PaymentDTO` | 400, 404 |
| GET | `/api/v1/pagos` | Query: `PaymentFilters` | `200` `PaginatedResponse<PaymentDTO>` | 400 |
| GET | `/api/v1/pagos/:id` | — | `200` `PaymentDetailDTO` | 404 |
| PUT | `/api/v1/pagos/:id/cancel` | — | `200` `PaymentDTO` | 400, 404 |

## Definiciones de DTO

```typescript
// packages/shared/index.ts additions

export type PaymentType = 'Cuota' | 'Mensualidad' | 'Inscripcion' | 'Otro';
export type PaymentStatus = 'Completed' | 'Canceled';

export interface PaymentDTO {
  id: string;
  memberId: string;
  amount: number;
  paymentDate: string;
  paymentType: PaymentType;
  status: PaymentStatus;
  created_at: string;
}

export interface PaymentDetailDTO extends PaymentDTO {
  memberName: string;
}

export interface CreatePaymentRequest {
  memberId: string;
  amount: number;
  paymentDate?: string;
  paymentType: PaymentType;
}

export interface PaymentFilters {
  memberId?: string;
  paymentType?: PaymentType;
  status?: PaymentStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

## Escenarios de Prueba

### Crear — Caso exitoso
- DADO un `CreatePaymentRequest` válido con `memberId` de un miembro existente, `amount: 150.00`, `paymentType: "Cuota"`
- CUANDO se llama a `POST /api/v1/pagos`
- ENTONCES HTTP `201` con un `PaymentDTO` y `status: "Completed"`

### Crear — Member no encontrado
- DADO que `memberId` no existe
- CUANDO se llama a `POST /api/v1/pagos`
- ENTONCES HTTP `404` con mensaje de error

### Crear — Amount inválido
- DADO `amount: 0`
- CUANDO se llama a `POST /api/v1/pagos`
- ENTONCES HTTP `400` con mensaje de error

### Obtener lista — Con filtros
- DADO que existen pagos para múltiples miembros
- CUANDO se llama a `GET /api/v1/pagos?memberId=abc&status=Completed`
- ENTONCES HTTP `200` con `PaginatedResponse` filtrado

### Obtener lista — Vacía
- DADO que ningún pago coincide con los filtros
- CUANDO se llama a `GET /api/v1/pagos`
- ENTONCES HTTP `200` con `{ data: [], total: 0, page: 1, limit: 10 }`

### Obtener por ID — Encontrado
- DADO que existe un pago
- CUANDO se llama a `GET /api/v1/pagos/:id`
- ENTONCES HTTP `200` con `PaymentDetailDTO` incluyendo `memberName`

### Obtener por ID — No encontrado
- DADO que ningún pago coincide con el ID
- CUANDO se llama a `GET /api/v1/pagos/:id`
- ENTONCES HTTP `404` con error

### Cancelar — Caso exitoso
- DADO un pago con `status: "Completed"`
- CUANDO se llama a `PUT /api/v1/pagos/:id/cancel`
- ENTONCES HTTP `200` con `status: "Canceled"`

### Cancelar — Ya cancelado
- DADO un pago con `status: "Canceled"`
- CUANDO se llama a `PUT /api/v1/pagos/:id/cancel`
- ENTONCES HTTP `400` con mensaje de error

### Cancelar — No encontrado
- DADO que ningún pago coincide con el ID
- CUANDO se llama a `PUT /api/v1/pagos/:id/cancel`
- ENTONCES HTTP `404` con error

### DELETE intentado
- DADO cualquier pago
- CUANDO se intenta `DELETE /api/v1/pagos/:id`
- ENTONCES HTTP `405` Method Not Allowed
