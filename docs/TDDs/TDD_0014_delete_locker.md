---
id: 0014
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Eliminación de Casilleros
---

# TDD-0014: Eliminación de Casilleros

## Contexto de Negocio (PRD)

### Objetivo

Permitir la eliminación física de un casillero del sistema. Solo se permite eliminar casilleros que estén en estado "Available". Los casilleros ocupados o en mantenimiento no pueden eliminarse.

### User Persona

- **Nombre**: Martín (Administrativo de instalaciones).
- **Necesidad**: Dar de baja un casillero que fue dañado irreversiblemente o que ya no forma parte del club. Necesita una advertencia si el casillero está ocupado o en mantenimiento para no cometer errores.

### Criterios de Aceptación

- El sistema debe validar que el casillero exista antes de eliminarlo.
- El sistema debe permitir la eliminación **solo si** el casillero está en estado "Available".
- El sistema debe rechazar la eliminación si el casillero está "Occupied" o "Maintenance".
- El sistema debe realizar un borrado físico (hard delete).

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

- Endpoint: `DELETE /api/v1/casilleros/:id`
- Request Body: `None`
- Response: `204 No Content` en caso de éxito.

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `LockerRepository` (Método `delete(id)`, método `findById` para verificar estado).
2. **Servicio de Dominio**: `LockerValidator` (Valida que el estado sea Available antes de eliminar).
3. **Caso de Uso**: `DeleteLockerUseCase` (Verifica existencia, valida estado, elimina).
4. **Adaptador de Salida**: `PostgresLockerRepository` (Eliminación con Prisma).
5. **Adaptador de Entrada**: `LockerController` (Ruta HTTP DELETE).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Casillero inexistente                          | Mensaje: "El casillero no existe"                            | 404 Not Found |
| Eliminar casillero ocupado                     | Mensaje: "No se puede eliminar un casillero ocupado. Libérelo primero" | 400 Bad Request |
| Eliminar casillero en mantenimiento            | Mensaje: "No se puede eliminar un casillero en mantenimiento" | 400 Bad Request |
| Eliminación exitosa                            | Respuesta vacía                                              | 204 No Content |
| Error de conexión a DB                         | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Ampliar `LockerRepository` y `PostgresLockerRepository` con el método `delete`.
2. Implementar `DeleteLockerUseCase` con verificación de estado.
3. Agregar ruta `DELETE /api/v1/casilleros/:id` en `LockerController`.
4. Registrar en `app.ts`.
5. En el frontend, agregar botón de eliminación con confirmación y validación visual de estado.
