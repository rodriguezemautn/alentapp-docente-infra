# EquipmentLoan Specification

## Purpose

Define la entidad EquipmentLoan (Préstamos de Equipamiento) del club social. Backend hexagonal completo y frontend CRUD con operaciones de devolución y reporte de pérdida.

## Requirements

### Requirement: Modelo de datos EquipmentLoan

El schema DEBE incluir:

```
Member (extensión):
  sportCategory: Enum [Senior, Lifetime, Cadet]? (opcional)

EquipmentLoan:
  id: UUID (PK)
  memberId: UUID (FK → Member)
  equipmentName: String
  loanDate: DateTime (default: now)
  returnDate: DateTime?
  status: Enum [Active, Returned, Lost] (default: Active)
  notes: String?
  created_at: DateTime (autogenerado)
```

#### Scenario: Crear préstamo exitosamente

- GIVEN un socio con `sportCategory = Senior` o `Lifetime`
- WHEN se llama a `POST /api/v1/prestamos-equipamiento` con `CreateEquipmentLoanRequest` válido
- THEN retorna `201 { data: EquipmentLoanDTO }`
- AND el préstamo se persiste con `status: Active`

#### Scenario: Socio sin categoría deportiva

- GIVEN un socio sin `sportCategory` asignada
- WHEN se intenta crear un préstamo
- THEN retorna `400 Bad Request` con mensaje "El socio no tiene una categoría deportiva asignada"

### Requirement: Endpoints EquipmentLoan

| Método | Ruta | Body | Response | TDD |
|--------|------|------|----------|-----|
| POST | `/api/v1/prestamos-equipamiento` | `CreateEquipmentLoanRequest` | `201 { data: EquipmentLoanDTO }` | 0009 |
| GET | `/api/v1/prestamos-equipamiento` | query: `?memberId=&status=` | `200 { data: EquipmentLoanDetailDTO[] }` | 0024 |
| GET | `/api/v1/prestamos-equipamiento/:id` | — | `200 { data: EquipmentLoanDetailDTO }` | 0024 |
| PUT | `/api/v1/prestamos-equipamiento/:id/return` | `ReturnRequest` | `200 { data: EquipmentLoanDTO }` | 0017 |
| PUT | `/api/v1/prestamos-equipamiento/:id/report-lost` | — | `200 { data: EquipmentLoanDTO }` | 0017 |
| DELETE | `/api/v1/prestamos-equipamiento/:id` | — | `204` | 0018 |

### Requirement: Reglas de negocio EquipmentLoan

1. **Categoría deportiva**: Solo socios con `sportCategory = Senior` o `Lifetime` pueden recibir préstamos
2. **Categoría requerida**: El socio DEBE tener `sportCategory` asignada
3. **Transición de estados**: Solo `Active → Returned` o `Active → Lost`
4. **Inmutabilidad**: Un préstamo `Returned` o `Lost` NO puede volver a `Active`
5. **Eliminación**: Solo se permite si `status = Returned` o `Lost`

#### Scenario: Devolver préstamo activo

- GIVEN un préstamo con `status: Active`
- WHEN se llama a `PUT /api/v1/prestamos-equipamiento/:id/return`
- THEN retorna `200 { data: EquipmentLoanDTO }`
- AND `status` cambia a `Returned`
- AND se registra `returnDate`

#### Scenario: Reportar préstamo como perdido

- GIVEN un préstamo con `status: Active`
- WHEN se llama a `PUT /api/v1/prestamos-equipamiento/:id/report-lost`
- THEN retorna `200 { data: EquipmentLoanDTO }`
- AND `status` cambia a `Lost`

#### Scenario: Eliminar préstamo devuelto

- GIVEN un préstamo con `status: Returned`
- WHEN se llama a `DELETE /api/v1/prestamos-equipamiento/:id`
- THEN retorna `204 No Content`

#### Scenario: No se puede eliminar préstamo activo

- GIVEN un préstamo con `status: Active`
- WHEN se llama a `DELETE /api/v1/prestamos-equipamiento/:id`
- THEN retorna `400 Bad Request` con mensaje "No se puede eliminar un préstamo activo"

### Requirement: Errores EquipmentLoan

| Escenario | HTTP | Mensaje |
|-----------|------|---------|
| Socio inexistente | 404 | "El socio no existe" |
| Socio sin categoría deportiva | 400 | "El socio no tiene una categoría deportiva asignada" |
| Socio categoría Cadet | 403 | "Los socios categoría Cadet no pueden solicitar préstamos" |
| Préstamo inexistente | 404 | "El préstamo no existe" |
| Devolver ya devuelto | 400 | "El préstamo ya fue devuelto" |
| Reportar perdido ya perdido | 400 | "El préstamo ya fue reportado como perdido" |
| Eliminar activo | 400 | "No se puede eliminar un préstamo activo" |
