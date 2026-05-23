---
id: 0030
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Reporte de Socios
---

# TDD-0030: Reporte de Socios

## Contexto de Negocio (PRD)

### Objetivo

Generar estadísticas agregadas sobre los socios del club: cantidad total, distribución por categoría, por estado, y socios inactivos/morosos. La administración necesita esta información para la toma de decisiones.

### User Persona

- **Nombre**: Alberto (Tesorero/Administrativo).
- **Necesidad**: Saber cuántos socios hay en cada categoría, cuántos están morosos, y ver la evolución de altas en el último año.

### Criterios de Aceptación

- El sistema debe devolver el total de socios registrados.
- El sistema debe desglosar por `category` y por `status`.
- El sistema debe devolver la cantidad de altas en los últimos 12 meses (agrupado por mes).
- El sistema debe calcular el porcentaje de morosidad.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

```ts
// GET /api/v1/reportes/socios

export interface MemberReportResponse {
    total: number;
    byCategory: {
        Pleno: number;
        Cadete: number;
        Honorario: number;
    };
    byStatus: {
        Activo: number;
        Moroso: number;
        Suspendido: number;
    };
    delinquencyRate: number;  // porcentaje de morosos (0-100)
    monthlyRegistrations: {
        month: string;    // "2026-01"
        count: number;
    }[];
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `MemberRepository` (Método `getMemberReport()`).
2. **Caso de Uso**: `GetMemberReportUseCase`.
3. **Adaptador de Entrada**: ReportController.

## Casos de Borde y Errores

| Escenario                                    | Resultado Esperado                                           | Código HTTP |
|----------------------------------------------|--------------------------------------------------------------|-------------|
| Sin socios registrados                       | Reporte con total 0, todos los contadores en 0               | 200 OK |
| Sin socios morosos                           | delinquencyRate = 0                                          | 200 OK |
| Sin altas en el último mes                   | monthlyRegistrations incluye mes con count = 0               | 200 OK |

## Plan de Implementación

1. Implementar consulta agregada en `PostgresMemberRepository` (groupBy de categoría, estado, y agrupación mensual de created_at).
2. Implementar `GetMemberReportUseCase`.
3. Crear ruta `GET /api/v1/reportes/socios`.
4. En el frontend, crear vista de dashboard con indicadores y gráficos.
