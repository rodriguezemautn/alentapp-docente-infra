---
id: 0006
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Registro de Casilleros
---

# TDD-0006: Registro de Casilleros

## Contexto de Negocio (PRD)

### Objetivo

Permitir la creación de casilleros en el sistema, cada uno identificado por un número único. Un casillero nuevo nace en estado "Available" y queda disponible para futura asignación a un socio.

### User Persona

- **Nombre**: Martín (Administrativo de instalaciones).
- **Necesidad**: Dar de alta nuevos casilleros en el sistema a medida que se adquieren o instalan, asegurándose de que no existan números duplicados.

### Criterios de Aceptación

- El sistema debe permitir crear un casillero con número único.
- El sistema debe validar que el número de casillero sea un entero positivo.
- El sistema debe asignar el estado "Available" por defecto.
- El sistema debe validar que el número de casillero no exista previamente.

## Diseño Técnico (RFC)

### Modelo de Datos

Se creará la entidad `Locker` con las siguientes propiedades y restricciones:

- `id`: Identificador único universal (UUID).
- `number`: Número de casillero, entero único.
- `location`: Ubicación dentro del club (opcional).
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

- Endpoint: `POST /api/v1/casilleros`

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
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `LockerRepository` (Interface: `create`, `findByNumber`, `findById`, `findAll`).
2. **Servicio de Dominio**: `LockerValidator` (Valida número único, número positivo).
3. **Caso de Uso**: `CreateLockerUseCase` (Crea casillero tras validaciones).
4. **Adaptador de Salida**: `PostgresLockerRepository` (Implementación con Prisma).
5. **Adaptador de Entrada**: `LockerController` (Ruta HTTP POST).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Número de casillero duplicado                  | Mensaje: "Ya existe un casillero con ese número"             | 409 Conflict |
| Número de casillero inválido (negativo o cero) | Mensaje: "El número de casillero debe ser positivo"          | 400 Bad Request |
| Error de conexión a DB                         | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Agregar modelo `Locker` y enum `LockerStatus` al schema de Prisma y crear migración.
2. Definir tipos compartidos (`LockerDTO`, `CreateLockerRequest`) en `@alentapp/shared`.
3. Crear el puerto `LockerRepository` en `domain/`.
4. Implementar el servicio de dominio `LockerValidator`.
5. Implementar `CreateLockerUseCase`.
6. Implementar `PostgresLockerRepository` en infraestructura.
7. Crear `LockerController` con ruta POST en Fastify.
8. Registrar ruta y dependencias en `app.ts`.
9. Crear servicio y vista en el frontend.
