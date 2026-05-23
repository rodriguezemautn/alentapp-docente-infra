---
id: 0008
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Registro de Disciplinas
---

# TDD-0008: Registro de Disciplinas

## Contexto de Negocio (PRD)

### Objetivo

Registrar las disciplinas o divisiones dentro de cada deporte del club. Por ejemplo, dentro del deporte "Fútbol" pueden existir las disciplinas "Fútbol Infantil", "Fútbol Femenino" y "Fútbol Senior". Cada disciplina tiene su propio rango de fechas, horario y profesor.

### User Persona

- **Nombre**: Carla (Coordinadora de actividades).
- **Necesidad**: Crear las distintas variantes de cada deporte con sus horarios y profesores específicos. Necesita asegurarse de que las fechas de inicio y fin sean consistentes.

### Criterios de Aceptación

- El sistema debe permitir crear una disciplina asociada a un deporte existente.
- El sistema debe validar que `endDate` sea estrictamente posterior a `startDate`.
- El sistema debe validar que el deporte asociado exista.

## Diseño Técnico (RFC)

### Modelo de Datos

Se creará la entidad `Discipline` con las siguientes propiedades y restricciones:

- `id`: Identificador único universal (UUID).
- `sportId`: Relación con el deporte (UUID, clave foránea).
- `name`: Nombre de la disciplina (ej: "Fútbol Infantil").
- `description`: Descripción de la disciplina (opcional).
- `startDate`: Fecha de inicio de la disciplina.
- `endDate`: Fecha de fin de la disciplina (debe ser posterior a startDate).
- `schedule`: Horario de la disciplina (opcional).
- `professor`: Nombre del profesor a cargo (opcional).
- `created_at`: Fecha de creación autogenerada.

```prisma
model Discipline {
    id          String    @id @default(uuid())
    sportId     String
    sport       Sport     @relation(fields: [sportId], references: [id])
    name        String
    description String?
    startDate   DateTime  @db.Date
    endDate     DateTime  @db.Date
    schedule    String?
    professor   String?
    created_at  DateTime  @default(now())

    @@map("disciplines")
}
```

### Contrato de API (@alentapp/shared)

- Endpoint: `POST /api/v1/disciplinas`

```ts
export interface DisciplineDTO {
    id: string;
    sportId: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    schedule?: string;
    professor?: string;
    created_at: string;
}

export interface CreateDisciplineRequest {
    sportId: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    schedule?: string;
    professor?: string;
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `DisciplineRepository` (Interface: `create`, `findById`, `findAll`).
2. **Servicio de Dominio**: `DisciplineValidator` (Valida que `endDate > startDate`, que el deporte exista).
3. **Caso de Uso**: `CreateDisciplineUseCase` (Crea la disciplina tras validaciones).
4. **Adaptador de Salida**: `PostgresDisciplineRepository` (Implementación con Prisma).
5. **Adaptador de Entrada**: `DisciplineController` (Ruta HTTP POST).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Fecha de fin igual a fecha de inicio           | Mensaje: "La fecha de fin debe ser posterior a la fecha de inicio" | 400 Bad Request |
| Fecha de fin anterior a fecha de inicio        | Mensaje: "La fecha de fin debe ser posterior a la fecha de inicio" | 400 Bad Request |
| Deporte inexistente                            | Mensaje: "El deporte no existe"                              | 404 Not Found |
| Error de conexión a DB                         | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Agregar modelo `Discipline` al schema de Prisma y crear migración.
2. Definir tipos compartidos (`DisciplineDTO`, `CreateDisciplineRequest`) en `@alentapp/shared`.
3. Crear el puerto `DisciplineRepository` en `domain/`.
4. Implementar el servicio de dominio `DisciplineValidator`.
5. Implementar `CreateDisciplineUseCase`.
6. Implementar `PostgresDisciplineRepository`.
7. Crear `DisciplineController` con ruta POST en Fastify.
8. Registrar ruta y dependencias en `app.ts`.
9. Crear servicio y vista en el frontend.
