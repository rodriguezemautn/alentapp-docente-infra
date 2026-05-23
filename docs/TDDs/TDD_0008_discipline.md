---
id: 0008
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: ABM de Disciplinas
---

# TDD-0008: ABM de Disciplinas

## Contexto de Negocio (PRD)

### Objetivo

Gestionar las disciplinas o divisiones dentro de cada deporte del club. Por ejemplo, dentro del deporte "Fútbol" pueden existir las disciplinas "Fútbol Infantil", "Fútbol Femenino" y "Fútbol Senior", cada una con su propio rango de fechas, horario y profesor asignado.

### User Persona

- **Nombre**: Carla (Coordinadora de actividades).
- **Necesidad**: Organizar las distintas variantes de cada deporte con sus horarios y profesores específicos. Necesita asegurarse de que las fechas de inicio y fin de cada disciplina sean consistentes (no puede terminar antes de empezar).

### Criterios de Aceptación

- El sistema debe permitir crear una disciplina asociada a un deporte existente.
- El sistema debe validar que `endDate` sea estrictamente posterior a `startDate`.
- El sistema debe permitir actualizar los datos de una disciplina (incluyendo fechas, con la misma validación).
- El sistema debe permitir eliminar una disciplina.

## Diseño Técnico (RFC)

### Modelo de Datos

Se creará la entidad `Discipline` con las siguientes propiedades y restricciones:

- `id`: Identificador único universal (UUID).
- `sportId`: Relación con el deporte (UUID, clave foránea).
- `name`: Nombre de la disciplina (ej: "Fútbol Infantil").
- `description`: Descripción de la disciplina (opcional).
- `startDate`: Fecha de inicio de la disciplina.
- `endDate`: Fecha de fin de la disciplina (debe ser posterior a startDate).
- `schedule`: Horario de la disciplina (opcional, ej: "Lunes y Miércoles 18-20hs").
- `professor`: Nombre del profesor a cargo (opcional).
- `created_at`: Fecha de creación autogenerada.

```prisma
model Discipline {
    id          String   @id @default(uuid())
    sportId     String
    sport       Sport    @relation(fields: [sportId], references: [id])
    name        String
    description String?
    startDate   DateTime @db.Date
    endDate     DateTime @db.Date
    schedule    String?
    professor   String?
    created_at  DateTime @default(now())

    @@map("disciplines")
}
```

### Contrato de API (@alentapp/shared)

Endpoint base: `/api/v1/disciplinas`

```ts
export interface DisciplineDTO {
    id: string;
    sportId: string;
    name: string;
    description?: string;
    startDate: string;     // ISO Date String (YYYY-MM-DD)
    endDate: string;       // ISO Date String (YYYY-MM-DD)
    schedule?: string;
    professor?: string;
    created_at: string;
}

export interface CreateDisciplineRequest {
    sportId: string;
    name: string;
    description?: string;
    startDate: string;     // ISO Date String (YYYY-MM-DD)
    endDate: string;       // ISO Date String (YYYY-MM-DD)
    schedule?: string;
    professor?: string;
}

export interface UpdateDisciplineRequest {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    schedule?: string;
    professor?: string;
}
```

| Método | Endpoint                        | Descripción                             |
|--------|---------------------------------|-----------------------------------------|
| GET    | `/api/v1/disciplinas`           | Listar disciplinas (filtro por ?sportId=) |
| GET    | `/api/v1/disciplinas/:id`       | Obtener una disciplina por ID           |
| POST   | `/api/v1/disciplinas`           | Crear una nueva disciplina              |
| PUT    | `/api/v1/disciplinas/:id`       | Actualizar una disciplina               |
| DELETE | `/api/v1/disciplinas/:id`       | Eliminar una disciplina                 |

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `DisciplineRepository` (Interface: `create`, `findById`, `findAll`, `update`, `delete`).
2. **Servicio de Dominio**: `DisciplineValidator` (Valida que `endDate > startDate`, que el deporte exista).
3. **Casos de Uso**:
   - `CreateDisciplineUseCase` (Crea la disciplina tras validar fechas).
   - `GetDisciplinesUseCase` (Lista con filtro por deporte).
   - `UpdateDisciplineUseCase` (Actualiza con re-validación de fechas).
   - `DeleteDisciplineUseCase` (Elimina la disciplina).
4. **Adaptador de Salida**: `PostgresDisciplineRepository` (Implementación con Prisma).
5. **Adaptador de Entrada**: `DisciplineController` (Rutas HTTP).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Fecha de fin igual a fecha de inicio           | Mensaje: "La fecha de fin debe ser posterior a la fecha de inicio" | 400 Bad Request |
| Fecha de fin anterior a fecha de inicio        | Mensaje: "La fecha de fin debe ser posterior a la fecha de inicio" | 400 Bad Request |
| Deporte inexistente                            | Mensaje: "El deporte no existe"                              | 404 Not Found |
| Disciplina inexistente                         | Mensaje: "La disciplina no existe"                           | 404 Not Found |
| Actualizar endDate a una fecha inválida        | Mensaje: "La fecha de fin debe ser posterior a la fecha de inicio" | 400 Bad Request |
| Error de conexión a DB                         | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Agregar modelo `Discipline` al schema de Prisma y crear migración.
2. Definir tipos compartidos (`DisciplineDTO`, `CreateDisciplineRequest`, `UpdateDisciplineRequest`) en `@alentapp/shared`.
3. Crear el puerto `DisciplineRepository` en `domain/`.
4. Implementar el servicio de dominio `DisciplineValidator` (validación de fechas, existencia del deporte).
5. Implementar los 4 casos de uso.
6. Implementar `PostgresDisciplineRepository` en infraestructura.
7. Crear `DisciplineController` con rutas CRUD completas en Fastify.
8. Registrar rutas y dependencias en `app.ts`.
9. Crear `disciplinesService` en el frontend.
10. Crear vista `DisciplinesView` con tabla, selector de deporte padre, y modal de creación/edición con campos de fecha.
11. Agregar ruta `/disciplinas` en el router del frontend.
