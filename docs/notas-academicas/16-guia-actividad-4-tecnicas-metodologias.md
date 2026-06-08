# Guía de la Actividad 4 — Técnicas, Metodologías y Conocimientos Requeridos

> **Materia**: Ingeniería y Calidad de Software — 2026
> **Actividad**: TP Integrador — Actividad 4: "Preparando para Producción (v2 Profesional)"
> **Propósito**: Documentar qué se pide, qué técnicas aplica y qué conocimientos previos requiere

---

## 1. ¿Qué pide la Actividad 4?

Llevar la aplicación **de un entorno de desarrollo Docker a una arquitectura de producción profesional** con observabilidad 360°. Esto implica 5 fases secuenciales:

```
Fase 1: Analizar y proponer  (individual)
         ↓
Fase 2: Especificar y diseñar  (grupal)
         ↓
Fase 3: Docker producción  (grupal — código)
         ↓
Fase 4: Observabilidad profesional  (grupal — código)
         ↓
Fase 5: Verificar y entregar  (grupal — informe + presentación)
```

### Fase 1 — Analizar y proponer (individual)
- Analizar la infraestructura Docker actual del proyecto
- Identificar 5 problemas/vulnerabilidades respecto a buenas prácticas de producción
- Investigar OpenTelemetry y observar los 4 pilares de observabilidad

### Fase 2 — Especificar y diseñar (grupal)
- Diseñar Dockerfile multi-stage para API y Web
- Diseñar docker-compose.prod.yml con hardening de seguridad
- Diseñar arquitectura de observabilidad de 4 capas (RED, USE, Business, UX)
- Diseñar alertas

### Fase 3 — Docker producción (grupal, código)
- Implementar `packages/api/Dockerfile.prod` multi-stage
- Implementar `packages/web/Dockerfile.prod` multi-stage
- Implementar `docker-compose.prod.yml` con hardening

### Fase 4 — Observabilidad profesional (grupal, código)
- Integrar OpenTelemetry en la API
- Configurar Prometheus, Grafana, Alertmanager, cAdvisor, node-exporter
- Crear 4 dashboards provisionados (RED, USE, Business, UX)
- Configurar reglas de alerta

### Fase 5 — Verificar y entregar (grupal)
- Verificar seguridad, performance y observabilidad
- Documentar decisiones técnicas y problemas encontrados
- Preparar presentación de 10 minutos con demo en vivo

---

## 2. Técnicas Aplicadas

### 2.1. Docker multi-stage
**¿Qué es?** Construir imágenes Docker en múltiples etapas donde cada etapa tiene un propósito específico y solo la última etapa va al runtime.

**Problema que resuelve**: Las imágenes de desarrollo incluyen herramientas de build (TypeScript compiler, npm, test runners) que NO son necesarias en producción. Esto produce imágenes de ~1GB cuando deberían ser ~250MB.

**Cómo se aplica en la actividad**:

```
Stage "deps":     Instalar solo dependencias de producción (npm ci --omit=dev)
Stage "build":    Compilar TypeScript (incluye dev deps para tsc, prisma generate)
Stage "runtime":  Solo node_modules prod + JS compilado + usuario no-root
```

**Técnicas relacionadas**:
- **Layer caching**: Ordenar COPY de menos a más cambiante para maximizar cache de Docker
- **`.dockerignore`**: Excluir node_modules, .git, dist, coverage del build context
- **`COPY --from=`**: Copiar archivos entre etapas (solo lo necesario)
- **`apk add --no-cache`**: Instalar paquetes sin cache

### 2.2. Hardening de seguridad Docker
**¿Qué es?** Aplicar configuraciones de seguridad mínimas para reducir la superficie de ataque.

**Problema que resuelve**: Los contenedores por defecto corren como root, con todas las capabilities Linux habilitadas, y filesystem read-write. Esto permite escalada de privilegios si un atacante compromete la aplicación.

**Cómo se aplica**:
| Medida | Qué hace |
|--------|----------|
| `read_only: true` | Filesystem de solo lectura (excepto tmpfs) |
| `tmpfs: /tmp` | Directorio temporal en memoria para escritura |
| `cap_drop: ALL` | Elimina todas las capabilities Linux |
| `cap_add: NET_BIND_SERVICE` | Solo permite bindear puertos (< 1024) |
| `no-new-privileges: true` | Evita escalada de privilegios |
| Usuario no-root (`appuser`) | El proceso no corre como root |
| `server_tokens off` | Oculta versión de nginx |
| Healthchecks | Detecta y reinicia servicios caídos |

### 2.3. OpenTelemetry (OTel)
**¿Qué es?** Un estándar abierto para telemetría (métricas, logs, tracing) que permite instrumentar aplicaciones una vez y exportar a múltiples backends.

**Problema que resuelve**: Sin OTel, cada aplicación usa su propio formato de métricas. OTel unifica la instrumentación y permite cambiar de backend (Prometheus, Datadog, New Relic) sin modificar el código.

**Cómo se aplica**:
1. **NodeSDK**: Inicializa OTel con metric reader PrometheusExporter
2. **Auto-instrumentación**: Captura automáticamente HTTP method, route, status code, duración (sin modificar los controllers)
3. **Métricas custom**: Métricas de negocio que se actualizan periódicamente (business.members.active, etc.)
4. **Exportación**: OTel expone métricas en `:9464/metrics` en formato Prometheus

### 2.4. Métricas RED
**¿Qué es?** Metodología para monitorear servicios, propuesta por Tom Wilkie (Grafana Labs).

| Métrica | Significa | Pregunta que responde |
|---------|-----------|----------------------|
| **Rate** | Requests por segundo | ¿Está recibiendo tráfico? |
| **Errors** | Tasa de error | ¿Está funcionando correctamente? |
| **Duration** | Latencia (p95/p99) | ¿Es rápido? |

**Problema que resuelve**: Sin métricas RED, no se puede saber si la API está viva, si está respondiendo errores, o si está lenta. Es el mínimo indispensable para monitorear cualquier servicio.

### 2.5. Métricas USE
**¿Qué es?** Metodología para monitorear infraestructura, propuesta por Brendan Gregg.

| Métrica | Significa | Pregunta que responde |
|---------|-----------|----------------------|
| **Utilization** | % de uso del recurso | ¿Está siendo usado? |
| **Saturation** | Grado de saturación | ¿Tiene capacidad disponible? |
| **Errors** | Cantidad de errores | ¿Tiene errores? |

**Problema que resuelve**: Sin métricas USE, no se puede diagnosticar si un problema es de la aplicación o del servidor (falta de CPU, memoria, disco, red).

### 2.6. Dashboards provisionados
**¿Qué es?** Dashboards de Grafana definidos como archivos JSON que se cargan automáticamente al iniciar Grafana.

**Problema que resuelve**: Los dashboards creados manualmente en la UI se pierden si se borra el volumen de Grafana. Los provisionados están versionados en el repo y se replican automáticamente.

**Cómo se aplica**:
- 4 archivos JSON en `observability/grafana/dashboards/`
- Configurados con UIDs fijos, datasource Prometheus
- Provisioning via `observability/grafana/datasources/` y `observability/grafana/dashboards/`

### 2.7. Alertas con Prometheus + Alertmanager
**¿Qué es?** Reglas que evalúan expresiones PromQL periódicamente y disparan alertas cuando se superan umbrales.

**Problema que resuelve**: No se puede estar mirando dashboards 24/7. Las alertas notifican cuando algo anda mal (API caída, alto error rate, latencia alta).

**Alertas de la actividad**:
| Alerta | Condición | Severidad |
|--------|-----------|-----------|
| API Down | Sin métricas por > 1 minuto | 🔴 CRITICAL |
| High Error Rate | Error rate > 5% en 5 minutos | 🟡 WARNING |
| High Latency | p99 > 2 segundos en 5 minutos | 🟡 WARNING |
| High Memory | Memoria > 400MB en 5 minutos | 🟡 WARNING |

---

## 3. Metodologías Aplicadas

### 3.1. Feature Branch Workflow
Cada cambio se desarrolla en una rama separada y se integra vía Pull Request.

```
feature/dockerfile-api  →  Pull Request  →  main
feature/opentelemetry   →  Pull Request  →  main
feature/dashboards      →  Pull Request  →  main
```

**Por qué se usa**: Permite trabajo paralelo, revisión de código, y mantener `main` estable.

### 3.2. Conventional Commits
Mensajes de commit estructurados con tipo y scope:

```
feat(infra): agrega dockerfile multi-stage para API
fix(api): corrige healthcheck de nginx
docs(informe): agrega verificacion de seguridad
perf(docker): reduce imagen prod API en 70%
```

**Por qué se usa**: Permite generar changelogs automáticos, facilita la revisión, y es evaluable (puntúa en el scoring automático).

### 3.3. Infraestructura como Código (IaC)
Toda la configuración de infraestructura está en archivos versionados en el repositorio:
- `Dockerfile.prod` — definición de la imagen
- `docker-compose.prod.yml` — orquestación de servicios
- `prometheus.yml` — configuración de scraping
- `*.json` — dashboards de Grafana
- `alert-rules.yml` — reglas de alerta

**Por qué se usa**: Es reproducible, auditable, y evita "solo funciona en mi máquina".

### 3.4. Principio de Mínimo Privilegio
Cada componente recibe solo los permisos que necesita:
- API: no-root, solo NET_BIND_SERVICE
- Web: no-root, solo NET_BIND_SERVICE + CHOWN + SETUID + SETGID
- DB: solo expuesta en red interna

**Por qué se usa**: Reduce el impacto de una vulnerabilidad. Si un atacante compromete el contenedor de la API, no puede escalar a root ni modificar el filesystem.

---

## 4. Conocimientos Previos Requeridos

### 4.1. Docker y Contenedores
| Concepto | Nivel requerido | Para qué |
|----------|----------------|----------|
| `docker build`, `docker run`, `docker compose` | Alto | Trabajo diario |
| Multi-stage builds | Medio | Fase 3 |
| Layer caching | Medio | Optimizar builds |
| Dockerfile: FROM, COPY, RUN, CMD, ENTRYPOINT | Alto | Escribir Dockerfiles |
| Docker Compose: services, volumes, networks | Alto | Orquestar servicios |
| tmpfs, read_only, cap_drop | Bajo (se aprende) | Hardening |
| Healthchecks | Medio | Fase 3 |

### 4.2. Linux
| Concepto | Nivel requerido | Para qué |
|----------|----------------|----------|
| Línea de comandos | Alto | Trabajo diario |
| Usuarios y permisos | Medio | Usuario no-root, tmpfs |
| Alpine Linux (apk) | Bajo | Dockerfiles |
| Network namespaces | Bajo | Docker networking |
| signals (SIGTERM, SIGINT) | Bajo | Graceful shutdown |

### 4.3. Node.js / TypeScript
| Concepto | Nivel requerido | Para qué |
|----------|----------------|----------|
| npm workspaces | Medio | Monorepo, dependencias |
| TypeScript compilation | Medio | Multi-stage build |
| Fastify hooks (onRequest, onResponse) | Medio | Instrumentar métricas RED |
| Process environment variables | Medio | Configuración |

### 4.4. Observabilidad
| Concepto | Nivel requerido | Para qué |
|----------|----------------|----------|
| PromQL básico | Bajo (se aprende) | Dashboards |
| Grafana provisioning | Bajo (se aprende) | Dashboards |
| OpenTelemetry concepts | Bajo (se aprende) | Fase 4 |
| Métricas RED, USE | Bajo (se aprende) | Fase 4 |

### 4.5. Git y Colaboración
| Concepto | Nivel requerido | Para qué |
|----------|----------------|----------|
| Feature branches | Alto | Trabajo en equipo |
| Pull Requests | Alto | Integración |
| Conventional Commits | Alto | Commits evaluables |
| Merge conflict resolution | Medio | Trabajo paralelo |

---

## 5. Mapa de Aprendizaje

Cómo se relaciona la actividad con los contenidos de la materia:

```
Calidad de Software
├── Análisis estático
│   ├── Linting (ESLint) — actividad 1/2
│   └── TypeScript strict — actividad 1/2
├── Testing
│   ├── Unitario + Integración — actividad 1/2
│   ├── E2E (Playwright) — actividad 2
│   └── Cobertura — actividad 2
└── Infraestructura y Operaciones ← ACTIVIDAD 4
    ├── Docker multi-stage ← optimización de imágenes
    ├── Hardening de seguridad ← cap_drop, no-root, read-only
    ├── OpenTelemetry ← estándar de telemetría
    ├── Prometheus ← backend de métricas
    ├── Grafana ← visualización y dashboards
    ├── Alertas ← detección proactiva
    └── Documentación técnica ← arquitectura y decisiones
```

---

## 6. Complejidad y Tiempo Estimado

| Fase | Duración | Tipo | Dificultad |
|------|----------|------|------------|
| Fase 1: Analizar | 2h | Individual | Media |
| Fase 2: Diseñar | 3h | Grupal | Alta |
| Fase 3: Docker prod | 4h | Grupal | Media |
| Fase 4: Observabilidad | 6h | Grupal | Alta |
| Fase 5: Verificar | 2h | Grupal | Media |
| **Total** | **~17h** | | |

**Perfil de dificultad**: La mayor dificultad está en Fase 4 (OpenTelemetry + dashboards) porque combina múltiples tecnologías nuevas. Fase 2 requiere pensamiento abstracto (diseñar sin implementar). Fase 3 es la más concreta y accesible.

---

## 7. Referencias

### Docker
- https://docs.docker.com/build/building/multi-stage/
- https://docs.docker.com/engine/security/
- https://docs.docker.com/compose/production/

### OpenTelemetry
- https://opentelemetry.io/docs/languages/js/
- https://www.aspecto.io/blog/opentelemetry-metrics-guide/

### Observabilidad
- https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/
- https://www.brendangregg.com/usemethod.html
- https://web.dev/vitals/

### Prometheus
- https://prometheus.io/docs/prometheus/latest/querying/basics/
- https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/

### Prácticas de producción
- https://12factor.net/
- https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
