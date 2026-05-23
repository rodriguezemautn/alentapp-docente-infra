---
id: 0015
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Eliminación de Deportes
---

# TDD-0015: Eliminación de Deportes

## Contexto de Negocio (PRD)

### Objetivo

Permitir la eliminación de un deporte del sistema. Solo se permite eliminar deportes que no tengan disciplinas asociadas, para evitar datos huérfanos.

### User Persona

- **Nombre**: Carla (Coordinadora de actividades).
- **Necesidad**: Eliminar un deporte que ya no se ofrece en el club, pero solo si no tiene disciplinas activas asociadas.

### Criterios de Aceptación

- El sistema debe validar que el deporte exista antes de eliminarlo.
- El sistema debe validar que el deporte **no tenga disciplinas asociadas**.
- El sistema debe realizar un borrado físico (hard delete).

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

- Endpoint: `DELETE /api/v1/deportes/:id`
- Request Body: `None`
- Response: `204 No Content` en caso de éxito.

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `SportRepository` (Método `delete(id)`, método para contar disciplinas asociadas).
2. **Servicio de Dominio**: `SportValidator` (Valida que no tenga disciplinas antes de eliminar).
3. **Caso de Uso**: `DeleteSportUseCase` (Verifica existencia, valida disciplinas, elimina).
4. **Adaptador de Salida**: `PostgresSportRepository` (Eliminación con Prisma, con restricción de integridad).
5. **Adaptador de Entrada**: `SportController` (Ruta HTTP DELETE).

## Casos de Borde y Errores

| Escenario                                    | Resultado Esperado                                           | Código HTTP |
|----------------------------------------------|--------------------------------------------------------------|-------------|
| Deporte inexistente                          | Mensaje: "El deporte no existe"                              | 404 Not Found |
| Eliminar deporte con disciplinas asociadas   | Mensaje: "No se puede eliminar un deporte con disciplinas asociadas. Elimine las disciplinas primero" | 400 Bad Request |
| Eliminación exitosa                          | Respuesta vacía                                              | 204 No Content |
| Error de conexión a DB                       | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Ampliar `SportRepository` con método `delete` y `countDisciplines(sportId)`.
2. Implementar `DeleteSportUseCase`.
3. Agregar ruta `DELETE /api/v1/deportes/:id` en `SportController`.
4. Registrar en `app.ts`.
5. En el frontend, verificar visualmente si el deporte tiene disciplinas antes de mostrar botón de eliminar.
