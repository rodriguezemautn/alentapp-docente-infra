---
id: 0011
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Actualización de Deportes
---

# TDD-0011: Actualización de Deportes

## Contexto de Negocio (PRD)

### Objetivo

Permitir modificar la información de un deporte existente, excepto su nombre que es inmutable una vez creado. Esto evita inconsistencias en comunicaciones y referencias del club.

### User Persona

- **Nombre**: Carla (Coordinadora de actividades).
- **Necesidad**: Actualizar la descripción de un deporte o su capacidad máxima si cambia la disponibilidad. No puede modificar el nombre porque está referenciado en todas las comunicaciones del club.

### Criterios de Aceptación

- El sistema debe permitir actualizar la `description` y `maxCapacity` de un deporte.
- El sistema debe **rechazar explícitamente** cualquier intento de modificar el `name`.
- El sistema debe validar que `maxCapacity` > 0 si se envía.
- El sistema debe validar que el deporte exista.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

- Endpoint: `PUT /api/v1/deportes/:id`

```ts
export interface UpdateSportRequest {
    description?: string;
    maxCapacity?: number;
    // NOTA: name NO está incluido — es inmutable después de la creación
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `SportRepository` (Método `update(id, data)`).
2. **Servicio de Dominio**: `SportValidator` (Rechaza cambios de nombre incluso si se enviaran, valida capacidad > 0).
3. **Caso de Uso**: `UpdateSportUseCase` (Orquesta la validación y llama al repositorio).
4. **Adaptador de Salida**: `PostgresSportRepository` (Actualización con Prisma).
5. **Adaptador de Entrada**: `SportController` (Ruta HTTP PUT).

## Casos de Borde y Errores

| Escenario                                    | Resultado Esperado                                           | Código HTTP |
|----------------------------------------------|--------------------------------------------------------------|-------------|
| Deporte inexistente                          | Mensaje: "El deporte no existe"                              | 404 Not Found |
| Capacidad máxima cero o negativa             | Mensaje: "La capacidad máxima debe ser mayor a cero"         | 400 Bad Request |
| Intentar modificar el nombre                 | Mensaje: "No se puede modificar el nombre del deporte"       | 400 Bad Request |
| Error de conexión a DB                       | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Ampliar `SportRepository` con el método `update`.
2. Implementar `UpdateSportUseCase` con validación de nombre inmutable.
3. Agregar ruta `PUT /api/v1/deportes/:id` en `SportController`.
4. Registrar en `app.ts`.
5. Consumir desde el frontend (ocultar campo name en edición).
