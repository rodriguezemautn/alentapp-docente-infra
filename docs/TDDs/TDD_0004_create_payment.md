---
id: 0004
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Registro de Pagos
---

# TDD-0004: Registro de Pagos

## Contexto de Negocio (PRD)

### Objetivo

Digitalizar el registro de pagos de los socios del club, eliminando el registro manual en planillas. El sistema debe capturar el monto, tipo de pago y socio asociado, garantizando la integridad de los registros financieros desde el inicio.

### User Persona

- **Nombre**: Alberto (Tesorero/Administrativo).
- **Necesidad**: Registrar los pagos de cuotas, mensualidades e inscripciones de los socios de forma rápida y sin errores. No puede permitirse montos incorrectos o pagos cargados al socio equivocado.

### Criterios de Aceptación

- El sistema debe permitir registrar un pago asociado a un socio existente.
- El sistema debe validar que el monto sea un valor positivo.
- El sistema debe validar que el socio exista antes de asociar el pago.
- El sistema debe asignar el estado "Completed" por defecto al nuevo pago.
- Al finalizar, el sistema debe mostrar los datos del pago registrado.

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

Se crearán los tipos compartidos para la entidad Payment:

- Endpoint: `POST /api/v1/pagos`
- Response: `200 OK` con los datos del pago

```ts
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

export interface CreatePaymentRequest {
    memberId: string;
    amount: number;
    paymentDate?: string;
    paymentType: PaymentType;
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `PaymentRepository` (Interface en el Dominio: `create`, `findById`, `findAll`).
2. **Servicio de Dominio**: `PaymentValidator` (Valida monto positivo, existencia del socio).
3. **Caso de Uso**: `CreatePaymentUseCase` (Crea el pago tras validaciones).
4. **Adaptador de Salida**: `PostgresPaymentRepository` (Implementación con Prisma).
5. **Adaptador de Entrada**: `PaymentController` (Ruta HTTP POST).

## Casos de Borde y Errores

| Escenario                              | Resultado Esperado                                      | Código HTTP |
|----------------------------------------|---------------------------------------------------------|-------------|
| Socio inexistente                      | Mensaje: "El socio no existe"                           | 404 Not Found |
| Monto negativo o cero                  | Mensaje: "El monto debe ser mayor a cero"               | 400 Bad Request |
| Tipo de pago inválido                  | Mensaje: "Tipo de pago no válido"                       | 400 Bad Request |
| Error de conexión a DB                 | Mensaje: "Error interno, reintente más tarde"           | 500 Internal Server Error |

## Plan de Implementación

1. Agregar modelos `Payment`, `PaymentType`, `PaymentStatus` al schema de Prisma y crear migración.
2. Definir tipos compartidos (`PaymentDTO`, `CreatePaymentRequest`) en `@alentapp/shared`.
3. Crear el puerto `PaymentRepository` en `domain/`.
4. Implementar el servicio de dominio `PaymentValidator`.
5. Implementar `CreatePaymentUseCase`.
6. Implementar `PostgresPaymentRepository` en infraestructura.
7. Crear `PaymentController` con ruta POST en Fastify.
8. Registrar ruta y dependencias en `app.ts`.
9. Crear `paymentsService` en el frontend (`services/payments.ts`).
10. Agregar vista y ruta en el frontend (`/pagos`).
