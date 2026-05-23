---
id: 0023
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Consulta de Disciplinas
---

# TDD-0023: Consulta de Disciplinas

## Contexto de Negocio (PRD)

### Objetivo

Permitir la consulta de disciplinas filtradas por deporte. La coordinadora necesita ver qué disciplinas están disponibles dentro de cada deporte, con sus horarios y profesores.

### User Persona

- **Nombre**: Carla (Coordinadora de actividades).
- **Necesidad**: Ver las disciplinas de un deporte específico con sus horarios y profesores para informar a los socios.

### Criterios de Aceptación

- El sistema debe listar todas las disciplinas, filtrables por `sportId`.
- El sistema debe incluir el nombre del deporte padre en los resultados.
- El sistema debe permitir obtener una disciplina individual por ID.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

```ts
// GET /api/v1/disciplinas?sportId=xxx
// GET /api/v1/disciplinas/:id

export interface DisciplineDetailDTO extends DisciplineDTO {
    sportName?: string;  // nombre del deporte padre
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `DisciplineRepository` (Métodos `findAll(filters)`, `findById(id)` con include de Sport).
2. **Casos de Uso**: `GetDisciplinesUseCase`, `GetDisciplineByIdUseCase`.
3. **Adaptador de Entrada**: `DisciplineController` (Rutas GET).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Deporte sin disciplinas                        | Lista vacía                                                  | 200 OK |
| Disciplina inexistente                         | Mensaje: "La disciplina no existe"                           | 404 Not Found |
| Filtro sportId inválido (UUID mal formado)     | Mensaje: "ID de deporte inválido"                            | 400 Bad Request |

## Plan de Implementación

1. Agregar métodos de consulta a `DisciplineRepository` con filtros.
2. Implementar casos de uso.
3. Agregar rutas GET en `DisciplineController`.
4. En el frontend, mostrar las disciplinas agrupadas por deporte.
