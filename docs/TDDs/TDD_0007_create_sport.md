---
id: 0007
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Registro de Deportes
---

# TDD-0007: Registro de Deportes

## Contexto de Negocio (PRD)

### Objetivo

Permitir la creación de los deportes que ofrece el club. Cada deporte tiene un nombre único, una descripción opcional y una capacidad máxima de participantes. El nombre de un deporte es inmutable una vez creado.

### User Persona

- **Nombre**: Carla (Coordinadora de actividades).
- **Necesidad**: Dar de alta los deportes que se ofrecen en el club (Fútbol, Natación, Tenis, etc.) con su capacidad máxima, asegurándose de que no haya deportes con el mismo nombre.

### Criterios de Aceptación

- El sistema debe permitir crear un deporte con nombre único.
- El sistema debe validar que `maxCapacity` sea mayor a cero.
- El sistema debe guardar el nombre tal como se ingresó (no se podrá modificar después).

## Diseño Técnico (RFC)

### Modelo de Datos

Se creará la entidad `Sport` con las siguientes propiedades y restricciones:

- `id`: Identificador único universal (UUID).
- `name`: Nombre del deporte, único e inmutable post-creación.
- `description`: Descripción del deporte (opcional).
- `maxCapacity`: Capacidad máxima de participantes, entero mayor a cero.
- `created_at`: Fecha de creación autogenerada.

```prisma
model Sport {
    id           String       @id @default(uuid())
    name         String       @unique
    description  String?
    maxCapacity  Int
    created_at   DateTime     @default(now())
    disciplines  Discipline[]

    @@map("sports")
}
```

### Contrato de API (@alentapp/shared)

- Endpoint: `POST /api/v1/deportes`

```ts
export interface SportDTO {
    id: string;
    name: string;
    description?: string;
    maxCapacity: number;
    created_at: string;
}

export interface CreateSportRequest {
    name: string;
    description?: string;
    maxCapacity: number;
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `SportRepository` (Interface: `create`, `findByName`, `findById`, `findAll`).
2. **Servicio de Dominio**: `SportValidator` (Valida capacidad > 0, nombre único).
3. **Caso de Uso**: `CreateSportUseCase` (Crea el deporte tras validaciones).
4. **Adaptador de Salida**: `PostgresSportRepository` (Implementación con Prisma).
5. **Adaptador de Entrada**: `SportController` (Ruta HTTP POST).

## Casos de Borde y Errores

| Escenario                                    | Resultado Esperado                                           | Código HTTP |
|----------------------------------------------|--------------------------------------------------------------|-------------|
| Nombre de deporte duplicado                  | Mensaje: "Ya existe un deporte con ese nombre"               | 409 Conflict |
| Capacidad máxima cero o negativa             | Mensaje: "La capacidad máxima debe ser mayor a cero"         | 400 Bad Request |
| Error de conexión a DB                       | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Agregar modelo `Sport` al schema de Prisma y crear migración.
2. Definir tipos compartidos (`SportDTO`, `CreateSportRequest`) en `@alentapp/shared`.
3. Crear el puerto `SportRepository` en `domain/`.
4. Implementar el servicio de dominio `SportValidator`.
5. Implementar `CreateSportUseCase`.
6. Implementar `PostgresSportRepository`.
7. Crear `SportController` con ruta POST en Fastify.
8. Registrar ruta y dependencias en `app.ts`.
9. Crear servicio y vista en el frontend.
