# Tasks: Actividad 4 Version Pro

## Fase 1: Docker Production

### 1.1 [infra] Optimizar Dockerfile.prod API
- [ ] Agregar `--no-cache` en `apk add` para reducir capas
- [ ] Reordenar COPY para maximizar cache hits (package*.json antes que código)
- [ ] Verificar HEALTHCHECK funciona con `curl` disponible en runtime
- [ ] Build y verificar tamaño < 300MB

### 1.2 [infra] Optimizar Dockerfile.prod Web
- [ ] Agregar security headers en nginx.conf (X-Frame-Options, X-Content-Type-Options, HSTS)
- [ ] Configurar cache de assets estáticos con far-future expires
- [ ] Agregar compresión gzip para JS/CSS
- [ ] Build y verificar tamaño < 170MB

### 1.3 [infra] Hardening docker-compose.prod.yml
- [ ] Agregar `tmpfs: /tmp` para API (read_only necesita /tmp)
- [ ] Verificar `cap_drop: ALL` + `cap_add: NET_BIND_SERVICE` funciona
- [ ] Configurar `logging: json-file` con `max-size: 10m` y `max-file: 3`
- [ ] Variables sensibles via `${VARIABLE:?error}` (no defaults hardcodeados)
- [ ] Verificar read-only filesystem (`docker exec ... touch /test` falla)

## Fase 2: OpenTelemetry

### 2.1 [api] Crear infrastructure/telemetry.ts
- [ ] Instalar dependencias OTel: `@opentelemetry/sdk-node`, `@opentelemetry/auto-instrumentations-node`, `@opentelemetry/exporter-prometheus`
- [ ] Crear archivo con NodeSDK + PrometheusExporter en puerto 9464
- [ ] Agregar auto-instrumentaciones HTTP + Fastify
- [ ] Crear función `createREDMetrics()` con Counter/Histogram
- [ ] Agregar métricas de proceso (memory usage, active requests)

### 2.2 [api] Inicializar OTel en app.ts
- [ ] Agregar `import './infrastructure/telemetry.js'` al inicio de app.ts
- [ ] Deshabilitar plugin `fastify-metrics` (o condicional con flag de entorno)
- [ ] Verificar que `:9464/metrics` funciona y `:3000/metrics` no duplica

## Fase 3: Dashboards

### 3.1 [infra] Dashboard RED API
- [ ] Crear `observability/grafana/dashboards/red-metrics.json` con 6 paneles
- [ ] Datasource Prometheus apuntando a OTel :9464
- [ ] Paneles: requests/s, error rate %, latencia p95/p99, status codes, memoria, top endpoints lentos

### 3.2 [infra] Dashboard USE Infraestructura
- [ ] Crear `observability/grafana/dashboards/use-infra.json`
- [ ] Agregar cadvisor + node-exporter a docker-compose.obs.yml
- [ ] Paneles: CPU utilization, memory utilization, disk I/O, network bytes, uptime

### 3.3 [infra] Dashboard Negocio
- [ ] Crear `observability/grafana/dashboards/business.json`
- [ ] Implementar métricas de negocio en telemetry.ts (opcional - para referencia docente)
- [ ] Paneles: miembros activos, préstamos activos, ingresos/día, ocupación casilleros

### 3.4 [infra] Dashboard Frontend UX
- [ ] Crear `observability/grafana/dashboards/ux-frontend.json`
- [ ] Paneles: tiempo de carga, errores de cliente, Core Web Vitals simulados

## Fase 4: Alertas

### 4.1 [infra] Reglas de alerta Prometheus
- [ ] Crear `observability/prometheus/rules/alert-rules.yml`
- [ ] Regla: API Down (absent(http_requests_total) > 1m) — CRITICAL
- [ ] Regla: High Error Rate (rate > 5% en 5m) — WARNING
- [ ] Regla: High Latency (p99 > 2s en 5m) — WARNING
- [ ] Regla: High Memory (> 80% en 5m) — WARNING
- [ ] Regla: High CPU (> 80% en 5m) — WARNING

### 4.2 [infra] Alertmanager + Contact Points
- [ ] Agregar Alertmanager a docker-compose.obs.yml
- [ ] Configurar contact point por defecto en Grafana (email/webhook)

## Fase 5: Enunciado V2

### 5.1 [docs] Reescribir Actividad 4 V2
- [ ] Corregir inconsistencia métricas custom vs auto-instrumentación
- [ ] Rediseñar Fase 3: Docker production (multi-stage, hardening, verificación)
- [ ] Rediseñar Fase 4: Observabilidad profesional (OTel, dashboards RED/USE/negocio/UX)
- [ ] Agregar Fase 4.b: Alertas (Prometheus rules + Grafana)
- [ ] Actualizar Fase 5: Verificación con checklist expandido
- [ ] Actualizar entregables, criterios de evaluación y referencias
