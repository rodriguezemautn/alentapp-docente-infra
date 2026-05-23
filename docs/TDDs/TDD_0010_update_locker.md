---
id: 0010
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Actualización de Casilleros
---

# TDD-0010: Actualización de Casilleros

## Contexto de Negocio (PRD)

### Objetivo

Permitir la asignación, liberación y cambio de estado de los casilleros del club. Un casillero solo puede asignarse a un socio si está "Available". También se debe poder cambiar su estado a "Maintenance" cuando sea necesario.

### User Persona

- **Nombre**: Martín (Administrativo de instalaciones).
- **Necesidad**: Asignar un casillero disponible a un socio, liberarlo cuando el socio se va, o ponerlo en mantenimiento si está dañado. No puede asignar un casillero que esté en mantenimiento.

### Criterios de Aceptación

- El sistema debe permitir actualizar un casillero existente.
- El sistema debe validar que un casillero en estado "Maintenance" **no pueda asignarse** a un socio.
- El sistema debe validar que el socio exista al asignar un casillero.
- El sistema debe validar que el número no esté duplicado si se cambia (opcional).
- El sistema debe permitir liberar un casillero (desasociar socio y poner Available).

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

- Endpoint: `PUT /api/v1/casilleros/:id`

```ts
export interface UpdateLockerRequest {
    number?: number;
    location?: string;
    status?: LockerStatus;
    memberId?: string | null;  // null para liberar
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `LockerRepository` (Método `update(id, data)`).
2. **Servicio de Dominio**: `LockerValidator` (Valida reglas de asignación: no asignar si Maintenance, no asignar socio inexistente, no duplicar número).
3. **Caso de Uso**: `UpdateLockerUseCase` (Orquesta la validación y llama al repositorio).
4. **Adaptador de Salida**: `PostgresLockerRepository` (Actualización con Prisma).
5. **Adaptador de Entrada**: `LockerController` (Ruta HTTP PUT).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Casillero inexistente                          | Mensaje: "El casillero no existe"                            | 404 Not Found |
| Asignar casillero en estado Maintenance        | Mensaje: "No se puede asignar un casillero en mantenimiento" | 400 Bad Request |
| Asignar casillero ya ocupado                   | Mensaje: "El casillero ya está ocupado"                      | 400 Bad Request |
| Socio inexistente al asignar                   | Mensaje: "El socio no existe"                                | 404 Not Found |
| Cambiar número a uno ya existente              | Mensaje: "Ya existe un casillero con ese número"             | 409 Conflict |
| Error de conexión a DB                         | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Ampliar `LockerRepository` con el método `update`.
2. Implementar `UpdateLockerUseCase` con validación de reglas de asignación.
3. Agregar ruta `PUT /api/v1/casilleros/:id` en `LockerController`.
4. Registrar en `app.ts`.
5. Consumir el endpoint desde el frontend.
