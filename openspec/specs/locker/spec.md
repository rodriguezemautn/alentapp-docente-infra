# Locker Specification

## Purpose

Define la entidad Locker (Casilleros) del club social, incluyendo LockerAssignmentLog como historial de asignaciones. Backend hexagonal completo y frontend CRUD.

## Requirements

### Requirement: Modelo de datos Locker

El schema DEBE incluir:

```
Locker:
  id: UUID (PK)
  number: Int (UNIQUE)
  location: String? (opcional)
  status: Enum [Available, Occupied, Maintenance] (default: Available)
  memberId: UUID? (FK → Member, nullable)
  created_at: DateTime (autogenerado)
```

#### Scenario: Crear casillero exitosamente

- GIVEN un request válido con `number` único
- WHEN se llama a `POST /api/v1/casilleros`
- THEN retorna `201 { data: LockerDTO }`
- AND el casillero se persiste con status `Available`

#### Scenario: Número duplicado

- GIVEN un casillero existente con `number: 5`
- WHEN se crea otro casillero con `number: 5`
- THEN retorna `409 Conflict` con mensaje "Ya existe un casillero con ese número"

### Requirement: Endpoints Locker

| Método | Ruta | Body | Response | TDD |
|--------|------|------|----------|-----|
| POST | `/api/v1/casilleros` | `CreateLockerRequest` | `201 { data: LockerDTO }` | 0006 |
| GET | `/api/v1/casilleros` | query: `?status=` | `200 { data: LockerDetailDTO[] }` | 0021 |
| GET | `/api/v1/casilleros/:id` | — | `200 { data: LockerDetailDTO }` | 0021 |
| PUT | `/api/v1/casilleros/:id` | `UpdateLockerRequest` | `200 { data: LockerDTO }` | 0010 |
| DELETE | `/api/v1/casilleros/:id` | — | `204` | 0014 |

### Requirement: Reglas de negocio Locker

1. **Número único**: No pueden existir dos casilleros con el mismo `number`
2. **Número positivo**: `number` DEBE ser entero positivo (> 0)
3. **Asignación**: Solo se puede asignar un socio si `status = Available`
4. **Mantenimiento**: No se puede asignar un casillero en `Maintenance`
5. **Eliminación**: Solo se permite si `status = Available`
6. **Historial**: Toda asignación o liberación DEBE registrar un `LockerAssignmentLog`

#### Scenario: Asignar casillero a socio

- GIVEN un casillero con `status: Available`
- WHEN se actualiza con `memberId` válido
- THEN el status cambia a `Occupied`
- AND se crea un `LockerAssignmentLog` con `eventType: Assignment`

#### Scenario: Liberar casillero

- GIVEN un casillero con `status: Occupied` y `memberId` asignado
- WHEN se actualiza con `memberId: null`
- THEN el status cambia a `Available`
- AND se crea un `LockerAssignmentLog` con `eventType: Release`

### Requirement: LockerAssignmentLog (Historial)

```
LockerAssignmentLog:
  id: UUID (PK)
  lockerId: UUID (FK → Locker)
  memberId: UUID (FK → Member)
  eventType: Enum [Assignment, Release]
  assignedAt: DateTime
  releasedAt: DateTime?
  created_at: DateTime (autogenerado)
```

| Método | Ruta | Response |
|--------|------|----------|
| GET | `/api/v1/historial/casilleros?lockerId=xxx` | `200 { data: LockerHistoryDTO[] }` |
| GET | `/api/v1/historial/casilleros?memberId=xxx` | `200 { data: LockerHistoryDTO[] }` |

### Requirement: Errores Locker

| Escenario | HTTP | Mensaje |
|-----------|------|---------|
| Número duplicado | 409 | "Ya existe un casillero con ese número" |
| Número inválido | 400 | "El número de casillero debe ser positivo" |
| Asignar en Maintenance | 400 | "No se puede asignar un casillero en mantenimiento" |
| Asignar ya ocupado | 400 | "El casillero ya está ocupado" |
| Eliminar ocupado | 400 | "No se puede eliminar un casillero ocupado. Libérelo primero" |
| Eliminar en mantenimiento | 400 | "No se puede eliminar un casillero en mantenimiento" |
| No existe | 404 | "El casillero no existe" |
