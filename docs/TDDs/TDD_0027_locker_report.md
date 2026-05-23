---
id: 0027
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Reporte de Estado de Casilleros
---

# TDD-0027: Reporte de Estado de Casilleros

## Contexto de Negocio (PRD)

### Objetivo

Generar un reporte del estado actual de los casilleros del club: cuántos están disponibles, ocupados y en mantenimiento. El administrativo necesita esta información para tomar decisiones de mantenimiento y planificar nuevas adquisiciones.

### User Persona

- **Nombre**: Martín (Administrativo de instalaciones).
- **Necesidad**: Saber de un vistazo la ocupación actual de casilleros para decidir si hacen falta más o si hay muchos fuera de servicio.

### Criterios de Aceptación

- El sistema debe devolver el conteo de casilleros agrupado por estado.
- El sistema debe devolver el porcentaje de ocupación.
- El sistema debe permitir ver el detalle de casilleros en cada estado.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

```ts
// GET /api/v1/reportes/casilleros

export interface LockerReportResponse {
    total: number;
    available: number;
    occupied: number;
    maintenance: number;
    occupancyRate: number;  // porcentaje (0-100)
    details: {
        available: LockerDTO[];
        occupied: LockerDetailDTO[];
        maintenance: LockerDTO[];
    };
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `LockerRepository` (Método `getStatusReport()`).
2. **Caso de Uso**: `GetLockerReportUseCase`.
3. **Adaptador de Entrada**: Nuevo `ReportController` o extensión de `LockerController`.

## Casos de Borde y Errores

| Escenario                                    | Resultado Esperado                                           | Código HTTP |
|----------------------------------------------|--------------------------------------------------------------|-------------|
| Sin casilleros registrados                   | Reporte con total 0, todos los contadores en 0               | 200 OK |
| Todos los casilleros ocupados                | occupancyRate = 100                                          | 200 OK |
| Todos disponibles                            | occupancyRate = 0                                            | 200 OK |

## Plan de Implementación

1. Implementar consulta agregada en `PostgresLockerRepository`.
2. Implementar `GetLockerReportUseCase`.
3. Crear ruta `GET /api/v1/reportes/casilleros`.
4. En el frontend, mostrar gráfico de torta con distribución de estados.
