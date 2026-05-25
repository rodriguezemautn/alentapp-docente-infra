# Especificación de Discipline

## Propósito

La entidad Discipline representa las divisiones o variantes específicas dentro de cada deporte. Por ejemplo, "Fútbol Infantil", "Fútbol Femenino" y "Fútbol Senior" son disciplinas del deporte "Fútbol". Cada disciplina tiene su propio rango de fechas, horario y profesor.

## Requisitos Funcionales

### RF-01: Crear Discipline
Crear una disciplina asociada a un deporte existente.
- Éxito → HTTP `201` con `DisciplineDTO`
- Deporte no encontrado → HTTP `404`
- `endDate` anterior o igual a `startDate` → HTTP `400`

### RF-02: Obtener Todas las Disciplinas
Listar todas las disciplinas, filtrable por `sportId`. Incluye el nombre del deporte en los resultados.
- Éxito → HTTP `200` con `DisciplineDetailDTO[]`

### RF-03: Obtener Discipline por ID
Obtener una disciplina por su ID.
- Éxito → HTTP `200` con `DisciplineDetailDTO`
- No encontrada → HTTP `404`

### RF-04: Actualizar Discipline
Actualizar uno o más campos de una disciplina. Revalida las fechas si `startDate` o `endDate` cambiaron.
- Éxito → HTTP `200` con `DisciplineDetailDTO`
- No encontrada → HTTP `404`
- Rango de fechas inválido → HTTP `400`

### RF-05: Eliminar Discipline
Eliminación física (hard delete) de una disciplina.
- Éxito → HTTP `204`
- No encontrada → HTTP `404`

## Reglas de Negocio

| ID | Regla | Obligatoriedad |
|----|-------|----------------|
| RN-01 | `endDate` DEBE ser estrictamente posterior a `startDate` | MUST |
| RN-02 | Una disciplina DEBE pertenecer a un deporte existente | MUST |
| RN-03 | La eliminación es física (hard delete) | MUST |

## Contrato de API

Base: `/api/v1/disciplinas`

| Método | Ruta | Request | Respuesta | Errores |
|--------|------|---------|-----------|---------|
| POST | `/api/v1/disciplinas` | `CreateDisciplineRequest` | `201` `DisciplineDetailDTO` | 400, 404 |
| GET | `/api/v1/disciplinas` | `?sportId=xxx` | `200` `DisciplineDetailDTO[]` | — |
| GET | `/api/v1/disciplinas/:id` | — | `200` `DisciplineDetailDTO` | 404 |
| PUT | `/api/v1/disciplinas/:id` | `UpdateDisciplineRequest` | `200` `DisciplineDetailDTO` | 400, 404 |
| DELETE | `/api/v1/disciplinas/:id` | — | `204` | 404 |

## Definiciones de DTOs

```typescript
// packages/shared/index.ts additions

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

export interface DisciplineDetailDTO extends DisciplineDTO {
  sportName?: string;
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

export interface UpdateDisciplineRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  schedule?: string;
  professor?: string;
}
```
