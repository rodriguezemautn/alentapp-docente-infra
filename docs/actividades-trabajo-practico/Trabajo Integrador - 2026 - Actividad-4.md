# Ingeniería y Calidad de Software

2026

TP Integrador - Actividad 4: Preparando para Producción

**Límite de entrega: Domingo 28/06 23:59 hs**

***[IMPORTANTE:]** *Las dudas sobre este TP se realizan en <https://github.com/orgs/frlp-utn-ingsoft/discussions/categories/q-a>.*

***No se contestan dudas por correo electrónico.***

---

## Objetivos

Al finalizar esta actividad, los alumnos serán capaces de:

- ✅ Aplicar buenas prácticas de seguridad y optimización en Docker para entornos productivos
- ✅ Implementar multi-stage builds reduciendo significativamente el tamaño de las imágenes
- ✅ Integrar OpenTelemetry en una aplicación Node.js para capturar métricas RED
- ✅ Configurar Prometheus y Grafana para visualizar métricas en tiempo real
- ✅ Construir dashboards representativos del estado y rendimiento del sistema
- ✅ Documentar y presentar las decisiones técnicas adoptadas

---

## Estructura de trabajo

Esta actividad se organiza en **4 fases secuenciales**. Cada fase tiene entregables específicos y debe completarse antes de pasar a la siguiente:

```
Fase 1: Analizar y proponer
        ↓
Fase 2: Especificar y diseñar
        ↓
Fase 3: Implementar
        ↓
Fase 4: Verificar y entregar
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

### 1.2. Investigar OpenTelemetry

Lean sobre OpenTelemetry y respondan en el mismo documento:

1. ¿Qué es OpenTelemetry y cómo se diferencia de Prometheus?
2. ¿Qué son los "3 pilares" de la observabilidad? ¿Cuál aborda OpenTelemetry?
3. Expliquen el concepto de **métricas RED** (Rate, Errors, Duration). ¿Para qué sirve cada una?
4. ¿Qué es el **OTLP** (OpenTelemetry Protocol)? ¿Qué ventaja tiene frente a exportar directamente a Prometheus?
5. ¿Cómo se relaciona OpenTelemetry con Grafana?

> **Recursos**:
> - [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
> - [RED Method (Tom Wilkie)](https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/)
> - [Grafana + OpenTelemetry](https://grafana.com/oss/opentelemetry/)

---

## Fase 2: Especificar y diseñar

**Duración estimada**: 2 horas (grupal)
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
| Stage 2 | `build` | `node:22-alpine` | Compilar TypeScript, generar JS |
| Stage 3 | `runtime` | `node:22-alpine` | Solo runtime: JS compilado + node_modules prod + usuario no-root |

Requisitos:
- Usuario no-root (`appuser` / `node`)
- Healthcheck contra `localhost:3000`
- `.dockerignore` que excluya `node_modules`, `.git`, `dist`, etc.

#### b) `packages/web/Dockerfile.prod`

Diseñen un multi-stage build con 3 etapas:

| Etapa | Nombre | Base | Propósito |
|-------|--------|------|-----------|
| Stage 1 | `deps` | `node:22-alpine` | Instalar dependencias |
| Stage 2 | `build` | `node:22-alpine` | Build de Vite (`vite build`) |
| Stage 3 | `runtime` | `nginx:stable-alpine` | Servir archivos estáticos con nginx |

Requisitos:
- Usar **nginx** para servir el frontend (no Node.js en producción)
- Configurar compresión gzip, cache de assets, y security headers
- Healthcheck contra `localhost:80`

#### c) `docker-compose.prod.yml`

Diseñen la configuración de servicios para producción:

| Aspecto | Requisito |
|---------|-----------|
| **Resource limits** | CPU y memoria definidos por servicio |
| **Healthchecks** | Para API y DB |
| **Seguridad** | `read_only: true`, `cap_drop: ALL`, `cap_add: NET_BIND_SERVICE`, `no-new-privileges` |
| **Logging** | Driver `json-file` con rotación (`max-size: 10m`, `max-file: 3`) |
| **Red** | Red interna personalizada (no la default bridge) |
| **Secrets** | Variables sensibles desde archivo `.env` (no hardcodeadas) |

### 2.2. Diseño de la observabilidad

Especifiquen cómo integrar OpenTelemetry en la API:

#### a) Métricas RED a capturar

Definan las 3 métricas fundamentales:

| Métrica | Tipo OpenTelemetry | Descripción | Labels |
|---------|-------------------|-------------|--------|
| **Rate** | `Counter` | Requests por segundo | `method`, `route`, `status` |
| **Errors** | `Counter` | Tasa de error (4xx/5xx) | `method`, `route`, `status` |
| **Duration** | `Histogram` | Latencia de requests | `method`, `route` |

Además, agreguen:
- `process.memory.usage` — memoria del proceso (Gauge)
- `http.requests.active` — requests concurrentes (Gauge)

#### b) OpenTelemetry SDK

Diseñen la configuración del SDK:

```typescript
// Estructura conceptual de la configuración OpenTelemetry
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

// Configuración a implementar:
// 1. PrometheusExporter en puerto 9464 (o el que elijan)
// 2. Auto-instrumentaciones para HTTP y Fastify
// 3. Métricas personalizadas RED definidas arriba
```

#### c) Dashboard RED en Grafana

Diseñen un dashboard con al menos **6 paneles**:

| Panel | Métrica | Tipo de gráfico | Propósito |
|-------|---------|----------------|-----------|
| 1. Requests por segundo | `rate(http.server.duration.count[1m])` | Time series | Ver el tráfico actual |
| 2. Tasa de error | `rate(http.server.duration.count{status=~"5.."}[1m]) / rate(http.server.duration.count[1m])` | Time series | % de errores |
| 3. Latencia p95/p99 | `histogram_quantile(0.95, ...)` / `histogram_quantile(0.99, ...)` | Time series | Performance percibida |
| 4. Por status code | `sum by(status) (rate(...))` | Stacked area | Distribución de respuestas |
| 5. Memoria del proceso | `process.memory.usage` | Time series | Consumo de recursos |
| 6. Endpoints más lentos | `topk(5, ...)` | Bar chart (horizontal) | Cuellos de botella |

---

## Fase 3: Implementar

**Duración estimada**: 6 horas (grupal)
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
docker run --rm -it alentapp-api:prod which tsc npm node
# debería mostrar solo node, NO tsc ni npm
```

> **Meta**: reducir al menos 70% del tamaño original (~1GB API → ~300MB, ~570MB Web → ~170MB)

### 3.2. Docker Compose producción

Creen `docker-compose.prod.yml` con los 3 servicios (api, web, db).

**Verificación**:
```bash
# Iniciar entorno productivo
docker compose -f docker-compose.prod.yml up -d

# Verificar healthchecks
docker compose -f docker-compose.prod.yml ps

# Probar endpoints
curl http://localhost:3000/api/v1/socios
curl http://localhost/  # frontend vía nginx

# Verificar que no hay herramientas de build
docker exec alentapp-api which tsc  # debe fallar

# Verificar read-only filesystem
docker exec alentapp-api touch /test  # debe fallar
```

### 3.3. Integrar OpenTelemetry en la API

Agreguen OpenTelemetry a la API:

```bash
npm -w packages/api install \
  @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-prometheus \
  @opentelemetry/instrumentation-http \
  @opentelemetry/instrumentation-fastify
```

#### a) Crear el archivo de inicialización

Creen `packages/api/src/infrastructure/telemetry.ts`:

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { MeterProvider, Meter } from '@opentelemetry/sdk-metrics';
import { metrics } from '@opentelemetry/api';

// Configurar Prometheus Exporter
const prometheusExporter = new PrometheusExporter({
  port: 9464,  // Puerto para /metrics de OpenTelemetry
  endpoint: '/metrics',
});

// Crear SDK con auto-instrumentaciones
const sdk = new NodeSDK({
  metricReader: prometheusExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {},
      '@opentelemetry/instrumentation-fastify': {},
    }),
  ],
});

// Iniciar SDK
sdk.start();

// Crear meter para métricas personalizadas
const meter = metrics.getMeter('alentapp-api');

export function createREDMetrics(meter: Meter) {
  const requestCounter = meter.createCounter('http.requests.total', {
    description: 'Total de requests HTTP',
  });

  const errorCounter = meter.createCounter('http.requests.errors', {
    description: 'Total de errores HTTP',
  });

  const requestDuration = meter.createHistogram('http.request.duration', {
    description: 'Duración de requests',
    unit: 'ms',
  });

  return { requestCounter, errorCounter, requestDuration };
}

export { sdk, meter, prometheusExporter };
```

#### b) Inicializar OpenTelemetry en el entrypoint

En `packages/api/src/app.ts`, agregar la inicialización **antes de cualquier otro import**:

```typescript
// PRIMERO: inicializar OpenTelemetry (antes de cualquier otro import)
import './infrastructure/telemetry.js';

// Luego el resto de imports...
import Fastify from 'fastify';
// ...
```

#### c) Registrar métricas RED en cada ruta

En cada controller, agregar instrumentación manual para las métricas RED. Por ejemplo en `MemberController.ts`:

```typescript
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('alentapp-api');
const requestCounter = meter.createCounter('http.requests.total');
const errorCounter = meter.createCounter('http.requests.errors');
const requestDuration = meter.createHistogram('http.request.duration', { unit: 'ms' });

// En cada handler:
async getAll(request, reply) {
  const start = Date.now();
  const method = request.method;
  const route = request.url.split('?')[0];

  try {
    const members = await this.getMembersUseCase.execute();
    requestCounter.add(1, { method, route, status: '200' });
    return reply.status(200).send({ data: members });
  } catch (error) {
    errorCounter.add(1, { method, route, status: '500' });
    return reply.status(500).send({ error: 'Error interno' });
  } finally {
    requestDuration.record(Date.now() - start, { method, route });
  }
}
```

#### d) Verificar métricas OpenTelemetry

```bash
# Reconstruir API
docker compose -f docker-compose.prod.yml up -d --build api

# Verificar endpoint de métricas OpenTelemetry
curl http://localhost:9464/metrics | head -30

# Hacer algunos requests
curl http://localhost:3000/api/v1/socios
curl http://localhost:3000/api/v1/sports
curl http://localhost:3000/api/v1/lockers

# Verificar que las métricas RED aparecen
curl http://localhost:9464/metrics | grep -E "http_requests_total|http_request_duration"
```

### 3.4. Configurar Prometheus para OpenTelemetry

Actualicen `observability/prometheus/prometheus.yml` para scrapear el nuevo endpoint de OpenTelemetry:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'alentapp-api'
    static_configs:
      - targets: ['host.docker.internal:3000']
        labels:
          app: 'alentapp'
          service: 'api'

  - job_name: 'opentelemetry'
    static_configs:
      - targets: ['host.docker.internal:9464']
        labels:
          app: 'alentapp'
          service: 'api-otel'
```

### 3.5. Crear dashboard RED en Grafana

Creen un dashboard en Grafana llamado **"RED — Alentapp API"** con los 6 paneles diseñados en la Fase 2.

Pueden hacerlo de dos formas:

#### Opción A: Importar JSON

Si prefieren definirlo como código (Infrastructure as Code), exporten el dashboard como JSON y guárdenlo en `observability/grafana/dashboards/red-metrics.json`.

#### Opción B: Manual en la UI

1. Abran Grafana en `http://localhost:3001` (admin/admin)
2. **Dashboards → New Dashboard → Add Panel**
3. Por cada panel, configuren la consulta PromQL y el tipo de gráfico

**Consultas PromQL de referencia:**

```promql
// Panel 1: Requests por segundo
rate(http_server_duration_count[1m])

// Panel 2: Tasa de error (%)
sum(rate(http_server_duration_count{status=~"5.."}[1m])) / sum(rate(http_server_duration_count[1m])) * 100

// Panel 3: Latencia p95/p99
histogram_quantile(0.95, sum(rate(http_server_duration_bucket[5m])) by (le))
histogram_quantile(0.99, sum(rate(http_server_duration_bucket[5m])) by (le))

// Panel 4: Por status code
sum by (status) (rate(http_server_duration_count[5m]))

// Panel 5: Memoria del proceso
process_memory_usage_bytes / 1024 / 1024

// Panel 6: Endpoints más lentos (top 5)
topk(5, avg by (route) (http_server_duration_ms))
```

**Verificación**:
```bash
# Generar tráfico de prueba
for i in {1..100}; do
  curl -s http://localhost:3000/api/v1/socios > /dev/null
  curl -s http://localhost:3000/api/v1/sports > /dev/null
  curl -s http://localhost:3000/api/v1/lockers > /dev/null
  sleep 0.05
done

# Crear algún error 4xx
curl -s http://localhost:3000/api/v1/socios/99999 > /dev/null

# Crear algún POST
curl -s -X POST http://localhost:3000/api/v1/socios \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@test.com","phone":"1234567890","memberCategory":"Senior"}' > /dev/null
```

Luego verifiquen en Grafana que los paneles reflejen el tráfico generado.

---

## Fase 4: Verificar y entregar

**Duración estimada**: 2 horas (grupal)
**Formato**: Documento Markdown en `docs/produccion/informe-{grupo}.md`

### 4.1. Verificación técnica

Completen la siguiente tabla con las métricas obtenidas:

| Métrica | Antes (desarrollo) | Después (producción) | Mejora |
|---------|:------------------:|:--------------------:|:------:|
| Tamaño imagen API | `docker images api` | `docker images api:prod` | |
| Tamaño imagen Web | `docker images web` | `docker images web:prod` | |
| Tiempo de startup API | `time docker compose up -d api` | `time docker compose -f docker-compose.prod.yml up -d api` | |
| Memoria API (idle) | `docker stats --no-stream api` | `docker stats --no-stream alentapp-api` | |
| Endpoints accesibles | `curl :3000/...` | `curl :3000/...` | |
| Frontend vía nginx | — | `curl localhost/` | |

### 4.2. Verificación de seguridad

Confirmen que cada medida de seguridad funciona:

- [ ] La API corre con usuario no-root
- [ ] No hay `npm`/`tsc`/`python` en la imagen final
- [ ] Read-only filesystem activo (`docker exec ... touch /test` falla)
- [ ] Capabilities mínimas (no se puede `ping`, `mount`, etc.)
- [ ] Variables sensibles via `.env`, no hardcodeadas
- [ ] Healthchecks funcionando (`docker ps` muestra "healthy")

### 4.3. Verificación de observabilidad

Confirmen que:

- [ ] OpenTelemetry exporta métricas en `:9464/metrics`
- [ ] Prometheus scrapea correctamente el endpoint OTLP
- [ ] Grafana tiene al menos un datasource Prometheus configurado
- [ ] El dashboard RED tiene 6 paneles funcionales
- [ ] Los gráficos responden al tráfico generado
- [ ] Las métricas de error reflejan los 4xx/5xx

### 4.4. Documentación de decisiones

Incluyan en el informe:

1. **Arquitectura final**: diagrama o descripción de cómo quedó el sistema
2. **Decisiones técnicas**: por qué eligieron cada approach (multi-stage, nginx, OTLP, etc.)
3. **Problemas encontrados**: qué les costó resolver y cómo lo hicieron
4. **Capturas de pantalla**: del dashboard RED funcionando con datos

### 4.5. Presentación

Preparen una presentación de **10 minutos** para el curso que incluya:

1. **Antes y después**: tamaño de imágenes, tiempo de startup
2. **Demo del dashboard RED**: mostrar los 6 paneles con tráfico real
3. **Seguridad**: qué medidas aplicaron y por qué
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
| 6 | Config Prometheus actualizada | `observability/prometheus/prometheus.yml` |
| 7 | Dashboard RED (opcional) | `observability/grafana/dashboards/red-metrics.json` |
| 8 | Informe del grupo | `docs/produccion/informe-{grupo}.md` |

---

## Criterios de evaluación

| Criterio | Puntos |
|----------|:------:|
| **Fase 1**: Análisis completo con 5 problemas identificados correctamente | 10 |
| **Fase 1**: Preguntas de OpenTelemetry respondidas correctamente | 10 |
| **Fase 2**: Diseño Dockerfile multi-stage bien especificado | 10 |
| **Fase 2**: Diseño observabilidad con métricas RED completo | 10 |
| **Fase 3**: Multi-stage builds funcionales con reducción ≥ 70% | 15 |
| **Fase 3**: Seguridad aplicada (no-root, read-only, capabilities, secrets) | 10 |
| **Fase 3**: OpenTelemetry integrado y exportando métricas | 10 |
| **Fase 3**: Dashboard RED con 6 paneles funcionales | 10 |
| **Fase 4**: Verificación completa con métricas documentadas | 5 |
| **Fase 4**: Presentación oral | 5 |
| **Trabajo en equipo**: Commits distribuidos entre integrantes | 5 |
| **Total** | **100** |

---

## Entrega

La entrega se realiza a través del GitHub Discussions perteneciente a la organización de la cátedra, con la categoría **Show and Tell**: <https://github.com/orgs/frlp-utn-ingsoft/discussions/categories/show-and-tell>

Ahí van a tener que crear una discusión con el título *Actividad 4 - GRUPO X* y dejando el link al repositorio en la descripción.

> **[IMPORTANTE:** *No se puede resolver el trabajo haciendo commits desde la interfaz de GitHub.

---

## Referencias

### Docker y producción
- [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker security best practices](https://docs.docker.com/engine/security/)
- [Docker Compose production](https://docs.docker.com/compose/production/)
- [12 Factor App](https://12factor.net/)
- [Dockerfile best practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Nginx as reverse proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)

### OpenTelemetry
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [OpenTelemetry JavaScript SDK](https://opentelemetry.io/docs/languages/js/)
- [OpenTelemetry Prometheus Exporter](https://opentelemetry.io/docs/specs/otel/exporter/prometheus/)
- [OpenTelemetry auto-instrumentation](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/metapackages/auto-instrumentations-node)

### Métricas y observabilidad
- [RED Method (Tom Wilkie)](https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/)
- [USE Method (Brendan Gregg)](https://www.brendangregg.com/usemethod.html)
- [PromQL basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)

### Ayuda general
- [Git cheat sheet](https://training.github.com/downloads/es_ES/github-git-cheat-sheet.pdf)
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/)
- [Markdown guide](https://guides.github.com/features/mastering-markdown/)
