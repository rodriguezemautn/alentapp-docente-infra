---
schema: spec-driven
phase: spec
status: draft
change: locker-equipment-loan-reports
entidad: EquipmentLoan
tdds: [0009, 0017, 0018, 0024]
---

# Especificación: EquipmentLoan (Préstamos de Equipamiento)

## Modelo de Datos

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

## Endpoints

| Método | Ruta | Body | Response | TDD |
|--------|------|------|----------|-----|
| POST | `/api/v1/prestamos-equipamiento` | `CreateEquipmentLoanRequest` | `201 { data: EquipmentLoanDTO }` | 0009 |
| GET | `/api/v1/prestamos-equipamiento` | query: `?memberId=&status=` | `200 { data: EquipmentLoanDetailDTO[] }` | 0024 |
| GET | `/api/v1/prestamos-equipamiento/:id` | — | `200 { data: EquipmentLoanDetailDTO }` | 0024 |
| PUT | `/api/v1/prestamos-equipamiento/:id/return` | `ReturnRequest` | `200 { data: EquipmentLoanDTO }` | 0017 |
| PUT | `/api/v1/prestamos-equipamiento/:id/report-lost` | — | `200 { data: EquipmentLoanDTO }` | 0017 |
| DELETE | `/api/v1/prestamos-equipamiento/:id` | — | `204` | 0018 |

## Reglas de Negocio

1. **Categoría deportiva**: Solo socios con `sportCategory = Senior` o `Lifetime` pueden recibir préstamos
2. **Categoría requerida**: El socio DEBE tener `sportCategory` asignada
3. **Transición de estados**: Solo `Active → Returned` o `Active → Lost`
4. **Inmutabilidad**: Un préstamo `Returned` o `Lost` NO puede volver a `Active`
5. **Eliminación**: Solo se permite si `status = Returned` o `Lost`

## Errores

| Escenario | HTTP | Mensaje |
|-----------|------|---------|
| Socio inexistente | 404 | "El socio no existe" |
| Socio sin categoría deportiva | 400 | "El socio no tiene una categoría deportiva asignada" |
| Socio categoría Cadet | 403 | "Los socios categoría Cadet no pueden solicitar préstamos" |
| Préstamo inexistente | 404 | "El préstamo no existe" |
| Devolver ya devuelto | 400 | "El préstamo ya fue devuelto" |
| Reportar perdido ya perdido | 400 | "El préstamo ya fue reportado como perdido" |
| Eliminar activo | 400 | "No se puede eliminar un préstamo activo" |
