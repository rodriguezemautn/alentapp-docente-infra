---
id: 0007
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: ABM de Deportes
---

# TDD-0007: ABM de Deportes

## Contexto de Negocio (PRD)

### Objetivo

Administrar los deportes que ofrece el club. Cada deporte tiene un nombre único que no puede modificarse una vez creado, una descripción opcional y una capacidad máxima de participantes. Esta información es la base para luego definir las disciplinas y horarios de cada deporte.

### User Persona

- **Nombre**: Carla (Coordinadora de actividades).
- **Necesidad**: Dar de alta los deportes que se ofrecen en el club (Fútbol, Natación, Tenis, etc.), actualizar su descripción o cupo máximo, pero sin poder cambiar el nombre de un deporte ya creado porque está referenciado en todas las comunicaciones del club.

### Criterios de Aceptación

- El sistema debe permitir crear un deporte con nombre único.
- El sistema debe validar que `maxCapacity` sea mayor a cero.
- El sistema **no debe permitir** modificar el `name` de un deporte después de creado (inmutabilidad del nombre).
- El sistema debe permitir actualizar la descripción y la capacidad máxima.
- El sistema debe permitir eliminar un deporte (con precaución si tiene disciplinas asociadas).

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

Endpoint base: `/api/v1/deportes`

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

export interface UpdateSportRequest {
    description?: string;
    maxCapacity?: number;
    // NOTA: name NO está incluido — es inmutable después de la creación
}
```

| Método | Endpoint                     | Descripción                        |
|--------|------------------------------|------------------------------------|
| GET    | `/api/v1/deportes`           | Listar deportes                    |
| GET    | `/api/v1/deportes/:id`       | Obtener un deporte por ID          |
| POST   | `/api/v1/deportes`           | Crear un nuevo deporte             |
| PUT    | `/api/v1/deportes/:id`       | Actualizar deporte (sin name)      |
| DELETE | `/api/v1/deportes/:id`       | Eliminar deporte                   |

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `SportRepository` (Interface en el Dominio: `create`, `findById`, `findByName`, `findAll`, `update`, `delete`).
2. **Servicio de Dominio**: `SportValidator` (Valida capacidad positiva, nombre único, nombre inmutable en updates).
3. **Casos de Uso**:
   - `CreateSportUseCase` (Crea el deporte).
   - `GetSportsUseCase` (Lista todos).
   - `UpdateSportUseCase` (Actualiza solo descripción y capacidad; rechaza cambios de nombre).
   - `DeleteSportUseCase` (Elimina el deporte; verificar disciplinas asociadas).
4. **Adaptador de Salida**: `PostgresSportRepository` (Implementación con Prisma).
5. **Adaptador de Entrada**: `SportController` (Rutas HTTP).

## Casos de Borde y Errores

| Escenario                                    | Resultado Esperado                                           | Código HTTP |
|----------------------------------------------|--------------------------------------------------------------|-------------|
| Nombre de deporte duplicado                  | Mensaje: "Ya existe un deporte con ese nombre"               | 409 Conflict |
| Capacidad máxima cero o negativa             | Mensaje: "La capacidad máxima debe ser mayor a cero"         | 400 Bad Request |
| Intentar modificar el nombre en un update    | Mensaje: "No se puede modificar el nombre del deporte"       | 400 Bad Request |
| Deporte inexistente                          | Mensaje: "El deporte no existe"                              | 404 Not Found |
| Eliminar deporte con disciplinas asociadas   | Mensaje: "No se puede eliminar un deporte con disciplinas asociadas. Elimine las disciplinas primero" | 400 Bad Request |
| Error de conexión a DB                       | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Agregar modelo `Sport` al schema de Prisma y crear migración.
2. Definir tipos compartidos (`SportDTO`, `CreateSportRequest`, `UpdateSportRequest`) en `@alentapp/shared`.
3. Crear el puerto `SportRepository` en `domain/`.
4. Implementar el servicio de dominio `SportValidator` (capacidad > 0, nombre inmutable en updates).
5. Implementar los 4 casos de uso.
6. Implementar `PostgresSportRepository` en infraestructura.
7. Crear `SportController` con rutas CRUD completas en Fastify.
8. Registrar rutas y dependencias en `app.ts`.
9. Crear `sportsService` en el frontend.
10. Crear vista `SportsView` con tabla, modal de creación/edición (ocultando campo name en edición).
11. Agregar ruta `/deportes` en el router del frontend.
