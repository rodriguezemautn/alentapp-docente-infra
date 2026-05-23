---
id: 0022
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Consulta de Deportes
---

# TDD-0022: Consulta de Deportes

## Contexto de Negocio (PRD)

### Objetivo

Permitir la consulta de los deportes disponibles en el club, incluyendo la cantidad de disciplinas asociadas a cada uno.

### User Persona

- **Nombre**: Carla (Coordinadora de actividades).
- **Necesidad**: Ver el listado de deportes del club con su capacidad máxima y cuántas disciplinas tiene cada uno para planificar la oferta.

### Criterios de Aceptación

- El sistema debe listar todos los deportes.
- El sistema debe incluir la cantidad de disciplinas asociadas a cada deporte.
- El sistema debe permitir obtener un deporte individual por ID.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

```ts
// GET /api/v1/deportes
// GET /api/v1/deportes/:id

export interface SportDetailDTO extends SportDTO {
    disciplineCount: number;
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `SportRepository` (Métodos `findAll()`, `findById(id)` con count de disciplines).
2. **Casos de Uso**: `GetSportsUseCase`, `GetSportByIdUseCase`.
3. **Adaptador de Entrada**: `SportController` (Rutas GET).

## Casos de Borde y Errores

| Escenario                                    | Resultado Esperado                                           | Código HTTP |
|----------------------------------------------|--------------------------------------------------------------|-------------|
| Deporte inexistente                          | Mensaje: "El deporte no existe"                              | 404 Not Found |
| Deporte sin disciplinas                      | Listado normal, disciplineCount = 0                          | 200 OK |
| Sin deportes registrados                     | Lista vacía                                                  | 200 OK |

## Plan de Implementación

1. Agregar métodos de consulta a `SportRepository` con count de disciplinas.
2. Implementar casos de uso.
3. Agregar rutas GET en `SportController`.
4. En el frontend, mostrar el contador de disciplinas como badge.
