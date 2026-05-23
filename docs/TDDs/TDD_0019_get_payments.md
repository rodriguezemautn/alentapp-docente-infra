---
id: 0019
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Consulta de Pagos
---

# TDD-0019: Consulta de Pagos

## Contexto de Negocio (PRD)

### Objetivo

Permitir la consulta de pagos registrados con filtros por socio y rango de fechas. El tesorero necesita visualizar rápidamente los pagos de un socio específico, los pagos de un período o los pagos cancelados para auditoría.

### User Persona

- **Nombre**: Alberto (Tesorero/Administrativo).
- **Necesidad**: Consultar el historial de pagos de un socio, filtrar por fecha para la rendición mensual, y ver qué pagos fueron cancelados para auditoría.

### Criterios de Aceptación

- El sistema debe listar todos los pagos, con paginación opcional.
- El sistema debe permitir filtrar por `memberId`, `paymentType`, `status` y rango de fechas (`from`, `to`).
- El sistema debe permitir obtener un pago individual por ID.
- Los pagos cancelados deben mostrarse visualmente diferenciados.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

```ts
// GET /api/v1/pagos
// Query params: ?memberId=&paymentType=&status=&from=&to=&page=&limit=
export interface PaymentFilters {
    memberId?: string;
    paymentType?: PaymentType;
    status?: PaymentStatus;
    from?: string;    // ISO Date
    to?: string;      // ISO Date
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// GET /api/v1/pagos/:id
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `PaymentRepository` (Métodos `findAll(filters)`, `findById(id)`).
2. **Casos de Uso**: `GetPaymentsUseCase` (Aplica filtros y paginación), `GetPaymentByIdUseCase`.
3. **Adaptador de Entrada**: `PaymentController` (Rutas GET).

## Casos de Borde y Errores

| Escenario                              | Resultado Esperado                                      | Código HTTP |
|----------------------------------------|---------------------------------------------------------|-------------|
| Filtros sin resultados                 | Lista vacía con total 0                                 | 200 OK |
| Socio sin pagos                        | Lista vacía                                             | 200 OK |
| Rango de fechas inválido (from > to)   | Mensaje: "La fecha desde no puede ser posterior a la fecha hasta" | 400 Bad Request |
| Pago inexistente                       | Mensaje: "El pago no existe"                            | 404 Not Found |
| Error de conexión a DB                 | Mensaje: "Error interno"                                | 500 |

## Plan de Implementación

1. Agregar métodos `findAll` con filtros y `findById` a `PaymentRepository`.
2. Implementar `GetPaymentsUseCase` y `GetPaymentByIdUseCase`.
3. Agregar rutas GET en `PaymentController`.
4. En el frontend, agregar filtros de búsqueda en la vista de pagos.
