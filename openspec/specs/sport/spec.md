# Especificación de Sport

## Propósito

La entidad Sport representa un deporte ofrecido por el club. Es la primera entidad en implementarse dentro de la Actividad 2, sin dependencias externas. Los deportes sirven como base para las Disciplinas, que a su vez son referenciadas por EquipmentLoan. Cada deporte tiene un nombre único e inmutable, una descripción opcional y una capacidad máxima de participantes.

## Requisitos Funcionales

### RF-01: Crear Deporte

El sistema DEBE permitir crear un deporte con un `name` (requerido, único), `description` (opcional) y `maxCapacity` (requerido, > 0).

En caso de éxito, el sistema DEBE retornar HTTP `201` con un `SportDTO` en el cuerpo de la respuesta.

En caso de error:
- `name` duplicado → HTTP `409` con `{ error: "Ya existe un deporte con ese nombre" }`
- `maxCapacity` ≤ 0 → HTTP `400` con `{ error: "La capacidad máxima debe ser mayor a cero" }`

### RF-02: Obtener Todos los Deportes

El sistema DEBE retornar todos los deportes como un arreglo de `SportDetailDTO[]`. Cada elemento DEBE incluir un campo `disciplineCount` que refleje la cantidad de disciplinas asociadas al momento de la consulta.

- Sin deportes en el sistema → HTTP `200` con un arreglo vacío `{ data: [] }`
- Deportes existentes → HTTP `200` con `{ data: SportDetailDTO[] }`

### RF-03: Actualizar Deporte

El sistema DEBE permitir actualizar `description` y `maxCapacity` de un deporte existente. El `name` NO DEBE ser modificado — cualquier solicitud que incluya un campo `name` DEBE ser rechazada.

- Deporte no encontrado → HTTP `404` con `{ error: "El deporte no existe" }`
- Nombre incluido en el cuerpo de la solicitud → HTTP `400` con `{ error: "No se puede modificar el nombre del deporte" }`
- `maxCapacity` ≤ 0 → HTTP `400` con `{ error: "La capacidad máxima debe ser mayor a cero" }`
- Éxito → HTTP `200` con `{ data: SportDTO }`

### RF-04: Eliminar Deporte

El sistema DEBE eliminar un deporte de forma permanente (hard-delete). La eliminación DEBE ser rechazada si el deporte tiene disciplinas asociadas.

- Deporte no encontrado → HTTP `404` con `{ error: "El deporte no existe" }`
- Deporte con disciplinas → HTTP `409` con `{ error: "No se puede eliminar un deporte con disciplinas asociadas. Elimine las disciplinas primero" }`
- Éxito → HTTP `204` Sin Contenido

## Reglas de Negocio

| ID | Regla | Obligatoriedad |
|---|---|---|
| RN-01 | `name` DEBE ser único entre todos los deportes | MUST |
| RN-02 | `name` NO DEBE ser modificable después de la creación (inmutable) | MUST |
| RN-03 | Un deporte NO DEBE ser eliminado si tiene registros de `discipline` asociados | MUST |
| RN-04 | `description` es opcional (PUEDE ser `null` u omitida) | MAY |
| RN-05 | `name` es requerido y DEBE tener una longitud máxima de 100 caracteres | MUST |
| RN-06 | `maxCapacity` es requerido y DEBE ser un entero mayor a cero | MUST |

## Contrato de API

Todos los endpoints tienen el prefijo `/api/v1/sports`.

### `POST /api/v1/sports`

Crear un nuevo deporte.

**Cuerpo de la Solicitud:** `CreateSportRequest`
**Respuesta Exitosa:** `201` `{ data: SportDTO }`
**Respuestas de Error:** `400` (entrada inválida), `409` (nombre duplicado)

### `GET /api/v1/sports`

Obtener todos los deportes.

**Respuesta Exitosa:** `200` `{ data: SportDetailDTO[] }`

### `PUT /api/v1/sports/:id`

Actualizar un deporte existente.

**Cuerpo de la Solicitud:** `UpdateSportRequest`
**Respuesta Exitosa:** `200` `{ data: SportDTO }`
**Respuestas de Error:** `400` (entrada inválida o intento de cambio de nombre), `404` (no encontrado)

### `DELETE /api/v1/sports/:id`

Eliminar un deporte.

**Respuesta Exitosa:** `204` Sin Contenido
**Respuestas de Error:** `404` (no encontrado), `409` (tiene disciplinas asociadas)

## Definiciones de DTOs

```typescript
// packages/shared/index.ts additions

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

## Escenarios de Prueba

### Crear — Caso exitoso

- GIVEN una solicitud `CreateSportRequest` válida con `name: "Fútbol"`, `description: "Deporte de equipo"`, `maxCapacity: 22`
- WHEN se llama a `POST /api/v1/sports`
- THEN el sistema retorna HTTP `201` con un `SportDTO` que contiene los datos enviados y un `id` generado

### Crear — Nombre duplicado

- GIVEN ya existe un deporte con `name: "Fútbol"`
- WHEN se llama a `POST /api/v1/sports` con `name: "Fútbol"`
- THEN el sistema retorna HTTP `409` con `{ error: "Ya existe un deporte con ese nombre" }`

### Crear — maxCapacity inválido

- GIVEN una solicitud `CreateSportRequest` con `maxCapacity: 0`
- WHEN se llama a `POST /api/v1/sports`
- THEN el sistema retorna HTTP `400` con `{ error: "La capacidad máxima debe ser mayor a cero" }`

### Obtener Todos — Con datos

- GIVEN existen 3 deportes en la base de datos, uno con 2 disciplinas asociadas
- WHEN se llama a `GET /api/v1/sports`
- THEN el sistema retorna HTTP `200` con un arreglo de 3 elementos `SportDetailDTO`
- AND el elemento con disciplinas muestra `disciplineCount: 2`

### Obtener Todos — Vacío

- GIVEN no existen deportes en la base de datos
- WHEN se llama a `GET /api/v1/sports`
- THEN el sistema retorna HTTP `200` con `{ data: [] }`

### Actualizar — Caso exitoso

- GIVEN existe un deporte con `id: "abc-123"` y `name: "Natación"`
- WHEN se llama a `PUT /api/v1/sports/abc-123` con `{ description: "Deporte acuático", maxCapacity: 30 }`
- THEN el sistema retorna HTTP `200` con el `SportDTO` actualizado
- AND el `name` retornado sigue siendo `"Natación"` (sin cambios)

### Actualizar — Cambio de nombre rechazado

- GIVEN existe un deporte con `id: "abc-123"`
- WHEN se llama a `PUT /api/v1/sports/abc-123` con `{ name: "Otro nombre" }`
- THEN el sistema retorna HTTP `400` con `{ error: "No se puede modificar el nombre del deporte" }`

### Actualizar — No encontrado

- GIVEN no existe un deporte con `id: "nonexistent"`
- WHEN se llama a `PUT /api/v1/sports/nonexistent` con `{ description: "test" }`
- THEN el sistema retorna HTTP `404` con `{ error: "El deporte no existe" }`

### Eliminar — Caso exitoso

- GIVEN existe un deporte con `id: "abc-123"` con 0 disciplinas asociadas
- WHEN se llama a `DELETE /api/v1/sports/abc-123`
- THEN el sistema retorna HTTP `204` sin contenido

### Eliminar — Tiene disciplinas

- GIVEN existe un deporte con `id: "abc-123"` con 2 disciplinas asociadas
- WHEN se llama a `DELETE /api/v1/sports/abc-123`
- THEN el sistema retorna HTTP `409` con `{ error: "No se puede eliminar un deporte con disciplinas asociadas. Elimine las disciplinas primero" }`

### Eliminar — No encontrado

- GIVEN no existe un deporte con `id: "nonexistent"`
- WHEN se llama a `DELETE /api/v1/sports/nonexistent`
- THEN el sistema retorna HTTP `404` con `{ error: "El deporte no existe" }`

## Especificación del Frontend

### Servicio (`packages/web/src/services/sports.ts`)

Siguiendo el patrón exacto de `packages/web/src/services/members.ts`:

| Método | Endpoint | Retorno |
|---|---|---|
| `getAll()` | `GET /api/v1/sports` | `SportDTO[]` |
| `create(data)` | `POST /api/v1/sports` | `SportDTO` |
| `update(id, data)` | `PUT /api/v1/sports/:id` | `SportDTO` |
| `delete(id)` | `DELETE /api/v1/sports/:id` | `void` |

Cada método DEBE parsear la respuesta como `result.data` y lanzar un error en respuestas no exitosas con el mensaje de error del servidor.

### Vista (`packages/web/src/views/Sports.tsx`)

Siguiendo el patrón exacto de `packages/web/src/views/Members.tsx`:

- **Columnas de la tabla**: Nombre, Descripción, Capacidad Máx., distintivo de Disciplinas, Acciones (Editar / Eliminar)
- **Modal de creación**: formulario con Nombre (requerido), Descripción (opcional, textarea), Capacidad Máxima (requerido, número > 0)
- **Modal de edición**: mismo formulario pero el campo Nombre DEBE ser de solo lectura/deshabilitado (regla de inmutabilidad)
- **Eliminación**: diálogo de confirmación (`window.confirm`). Si `disciplineCount > 0`, el botón de eliminar DEBERÍA estar deshabilitado o mostrar un tooltip explicando por qué está bloqueada la eliminación

La ruta DEBERÍA registrarse en el router como `/deportes` o `/sports`.

---

**Cambio**: Actividad 2 – Implementación de Entidades del TP Integrador  
**Entidad**: Sport  
**Tipo de Especificación**: Completa (nuevo dominio — sin especificación previa)  
**Total de Requisitos**: 4 funcionales, 6 reglas de negocio  
**Total de Escenarios**: 10 (4 casos exitosos, 6 casos de error/borde)
