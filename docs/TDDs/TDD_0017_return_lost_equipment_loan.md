---
id: 0017
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Devolución y Reporte de Pérdida de Equipamiento
---

# TDD-0017: Devolución y Reporte de Pérdida de Equipamiento

## Contexto de Negocio (PRD)

### Objetivo

Gestionar la devolución del material prestado o reportar su pérdida. Un préstamo activo puede pasar a "Returned" cuando el socio devuelve el material, o a "Lost" si se reporta como perdido. Una vez devuelto o perdido, no puede volver a estado "Active".

### User Persona

- **Nombre**: Roberto (Encargado del depósito de material).
- **Necesidad**: Registrar cuándo un socio devuelve el material, o reportar si algo se perdió. Necesita que el sistema le impida cambiar el estado incorrectamente.

### Criterios de Aceptación

- El sistema debe permitir registrar la devolución de un préstamo activo.
- El sistema debe permitir reportar como perdido un préstamo activo.
- El sistema debe validar que el préstamo esté en estado "Active" antes de cualquier transición.
- El sistema debe rechazar devolver o reportar pérdida de un préstamo ya devuelto o perdido.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

```ts
export interface ReturnEquipmentLoanRequest {
    returnDate?: string;     // ISO Date String, default hoy
    notes?: string;
}
```

| Método | Endpoint                                                    | Descripción                              |
|--------|-------------------------------------------------------------|------------------------------------------|
| PUT    | `/api/v1/prestamos-equipamiento/:id/return`                 | Registrar devolución (Active → Returned) |
| PUT    | `/api/v1/prestamos-equipamiento/:id/report-lost`            | Reportar pérdida (Active → Lost)         |

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `EquipmentLoanRepository` (Método `update(id, data)`).
2. **Servicio de Dominio**: `EquipmentLoanValidator` (Valida que el préstamo exista, que esté en estado Active, que no esté ya en estado final).
3. **Casos de Uso**:
   - `ReturnEquipmentLoanUseCase` (Cambia status a Returned, registra fecha de devolución).
   - `ReportLostEquipmentLoanUseCase` (Cambia status a Lost).
4. **Adaptador de Salida**: `PostgresEquipmentLoanRepository`.
5. **Adaptador de Entrada**: `EquipmentLoanController` (Rutas PUT return y PUT report-lost).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Préstamo inexistente                           | Mensaje: "El préstamo no existe"                             | 404 Not Found |
| Devolver un préstamo ya devuelto               | Mensaje: "El préstamo ya fue devuelto"                       | 400 Bad Request |
| Reportar como perdido un préstamo ya perdido   | Mensaje: "El préstamo ya fue reportado como perdido"         | 400 Bad Request |
| Reportar como perdido un préstamo ya devuelto  | Mensaje: "El préstamo ya fue devuelto"                       | 400 Bad Request |
| Error de conexión a DB                         | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Implementar `EquipmentLoanValidator` (validación de estados para transición).
2. Implementar `ReturnEquipmentLoanUseCase`.
3. Implementar `ReportLostEquipmentLoanUseCase`.
4. Agregar rutas `PUT .../return` y `PUT .../report-lost` en `EquipmentLoanController`.
5. Registrar en `app.ts`.
6. En el frontend, agregar botones de "Devolver" y "Reportar pérdida" con confirmación.
