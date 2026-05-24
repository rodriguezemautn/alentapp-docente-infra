# Diseño: Entidad Sport

## Enfoque Técnico

Implementar la entidad Sport siguiendo el patrón exacto de arquitectura hexagonal establecido por Member, en todas las capas: Schema de Prisma → DTOs Compartidos → Dominio (puerto + validador) → Aplicación (4 casos de uso) → Delivery (controlador Fastify) → Infraestructura (repositorio Postgres) → Frontend (servicio React + vista de formulario).

Sport es la primera entidad en implementarse en la Actividad 2. No tiene dependencias externas, pero el modelo de Prisma incluye la relación hacia adelante con Discipline (que referenciará `sportId`).

---

## Vista General de la Arquitectura

```
Prisma schema [sports table + relation to disciplines]
    ↓
Shared DTOs [SportDTO, SportDetailDTO, CreateSportRequest, UpdateSportRequest]
    ↓
Domain:
  SportRepository (port interface)
  SportValidator (domain service: name format, maxCapacity, uniqueness)
    ↓
Application:
  CreateSportUseCase | GetSportsUseCase | UpdateSportUseCase | DeleteSportUseCase
    ↓
Delivery:
  SportController (Fastify routes: POST/GET/PUT/DELETE /api/v1/deportes)
    ↓
Infrastructure:
  PostgresSportRepository (Prisma implementation, includes _count for disciplines)
    ↓
Frontend:
  services/sports.ts → views/Sports.tsx → routes.ts (/sports)
```

---

## Decisiones de Arquitectura

### Decisión: Ruta del frontend como `/sports`

**Elección**: `/sports` (inglés), coincidiendo con el nombre del archivo de servicio y los DTOs.
**Fundamento**: La especificación sugiere `/deportes` o `/sports`. El patrón existente de Member usa `/members` (inglés). Mantenerlo en inglés es consistente con la base de código existente — las rutas, archivos de servicio y DTOs están todos en inglés. Las etiquetas de la UI (títulos, botones, mensajes de error) seguirán en español para el usuario final.
**Alternativas consideradas**: `/deportes` — español más natural, pero inconsistente con el patrón de ruta `/members`.

### Decisión: SportDetailDTO extiende SportDTO con `disciplineCount`

**Elección**: Un `SportDetailDTO` separado que extiende `SportDTO`.
**Fundamento**: La especificación requiere `disciplineCount` solo en la respuesta de GET-all. Usar un DTO separado mantiene el `SportDTO` base limpio para respuestas de un solo recurso (create/update retornan `SportDTO` sin el conteo). Esto sigue el contrato de la especificación exactamente.
**Alternativas consideradas**: Agregar `disciplineCount` a `SportDTO` con un valor por defecto de 0 — más simple pero filtra un detalle que solo tiene sentido en el contexto de listado.

### Decisión: Eliminación valida disciplinas via `countDisciplines()` en el repositorio

**Elección**: La interfaz `SportRepository` expone `findById(id)`, `delete(id)`, y un método dedicado `countDisciplines(id): Promise<number>`.
**Fundamento**: La especificación requiere rechazar la eliminación si existen disciplinas. Usar un método `countDisciplines` dedicado es más limpio que requerir que cada `findById` incluya un conteo de disciplinas (lo cual sería derrochador para los flujos de create/update). El `DeleteSportUseCase` llama a `findById` para verificar existencia, luego `countDisciplines` para la verificación de la regla de negocio, y luego `delete` solo si ambas pasan.
**Alternativas consideradas**: Usar el conteo de relaciones de Prisma en `findById` directamente — más simple pero acopla la forma de la consulta al caso de uso de eliminación.

### Decisión: Inmutabilidad del nombre aplicada a nivel de caso de uso, no en la DB

**Elección**: `UpdateSportRequest` excluye `name` de su definición de tipo. Si una solicitud de alguna manera incluye `name`, el caso de uso lo detecta y lanza un error.
**Fundamento**: La exclusión a nivel de tipo en el DTO compartido evita que el frontend lo envíe. La verificación en tiempo de ejecución en el caso de uso atrapa cualquier consumidor futuro de la API que ignore el tipo. Dos capas de defensa sin necesidad de un trigger en la DB o columna calculada.
**Alternativas consideradas**: Trigger en la DB para prevenir UPDATE en la columna `name` — más robusto pero sobreingeniería para este caso; la API es el único camino de escritura.

---

## Flujo de Datos

```
Create:
  Client ──POST /api/v1/deportes──→ Controller ──→ CreateSportUseCase
    └→ SportValidator.validateName(name) ─→ validateMaxCapacity(maxCapacity)
      └→ SportValidator.validateNameIsUnique(name) [calls repo.findByName]
        └→ repo.create(data) ──→ PostgresSportRepository ──→ Prisma ──→ PostgreSQL
          └→ 201 { data: SportDTO }

Get All:
  Client ──GET /api/v1/deportes──→ Controller ──→ GetSportsUseCase
    └→ repo.findAll() ──→ PostgresSportRepository ──→ Prisma (include: _count: disciplines)
      └→ 200 { data: SportDetailDTO[] }

Update:
  Client ──PUT /api/v1/deportes/:id──→ Controller ──→ UpdateSportUseCase
    └→ repo.findById(id) ──→ validate name not in request body
      └→ SportValidator.validateMaxCapacity(data.maxCapacity) if provided
        └→ repo.update(id, data) ──→ 200 { data: SportDTO }

Delete:
  Client ──DELETE /api/v1/deportes/:id──→ Controller ──→ DeleteSportUseCase
    └→ repo.findById(id) ──→ repo.countDisciplines(id) → must be 0
      └→ repo.delete(id) ──→ 204 No Content
```

---

## Cambios en el Schema de Prisma

Agregar a `packages/api/prisma/schema.prisma`:

```prisma
model Sport {
    id           String       @id @default(uuid())
    name         String       @unique
    description  String?
    maxCapacity  Int
    created_at   DateTime     @default(now())
    disciplines  Discipline[] // Forward relation — Discipline will have sportId FK

    @@map("sports")
}
```

**Nota**: El modelo `Discipline` aún no existe, pero agregar la relación ahora significa que la migración de Sport no necesitará ser recreada cuando se implemente Discipline. Esto es intencionalmente diferente del patrón de Member (que no tiene relaciones hacia adelante) porque Sport es una entidad padre.

**Migración**: Ejecutar `npx prisma migrate dev --name create_sport` después de agregar el modelo.

---

## DTOs Compartidos

Agregar a `packages/shared/index.ts`:

```typescript
// ==========================================
// Sport
// ==========================================
export interface SportDTO {
  id: string;           // UUID
  name: string;
  description?: string; // nullable
  maxCapacity: number;
  created_at: string;   // ISO date string
}

export interface SportDetailDTO extends SportDTO {
  disciplineCount: number;
}

export interface CreateSportRequest {
  name: string;
  description?: string;
  maxCapacity: number;
}

export interface UpdateSportRequest {
  description?: string;
  maxCapacity?: number;
  // NOTE: name is intentionally excluded — it is immutable after creation
}
```

---

## Capa de Dominio

### `packages/api/src/domain/SportRepository.ts`

```typescript
import { SportDTO, SportDetailDTO, CreateSportRequest, UpdateSportRequest } from '@alentapp/shared';

export interface SportRepository {
  create(data: CreateSportRequest): Promise<SportDTO>;
  findById(id: string): Promise<SportDTO | null>;
  findByName(name: string): Promise<SportDTO | null>;
  findAll(): Promise<SportDetailDTO[]>;
  update(id: string, data: UpdateSportRequest): Promise<SportDTO>;
  delete(id: string): Promise<void>;
  countDisciplines(sportId: string): Promise<number>;
}
```

**Diferencias clave respecto a MemberRepository**:
- `findByName` en lugar de `findByDni` (la unicidad está en `name`, no en `dni`)
- `findAll` retorna `SportDetailDTO[]` (incluye `disciplineCount`) — diferente de `MemberDTO[]` de Member
- Se agregó `countDisciplines` para la protección de eliminación

### `packages/api/src/domain/services/SportValidator.ts`

```typescript
import { SportRepository } from '../SportRepository.js';

export class SportValidator {
  constructor(private readonly sportRepo: SportRepository) {}

  validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('El nombre es requerido');
    }
    if (name.length > 100) {
      throw new Error('El nombre no puede superar los 100 caracteres');
    }
  }

  validateDescription(description?: string): void {
    if (description && description.length > 500) {
      throw new Error('La descripción no puede superar los 500 caracteres');
    }
  }

  validateMaxCapacity(maxCapacity: number): void {
    if (maxCapacity === undefined || maxCapacity === null) {
      throw new Error('La capacidad máxima es requerida');
    }
    if (!Number.isInteger(maxCapacity) || maxCapacity <= 0) {
      throw new Error('La capacidad máxima debe ser un número entero positivo');
    }
  }

  async validateNameIsUnique(name: string, excludeSportId?: string): Promise<void> {
    const existing = await this.sportRepo.findByName(name);
    if (existing && existing.id !== excludeSportId) {
      throw new Error('Ya existe un deporte con ese nombre');
    }
  }

  /**
   * Validates that a name update is NOT attempted.
   * The name field is immutable — this catches any request body that includes it.
   */
  validateNameNotInPayload(data: Record<string, unknown>): void {
    if ('name' in data && data.name !== undefined) {
      throw new Error('No se puede modificar el nombre del deporte');
    }
  }
}
```

### Tabla de Validación del Backend

| Campo | Regla | Mensaje de Error | Capa |
|-------|------|---------------|-------|
| name | Requerido, máx. 100 caracteres, único | "El nombre es requerido" / "El nombre no puede superar los 100 caracteres" / "Ya existe un deporte con ese nombre" | Validator (formato) + Repository (unicidad via `findByName`) |
| description | Opcional, máx. 500 caracteres | "La descripción no puede superar los 500 caracteres" | Validator |
| maxCapacity | Requerido, entero, > 0 | "La capacidad máxima es requerida" / "La capacidad máxima debe ser un número entero positivo" | Validator |

### `packages/api/src/domain/services/SportValidator.test.ts` — Plan de Pruebas

| # | Prueba | Entrada | Esperado |
|---|------|-------|----------|
| 1 | `validateName` pasa con nombre válido | `"Fútbol"` | Sin error |
| 2 | `validateName` rechaza nombre vacío | `""` | Lanza "El nombre es requerido" |
| 3 | `validateName` rechaza nombre > 100 caracteres | Cadena de 101 caracteres | Lanza "El nombre no puede superar los 100 caracteres" |
| 4 | `validateDescription` pasa con descripción válida | `"Deporte"` | Sin error |
| 5 | `validateDescription` pasa con null/undefined | `undefined` | Sin error |
| 6 | `validateDescription` rechaza > 500 caracteres | Cadena de 501 caracteres | Lanza "La descripción no puede superar los 500 caracteres" |
| 7 | `validateMaxCapacity` pasa con entero válido | `22` | Sin error |
| 8 | `validateMaxCapacity` rechaza 0 | `0` | Lanza "La capacidad máxima debe ser un número entero positivo" |
| 9 | `validateMaxCapacity` rechaza negativo | `-1` | Lanza "La capacidad máxima debe ser un número entero positivo" |
| 10 | `validateMaxCapacity` rechaza flotante | `1.5` | Lanza "La capacidad máxima debe ser un número entero positivo" |
| 11 | `validateMaxCapacity` rechaza null/undefined | `undefined` | Lanza "La capacidad máxima es requerida" |
| 12 | `validateNameIsUnique` pasa si el nombre es único | repo retorna null | Sin error |
| 13 | `validateNameIsUnique` pasa si es el mismo deporte (edición) | repo retorna mismo id | Sin error |
| 14 | `validateNameIsUnique` rechaza si el nombre está ocupado | repo retorna id diferente | Lanza "Ya existe un deporte con ese nombre" |
| 15 | `validateNameNotInPayload` pasa si no hay nombre | `{ description: "test" }` | Sin error |
| 16 | `validateNameNotInPayload` rechaza si se incluye nombre | `{ name: "Nuevo" }` | Lanza "No se puede modificar el nombre del deporte" |

**Patrón de mock**: Igual que MemberValidator.test — mockear `SportRepository` con `findByName` como `vi.fn()`.

---

## Capa de Aplicación

### CreateSportUseCase — `packages/api/src/application/CreateSportUseCase.ts`

```typescript
export class CreateSportUseCase {
  constructor(
    private readonly sportRepo: SportRepository,
    private readonly sportValidator: SportValidator
  ) {}

  async execute(data: CreateSportRequest): Promise<SportDTO> {
    this.sportValidator.validateName(data.name);
    this.sportValidator.validateDescription(data.description);
    this.sportValidator.validateMaxCapacity(data.maxCapacity);
    await this.sportValidator.validateNameIsUnique(data.name);

    return this.sportRepo.create({
      ...data,
      description: data.description || null,
    });
  }
}
```

**Plan de Pruebas**:
| # | Escenario | Comportamiento del Mock | Esperado |
|---|----------|--------------|----------|
| 1 | Creación válida | Todas las validaciones pasan, repo retorna SportDTO | Retorna SportDTO con id |
| 2 | Nombre duplicado | `validateNameIsUnique` lanza error | Re-lanza el error |
| 3 | maxCapacity inválido | `validateMaxCapacity` lanza error | Re-lanza el error |

### GetSportsUseCase — `packages/api/src/application/GetSportsUseCase.ts`

```typescript
export class GetSportsUseCase {
  constructor(private readonly sportRepo: SportRepository) {}

  async execute(): Promise<SportDetailDTO[]> {
    return this.sportRepo.findAll();
  }
}
```

**Plan de Pruebas**: Trivial — 1 prueba: llama a `findAll` y retorna el resultado.

### UpdateSportUseCase — `packages/api/src/application/UpdateSportUseCase.ts`

```typescript
export class UpdateSportUseCase {
  constructor(
    private readonly sportRepo: SportRepository,
    private readonly sportValidator: SportValidator
  ) {}

  async execute(id: string, data: UpdateSportRequest): Promise<SportDTO> {
    const existing = await this.sportRepo.findById(id);
    if (!existing) {
      throw new Error('El deporte no existe');
    }

    // Runtime check: name is immutable — reject if included
    this.sportValidator.validateNameNotInPayload(data as Record<string, unknown>);

    if (data.maxCapacity !== undefined) {
      this.sportValidator.validateMaxCapacity(data.maxCapacity);
    }

    if (data.description !== undefined) {
      this.sportValidator.validateDescription(data.description);
    }

    return this.sportRepo.update(id, data);
  }
}
```

**Plan de Pruebas**:
| # | Escenario | Comportamiento del Mock | Esperado |
|---|----------|--------------|----------|
| 1 | Actualización válida | `findById` retorna deporte | Llama a `update`, retorna SportDTO |
| 2 | Deporte no encontrado | `findById` retorna null | Lanza "El deporte no existe" |
| 3 | Intento de cambio de nombre | `findById` retorna deporte, cuerpo incluye name | Lanza "No se puede modificar el nombre" |
| 4 | maxCapacity inválido | cuerpo tiene maxCapacity: 0 | Lanza (validado) |

### DeleteSportUseCase — `packages/api/src/application/DeleteSportUseCase.ts`

```typescript
export class DeleteSportUseCase {
  constructor(private readonly sportRepo: SportRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.sportRepo.findById(id);
    if (!existing) {
      throw new Error('El deporte no existe');
    }

    const disciplineCount = await this.sportRepo.countDisciplines(id);
    if (disciplineCount > 0) {
      throw new Error('No se puede eliminar un deporte con disciplinas asociadas. Elimine las disciplinas primero');
    }

    await this.sportRepo.delete(id);
  }
}
```

**Plan de Pruebas**:
| # | Escenario | Comportamiento del Mock | Esperado |
|---|----------|--------------|----------|
| 1 | Eliminación exitosa | existe, 0 disciplinas | llama a `delete` |
| 2 | No encontrado | `findById` retorna null | Lanza "El deporte no existe" |
| 3 | Tiene disciplinas | existe, 2 disciplinas | Lanza mensaje de rechazo, `delete` NO llamado |

---

## Capa de Delivery

### `packages/api/src/delivery/SportController.ts`

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateSportUseCase } from '../application/CreateSportUseCase.js';
import { GetSportsUseCase } from '../application/GetSportsUseCase.js';
import { UpdateSportUseCase } from '../application/UpdateSportUseCase.js';
import { DeleteSportUseCase } from '../application/DeleteSportUseCase.js';
import { CreateSportRequest, UpdateSportRequest } from '@alentapp/shared';

export class SportController {
  constructor(
    private readonly createSportUseCase: CreateSportUseCase,
    private readonly getSportsUseCase: GetSportsUseCase,
    private readonly updateSportUseCase: UpdateSportUseCase,
    private readonly deleteSportUseCase: DeleteSportUseCase,
  ) {}

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const sports = await this.getSportsUseCase.execute();
      return reply.status(200).send({ data: sports });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  async create(
    request: FastifyRequest<{ Body: CreateSportRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const sport = await this.createSportUseCase.execute(request.body);
      return reply.status(201).send({ data: sport });
    } catch (error: any) {
      if (error.message.includes('Ya existe un deporte con ese nombre')) {
        return reply.status(409).send({ error: error.message });
      }
      if (error.message.includes('es requerido') || error.message.includes('no puede superar') || error.message.includes('debe ser un número')) {
        return reply.status(400).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
    }
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateSportRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      const sport = await this.updateSportUseCase.execute(id, request.body);
      return reply.status(200).send({ data: sport });
    } catch (error: any) {
      if (error.message.includes('no existe')) {
        return reply.status(404).send({ error: error.message });
      }
      if (error.message.includes('No se puede modificar el nombre') || error.message.includes('debe ser un número')) {
        return reply.status(400).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      await this.deleteSportUseCase.execute(id);
      return reply.status(204).send();
    } catch (error: any) {
      if (error.message.includes('no existe')) {
        return reply.status(404).send({ error: error.message });
      }
      if (error.message.includes('disciplinas asociadas')) {
        return reply.status(409).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
    }
  }
}
```

### Mapeo de Errores

| Error de Dominio | HTTP Status | Cuerpo de Respuesta |
|-------------|-------------|---------------|
| "El nombre es requerido" | 400 | `{ error: "..." }` |
| "El nombre no puede superar los 100 caracteres" | 400 | `{ error: "..." }` |
| "La descripción no puede superar los 500 caracteres" | 400 | `{ error: "..." }` |
| "La capacidad máxima es requerida" | 400 | `{ error: "..." }` |
| "La capacidad máxima debe ser un número entero positivo" | 400 | `{ error: "..." }` |
| "Ya existe un deporte con ese nombre" | 409 | `{ error: "..." }` |
| "No se puede modificar el nombre del deporte" | 400 | `{ error: "..." }` |
| "El deporte no existe" | 404 | `{ error: "..." }` |
| "No se puede eliminar un deporte con disciplinas asociadas..." | 409 | `{ error: "..." }` |
| Cualquier error no manejado | 500 | `{ error: "Error interno, reintente más tarde" }` |

### Plan de Pruebas del Controlador

Siguiendo el patrón exacto de MemberController.test.ts (mockear casos de uso, mockear request/reply):

| # | Método | Escenario | Esperado |
|---|--------|----------|----------|
| 1 | create | Éxito | 201 + data |
| 2 | create | Nombre duplicado | 409 + mensaje de error |
| 3 | create | maxCapacity inválido | 400 + mensaje de error |
| 4 | create | Error genérico | 500 |
| 5 | getAll | Éxito con datos | 200 + arreglo |
| 6 | getAll | Error | 500 |
| 7 | update | Éxito | 200 + data |
| 8 | update | No encontrado | 404 |
| 9 | update | Intento de cambio de nombre | 400 |
| 10 | update | Error genérico | 500 |
| 11 | delete | Éxito | 204 |
| 12 | delete | No encontrado | 404 |
| 13 | delete | Tiene disciplinas | 409 |

### Plan de Pruebas de Integración

Siguiendo el patrón de `MemberController.integration.test.ts` — mockear `PostgresSportRepository`, inyectar con `buildApp()`:

| # | Escenario | Esperado |
|---|----------|----------|
| 1 | GET lista vacía | 200 `{ data: [] }` |
| 2 | POST + GET | 201 luego 200 con datos |
| 3 | POST nombre duplicado | 409 |
| 4 | POST maxCapacity inválido | 400 |
| 5 | PUT actualización válida | 200 con datos actualizados |
| 6 | PUT intento de cambio de nombre | 400 |
| 7 | PUT no encontrado | 404 |
| 8 | DELETE deporte | 204 |
| 9 | DELETE deporte con disciplinas | 409 |

---

## Capa de Infraestructura

### `packages/api/src/infrastructure/PostgresSportRepository.ts`

```typescript
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { SportRepository } from '../domain/SportRepository.js';
import { SportDTO, SportDetailDTO, CreateSportRequest, UpdateSportRequest } from '@alentapp/shared';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
});

type DBSport = {
    id: string;
    name: string;
    description: string | null;
    maxCapacity: number;
    created_at: Date;
};

export class PostgresSportRepository implements SportRepository {
    async create(data: CreateSportRequest): Promise<SportDTO> {
        const sport = await prisma.sport.create({
            data: {
                name: data.name,
                description: data.description || null,
                maxCapacity: data.maxCapacity,
            },
        });
        return this.mapToDTO(sport);
    }

    async findById(id: string): Promise<SportDTO | null> {
        const sport = await prisma.sport.findUnique({ where: { id } });
        return sport ? this.mapToDTO(sport) : null;
    }

    async findByName(name: string): Promise<SportDTO | null> {
        const sport = await prisma.sport.findUnique({ where: { name } });
        return sport ? this.mapToDTO(sport) : null;
    }

    async findAll(): Promise<SportDetailDTO[]> {
        const sports = await prisma.sport.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                _count: {
                    select: { disciplines: true },
                },
            },
        });
        return sports.map((sport) => ({
            ...this.mapToDTO(sport),
            disciplineCount: sport._count.disciplines,
        }));
    }

    async update(id: string, data: UpdateSportRequest): Promise<SportDTO> {
        const sport = await prisma.sport.update({
            where: { id },
            data: {
                ...(data.description !== undefined && { description: data.description }),
                ...(data.maxCapacity !== undefined && { maxCapacity: data.maxCapacity }),
            },
        });
        return this.mapToDTO(sport);
    }

    async delete(id: string): Promise<void> {
        await prisma.sport.delete({ where: { id } });
    }

    async countDisciplines(sportId: string): Promise<number> {
        const count = await prisma.discipline.count({
            where: { sportId },
        });
        return count;
    }

    private mapToDTO(sport: DBSport): SportDTO {
        return {
            id: sport.id,
            name: sport.name,
            description: sport.description || undefined,
            maxCapacity: sport.maxCapacity,
            created_at: sport.created_at.toISOString(),
        };
    }
}
```

**Diferencias clave respecto a PostgresMemberRepository**:
- `findAll` usa `include: { _count: { select: { disciplines: true } } }` de Prisma para obtener el conteo de disciplinas por deporte
- `mapToDTO` convierte `description: null` a `undefined` (consistente con el campo DTO opcional)
- `countDisciplines` consulta la tabla `discipline` — esto asume que el modelo `Discipline` existe en el schema de Prisma (no existirá cuando Sport se implemente a menos que lo agreguemos como modelo con solo un `id` y `sportId`, o usemos una consulta SQL directa)

**Advertencia**: La tabla `discipline` aún no existirá cuando Sport se migre por primera vez. `findAll` y `countDisciplines` compilarán y funcionarán porque Prisma genera el cliente para Discipline basado en el schema, pero las consultas SQL reales fallarán si la migración de Discipline aún no se ha ejecutado. **Decisión de diseño**: Usar una consulta SQL directa para el conteo inicialmente, o simplemente definir Discipline como un modelo mínimo en la misma migración para que la relación exista. La especificación dice que agreguemos la relación ahora — definimos Discipline mínimamente en el schema para que `_count` funcione, aunque la entidad Discipline completa se implementará después.

En realidad, mirando esto con más cuidado — necesitamos definir al menos un stub del modelo `Discipline` en el schema para que Prisma pueda generar la relación. Reconsideremos.

**Enfoque revisado**: SÍ definimos `Discipline` como un modelo mínimo en el schema de Prisma *ahora*:

```prisma
model Discipline {
    id        String   @id @default(uuid())
    sportId   String
    sport     Sport    @relation(fields: [sportId], references: [id])
    // Other fields will be added when Discipline is implemented

    @@map("disciplines")
}
```

De esta manera el cliente de Prisma incluye `Discipline` desde el inicio, `_count` funciona en `findAll`, y `countDisciplines` consulta una tabla real. La migración crea la tabla `disciplines` con solo `id` y `sportId`. Cuando Discipline se implemente después, las columnas adicionales se agregan mediante una nueva migración.

---

## Frontend

### `packages/web/src/services/sports.ts`

```typescript
import type { SportDTO, SportDetailDTO, CreateSportRequest, UpdateSportRequest } from '@alentapp/shared';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/v1';

export const sportsService = {
  async getAll(): Promise<SportDetailDTO[]> {
    const response = await fetch(`${API_URL}/deportes`);
    if (!response.ok) {
      throw new Error('Error al obtener los deportes');
    }
    const result = await response.json();
    return result.data;
  },

  async create(data: CreateSportRequest): Promise<SportDTO> {
    const response = await fetch(`${API_URL}/deportes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear el deporte');
    }
    const result = await response.json();
    return result.data;
  },

  async update(id: string, data: UpdateSportRequest): Promise<SportDTO> {
    const response = await fetch(`${API_URL}/deportes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al actualizar el deporte');
    }
    const result = await response.json();
    return result.data;
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/deportes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al eliminar el deporte');
    }
  },
};
```

### `packages/web/src/views/Sports.tsx`

Estructura del componente siguiendo `Members.tsx` exactamente:

- **Estado**: `sports: SportDetailDTO[]`, `isLoading`, `error`, estados de diálogo/formulario, `editingSportId`
- **Estado del formulario**: `{ name, description, maxCapacity }` — coincide con `CreateSportRequest`
- **Columnas de la tabla**: Nombre, Descripción, Capacidad Máx., Disciplinas (distintivo), Acciones (Editar / Eliminar)

#### Tabla de Validación del Frontend

| Campo | Regla | Visualización de Error |
|-------|------|---------------|
| name | Requerido, máx. 100 caracteres | Mensaje de error debajo del campo |
| description | Opcional, máx. 500 caracteres | Contador de caracteres (mostrar estilo `50/500`) |
| maxCapacity | Requerido, entero, mínimo 1 | Input numérico con `min={1}` |

#### Comportamientos clave de UI (diferencias con Members):

1. **Campo de nombre es de solo lectura en modo edición** — usa `<Input readOnly disabled>` con un tooltip "El nombre no se puede modificar"
2. **Distintivo de disciplinas** — muestra `disciplineCount` como un distintivo azul. Si es 0, muestra "0" en estilo atenuado
3. **Botón de eliminar deshabilitado** cuando `disciplineCount > 0` — muestra tooltip "No se puede eliminar: tiene disciplinas asociadas"
4. **Campo de descripción** — usa `<textarea>` con un contador de caracteres
5. **Campo maxCapacity** — usa `<Input type="number" min={1}>` para que el navegador prevenga valores ≤ 0

#### Esquema del componente:

```tsx
export function SportsView() {
  const [sports, setSports] = useState<SportDetailDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSportId, setEditingSportId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateSportRequest>({
    name: "", description: "", maxCapacity: 1,
  });

  // fetchSports, openCreateModal, openEditModal, handleSubmit, handleDelete
  // Same pattern as Members.tsx

  return (
    <DialogRoot open={isDialogOpen} onOpenChange={...}>
      <Stack gap="8">
        <Flex>... title "Administración de Deportes" + add button ...</Flex>

        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>...</DialogHeader>
            <DialogBody>
              {/* Name: required, read-only in edit */}
              <Field label="Nombre" required>
                <Input
                  value={formData.name}
                  onChange={...}
                  readOnly={!!editingSportId}
                  disabled={!!editingSportId}
                  required
                  maxLength={100}
                />
              </Field>

              {/* Description: optional, textarea with counter */}
              <Field label="Descripción" helperText={`${formData.description?.length || 0}/500`}>
                <Textarea
                  value={formData.description || ''}
                  onChange={...}
                  maxLength={500}
                />
              </Field>

              {/* Max Capacity: number, min=1 */}
              <Field label="Capacidad Máxima" required>
                <Input
                  type="number"
                  min={1}
                  value={formData.maxCapacity}
                  onChange={...}
                  required
                />
              </Field>
            </DialogBody>
            <DialogFooter>...</DialogFooter>
          </form>
        </DialogContent>

        {/* Table */}
        {isLoading ? <Spinner /> : sports.length === 0 ? <Empty /> : (
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Nombre</Table.ColumnHeader>
                <Table.ColumnHeader>Descripción</Table.ColumnHeader>
                <Table.ColumnHeader>Capacidad Máx.</Table.ColumnHeader>
                <Table.ColumnHeader>Disciplinas</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Acciones</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sports.map((sport) => (
                <Table.Row key={sport.id}>
                  <Table.Cell>{sport.name}</Table.Cell>
                  <Table.Cell>{sport.description || '-'}</Table.Cell>
                  <Table.Cell>{sport.maxCapacity}</Table.Cell>
                  <Table.Cell>
                    <Badge>{sport.disciplineCount}</Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="end">
                    <IconButton aria-label="Editar deporte" onClick={...}>
                      <LuPencil />
                    </IconButton>
                    <IconButton
                      aria-label="Eliminar deporte"
                      disabled={sport.disciplineCount > 0}
                      title={sport.disciplineCount > 0 ? "No se puede eliminar: tiene disciplinas asociadas" : ""}
                      onClick={...}
                    >
                      <LuTrash2 />
                    </IconButton>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Stack>
    </DialogRoot>
  );
}
```

### `packages/web/src/views/Sports.test.tsx` — Plan de Pruebas

| # | Prueba | Comportamiento del Mock | Esperado |
|---|------|--------------|----------|
| 1 | Muestra carga, luego tabla vacía | `getAll` retorna `[]` | Muestra "Cargando deportes..." luego "No se encontraron deportes." |
| 2 | Renderiza lista de deportes | `getAll` retorna 2 deportes | Muestra ambos nombres en la tabla |
| 3 | Muestra error en caso de falla | `getAll` rechaza con error | Muestra mensaje de error en caja roja |
| 4 | Crea un nuevo deporte via formulario | `create` resuelve | Llama a `create` con los datos del formulario |
| 5 | Edita un deporte existente | `update` resuelve | Llama a `update` con campos modificados, el campo nombre es de solo lectura |
| 6 | Elimina un deporte con confirmación | `delete` resuelve, `confirm` retorna true | Llama a `delete` con id |
| 7 | Botón de eliminar deshabilitado cuando disciplineCount > 0 | — | El botón tiene el atributo `disabled` |

### Registro de Rutas — `packages/web/src/routes.ts`

Agregar import y ruta:

```typescript
import { SportsView } from "./views/Sports";

// Inside the children array:
{
  path: "/sports",
  Component: SportsView,
},
```

Agregar enlace de navegación en `Layout.tsx`:

```tsx
<RouterLink to="/sports">
  <Text fontWeight="semibold" fontSize="sm" textTransform="uppercase" letterSpacing="wider" color="fg.muted" _hover={{ color: "blue.500", textDecoration: "none" }}>
    Deportes
  </Text>
</RouterLink>
```

---

## Cableado en `app.ts`

Agregar a `packages/api/src/app.ts`:

```typescript
import { PostgresSportRepository } from './infrastructure/PostgresSportRepository.js';
import { SportValidator } from './domain/services/SportValidator.js';
import { CreateSportUseCase } from './application/CreateSportUseCase.js';
import { GetSportsUseCase } from './application/GetSportsUseCase.js';
import { UpdateSportUseCase } from './application/UpdateSportUseCase.js';
import { DeleteSportUseCase } from './application/DeleteSportUseCase.js';
import { SportController } from './delivery/SportController.js';

// Inside buildApp(), after Member wiring:

const sportRepo = new PostgresSportRepository();
const sportValidator = new SportValidator(sportRepo);

const createSportUseCase = new CreateSportUseCase(sportRepo, sportValidator);
const getSportsUseCase = new GetSportsUseCase(sportRepo);
const updateSportUseCase = new UpdateSportUseCase(sportRepo, sportValidator);
const deleteSportUseCase = new DeleteSportUseCase(sportRepo);

const sportController = new SportController(
  createSportUseCase,
  getSportsUseCase,
  updateSportUseCase,
  deleteSportUseCase,
);

server.post('/api/v1/deportes', sportController.create.bind(sportController));
server.get('/api/v1/deportes', sportController.getAll.bind(sportController));
server.put('/api/v1/deportes/:id', sportController.update.bind(sportController));
server.delete('/api/v1/deportes/:id', sportController.delete.bind(sportController));
```

---

## Orden de Implementación

El siguiente orden respeta las dependencias entre capas:

| Paso | Tarea | Archivos | Dependencias |
|------|------|-------|-------------|
| 1 | Agregar modelo Sport + stub mínimo de Discipline al schema de Prisma, ejecutar migración | `schema.prisma`, archivo de migración | — |
| 2 | Agregar DTOs de Sport al paquete compartido | `packages/shared/index.ts` | Paso 1 |
| 3 | Crear interfaz de puerto `SportRepository` + SportValidator + pruebas | `domain/SportRepository.ts`, `domain/services/SportValidator.ts`, `domain/services/SportValidator.test.ts` | Paso 2 |
| 4 | Crear `PostgresSportRepository` | `infrastructure/PostgresSportRepository.ts` | Pasos 1, 3 |
| 5 | Crear `CreateSportUseCase` + pruebas | `application/CreateSportUseCase.ts`, `.test.ts` | Pasos 3, 4 |
| 6 | Crear `GetSportsUseCase` + pruebas | `application/GetSportsUseCase.ts`, `.test.ts` | Paso 4 |
| 7 | Crear `UpdateSportUseCase` + pruebas | `application/UpdateSportUseCase.ts`, `.test.ts` | Pasos 3, 4 |
| 8 | Crear `DeleteSportUseCase` + pruebas | `application/DeleteSportUseCase.ts`, `.test.ts` | Paso 4 |
| 9 | Crear `SportController` + pruebas unitarias + pruebas de integración | `delivery/SportController.ts`, `.test.ts`, `.integration.test.ts` | Pasos 5–8 |
| 10 | Cablear todo en `app.ts` | `app.ts` | Pasos 1–9 |
| 11 | Crear servicio frontend | `packages/web/src/services/sports.ts` | Pasos 2, 10 |
| 12 | Crear vista frontend + pruebas | `packages/web/src/views/Sports.tsx`, `.test.tsx` | Paso 11 |
| 13 | Registrar ruta + enlace de navegación | `packages/web/src/routes.ts`, `packages/web/src/Layout.tsx` | Paso 12 |

---

## Resumen de Archivos

| Archivo | Acción | Descripción |
|------|--------|-------------|
| `packages/api/prisma/schema.prisma` | Modificar | Agregar modelo Sport + stub mínimo de Discipline |
| `packages/shared/index.ts` | Modificar | Agregar SportDTO, SportDetailDTO, CreateSportRequest, UpdateSportRequest |
| `packages/api/src/domain/SportRepository.ts` | Crear | Interfaz de puerto |
| `packages/api/src/domain/services/SportValidator.ts` | Crear | Servicio de validación de dominio |
| `packages/api/src/domain/services/SportValidator.test.ts` | Crear | Pruebas unitarias del validador |
| `packages/api/src/infrastructure/PostgresSportRepository.ts` | Crear | Repositorio Prisma |
| `packages/api/src/application/CreateSportUseCase.ts` | Crear | Caso de uso |
| `packages/api/src/application/CreateSportUseCase.test.ts` | Crear | Pruebas unitarias |
| `packages/api/src/application/GetSportsUseCase.ts` | Crear | Caso de uso |
| `packages/api/src/application/GetSportsUseCase.test.ts` | Crear | Pruebas unitarias |
| `packages/api/src/application/UpdateSportUseCase.ts` | Crear | Caso de uso |
| `packages/api/src/application/UpdateSportUseCase.test.ts` | Crear | Pruebas unitarias |
| `packages/api/src/application/DeleteSportUseCase.ts` | Crear | Caso de uso |
| `packages/api/src/application/DeleteSportUseCase.test.ts` | Crear | Pruebas unitarias |
| `packages/api/src/delivery/SportController.ts` | Crear | Controlador Fastify |
| `packages/api/src/delivery/SportController.test.ts` | Crear | Pruebas unitarias del controlador |
| `packages/api/src/delivery/SportController.integration.test.ts` | Crear | Pruebas de integración |
| `packages/api/src/app.ts` | Modificar | Cableado DI + registro de rutas |
| `packages/web/src/services/sports.ts` | Crear | Servicio API del frontend |
| `packages/web/src/views/Sports.tsx` | Crear | Componente de vista |
| `packages/web/src/views/Sports.test.tsx` | Crear | Pruebas del frontend |
| `packages/web/src/routes.ts` | Modificar | Agregar ruta /sports |
| `packages/web/src/Layout.tsx` | Modificar | Agregar enlace de navegación |

---

## Preguntas Abiertas

- [x] **Modelo stub de Discipline**: ¿Deberíamos definir un modelo mínimo de Discipline ahora para habilitar las consultas `_count`, o usar SQL directo? **Decisión**: Definir un modelo mínimo de Discipline para que Prisma genere las relaciones correctamente. SQL directo evitaría la seguridad de tipos de Prisma y crearía una carga de mantenimiento.

---

**Cambio**: Actividad 2 – Implementación de Entidades del TP Integrador
**Entidad**: Sport
**Total de archivos nuevos**: 16
**Total de archivos modificados**: 4
**Estrategia de pruebas**: Unitarias (validador + 4 casos de uso + controlador) + integración (controlador) + frontend (vista)
