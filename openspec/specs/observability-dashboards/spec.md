# Observability Dashboards Specification

## Purpose

Define 4 dashboards de Grafana (RED, USE, Negocio, Frontend) que cubran observabilidad profesional: rendimiento API, infraestructura, métricas de dominio y experiencia de usuario.

## Requirements

### Requirement: Dashboard RED API

El sistema MUST tener un dashboard "RED — Alentapp API" con 6 paneles: requests/s, error rate %, latencia p95/p99, status codes por segundo, memoria del proceso, top 5 endpoints lentos. Fuente: Prometheus (OTel `:9464`).

#### Scenario: Dashboard RED funcional

- GIVEN Grafana apunta al datasource Prometheus
- WHEN se navega al dashboard "RED — Alentapp API"
- THEN se ven 6 paneles con datos de las últimas 6h
- AND los gráficos responden a tráfico generado

### Requirement: Dashboard USE Infraestructura

El sistema MUST tener un dashboard "USE — Infraestructura" con paneles de CPU (utilization), memoria (utilization), disco (I/O), red (bytes in/out), tiempo de actividad del contenedor. Fuente: cadvisor + node-exporter.

#### Scenario: Dashboard USE con datos

- GIVEN cadvisor y node-exporter corriendo como sidecars
- WHEN se navega al dashboard "USE — Infraestructura"
- THEN muestra CPU/memoria/disco/red de cada contenedor
- AND los paneles se actualizan cada 15s

### Requirement: Dashboard Negocio

El sistema MUST tener un dashboard "Business — Alentapp" con paneles de: miembros activos (Gauge), préstamos activos (Gauge), ingresos del día (Gauge), ocupación de casilleros % (Gauge), payments por tipo (Pie chart), nuevos miembros/semana (Bar chart).

#### Scenario: Dashboard negocio con datos reales

- GIVEN la API expone métricas de negocio via OTel custom
- WHEN se navega al dashboard "Business — Alentapp"
- THEN muestra indicadores del dominio actualizados
- AND los valores reflejan el estado actual de la DB

### Requirement: Dashboard Frontend UX

El sistema SHOULD tener un dashboard "UX — Frontend" con paneles de: tiempo de carga de página (Histogram), errores de consola/client (Counter), Core Web Vitals simulados (LCP, CLS, INP), satisfacción de usuario (CSAT simulado).

#### Scenario: Dashboard frontend informativo

- GIVEN el frontend envía métricas de rendimiento
- WHEN se navega al dashboard "UX — Frontend"
- THEN muestra indicadores de experiencia de usuario
- AND permite identificar degradaciones de rendimiento

### Requirement: Dashboards provisionados como JSON

Todos los dashboards MUST estar definidos como JSON en `observability/grafana/dashboards/` para cargarse automáticamente vía provisioning.

#### Scenario: Dashboards cargan automáticamente

- GIVEN Grafana se inicia con provisioning
- WHEN se listan los dashboards en la UI de Grafana
- THEN aparecen los 4 dashboards sin configuración manual
