---
id: 0009
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: ABM de Préstamos de Equipamiento
---

# TDD-0009: ABM de Préstamos de Equipamiento

## Contexto de Negocio (PRD)

### Objetivo

Gestionar el préstamo de material deportivo a los socios del club (pelotas, raquetas, colchonetas, etc.). Dado que el material es limitado y sujeto a la categoría del socio, el sistema debe restringir los préstamos según la categoría del socio solicitante.

### User Persona

- **Nombre**: Roberto (Encargado del depósito de material).
- **Necesidad**: Prestar material deportivo a los socios que lo soliciten, registrar la salida y el estado del préstamo, y controlar la devolución. Necesita que el sistema le impida prestar material a socios de categoría "Cadete" por política del club.

### Criterios de Aceptación

- El sistema debe permitir registrar un préstamo de equipamiento a un socio.
- El sistema debe validar que el socio exista.
- El sistema debe validar que la **categoría deportiva** del socio habilite el préstamo.
- El sistema debe permitir registrar la devolución del material.
- El sistema debe registrar si un material se perdió o no fue devuelto.
- El sistema debe listar los préstamos activos y el historial por socio.

> **ℹ️ Categorías de membresía vs. categorías deportivas**: Este TDD introduce `SportCategory`, un enum nuevo e independiente de `MemberCategory`. Mientras que `MemberCategory` (Pleno, Cadete, Honorario) refleja el vínculo del socio con el club, `SportCategory` (Senior, Lifetime, Cadet) clasifica al socio en el ámbito deportivo. Son ortogonales — un socio puede ser "Honorario" y "Cadet" a la vez.

## Diseño Técnico (RFC)

### Modelo de Datos

Se agregará el enum `SportCategory` al modelo existente `Member` (nuevo campo) y se creará la entidad `EquipmentLoan`.

**Nuevo enum** (ámbito deportivo, independiente de `MemberCategory`):

```prisma
enum SportCategory {
    Senior
    Lifetime
    Cadet
}
```

**Extensión al modelo `Member` existente** (nueva migración):

```prisma
model Member {
    // ... campos existentes (id, dni, name, email, birthdate, category, status, created_at)
    sportCategory SportCategory?  // nuevo: categoría deportiva del socio (nullable)
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
    id            String     @id @default(uuid())
    memberId      String
    member        Member     @relation(fields: [memberId], references: [id])
    equipmentName String
    loanDate      DateTime   @default(now())
    returnDate    DateTime?
    status        LoanStatus @default(Active)
    notes         String?
    created_at    DateTime   @default(now())

    @@map("equipment_loans")
}
```

### Contrato de API (@alentapp/shared)

Se agrega `SportCategory` al paquete compartido y se extiende `MemberDTO` con el nuevo campo.

```ts
// --- Nuevo tipo ---
export type SportCategory = 'Senior' | 'Lifetime' | 'Cadet';

// --- Extensión a MemberDTO existente ---
export interface MemberDTO {
    // ... campos existentes
    sportCategory?: SportCategory;  // nuevo, opcional
}

// --- EquipmentLoan ---
export type LoanStatus = 'Active' | 'Returned' | 'Lost';

export interface EquipmentLoanDTO {
    id: string;
    memberId: string;
    equipmentName: string;
    loanDate: string;         // ISO Date String
    returnDate?: string;      // ISO Date String
    status: LoanStatus;
    notes?: string;
    created_at: string;
}

export interface CreateEquipmentLoanRequest {
    memberId: string;
    equipmentName: string;
    notes?: string;
}

export interface ReturnEquipmentLoanRequest {
    returnDate: string;       // ISO Date String, default hoy
    notes?: string;
}
```

| Método | Endpoint                                          | Descripción                                     |
|--------|---------------------------------------------------|-------------------------------------------------|
| GET    | `/api/v1/prestamos-equipamiento`                  | Listar préstamos (filtro por ?memberId=&status=) |
| GET    | `/api/v1/prestamos-equipamiento/:id`              | Obtener un préstamo por ID                      |
| POST   | `/api/v1/prestamos-equipamiento`                  | Crear un nuevo préstamo                         |
| PUT    | `/api/v1/prestamos-equipamiento/:id/return`       | Registrar devolución (cambia status a Returned) |
| PUT    | `/api/v1/prestamos-equipamiento/:id/report-lost`  | Reportar como perdido (cambia status a Lost)    |
| DELETE | `/api/v1/prestamos-equipamiento/:id`              | Eliminar préstamo (solo si status es Lost o Returned) |

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `EquipmentLoanRepository` (Interface: `create`, `findById`, `findAll`, `update`).
2. **Servicio de Dominio**: `EquipmentLoanValidator` (Valida existencia del socio, restricción por categoría deportiva — `sportCategory` debe ser `Senior` o `Lifetime`, no `Cadet` —, que el préstamo no esté ya devuelto/perdido antes de operar).
3. **Casos de Uso**:
   - `CreateEquipmentLoanUseCase` (Crea el préstamo tras validar la categoría deportiva del socio).
   - `GetEquipmentLoansUseCase` (Lista con filtros).
   - `ReturnEquipmentLoanUseCase` (Registra devolución).
   - `ReportLostEquipmentLoanUseCase` (Marca como perdido).
4. **Adaptador de Salida**: `PostgresEquipmentLoanRepository` (Implementación con Prisma).
5. **Adaptador de Entrada**: `EquipmentLoanController` (Rutas HTTP).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Socio inexistente                              | Mensaje: "El socio no existe"                                | 404 Not Found |
| Socio con categoría deportiva "Cadet"          | Mensaje: "Los socios categoría Cadet no pueden solicitar préstamos de equipamiento" | 403 Forbidden |
| Socio sin categoría deportiva asignada         | Mensaje: "El socio no tiene una categoría deportiva asignada"                       | 400 Bad Request |
| Devolver un préstamo ya devuelto               | Mensaje: "El préstamo ya fue devuelto"                       | 400 Bad Request |
| Reportar como perdido un préstamo ya devuelto  | Mensaje: "El préstamo ya fue devuelto"                       | 400 Bad Request |
| Reportar como perdido un préstamo ya perdido   | Mensaje: "El préstamo ya fue reportado como perdido"         | 400 Bad Request |
| Eliminar un préstamo activo                    | Mensaje: "No se puede eliminar un préstamo activo. Regístrelo como devuelto o perdido primero" | 400 Bad Request |
| Error de conexión a DB                         | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Agregar enum `SportCategory` y campo `sportCategory` al modelo `Member` en Prisma, y crear migración.
2. Agregar modelos `EquipmentLoan` y `LoanStatus` al schema de Prisma, y crear migración.
3. Agregar tipo `SportCategory` a `@alentapp/shared` y extender `MemberDTO` con `sportCategory?`.
4. Definir tipos compartidos (`EquipmentLoanDTO`, `CreateEquipmentLoanRequest`, `ReturnEquipmentLoanRequest`) en `@alentapp/shared`.
5. Crear el puerto `EquipmentLoanRepository` en `domain/`.
6. Implementar el servicio de dominio `EquipmentLoanValidator` (validación de categoría deportiva del socio, estados válidos para transición).
7. Implementar los casos de uso (creación, listado, devolución, reporte de pérdida).
8. Implementar `PostgresEquipmentLoanRepository` en infraestructura.
9. Crear `EquipmentLoanController` con rutas GET, POST, PUT return y PUT report-lost en Fastify.
10. Registrar rutas y dependencias en `app.ts`.
11. Crear `equipmentLoansService` en el frontend.
12. Crear vista `EquipmentLoansView` con tabla de préstamos activos/historial, modal de creación con selector de socio, y botones de devolución/reportar pérdida.
13. Agregar ruta `/prestamos-equipamiento` en el router del frontend.
