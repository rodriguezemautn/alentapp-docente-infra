# Actividad Enunciado Specification

## Purpose

Define el enunciado V2 de la Actividad 4 "Preparando para Producción" que integra Docker optimizado, OpenTelemetry, dashboards profesionales (RED/USE/negocio/frontend) y alertas.

## Requirements

### Requirement: Estructura del enunciado V2

El enunciado V2 MUST organizarse en 5 fases secuenciales: (1) Análisis, (2) Diseño, (3) Docker, (4) Observabilidad, (5) Verificación. Debe corregir la inconsistencia métricas custom vs auto-instrumentación presente en V1.

#### Scenario: Enunciado sin inconsistencias

- GIVEN un alumno lee el enunciado V2
- WHEN compara las métricas definidas en Fase 2 con las consultas PromQL en Fase 4
- THEN NO hay contradicción entre métricas custom y auto-instrumentación

### Requirement: Fase de Docker (Fase 3)

La Fase 3 MUST cubrir: multi-stage builds (API + Web), docker-compose.prod.yml con hardening, optimización de cache de capas, .dockerignore completo, verificación de seguridad (no-root, read-only, cap_drop).

#### Scenario: Alumno completa Docker

- GIVEN un alumno sigue la Fase 3
- WHEN ejecuta `docker build -f packages/api/Dockerfile.prod -t alentapp-api:prod .`
- THEN la imagen pesa < 300MB
- AND verifica que `which tsc` falla dentro del contenedor

### Requirement: Fase de Observabilidad (Fase 4)

La Fase 4 MUST cubrir: OpenTelemetry SDK + auto-instrumentación, métricas RED automáticas, dashboard RED Grafana, dashboard USE con cadvisor, dashboard Negocio con métricas del dominio, dashboard Frontend UX, alertas Prometheus.

#### Scenario: Alumno completa observabilidad

- GIVEN un alumno sigue la Fase 4
- WHEN configura OTel y genera tráfico
- THEN los 4 dashboards muestran datos en Grafana
- AND las alertas se disparan al superar umbrales

### Requirement: Criterios de evaluación V2

El enunciado V2 MUST actualizar la tabla de puntajes para reflejar las nuevas fases, con mínimo 100 pts distribuidos equitativamente entre Docker, Observabilidad y Verificación.

#### Scenario: Evaluación balanceada

- GIVEN un alumno revisa los criterios de evaluación
- WHEN suma los puntajes máximos de todas las fases
- THEN el total es 100 pts
- AND Docker y Observabilidad tienen peso similar (~40 pts cada uno)
