# Tasks: Actividad 4 Version Pro

## Fase 1: Docker Production

### 1.1 [infra] Optimizar Dockerfile.prod API
- [x] Agregar `--no-cache` en `apk add` para reducir capas
- [x] Reordenar COPY para maximizar cache hits (package*.json antes que código)
- [x] Verificar HEALTHCHECK funciona con `curl` disponible en runtime
- [x] Build y verificar tamaño < 300MB
- [x] Fix: prisma generate en build stage (antes runtime), tsc con tsconfig propio
- [x] Fix: `--ignore-scripts` para deps stage, path output corregido

### 1.2 [infra] Optimizar Dockerfile.prod Web
- [x] Agregar security headers en nginx.conf (X-Frame-Options, X-Content-Type-Options, HSTS)
- [x] Configurar cache de assets estáticos con far-future expires
- [x] Agregar compresión gzip para JS/CSS
- [x] Build y verificar tamaño < 170MB
- [x] Fix: read-only filesystem — remueve entrypoint scripts, parchea nginx.conf para tmpfs

### 1.3 [infra] Hardening docker-compose.prod.yml
- [x] Agregar `tmpfs: /tmp` para API (read_only necesita /tmp)
- [x] Verificar `cap_drop: ALL` + `cap_add: NET_BIND_SERVICE` funciona
- [x] Configurar `logging: json-file` con `max-size: 10m` y `max-file: 3`
- [x] Variables sensibles via `${VARIABLE:?error}` (no defaults hardcodeados) — PASSWORD y DATABASE_URL con `:?error`. POSTGRES_USER/DB y VITE_API_URL con defaults razonables por UX
- [x] Verificar read-only filesystem (`docker exec ... touch /test` falla)
- [x] Fix: puerto 80→8080 (conflicto host), tmpfs con tamanos explicitos

## Fase 2: OpenTelemetry

### 2.1 [api] Crear infrastructure/telemetry.ts
- [x] Instalar dependencias OTel: `@opentelemetry/sdk-node`, `@opentelemetry/auto-instrumentations-node`, `@opentelemetry/exporter-prometheus`
- [x] Crear archivo con NodeSDK + PrometheusExporter en puerto 9464
- [x] Agregar auto-instrumentaciones HTTP + Fastify
- [x] Crear función `createREDMetrics()` con Counter/Histogram
- [x] Agregar métricas de proceso (memory usage, active requests)
- [x] Agregar métricas de negocio (business.members.active, loans, lockers, revenue)

### 2.2 [api] Inicializar OTel en app.ts
- [x] Agregar `import './infrastructure/telemetry.js'` al inicio de app.ts
- [x] Deshabilitar plugin `fastify-metrics` (o condicional con flag de entorno)
- [x] Verificar que `:9464/metrics` funciona y `:3000/metrics` no duplica
- [x] Fix: type assertion para fastify-metrics, deteccion app.js en runtime

## Fase 3: Dashboards

### 3.1 [infra] Dashboard RED API
- [x] Crear `observability/grafana/dashboards/alentapp-red.json` con 7 paneles
- [x] Datasource Prometheus apuntando a OTel :9464
- [x] Paneles: requests/s, error rate %, latencia p95/p99, requests activos, memoria, status codes (fastify-metrics)
- [x] Fix: metric names actualizados a nomenclatura OTel (dots→underscores)

### 3.2 [infra] Dashboard USE Infraestructura
- [x] Crear `observability/grafana/dashboards/alentapp-use.json` con 8 paneles
- [x] cAdvisor + node-exporter ya en docker-compose.obs.yml
- [x] Paneles: CPU (contenedores + host), memoria (contenedores + host), red RX/TX, uptime, filesystem

### 3.3 [infra] Dashboard Negocio
- [x] Crear `observability/grafana/dashboards/alentapp-business.json` con 5 paneles
- [x] Métricas de negocio implementadas en telemetry.ts
- [x] Paneles: miembros activos, préstamos activos, ingresos/día, ocupación casilleros, resumen ejecutivo

### 3.4 [infra] Dashboard Frontend UX
- [x] Crear `observability/grafana/dashboards/alentapp-ux.json` con 7 paneles
- [x] Paneles: latencia API (p50/p95/p99), tasa error cliente, Core Web Vitals simulados (LCP/INP/CLS), disponibilidad, top endpoints lentos

## Fase 4: Alertas

### 4.1 [infra] Reglas de alerta Prometheus
- [x] Crear `observability/prometheus/rules/alert-rules.yml`
- [x] Regla: API Down (absent(http_requests_total) > 1m) — CRITICAL
- [x] Regla: High Error Rate (rate > 5% en 5m) — WARNING
- [x] Regla: High Latency (p99 > 2s en 5m) — WARNING
- [x] Regla: High Memory (> 80% en 5m) — WARNING
- [x] Regla: ContainerDown — CRITICAL

### 4.2 [infra] Alertmanager + Contact Points
- [x] Alertmanager en docker-compose.obs.yml
- [x] Crear `observability/alertmanager/alertmanager.yml` con Slack + email configs
- [x] Volume mount de config en docker-compose.obs.yml (faltaba)

## Fase 5: Enunciado V2

### 5.1 [docs] Reescribir Actividad 4 V2
- [x] Corregir inconsistencia métricas custom vs auto-instrumentación
- [x] Rediseñar Fase 3: Docker production (multi-stage, hardening, verificación)
- [x] Rediseñar Fase 4: Observabilidad profesional (OTel, dashboards RED/USE/negocio/UX)
- [x] Agregar Fase 4.b: Alertas (Prometheus rules + Grafana)
- [x] Actualizar Fase 5: Verificación con checklist expandido
- [x] Actualizar entregables, criterios de evaluación y referencias
