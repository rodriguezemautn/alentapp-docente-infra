---
id: 0026
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Reporte de Ingresos
---

# TDD-0026: Reporte de Ingresos

## Contexto de Negocio (PRD)

### Objetivo

Generar reportes agregados de ingresos por período y tipo de pago. El tesorero necesita conocer el total recaudado en un mes, desglosado por tipo de pago (cuotas, mensualidades, inscripciones), para la rendición de cuentas.

### User Persona

- **Nombre**: Alberto (Tesorero/Administrativo).
- **Necesidad**: Ver cuánto se recaudó en total este mes, comparar con el mes anterior, y desglosar por tipo de pago para la auditoría.

### Criterios de Aceptación

- El sistema debe devolver el total recaudado en un rango de fechas.
- El sistema debe desglosar por `paymentType` (Cuota, Mensualidad, Inscripción, Otro).
- El sistema debe excluir del total los pagos cancelados.
- El sistema debe permitir agrupar por día, mes o año.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

```ts
// GET /api/v1/reportes/ingresos?from=&to=&groupBy=day|month|year

export interface IncomeReportItem {
    period: string;       // "2026-05" o "2026-05-15" según groupBy
    total: number;
    byType: {
        Cuota: number;
        Mensualidad: number;
        Inscripcion: number;
        Otro: number;
    };
    canceledCount: number;
}

export interface IncomeReportResponse {
    from: string;
    to: string;
    grandTotal: number;
    items: IncomeReportItem[];
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `PaymentRepository` (Método `getIncomeReport(from, to, groupBy)`).
2. **Servicio de Dominio**: `ReportValidator` (Valida que las fechas sean coherentes).
3. **Caso de Uso**: `GetIncomeReportUseCase` (Consulta y agrega datos).
4. **Adaptador de Entrada**: Nuevo `ReportController` o extensión de `PaymentController`.

## Casos de Borde y Errores

| Escenario                                    | Resultado Esperado                                           | Código HTTP |
|----------------------------------------------|--------------------------------------------------------------|-------------|
| Rango sin pagos                              | Reporte con total 0 e items vacío                            | 200 OK |
| Fecha from > to                              | Mensaje: "La fecha desde no puede ser posterior a la fecha hasta" | 400 Bad Request |
| groupBy inválido                             | Mensaje: "Agrupación no válida. Use: day, month o year"      | 400 Bad Request |
| Error de conexión a DB                       | Mensaje: "Error interno"                                     | 500 |

## Plan de Implementación

1. Implementar consulta agregada en `PostgresPaymentRepository` usando `groupBy` de Prisma + raw query si es necesario.
2. Implementar `GetIncomeReportUseCase`.
3. Crear ruta `GET /api/v1/reportes/ingresos` en controlador.
4. En el frontend, crear vista de reporte con selector de fechas y gráfico de barras simple.
