# Design: Actividad 4 Version Pro

## Technical Approach

Arquitectura de observabilidad 360° con 4 capas: (1) Docker optimizado y seguro como base, (2) OpenTelemetry como collector de métricas unificado, (3) Prometheus como backend de métricas, (4) Grafana con 4 dashboards provisionados. Alertas via Prometheus rules + Alertmanager.

## Architecture Decisions

### Decision: OTel PrometheusExporter en lugar de fastify-metrics

**Choice**: Reemplazar `fastify-metrics` (plugin Express-style) por OpenTelemetry SDK con PrometheusExporter
**Alternatives**: Mantener ambos, usar solo fastify-metrics
**Rationale**: OTel es estándar de la industria, permite migrar a OTLP luego, Evita duplicación de métricas. fastify-metrics se deshabilita.

### Decision: Dashboards provisionados como JSON

**Choice**: 4 dashboards Grafana como JSON en `observability/grafana/dashboards/`
**Alternatives**: Dashboards creados manualmente en UI, generados por API
**Rationale**: Versionado, reproducible, los alumnos los importan sin esfuerzo manual

### Decision: cadvisor + node-exporter para métricas USE

**Choice**: Agregar cadvisor (métricas de contenedor) y node-exporter (métricas de host) al stack
**Alternatives**: Usar solo métricas de Docker stats, usar cAdvisor standalone
**Rationale**: cadvisor da métricas precisas de CPU/memoria por contenedor, node-exporter da métricas del host

### Decision: Métricas de negocio via OTel custom

**Choice**: Agregar métricas de dominio (miembros activos, préstamos, ingresos) como Gauge/Counters desde la API
**Alternatives**: Consultar directamente a la DB desde Grafana
**Rationale**: Mantiene consistencia con el stack de métricas, no expone DB directamente

## Data Flow

```
                         ┌────────────────────────────┐
                         │      OpenTelemetry SDK     │
                         │  (auto-instr HTTP/Fastify) │
                         │  + custom RED metrics      │
                         │  + custom business metrics │
                         └──────────┬─────────────────┘
                                    │ :9464/metrics
                                    ▼
┌──────────────┐    ┌──────────────────────────────┐    ┌──────────────┐
│  cadvisor    │───►│         Prometheus           │◄───│ node-exporter│
│  :8080       │    │  + Alertmanager               │    │  :9100       │
└──────────────┘    │  + rules/                     │    └──────────────┘
                    └──────────┬───────────────────┘
                               │ datasource
                               ▼
                    ┌──────────────────────────────┐
                    │           Grafana             │
                    │  ┌────────────────────────┐   │
                    │  │ RED  │ USE │ Biz │ UX  │   │
                    │  └────────────────────────┘   │
                    │  + Alerting (contact points)   │
                    └──────────────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `packages/api/src/infrastructure/telemetry.ts` | Create | SDK OTel, auto-instrumentación, métricas RED + negocio |
| `packages/api/src/app.ts` | Modify | Importar telemetry, deshabilitar fastify-metrics |
| `packages/api/Dockerfile.prod` | Modify | Optimizar cache layers, --no-cache en apk |
| `packages/web/Dockerfile.prod` | Modify | Agregar security headers nginx, optimizar build |
| `docker-compose.prod.yml` | Modify | tmpfs, cap_drop, secrets via .env, redes |
| `observability/prometheus/prometheus.yml` | Modify | Jobs para OTel, cadvisor, node-exporter |
| `observability/prometheus/rules/alert-rules.yml` | Create | Reglas de alerta para API, latencia, recursos |
| `observability/grafana/dashboards/red-metrics.json` | Create | Dashboard RED API |
| `observability/grafana/dashboards/use-infra.json` | Create | Dashboard USE infraestructura |
| `observability/grafana/dashboards/business.json` | Create | Dashboard negocio |
| `observability/grafana/dashboards/ux-frontend.json` | Create | Dashboard frontend UX |
| `observability/docker-compose.obs.yml` | Modify | Agregar cadvisor, node-exporter, alertmanager |
| `docs/actividades-trabajo-practico/Trabajo Integrador - 2026 - Actividad-4.md` | Modify | Reescribir enunciado V2 |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Metrics creation (telemetry.ts) | Verificar que Meter crea Counters/Histograms |
| Integration | OTel exporta métricas | curl :9464/metrics después de tráfico |
| E2E | Dashboards cargan en Grafana | Verificar provisioning via API de Grafana |

## Open Questions

- [ ] ¿Incluimos `docker-compose.obs.yml` actualizado con cadvisor/node-exporter o lo dejamos como ejercicio para los alumnos?
- [ ] ¿Las métricas de negocio las implementamos nosotros (como referencia) o las dejamos como tarea para los alumnos?
