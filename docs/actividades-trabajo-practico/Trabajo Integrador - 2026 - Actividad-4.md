# Ingeniería y Calidad de Software

2026

TP Integrador - Actividad 4: Preparando para Producción (v2 Profesional)

**Límite de entrega: Domingo 28/06 23:59 hs**

***[IMPORTANTE:]** *Las dudas sobre este TP se realizan en <https://github.com/orgs/frlp-utn-ingsoft/discussions/categories/q-a>.*

***No se contestan dudas por correo electrónico.***

---

## Objetivos

Al finalizar esta actividad, los alumnos serán capaces de:

- ✅ Aplicar buenas prácticas de seguridad y optimización en Docker para entornos productivos
- ✅ Implementar multi-stage builds reduciendo significativamente el tamaño de las imágenes
- ✅ Integrar OpenTelemetry en una aplicación Node.js con auto-instrumentación + métricas RED
- ✅ Construir dashboards profesionales: RED (API), USE (infraestructura), Business (negocio) y UX (frontend)
- ✅ Configurar alertas para detectar anomalías en el sistema
- ✅ Documentar y presentar las decisiones técnicas adoptadas

---

## Estructura de trabajo

Esta actividad se organiza en **5 fases secuenciales**. Cada fase tiene entregables específicos y debe completarse antes de pasar a la siguiente:

```
Fase 1: Analizar y proponer
        ↓
Fase 2: Especificar y diseñar
        ↓
Fase 3: Docker producción
        ↓
Fase 4: Observabilidad profesional
        ↓
Fase 5: Verificar y entregar
```

---

## Fase 1: Analizar y proponer

**Duración estimada**: 2 horas (individual)
**Formato de entrega**: Documento Markdown en `docs/produccion/analisis-{usuario}.md`

### 1.1. Analizar la infraestructura Docker actual

Lean la configuración Docker existente del proyecto:

- `docker-compose.yml` — configuración actual de servicios
- `packages/api/Dockerfile` — Dockerfile actual de la API
- `packages/web/Dockerfile` — Dockerfile actual del frontend

Identifiquen y documenten **5 problemas o vulnerabilidades** respecto a buenas prácticas de producción. Por cada problema:

| Problema | ¿Dónde ocurre? | Impacto | Solución propuesta |
|----------|----------------|---------|-------------------|
| *explicar* | *archivo:línea* | *alto/medio/bajo* | *qué cambiar* |

Algunas áreas a evaluar:

- **Tamaño de imagen**: ¿está usando imágenes base pesadas? ¿hay dependencias innecesarias?
- **Seguridad**: ¿corre como root? ¿tiene capabilities innecesarias? ¿filesystem read-write?
- **Resource management**: ¿hay límites de CPU/memoria? ¿healthchecks?
- **Caché de capas**: ¿están ordenadas para maximizar cache hits?
- **Entorno**: ¿las variables de entorno están hardcodeadas? ¿hay separación dev/prod?

### 1.2. Investigar OpenTelemetry y observabilidad

Lean sobre OpenTelemetry y observabilidad profesional, y respondan en el mismo documento:

1. ¿Qué es OpenTelemetry y cómo se diferencia de Prometheus?
2. Expliquen los **4 pilares** de la observabilidad moderna: métricas, logs, tracing, dashboards. ¿Cuál aborda cada herramienta?
3. ¿Qué son las métricas **RED** (Rate, Errors, Duration)? ¿Para qué sirve cada una?
4. ¿Qué son las métricas **USE** (Utilization, Saturation, Errors)? ¿En qué se diferencian de RED?
5. ¿Qué es el **OTLP** (OpenTelemetry Protocol)? ¿Qué ventaja tiene frente a exportar directamente a Prometheus?
6. ¿Cómo se relacionan OpenTelemetry, Prometheus y Grafana?
7. ¿Qué son los **Core Web Vitals** (LCP, CLS, INP)? ¿Por qué son importantes para medir la experiencia de usuario?

> **Recursos**:
> - [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
> - [RED Method (Tom Wilkie)](https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/)
> - [USE Method (Brendan Gregg)](https://www.brendangregg.com/usemethod.html)
> - [Core Web Vitals](https://web.dev/vitals/)

---

## Fase 2: Especificar y diseñar

**Duración estimada**: 3 horas (grupal)
**Formato de entrega**: Documento Markdown en `docs/produccion/diseno-{grupo}.md`

### 2.1. Diseño de la infraestructura Docker

Especifiquen el diseño de los siguientes archivos. Por cada uno, describan:

- **Propósito**: qué hace y por qué es necesario
- **Estructura**: etapas, capas, secciones
- **Requisitos no funcionales**: tamaño máximo de imagen, tiempo de startup, etc.

#### a) `packages/api/Dockerfile.prod`

Diseñen un multi-stage build con 3 etapas:

| Etapa | Nombre | Base | Propósito |
|-------|--------|------|-----------|
| Stage 1 | `deps` | `node:22-alpine` | Instalar solo dependencias de producción (`npm ci --omit=dev`) |
| Stage 2 | `build` | `node:22-alpine` | Compilar TypeScript a JS (instalar TODAS las deps, incluyendo dev para compilar) |
| Stage 3 | `runtime` | `node:22-alpine` | Solo runtime: JS compilado + node_modules prod + usuario no-root + Prisma generate |

Requisitos:
- Usuario no-root (`appuser`)
- Healthcheck contra `localhost:3000`
- `apk add --no-cache wget` para healthcheck (único paquete del sistema)
- Prisma Client generado en runtime (no en build)
- `.dockerignore` que excluya `node_modules`, `.git`, `dist`, `coverage`

#### b) `packages/web/Dockerfile.prod`

Diseñen un multi-stage build con 3 etapas:

| Etapa | Nombre | Base | Propósito |
|-------|--------|------|-----------|
| Stage 1 | `deps` | `node:22-alpine` | Instalar dependencias de producción |
| Stage 2 | `build` | `node:22-alpine` | Build de Vite (`npm -w packages/web run build` con TODAS las deps) |
| Stage 3 | `runtime` | `nginx:stable-alpine` | Servir archivos estáticos con nginx |

Requisitos:
- Usar **nginx** para servir el frontend (no Node.js en producción)
- Configurar compresión gzip, cache de assets con immutable flag, y security headers
- `server_tokens off` para ocultar versión de nginx
- Healthcheck contra `localhost:80`

#### c) `docker-compose.prod.yml`

Diseñen la configuración de servicios para producción:

| Aspecto | Requisito |
|---------|-----------|
| **Resource limits** | CPU y memoria definidos por servicio, con reservations mínimas |
| **Healthchecks** | Para API (wget :3000), DB (pg_isready) y Web (wget :80) |
| **Seguridad** | `read_only: true`, `tmpfs` para `/tmp` (API) y `/var/run,/var/cache/nginx` (Web), `cap_drop: ALL`, `cap_add: NET_BIND_SERVICE`, `no-new-privileges:true` |
| **Logging** | Driver `json-file` con rotación (`max-size: 10m`, `max-file: 3`) |
| **Red** | Red interna personalizada con nombre (`alentapp-production`) |
| **Secrets** | Variables sensibles desde archivo `.env` con `${VAR:?error}` (sin defaults para credenciales) |

### 2.2. Diseño de la observabilidad

Diseñen la arquitectura de observabilidad de **4 capas**:

```
OTel SDK (:9464) ──► Prometheus ──► Grafana
cadvisor (:8080)  ──►      │       ├── RED API
node-exporter     ──►      │       ├── USE Infra
                           │       ├── Business
                           │       └── UX Frontend
                           │
                     Alertmanager ◄── rules/
```

#### a) Métricas RED (API — OpenTelemetry)

| Métrica | Tipo OTel | Descripción | Labels |
|---------|-----------|-------------|--------|
| **Rate** | Counter | Requests por segundo | `method`, `route`, `status` |
| **Errors** | Counter | Tasa de error (5xx) | `method`, `route`, `status` |
| **Duration** | Histogram | Latencia de requests en ms | `method`, `route` |
| `process.memory.usage` | Gauge | Memoria del proceso | — |
| `http.requests.active` | Gauge | Requests concurrentes | — |

**Importante**: Las métricas RED se obtienen de la **auto-instrumentación de OpenTelemetry** (`http.server.duration.*`), NO se implementan manualmente en cada controller. La auto-instrumentación captura automáticamente HTTP method, route y status code.

#### b) Métricas USE (Infraestructura — cAdvisor + node-exporter)

| Métrica | Fuente | Descripción |
|---------|--------|-------------|
| Container CPU | cAdvisor | % de CPU utilizado por contenedor |
| Container Memory | cAdvisor | Memoria utilizada por contenedor |
| Disk I/O | cAdvisor | Lectura/escritura de disco |
| Network I/O | cAdvisor | Bytes de red por segundo |
| Node CPU | node-exporter | CPU del host |
| Node Memory | node-exporter | Memoria del host |

#### c) Métricas de Negocio (API — Custom OTel)

| Métrica | Tipo | Descripción |
|---------|------|-------------|
| `business.members.active` | Gauge | Socios activos actualmente |
| `business.loans.active` | Gauge | Préstamos activos |
| `business.lockers.occupancy` | Gauge | % ocupación de casilleros |
| `business.revenue.daily` | Counter | Ingresos del día |

#### d) Métricas Frontend (UX)

| Métrica | Descripción |
|---------|-------------|
| Tiempo de carga de página | Latencia de navegación |
| Errores de consola/cliente | Excepciones no capturadas |
| Core Web Vitals (simulados) | LCP, CLS, INP |

#### e) Dashboards en Grafana

Diseñen **4 dashboards**, todos provisionados como JSON:

| Dashboard | Paneles | Fuente de datos |
|-----------|---------|----------------|
| **RED — API** | Requests/s, error rate %, latencia p95/p99, status codes, memoria, top endpoints lentos | Prometheus (OTel :9464) |
| **USE — Infra** | CPU%, memoria%, disk I/O, network I/O, uptime | Prometheus (cAdvisor :8080) |
| **Business** | Miembros activos, préstamos activos, ingresos/día, ocupación casilleros | Prometheus (OTel :9464) |
| **UX — Frontend** | Tiempo de carga, errores cliente, Core Web Vitals | Prometheus (OTel :9464) |

#### f) Alertas

Diseñen reglas de alerta para detectar:

| Alerta | Condición | Severidad |
|--------|-----------|-----------|
| API Down | Sin métricas por > 1m | CRITICAL |
| High Error Rate | Error rate > 5% en 5m | WARNING |
| High Latency | p99 > 2s en 5m | WARNING |
| High Memory | > 400MB en 5m | WARNING |

---

## Fase 3: Docker producción

**Duración estimada**: 4 horas (grupal)
**Formato**: Código en el repositorio, siguiendo workflow feature branch

### 3.1. Dockerfiles multi-stage

Creen los archivos siguiendo el diseño de la Fase 2:

- `packages/api/Dockerfile.prod`
- `packages/web/Dockerfile.prod`

**Verificación**:
```bash
# Build de la API
docker build -f packages/api/Dockerfile.prod -t alentapp-api:prod .

# Build del frontend
docker build -f packages/web/Dockerfile.prod -t alentapp-web:prod .

# Verificar tamaño
docker images alentapp-api:prod alentapp-web:prod

# Verificar que NO tenga herramientas de build
docker run --rm alentapp-api:prod which tsc npm node
# debería mostrar solo node, NO tsc ni npm
```

> **Meta**: API < 300MB (desde ~1GB), Web < 170MB (desde ~570MB) — ~70% de reducción

### 3.2. Docker Compose producción

Creen `docker-compose.prod.yml` con los 3 servicios (api, web, db).

**Verificación**:
```bash
# Iniciar entorno productivo
docker compose -f docker-compose.prod.yml up -d

# Verificar healthchecks
docker compose -f docker-compose.prod.yml ps

# Verificar read-only filesystem
docker exec alentapp-api touch /test  # debe fallar
docker exec alentapp-web touch /test  # debe fallar

# Verificar que no hay herramientas de build
docker exec alentapp-api which tsc  # debe fallar

# Probar endpoints
curl http://localhost:3000/api/v1/socios
curl http://localhost/  # frontend vía nginx
```

---

## Fase 4: Observabilidad profesional

**Duración estimada**: 6 horas (grupal)
**Formato**: Código en el repositorio

### 4.1. Integrar OpenTelemetry en la API

Agreguen OpenTelemetry a la API:

```bash
npm -w packages/api install \
  @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-prometheus \
  @opentelemetry/instrumentation-http
```

#### a) Crear el archivo de inicialización

Creen `packages/api/src/infrastructure/telemetry.ts`:

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { metrics } from '@opentelemetry/api';

const prometheusExporter = new PrometheusExporter({ port: 9464, endpoint: '/metrics' });

const sdk = new NodeSDK({
    metricReader: prometheusExporter,
    instrumentations: [getNodeAutoInstrumentations({ '@opentelemetry/instrumentation-http': {} })],
});

sdk.start();

const meter = metrics.getMeter('alentapp-api');

// Métricas RED via auto-instrumentación (http.server.duration.*)
// Métricas custom de negocio
const activeMembers = meter.createGauge('business.members.active');
const activeLoans = meter.createGauge('business.loans.active');
```

#### b) Inicializar OpenTelemetry en el entrypoint

En `packages/api/src/app.ts`, agregar la inicialización **como PRIMER import**:

```typescript
// PRIMERO: inicializar OpenTelemetry (antes de cualquier otro import)
import './infrastructure/telemetry.js';

// Luego el resto de imports...
```

#### c) Deshabilitar fastify-metrics en producción

Las métricas de OpenTelemetry se exportan en `:9464/metrics`. `fastify-metrics` (plugin que expone en `:3000/metrics`) debe deshabilitarse en producción para evitar duplicación:

```typescript
if (process.env.NODE_ENV !== 'production') {
    server.register(metrics, { endpoint: '/metrics' });
}
```

#### d) Verificar métricas

```bash
# Reconstruir API
docker compose -f docker-compose.prod.yml up -d --build api

# Verificar endpoint OTel
curl http://localhost:9464/metrics | head -30

# Generar tráfico
curl http://localhost:3000/api/v1/socios

# Verificar métricas RED automáticas
curl http://localhost:9464/metrics | grep http_server_duration
```

### 4.2. Configurar Prometheus para OpenTelemetry

Actualicen `observability/prometheus/prometheus.yml` para incluir:

- Job para OTel endpoint (`host.docker.internal:9464`)
- Job para cAdvisor (`host.docker.internal:8080`)
- Job para node-exporter (`host.docker.internal:9100`)
- Reglas de alerta desde `rules/alert-rules.yml`

### 4.3. Stack de observabilidad

Agreguen al `observability/docker-compose.obs.yml`:

- **Prometheus** con montura de reglas de alerta
- **Alertmanager** para gestionar notificaciones
- **Grafana** con dashboards provisionados
- **cAdvisor** para métricas de contenedores
- **node-exporter** para métricas del host

```bash
docker compose -f observability/docker-compose.obs.yml up -d
```

### 4.4. Dashboards en Grafana

Creen **4 dashboards** como JSON en `observability/grafana/dashboards/`:

#### a) Dashboard RED — API (6 paneles)

| Panel | Consulta PromQL de referencia |
|-------|------------------------------|
| Requests/s | `rate(http_server_duration_count[1m])` |
| Error rate % | `sum(rate(http_server_duration_count{status=~"5.."}[1m])) / sum(rate(http_server_duration_count[1m])) * 100` |
| Latencia p95/p99 | `histogram_quantile(0.95, sum(rate(http_server_duration_bucket[5m])) by (le))` |
| Status codes | `sum by (status) (rate(http_server_duration_count[5m]))` |
| Memoria proceso | `process_memory_usage_bytes / 1024 / 1024` |
| Endpoints lentos | `topk(5, avg by (route) (http_server_duration_ms))` |

#### b) Dashboard USE — Infraestructura (5 paneles)

| Panel | Consulta PromQL de referencia |
|-------|------------------------------|
| CPU por contenedor | `rate(container_cpu_usage_seconds_total[1m])` |
| Memoria por contenedor | `container_memory_usage_bytes` |
| Disk I/O | `rate(container_fs_reads_bytes_total[1m])` / `rate(container_fs_writes_bytes_total[1m])` |
| Network I/O | `rate(container_network_receive_bytes_total[1m])` / `rate(container_network_transmit_bytes_total[1m])` |
| Uptime contenedor | `time() - container_start_time_seconds` |

#### c) Dashboard Business — Negocio (5 paneles)

| Panel | Consulta PromQL de referencia |
|-------|------------------------------|
| Miembros activos | `business_members_active` |
| Préstamos activos | `business_loans_active` |
| Ocupación casilleros | `business_lockers_occupancy` |
| Ingresos del día | `rate(business_revenue_daily[1d])` |
| Revenue acumulado | `sum_over_time(business_revenue_daily[7d])` |

#### d) Dashboard UX — Frontend (4 paneles)

| Panel | Consulta PromQL de referencia |
|-------|------------------------------|
| Tiempo de carga | `avg(frontend_page_load_duration_ms)` |
| Errores de cliente | `rate(frontend_client_errors_total[5m])` |
| LCP simulado | `avg(frontend_lcp_ms)` |
| INP simulado | `avg(frontend_inp_ms)` |

> **Tip**: Pueden importar los JSON provistos o crearlos manualmente en la UI de Grafana.

### 4.5. Configurar alertas

Activen las reglas de alerta en `observability/prometheus/rules/alert-rules.yml` y verifiquen que Alertmanager las recibe:

```bash
# Verificar reglas cargadas
curl http://localhost:9090/api/v1/rules

# Verificar alertas activas
curl http://localhost:9090/api/v1/alerts

# Verificar Alertmanager
curl http://localhost:9093/api/v2/alerts
```

---

## Fase 5: Verificar y entregar

**Duración estimada**: 2 horas (grupal)
**Formato**: Documento Markdown en `docs/produccion/informe-{grupo}.md`

### 5.1. Verificación técnica

Completen la siguiente tabla con las métricas obtenidas:

| Métrica | Antes (desarrollo) | Después (producción) | Mejora |
|---------|:------------------:|:--------------------:|:------:|
| Tamaño imagen API | | `< 300MB` | |
| Tamaño imagen Web | | `< 170MB` | |
| Tiempo de startup API | | | |
| Memoria API (idle) | | | |
| Endpoints accesibles | | | |

### 5.2. Verificación de seguridad

Confirmen que cada medida de seguridad funciona:

- [ ] La API corre con usuario no-root (`whoami` en contenedor)
- [ ] No hay `npm`/`tsc`/`python` en la imagen final
- [ ] Read-only filesystem activo (`touch /test` falla)
- [ ] tmpfs funcionando para `/tmp` (API) y `/var/cache/nginx` (Web)
- [ ] Capabilities mínimas (no se puede `ping`, `mount`, etc.)
- [ ] Variables sensibles via `.env`, no hardcodeadas
- [ ] Healthchecks funcionando (todos los servicios "healthy")

### 5.3. Verificación de observabilidad

Confirmen que:

- [ ] OpenTelemetry exporta métricas en `:9464/metrics`
- [ ] Prometheus scrapea OTel, cAdvisor y node-exporter
- [ ] Los 4 dashboards de Grafana están cargados y funcionales
- [ ] Las alertas se activan al superar umbrales (probar con estrés)
- [ ] Alertmanager recibe y agrupa notificaciones

### 5.4. Documentación de decisiones

Incluyan en el informe:

1. **Arquitectura final**: diagrama mostrando el flujo OTel → Prometheus → Grafana
2. **Decisiones técnicas**: por qué eligieron multi-stage, OTel vs fastify-metrics, nginx vs Node.js, cAdvisor vs Docker stats
3. **Problemas encontrados**: qué les costó resolver (read-only + tmpfs, dependencias de build en multi-stage, etc.)
4. **Capturas de pantalla**: de los 4 dashboards funcionando con datos reales
5. **Alertas**: mostrar una alerta disparada y resuelta

### 5.5. Presentación

Preparen una presentación de **10 minutos** para el curso que incluya:

1. **Antes y después**: tamaño de imágenes, tiempo de startup, seguridad
2. **Demo en vivo**: levantar el stack, generar tráfico, mostrar los 4 dashboards
3. **Alertas**: mostrar una alerta activa y su resolución
4. **Lecciones aprendidas**: qué fue lo más difícil y qué cambiarían

---

## Entregables resumen

| # | Archivo | Ubicación |
|---|---------|-----------|
| 1 | Análisis individual | `docs/produccion/analisis-{usuario}.md` |
| 2 | Diseño del grupo | `docs/produccion/diseno-{grupo}.md` |
| 3 | Dockerfile API producción | `packages/api/Dockerfile.prod` |
| 4 | Dockerfile Web producción | `packages/web/Dockerfile.prod` |
| 5 | Docker Compose producción | `docker-compose.prod.yml` |
| 6 | OpenTelemetry SDK | `packages/api/src/infrastructure/telemetry.ts` |
| 7 | Config Prometheus | `observability/prometheus/prometheus.yml` |
| 8 | Reglas de alerta | `observability/prometheus/rules/alert-rules.yml` |
| 9 | Dashboards Grafana (4) | `observability/grafana/dashboards/*.json` |
| 10 | Stack observabilidad | `observability/docker-compose.obs.yml` |
| 11 | Informe del grupo | `docs/produccion/informe-{grupo}.md` |

---

## Criterios de evaluación

| Criterio | Puntos |
|----------|:------:|
| **Fase 1**: Análisis completo con 5 problemas identificados correctamente | 5 |
| **Fase 1**: Preguntas de OpenTelemetry y observabilidad respondidas correctamente | 10 |
| **Fase 2**: Diseño Dockerfile multi-stage bien especificado | 5 |
| **Fase 2**: Diseño observabilidad con RED/USE/Business/UX completo | 10 |
| **Fase 2**: Diseño de alertas con umbrales definidos | 5 |
| **Fase 3**: Multi-stage builds funcionales con reducción ≥ 70% | 10 |
| **Fase 3**: Seguridad aplicada (no-root, read-only + tmpfs, capabilities, secrets) | 10 |
| **Fase 4**: OpenTelemetry integrado y exportando métricas OTel | 10 |
| **Fase 4**: Dashboard RED funcional con 6 paneles | 5 |
| **Fase 4**: Dashboard USE funcional con 5 paneles | 5 |
| **Fase 4**: Dashboard Business funcional con 5 paneles | 5 |
| **Fase 4**: Dashboard UX funcional con 4 paneles | 5 |
| **Fase 4**: Alertas configuradas y funcionales | 5 |
| **Fase 5**: Verificación completa con métricas documentadas | 5 |
| **Fase 5**: Presentación oral | 5 |
| **Trabajo en equipo**: Commits distribuidos entre integrantes | 5 |
| **Total** | **100** |

---

## Entrega

La entrega se realiza a través del GitHub Discussions de la cátedra, con la categoría **Show and Tell**:
<https://github.com/orgs/frlp-utn-ingsoft/discussions/categories/show-and-tell>

Ahí van a tener que crear una discusión con el título *Actividad 4 - GRUPO X* y dejando el link al repositorio en la descripción.

> **[IMPORTANTE:** *No se puede resolver el trabajo haciendo commits desde la interfaz de GitHub.*

---

## Referencias

### Docker y producción
- [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker security best practices](https://docs.docker.com/engine/security/)
- [Docker Compose production](https://docs.docker.com/compose/production/)
- [12 Factor App](https://12factor.net/)
- [Dockerfile best practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

### OpenTelemetry
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [OpenTelemetry JavaScript SDK](https://opentelemetry.io/docs/languages/js/)
- [OpenTelemetry Prometheus Exporter](https://opentelemetry.io/docs/specs/otel/exporter/prometheus/)

### Observabilidad
- [RED Method (Tom Wilkie)](https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/)
- [USE Method (Brendan Gregg)](https://www.brendangregg.com/usemethod.html)
- [Core Web Vitals](https://web.dev/vitals/)
- [PromQL basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)

### Alertas
- [Prometheus Alerting rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)
- [Alertmanager configuration](https://prometheus.io/docs/alerting/latest/configuration/)
- [Grafana Alerting](https://grafana.com/docs/grafana/latest/alerting/)
