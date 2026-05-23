---
id: 0013
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Cancelación de Pagos
---

# TDD-0013: Cancelación de Pagos

## Contexto de Negocio (PRD)

### Objetivo

Permitir la cancelación de un pago registrado erróneamente. Dado que los registros financieros son inmutables por política del club, **no se permite la eliminación física** de un pago. La única operación de baja disponible es cambiar su estado a "Canceled", preservando el registro original para auditoría.

### User Persona

- **Nombre**: Alberto (Tesorero/Administrativo).
- **Necesidad**: Cancelar un pago que fue cargado por error (monto incorrecto, socio equivocado). Necesita que quede registrado que el pago existió pero fue cancelado, sin perder el rastro.

### Criterios de Aceptación

- El sistema debe permitir cancelar un pago existente, cambiando su estado a "Canceled".
- El sistema **no debe permitir** eliminar físicamente un pago (no hay endpoint DELETE).
- El sistema debe validar que el pago exista antes de cancelarlo.
- El sistema debe validar que el pago no esté ya cancelado.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

- Endpoint: `PUT /api/v1/pagos/:id/cancel`
- Request Body: `None`
- Response: `200 OK` con los datos del pago cancelado

No existe endpoint `DELETE /api/v1/pagos/:id`.

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `PaymentRepository` (Método `update(id, data)` para cambiar estado).
2. **Servicio de Dominio**: `PaymentValidator` (Valida que el pago exista, que no esté ya cancelado).
3. **Caso de Uso**: `CancelPaymentUseCase` (Cambia status a Canceled, no elimina).
4. **Adaptador de Salida**: `PostgresPaymentRepository` (Actualización del campo status).
5. **Adaptador de Entrada**: `PaymentController` (Ruta HTTP PUT cancel).

## Casos de Borde y Errores

| Escenario                              | Resultado Esperado                                      | Código HTTP |
|----------------------------------------|---------------------------------------------------------|-------------|
| Pago inexistente                       | Mensaje: "El pago no existe"                            | 404 Not Found |
| Cancelar un pago ya cancelado          | Mensaje: "El pago ya se encuentra cancelado"            | 400 Bad Request |
| Intentar DELETE sobre un pago          | Mensaje: "No se permite eliminar pagos"                 | 405 Method Not Allowed |
| Error de conexión a DB                 | Mensaje: "Error interno, reintente más tarde"           | 500 Internal Server Error |

## Plan de Implementación

1. Ampliar `PaymentRepository` con método `update` (solo para cambiar status).
2. Implementar `CancelPaymentUseCase` (validación de existencia y estado actual + cambio a Canceled).
3. Agregar ruta `PUT /api/v1/pagos/:id/cancel` en `PaymentController` (sin ruta DELETE).
4. Registrar en `app.ts`.
5. En el frontend, agregar botón de cancelación con confirmación en lugar de eliminar.
