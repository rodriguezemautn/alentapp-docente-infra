---
id: 0018
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Eliminación de Préstamos de Equipamiento
---

# TDD-0018: Eliminación de Préstamos de Equipamiento

## Contexto de Negocio (PRD)

### Objetivo

Permitir la eliminación física de un registro de préstamo. Solo se permite eliminar préstamos que ya están en estado final ("Returned" o "Lost"), para mantener la integridad del seguimiento de material activo.

### User Persona

- **Nombre**: Roberto (Encargado del depósito de material).
- **Necesidad**: Limpiar registros históricos de préstamos que ya fueron cerrados. No puede eliminar préstamos que aún están activos.

### Criterios de Aceptación

- El sistema debe validar que el préstamo exista antes de eliminarlo.
- El sistema debe permitir la eliminación **solo si** el préstamo está en estado "Returned" o "Lost".
- El sistema debe rechazar la eliminación si el préstamo está "Active".

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

- Endpoint: `DELETE /api/v1/prestamos-equipamiento/:id`
- Request Body: `None`
- Response: `204 No Content` en caso de éxito.

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `EquipmentLoanRepository` (Método `delete(id)`).
2. **Servicio de Dominio**: `EquipmentLoanValidator` (Valida que el préstamo no esté en estado Active).
3. **Caso de Uso**: `DeleteEquipmentLoanUseCase` (Verifica estado, elimina).
4. **Adaptador de Salida**: `PostgresEquipmentLoanRepository` (Eliminación con Prisma).
5. **Adaptador de Entrada**: `EquipmentLoanController` (Ruta HTTP DELETE).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Préstamo inexistente                           | Mensaje: "El préstamo no existe"                             | 404 Not Found |
| Eliminar un préstamo activo                    | Mensaje: "No se puede eliminar un préstamo activo. Regístrelo como devuelto o perdido primero" | 400 Bad Request |
| Eliminación exitosa                            | Respuesta vacía                                              | 204 No Content |
| Error de conexión a DB                         | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Ampliar `EquipmentLoanRepository` con método `delete`.
2. Implementar `DeleteEquipmentLoanUseCase` con verificación de estado.
3. Agregar ruta `DELETE /api/v1/prestamos-equipamiento/:id` en `EquipmentLoanController`.
4. Registrar en `app.ts`.
5. En el frontend, ocultar o deshabilitar el botón de eliminar para préstamos activos.
