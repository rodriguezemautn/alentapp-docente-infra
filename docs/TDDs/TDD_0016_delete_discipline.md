---
id: 0016
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Eliminación de Disciplinas
---

# TDD-0016: Eliminación de Disciplinas

## Contexto de Negocio (PRD)

### Objetivo

Permitir la eliminación de una disciplina del sistema. Se trata de un borrado físico directo, sin restricciones adicionales más allá de verificar que la disciplina exista.

### User Persona

- **Nombre**: Carla (Coordinadora de actividades).
- **Necesidad**: Eliminar una disciplina que ya no se dicta, de forma rápida desde la tabla principal.

### Criterios de Aceptación

- El sistema debe validar que la disciplina exista antes de eliminarla.
- El sistema debe realizar un borrado físico (hard delete).

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

- Endpoint: `DELETE /api/v1/disciplinas/:id`
- Request Body: `None`
- Response: `204 No Content` en caso de éxito.

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `DisciplineRepository` (Método `delete(id)`).
2. **Servicio de Dominio**: `DisciplineValidator` (Valida existencia).
3. **Caso de Uso**: `DeleteDisciplineUseCase` (Verifica existencia, elimina).
4. **Adaptador de Salida**: `PostgresDisciplineRepository` (Eliminación con Prisma).
5. **Adaptador de Entrada**: `DisciplineController` (Ruta HTTP DELETE).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Disciplina inexistente                         | Mensaje: "La disciplina no existe"                           | 404 Not Found |
| Eliminación exitosa                            | Respuesta vacía                                              | 204 No Content |
| Error de conexión a DB                         | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Ampliar `DisciplineRepository` y `PostgresDisciplineRepository` con el método `delete`.
2. Implementar `DeleteDisciplineUseCase`.
3. Agregar ruta `DELETE /api/v1/disciplinas/:id` en `DisciplineController`.
4. Registrar en `app.ts`.
5. En el frontend, agregar botón de eliminación con confirmación.
