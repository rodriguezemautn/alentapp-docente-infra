---
id: 0004
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: ABM de Pagos
---

# TDD-0004: ABM de Pagos

## Contexto de Negocio (PRD)

### Objetivo

Digitalizar el registro de pagos de los socios del club, eliminando el registro manual en planillas. El sistema debe garantizar la inmutabilidad de los registros financieros: una vez registrado, un pago no puede modificarse ni eliminarse físicamente, solo cancelarse.

### User Persona

- **Nombre**: Alberto (Tesorero/Administrativo).
- **Necesidad**: Registrar los pagos de cuotas, mensualidades e inscripciones de los socios de forma rápida y sin errores. Necesita poder cancelar un pago mal registrado sin perder el rastro del error.

### Criterios de Aceptación

- El sistema debe permitir registrar un pago asociado a un socio existente.
- El sistema debe validar que el monto sea un valor positivo.
- El sistema debe validar que el socio exista antes de asociar el pago.
- El sistema **no debe permitir** la eliminación física de un pago (no hay DELETE).
- El sistema debe permitir cambiar el estado de un pago a "Canceled" como única operación de baja.
- El sistema debe listar los pagos filtrables por socio, rango de fechas o tipo.

## Diseño Técnico (RFC)

### Modelo de Datos

Se creará la entidad `Payment` con las siguientes propiedades y restricciones:

- `id`: Identificador único universal (UUID).
- `memberId`: Relación con el socio (UUID, clave foránea).
- `amount`: Monto del pago, numérico con dos decimales (mayor a cero).
- `paymentDate`: Fecha en que se realizó el pago (por defecto la fecha actual).
- `paymentType`: Tipo de pago (Cuota, Mensualidad, Inscripción, Otro).
- `status`: Estado del pago (Completed, Canceled). Por defecto `Completed`.
- `created_at`: Fecha de creación autogenerada.

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

### Contrato de API (@alentapp/shared)

Endpoint base: `/api/v1/pagos`

```ts
// --- Tipos ---
export type PaymentType = 'Cuota' | 'Mensualidad' | 'Inscripcion' | 'Otro';
export type PaymentStatus = 'Completed' | 'Canceled';

export interface PaymentDTO {
    id: string;
    memberId: string;
    amount: number;
    paymentDate: string;   // ISO Date String
    paymentType: PaymentType;
    status: PaymentStatus;
    created_at: string;    // ISO Date String
}

// POST /api/v1/pagos
export interface CreatePaymentRequest {
    memberId: string;
    amount: number;
    paymentDate?: string;   // opcional, default today
    paymentType: PaymentType;
}

// PUT /api/v1/pagos/:id/cancel → no tiene body, solo cambia status a Canceled
// GET  /api/v1/pagos → ?memberId=xxx&from=yyyy-mm-dd&to=yyyy-mm-dd
```

| Método | Endpoint                    | Descripción                        |
|--------|-----------------------------|------------------------------------|
| GET    | `/api/v1/pagos`             | Listar pagos (con filtros)         |
| GET    | `/api/v1/pagos/:id`         | Obtener un pago por ID             |
| POST   | `/api/v1/pagos`             | Registrar un nuevo pago            |
| PUT    | `/api/v1/pagos/:id/cancel`  | Cancelar un pago (única baja)      |

No existe endpoint `DELETE` ni `PUT` genérico — los pagos son inmutables.

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `PaymentRepository` (Interface en el Dominio: `create`, `findById`, `findAll`, `cancel`).
2. **Servicio de Dominio**: `PaymentValidator` (Valida monto positivo, existencia del socio, inmutabilidad — no permite update sobre un pago Cancelado).
3. **Casos de Uso**:
   - `CreatePaymentUseCase` (Crea el pago tras validaciones).
   - `GetPaymentsUseCase` (Lista con filtros opcionales).
   - `CancelPaymentUseCase` (Cambia status a Canceled, no elimina).
4. **Adaptador de Salida**: `PostgresPaymentRepository` (Implementación con Prisma).
5. **Adaptador de Entrada**: `PaymentController` (Rutas HTTP).

## Casos de Borde y Errores

| Escenario                              | Resultado Esperado                                      | Código HTTP |
|----------------------------------------|---------------------------------------------------------|-------------|
| Socio inexistente                      | Mensaje: "El socio no existe"                           | 404 Not Found |
| Monto negativo o cero                  | Mensaje: "El monto debe ser mayor a cero"               | 400 Bad Request |
| Tipo de pago inválido                  | Mensaje: "Tipo de pago no válido"                       | 400 Bad Request |
| Cancelar un pago ya cancelado          | Mensaje: "El pago ya se encuentra cancelado"            | 400 Bad Request |
| Intentar DELETE sobre un pago          | Mensaje: "No se permite eliminar pagos"                 | 405 Method Not Allowed |
| Error de conexión a DB                 | Mensaje: "Error interno, reintente más tarde"           | 500 Internal Server Error |

## Plan de Implementación

1. Agregar modelos `Payment`, `PaymentType`, `PaymentStatus` al schema de Prisma y crear migración.
2. Definir tipos compartidos (`PaymentDTO`, `CreatePaymentRequest`) en `@alentapp/shared`.
3. Crear el puerto `PaymentRepository` en `domain/`.
4. Implementar el servicio de dominio `PaymentValidator`.
5. Implementar los casos de uso (`CreatePaymentUseCase`, `GetPaymentsUseCase`, `CancelPaymentUseCase`).
6. Implementar `PostgresPaymentRepository` en infraestructura.
7. Crear `PaymentController` con rutas GET, POST y PUT cancel en Fastify.
8. Registrar rutas y dependencias en `app.ts`.
9. Crear `paymentsService` en el frontend (`services/payments.ts`).
10. Crear vista `PaymentsView` con tabla, modal de creación y confirmación de cancelación.
11. Agregar ruta `/pagos` en el router del frontend.
