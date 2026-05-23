---
id: 0009
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Registro de Préstamos de Equipamiento
---

# TDD-0009: Registro de Préstamos de Equipamiento

## Contexto de Negocio (PRD)

### Objetivo

Registrar el préstamo de material deportivo a los socios del club. Dado que el material es limitado, el sistema debe restringir los préstamos según la categoría deportiva del socio. Solo socios con categoría deportiva "Senior" o "Lifetime" pueden recibir material; los "Cadet" no.

### User Persona

- **Nombre**: Roberto (Encargado del depósito de material).
- **Necesidad**: Prestar material deportivo y registrar la salida. Necesita que el sistema le impida prestar material a socios de categoría deportiva "Cadet" por política del club.

### Criterios de Aceptación

- El sistema debe permitir registrar un préstamo de equipamiento a un socio existente.
- El sistema debe validar la **categoría deportiva** del socio (`SportCategory`): solo `Senior` o `Lifetime` pueden recibir préstamos.
- El sistema debe validar que el socio tenga una categoría deportiva asignada.
- El sistema debe asignar el estado "Active" por defecto al nuevo préstamo.

> **ℹ️ Categorías**: `SportCategory` (Senior, Lifetime, Cadet) es un enum independiente de `MemberCategory` (Pleno, Cadete, Honorario). El primero clasifica al socio en el ámbito deportivo; el segundo refleja su vínculo con el club. Ver TDD-0016 para la extensión del modelo Member.

## Diseño Técnico (RFC)

### Modelo de Datos

Se agrega `SportCategory` al modelo `Member` y se crea la entidad `EquipmentLoan`.

**Extensión al modelo `Member`** (nueva migración):

```prisma
enum SportCategory {
    Senior
    Lifetime
    Cadet
}

model Member {
    // ... campos existentes
    sportCategory SportCategory?  // categoría deportiva del socio
    // ...
}
```

**Nueva entidad `EquipmentLoan`**:

```prisma
enum LoanStatus {
    Active
    Returned
    Lost
}

model EquipmentLoan {
    id            String        @id @default(uuid())
    memberId      String
    member        Member        @relation(fields: [memberId], references: [id])
    equipmentName String
    loanDate      DateTime      @default(now())
    returnDate    DateTime?
    status        LoanStatus    @default(Active)
    notes         String?
    created_at    DateTime      @default(now())

    @@map("equipment_loans")
}
```

### Contrato de API (@alentapp/shared)

Se agrega `SportCategory` al paquete compartido y se extiende `MemberDTO`.

```ts
export type SportCategory = 'Senior' | 'Lifetime' | 'Cadet';

export type LoanStatus = 'Active' | 'Returned' | 'Lost';

export interface EquipmentLoanDTO {
    id: string;
    memberId: string;
    equipmentName: string;
    loanDate: string;
    returnDate?: string;
    status: LoanStatus;
    notes?: string;
    created_at: string;
}

export interface CreateEquipmentLoanRequest {
    memberId: string;
    equipmentName: string;
    notes?: string;
}

// Extensión a MemberDTO
export interface MemberDTO {
    // ... campos existentes
    sportCategory?: SportCategory;
}
```

- Endpoint: `POST /api/v1/prestamos-equipamiento`

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `EquipmentLoanRepository` (Interface: `create`, `findById`, `findAll`, `update`).
2. **Servicio de Dominio**: `EquipmentLoanValidator` (Valida existencia del socio, categoría deportiva — solo Senior o Lifetime —, socio con categoría asignada).
3. **Caso de Uso**: `CreateEquipmentLoanUseCase` (Crea el préstamo tras validar la categoría deportiva del socio).
4. **Adaptador de Salida**: `PostgresEquipmentLoanRepository` (Implementación con Prisma).
5. **Adaptador de Entrada**: `EquipmentLoanController` (Ruta HTTP POST).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Socio inexistente                              | Mensaje: "El socio no existe"                                | 404 Not Found |
| Socio sin categoría deportiva asignada         | Mensaje: "El socio no tiene una categoría deportiva asignada" | 400 Bad Request |
| Socio con categoría deportiva "Cadet"          | Mensaje: "Los socios categoría Cadet no pueden solicitar préstamos de equipamiento" | 403 Forbidden |
| Error de conexión a DB                         | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Agregar enum `SportCategory` y campo `sportCategory` al modelo `Member` en Prisma, y crear migración.
2. Agregar modelos `EquipmentLoan` y `LoanStatus` al schema de Prisma, y crear migración.
3. Agregar tipo `SportCategory` a `@alentapp/shared` y extender `MemberDTO`.
4. Definir `EquipmentLoanDTO`, `CreateEquipmentLoanRequest` en `@alentapp/shared`.
5. Crear el puerto `EquipmentLoanRepository` en `domain/`.
6. Implementar `EquipmentLoanValidator`.
7. Implementar `CreateEquipmentLoanUseCase`.
8. Implementar `PostgresEquipmentLoanRepository`.
9. Crear `EquipmentLoanController` con ruta POST en Fastify.
10. Registrar ruta y dependencias en `app.ts`.
11. Crear servicio y vista en el frontend.
