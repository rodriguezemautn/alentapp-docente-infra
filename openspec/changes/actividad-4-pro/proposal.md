# Proposal: Actividad 4 Version Pro

## Intent

La Actividad 4 actual tiene inconsistencias (métricas custom vs auto-instrumentación, solo RED, sin USE/negocio/frontend/alertas). Necesitamos una versión mejorada que cubra observabilidad profesional completa y Docker con mejores prácticas de industria.

## Scope

### In Scope
- Dockerfile multi-stage con optimización de capas y seguridad (node:22-alpine, no-root, healthchecks)
- docker-compose.prod.yml con hardening completo (read-only, cap_drop, tmpfs, secrets, resource limits)
- Telemetría OpenTelemetry con métricas RED automáticas (auto-instrumentación + custom)
- Dashboard RED: Rate/Errors/Duration con latencia p95/p99 por endpoint
- Dashboard USE: CPU, memoria, disco, red del contenedor (cadvisor + node-exporter)
- Dashboard Negocio: miembros activos, préstamos vigentes, ingresos diarios, ocupación
- Dashboard Frontend: Core Web Vitals (LCP, CLS, INP), errores de cliente, tiempo de carga
- Alertas: umbrales críticos en Prometheus + contacto en Grafana
- Enunciado actualizado de Actividad 4 que integre todo lo anterior

### Out of Scope
- Logging centralizado con Loki (queda para otra iteración)
- Tracing distribuido completo (queda para otra iteración)
- Dashboard de synthetic monitoring (RUM)
- Cost optimization multi-cloud

## Capabilities

### New Capabilities
- `docker-production`: Dockerfile multi-stage, docker-compose.prod con hardening, seguridad y optimización
- `otel-telemetry`: OpenTelemetry SDK + auto-instrumentación + métricas RED custom
- `observability-dashboards`: Dashboards RED, USE, negocio, frontend en Grafana
- `alerting`: Alertas Prometheus + Grafana con umbrales definidos
- `actividad-enunciado`: Enunciado V2 de la Actividad 4 integrando todo lo anterior

### Modified Capabilities
- None (primera versión de specs)

## Approach

1. Docker: optimizar Dockerfile.prod existentes (cache layers, .dockerignore), docker-compose.prod con tmpfs, cap_drop, secrets via .env
2. Telemetría: crear `infrastructure/telemetry.ts` con OTel SDK, auto-instrumentación HTTP/Fastify, PrometheusExporter en :9464. NO duplicar con fastify-metrics.
3. Dashboards: 4 dashboards en Grafana (RED, USE, Negocio, Frontend) como JSON provisionados
4. Alertas: reglas Prometheus para umbrales críticos, contact points en Grafana
5. Enunciado: reescribir Actividad 4 integrando todos los cambios anteriores

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/api/src/infrastructure/telemetry.ts` | New | SDK OpenTelemetry + métricas RED |
| `packages/api/Dockerfile.prod` | Modify | Optimizar cache layers, seguridad |
| `packages/web/Dockerfile.prod` | Modify | Optimizar build, nginx security headers |
| `docker-compose.prod.yml` | Modify | Hardening completo + tmpfs |
| `docker-compose.yml` | Modify | Secrets via .env, resource limits |
| `observability/prometheus/prometheus.yml` | Modify | Agregar jobs OTel, cadvisor, node-exporter |
| `observability/grafana/dashboards/` | New | 4 dashboards JSON provisionados |
| `observability/prometheus/rules/` | New | Reglas de alerta |
| `docs/actividades-trabajo-practico/...` | Modify | Enunciado V2 de Actividad 4 |
| `docs/produccion/` | New | Documentos de soporte |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Breaking cambios en docker-compose.prod.yml | Baja | Probar con docker compose up antes de publicar |
| Dashboards no cargan en Grafana provisionado | Media | Usar dashboard UIDs fijos, validar JSON schema |
| OpenTelemetry rompe auto-instrumentación | Baja | Test con API primero en desarrollo |

## Rollback Plan

Revert commits de Docker, telemetría, dashboards. El enunciado V2 se versiona aparte.

## Success Criteria

- [ ] `docker build -f packages/api/Dockerfile.prod` produce imagen < 300MB
- [ ] `docker build -f packages/web/Dockerfile.prod` produce imagen < 170MB
- [ ] `telemetry.ts` exporta métricas en `:9464/metrics`
- [ ] 4 dashboards de Grafana cargados y funcionales con datos reales
- [ ] Alertas de Prometheus evaluando correctamente
- [ ] Enunciado V2 sin inconsistencias y con todos los cambios integrados
