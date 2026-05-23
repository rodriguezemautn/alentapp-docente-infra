---
id: 0021
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Consulta de Casilleros
---

# TDD-0021: Consulta de Casilleros

## Contexto de Negocio (PRD)

### Objetivo

Permitir la consulta del estado de los casilleros del club. El administrativo necesita ver qué casilleros están disponibles, ocupados o en mantenimiento para tomar decisiones de asignación.

### User Persona

- **Nombre**: Martín (Administrativo de instalaciones).
- **Necesidad**: Ver rápidamente qué casilleros están libres para asignar a nuevos socios, cuáles están ocupados y quién los tiene, y cuáles están en mantenimiento.

### Criterios de Aceptación

- El sistema debe listar todos los casilleros.
- El sistema debe permitir filtrar por `status` (Available, Occupied, Maintenance).
- El sistema debe mostrar el nombre del socio asignado cuando el casillero esté ocupado.
- El sistema debe permitir obtener un casillero individual por ID.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

```ts
// GET /api/v1/casilleros?status=Available
// GET /api/v1/casilleros/:id

// Extensión de LockerDTO para incluir datos del socio
export interface LockerDetailDTO extends LockerDTO {
    memberName?: string;  // nombre del socio si está ocupado
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `LockerRepository` (Métodos `findAll(filters)`, `findById(id)` con include de Member).
2. **Casos de Uso**: `GetLockersUseCase`, `GetLockerByIdUseCase`.
3. **Adaptador de Entrada**: `LockerController` (Rutas GET).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Filtro por status sin resultados               | Lista vacía                                                  | 200 OK |
| Casillero inexistente                          | Mensaje: "El casillero no existe"                            | 404 Not Found |
| Error de conexión a DB                         | Mensaje: "Error interno"                                     | 500 |

## Plan de Implementación

1. Agregar métodos de consulta con filtros a `LockerRepository`.
2. Implementar `GetLockersUseCase` incluyendo nombre del socio asociado.
3. Agregar rutas GET en `LockerController`.
4. En el frontend, mostrar colores por estado (verde=Available, azul=Occupied, rojo=Maintenance).
