---
id: 0029
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Historial de Asignaciones de Casilleros
---

# TDD-0029: Historial de Asignaciones de Casilleros

## Contexto de Negocio (PRD)

### Objetivo

Registrar y consultar el historial de asignaciones de cada casillero. Actualmente el sistema solo almacena la asignación actual (campo `memberId`). Cuando un casillero se libera y reasigna, se pierde el rastro de quién lo ocupó antes. Este TDD introduce un modelo de auditoría para preservar ese historial.

### User Persona

- **Nombre**: Martín (Administrativo de instalaciones).
- **Necesidad**: Consultar quién ocupó un casillero en el pasado, por ejemplo si hubo daños o para resolver disputas sobre uso.

### Criterios de Aceptación

- El sistema debe registrar automáticamente un evento en el historial cuando un casillero se asigna o libera.
- El sistema debe registrar: casillero, socio, fecha de inicio, fecha de fin y tipo de evento (asignación/liberación).
- El sistema debe permitir consultar el historial por `lockerId` o por `memberId`.
- El sistema debe devolver los eventos ordenados por fecha descendente.

## Diseño Técnico (RFC)

### Modelo de Datos

Se creará la entidad `LockerAssignmentLog` para auditar las asignaciones:

```prisma
enum LockerEventType {
    Assignment
    Release
}

model LockerAssignmentLog {
    id         String           @id @default(uuid())
    lockerId   String
    locker     Locker           @relation(fields: [lockerId], references: [id])
    memberId   String
    member     Member           @relation(fields: [memberId], references: [id])
    eventType  LockerEventType
    assignedAt DateTime         @default(now())
    releasedAt DateTime?
    created_at DateTime         @default(now())

    @@map("locker_assignment_logs")
}
```

### Contrato de API (@alentapp/shared)

```ts
// GET /api/v1/historial/casilleros?lockerId=xxx
// GET /api/v1/historial/casilleros?memberId=xxx

export type LockerEventType = 'Assignment' | 'Release';

export interface LockerAssignmentLogDTO {
    id: string;
    lockerId: string;
    lockerNumber: number;
    memberId: string;
    memberName: string;
    eventType: LockerEventType;
    assignedAt: string;
    releasedAt?: string;
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `LockerAssignmentLogRepository` (Interface: `create(event)`, `findByLocker(lockerId)`, `findByMember(memberId)`).
2. **Integración**: El `UpdateLockerUseCase` (TDD-0010) debe disparar la creación de un log al asignar o liberar un casillero.
3. **Caso de Uso**: `GetLockerHistoryUseCase`.
4. **Adaptador de Entrada**: Nuevo `HistoryController` o extensión de `LockerController`.

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Casillero sin historial                        | Lista vacía                                                  | 200 OK |
| Socio sin asignaciones previas                 | Lista vacía                                                  | 200 OK |
| Casillero inexistente                          | Mensaje: "El casillero no existe"                            | 404 Not Found |

## Plan de Implementación

1. Agregar modelos `LockerAssignmentLog` y `LockerEventType` al schema de Prisma y crear migración.
2. Crear el puerto `LockerAssignmentLogRepository`.
3. Modificar `UpdateLockerUseCase` para registrar un log en cada asignación/liberación.
4. Implementar `GetLockerHistoryUseCase`.
5. Agregar ruta `GET /api/v1/historial/casilleros`.
6. En el frontend, agregar botón "Ver historial" en cada fila de casillero.
