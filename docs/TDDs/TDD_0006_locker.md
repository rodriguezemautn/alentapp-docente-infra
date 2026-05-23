---
id: 0006
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: ABM de Casilleros
---

# TDD-0006: ABM de Casilleros

## Contexto de Negocio (PRD)

### Objetivo

Gestionar la asignación de casilleros del club a los socios. Cada casillero tiene un número único que lo identifica, y solo puede asignarse a un socio si se encuentra en estado "Available". Los casilleros en estado "Maintenance" no pueden ser asignados.

### User Persona

- **Nombre**: Martín (Administrativo de instalaciones).
- **Necesidad**: Asignar casilleros a los socios que lo solicitan, llevar el control de qué casillero está ocupado, disponible o en mantenimiento, y liberar casilleros cuando un socio se va.

### Criterios de Aceptación

- El sistema debe permitir crear casilleros con número único.
- El sistema debe permitir asignar un casillero a un socio solo si el estado es "Available".
- El sistema **no debe permitir** asignar un casillero en estado "Maintenance".
- El sistema debe validar que el número de casillero sea único.
- El sistema debe permitir cambiar el estado de un casillero (Available, Occupied, Maintenance).
- El sistema debe permitir liberar un casillero (cambiar a Available y desasociar del socio).

## Diseño Técnico (RFC)

### Modelo de Datos

Se creará la entidad `Locker` con las siguientes propiedades y restricciones:

- `id`: Identificador único universal (UUID).
- `number`: Número de casillero, entero único.
- `location`: Ubicación dentro del club (opcional, ej: "Planta Baja", "Sector Norte").
- `status`: Estado del casillero (Available, Occupied, Maintenance). Por defecto `Available`.
- `memberId`: Relación opcional con un socio (UUID, clave foránea, nullable).
- `created_at`: Fecha de creación autogenerada.

```prisma
enum LockerStatus {
    Available
    Occupied
    Maintenance
}

model Locker {
    id         String       @id @default(uuid())
    number     Int          @unique
    location   String?
    status     LockerStatus @default(Available)
    memberId   String?
    member     Member?      @relation(fields: [memberId], references: [id])
    created_at DateTime     @default(now())

    @@map("lockers")
}
```

### Contrato de API (@alentapp/shared)

Endpoint base: `/api/v1/casilleros`

```ts
export type LockerStatus = 'Available' | 'Occupied' | 'Maintenance';

export interface LockerDTO {
    id: string;
    number: number;
    location?: string;
    status: LockerStatus;
    memberId?: string;
    created_at: string;
}

export interface CreateLockerRequest {
    number: number;
    location?: string;
}

export interface UpdateLockerRequest {
    location?: string;
    status?: LockerStatus;
    memberId?: string | null;  // null para liberar
}
```

| Método | Endpoint                          | Descripción                               |
|--------|-----------------------------------|-------------------------------------------|
| GET    | `/api/v1/casilleros`              | Listar casilleros (filtro por ?status=)   |
| GET    | `/api/v1/casilleros/:id`          | Obtener un casillero por ID               |
| POST   | `/api/v1/casilleros`              | Crear un nuevo casillero                  |
| PUT    | `/api/v1/casilleros/:id`          | Actualizar casillero (asignar, liberar, cambiar estado) |
| DELETE | `/api/v1/casilleros/:id`          | Eliminar casillero (solo si está Available) |

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `LockerRepository` (Interface: `create`, `findById`, `findByNumber`, `findAll`, `update`, `delete`).
2. **Servicio de Dominio**: `LockerValidator` (Valida número único, estado para asignación — no asignar si Maintenance).
3. **Casos de Uso**:
   - `CreateLockerUseCase` (Crea casillero con número único).
   - `GetLockersUseCase` (Lista con filtros).
   - `UpdateLockerUseCase` (Actualiza estado, ubicación o asignación; valida reglas de asignación).
   - `DeleteLockerUseCase` (Elimina solo si Available).
4. **Adaptador de Salida**: `PostgresLockerRepository` (Implementación con Prisma).
5. **Adaptador de Entrada**: `LockerController` (Rutas HTTP).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Número de casillero duplicado                  | Mensaje: "Ya existe un casillero con ese número"             | 409 Conflict |
| Asignar casillero en estado Maintenance        | Mensaje: "No se puede asignar un casillero en mantenimiento" | 400 Bad Request |
| Asignar casillero ya ocupado                   | Mensaje: "El casillero ya está ocupado"                      | 400 Bad Request |
| Socio inexistente al asignar                   | Mensaje: "El socio no existe"                                | 404 Not Found |
| Eliminar casillero ocupado                     | Mensaje: "No se puede eliminar un casillero ocupado. Libérelo primero" | 400 Bad Request |
| Eliminar casillero en mantenimiento            | Mensaje: "No se puede eliminar un casillero en mantenimiento" | 400 Bad Request |
| Número de casillero inválido (negativo o cero) | Mensaje: "El número de casillero debe ser positivo"          | 400 Bad Request |
| Error de conexión a DB                         | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Agregar modelo `Locker` y enum `LockerStatus` al schema de Prisma y crear migración.
2. Definir tipos compartidos (`LockerDTO`, `CreateLockerRequest`, `UpdateLockerRequest`) en `@alentapp/shared`.
3. Crear el puerto `LockerRepository` en `domain/`.
4. Implementar el servicio de dominio `LockerValidator` (número único, restricción de estado para asignación).
5. Implementar los 4 casos de uso.
6. Implementar `PostgresLockerRepository` en infraestructura.
7. Crear `LockerController` con rutas CRUD completas en Fastify.
8. Registrar rutas y dependencias en `app.ts`.
9. Crear `lockersService` en el frontend.
10. Crear vista `LockersView` con tabla, indicador de estado (colores), modal de creación/edición y confirmación de eliminación.
11. Agregar ruta `/casilleros` en el router del frontend.
