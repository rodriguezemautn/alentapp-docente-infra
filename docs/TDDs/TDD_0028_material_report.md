---
id: 0028
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Reporte de Material Deportivo
---

# TDD-0028: Reporte de Material Deportivo

## Contexto de Negocio (PRD)

### Objetivo

Generar reportes del estado del material deportivo: qué material está actualmente prestado, qué material se perdió, y el historial de préstamos por período. El encargado necesita saber qué material falta recuperar y cuánto se perdió en un período.

### User Persona

- **Nombre**: Roberto (Encargado del depósito de material).
- **Necesidad**: Saber cuántos préstamos están activos, qué material se perdió este mes, y el socio con más préstamos.

### Criterios de Aceptación

- El sistema debe devolver el conteo de préstamos por estado (Active, Returned, Lost).
- El sistema debe listar los préstamos activos con el socio y el material.
- El sistema debe listar el material perdido en un período.
- El sistema debe devolver el socio con más préstamos activos (opcional).

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

```ts
// GET /api/v1/reportes/material

export interface MaterialReportResponse {
    totalLoans: number;
    byStatus: {
        active: number;
        returned: number;
        lost: number;
    };
    activeLoans: EquipmentLoanDetailDTO[];
    lostItems: EquipmentLoanDetailDTO[];
    topMember?: {
        memberId: string;
        memberName: string;
        activeLoans: number;
    };
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `EquipmentLoanRepository` (Método `getMaterialReport()`).
2. **Caso de Uso**: `GetMaterialReportUseCase`.
3. **Adaptador de Entrada**: ReportController.

## Casos de Borde y Errores

| Escenario                                    | Resultado Esperado                                           | Código HTTP |
|----------------------------------------------|--------------------------------------------------------------|-------------|
| Sin préstamos registrados                    | Reporte con total 0, todos los contadores en 0               | 200 OK |
| Sin material perdido                         | lostItems vacío                                              | 200 OK |
| Sin préstamos activos                        | activeLoans vacío, topMember = null                          | 200 OK |

## Plan de Implementación

1. Implementar consulta agregada en `PostgresEquipmentLoanRepository`.
2. Implementar `GetMaterialReportUseCase`.
3. Crear ruta `GET /api/v1/reportes/material`.
4. En el frontend, mostrar resumen con tarjetas y listas desplegables.
