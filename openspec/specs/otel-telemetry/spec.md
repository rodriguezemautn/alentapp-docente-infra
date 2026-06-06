# OpenTelemetry Telemetry Specification

## Purpose

Define la integración de OpenTelemetry en la API para capturar métricas RED automáticas y custom, exportadas via PrometheusExporter en puerto 9464. SIN duplicar métricas con fastify-metrics.

## Requirements

### Requirement: Inicialización OTel

El sistema MUST inicializar OpenTelemetry SDK en `packages/api/src/infrastructure/telemetry.ts` con auto-instrumentaciones para HTTP y Fastify, y PrometheusExporter en `:9464/metrics`.

#### Scenario: Telemetría inicializada correctamente

- GIVEN la API corriendo en producción
- WHEN `curl http://localhost:9464/metrics`
- THEN retorna métricas de auto-instrumentación (http_server_duration_count, etc.)
- AND NO hay métricas duplicadas con fastify-metrics en `:3000/metrics`

### Requirement: Métricas RED custom

El sistema MUST crear métricas RED via OpenTelemetry Meter: `http.requests.total` (Counter), `http.requests.errors` (Counter), `http.request.duration` (Histogram). Cada una con labels `method`, `route`, `status`.

#### Scenario: Métricas RED generadas con tráfico

- GIVEN la API recibe requests a `/api/v1/socios`
- WHEN `curl http://localhost:9464/metrics`
- THEN aparece `http_requests_total{method="GET",route="/api/v1/socios",status="200"}`
- AND `http_request_duration` tiene registros en buckets

### Requirement: Sin duplicación con fastify-metrics

El sistema MUST deshabilitar `fastify-metrics` (plugin de `packages/api/src/app.ts`) cuando OpenTelemetry está activo.

#### Scenario: Un solo endpoint de métricas

- GIVEN OpenTelemetry activo
- WHEN `curl http://localhost:3000/metrics`
- THEN retorna 404 o información de que no existe
- AND solo `:9464/metrics` expone métricas

### Requirement: Métricas de proceso

El sistema MUST exponer `process.memory.usage` (Gauge) y `http.requests.active` (Gauge) como métricas complementarias.

#### Scenario: Métricas de proceso visibles

- GIVEN la API corriendo
- WHEN `curl http://localhost:9464/metrics | grep process_memory`
- THEN retorna valores numéricos de uso de memoria
