---
id: 0024
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Consulta de Préstamos de Equipamiento
---

# TDD-0024: Consulta de Préstamos de Equipamiento

## Contexto de Negocio (PRD)

### Objetivo

Permitir la consulta de préstamos de equipamiento con filtros por socio y estado. El encargado del depósito necesita ver qué material está prestado y a quién, y consultar el historial de un socio.

### User Persona

- **Nombre**: Roberto (Encargado del depósito de material).
- **Necesidad**: Ver los préstamos activos para saber qué material falta devolver, y consultar el historial completo de un socio específico.

### Criterios de Aceptación

- El sistema debe listar los préstamos filtrables por `memberId` y `status`.
- El sistema debe incluir el nombre del socio en los resultados.
- El sistema debe permitir obtener un préstamo individual por ID.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

```ts
// GET /api/v1/prestamos-equipamiento?memberId=xxx&status=Active
// GET /api/v1/prestamos-equipamiento/:id

export interface EquipmentLoanDetailDTO extends EquipmentLoanDTO {
    memberName?: string;
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `EquipmentLoanRepository` (Métodos `findAll(filters)`, `findById(id)` con include de Member).
2. **Casos de Uso**: `GetEquipmentLoansUseCase`, `GetEquipmentLoanByIdUseCase`.
3. **Adaptador de Entrada**: `EquipmentLoanController` (Rutas GET).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Socio sin préstamos                            | Lista vacía                                                  | 200 OK |
| Sin préstamos activos                          | Lista vacía aplicando filtro Active                          | 200 OK |
| Préstamo inexistente                           | Mensaje: "El préstamo no existe"                             | 404 Not Found |
| Error de conexión a DB                         | Mensaje: "Error interno"                                     | 500 |

## Plan de Implementación

1. Agregar métodos de consulta con filtros a `EquipmentLoanRepository`.
2. Implementar casos de uso.
3. Agregar rutas GET en `EquipmentLoanController`.
4. En el frontend, mostrar filtros por estado y socio, y colores por estado.
