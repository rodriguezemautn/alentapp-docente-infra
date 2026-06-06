# Alentapp Docente

Plataforma moderna para la gestión de clubes y socios. Monorepo con **Arquitectura Hexagonal** (backend) + **Componentes React** (frontend), diseñado como recurso educativo para Ingeniería y Calidad de Software.

| Capa | Stack |
|------|-------|
| **Backend** | Fastify 5 + Prisma 7 + PostgreSQL 16 |
| **Frontend** | React 19 + Chakra UI 3 + Vite 8 + React Router 7 |
| **Shared** | TypeScript 6.0 (strict) — DTOs, tipos, enums |
| **Testing** | Vitest 4 (unit + integration) + Playwright 1.59 (E2E) |
| **Infra** | Docker Compose + GitHub Actions CI/CD |
| **Observabilidad** | OpenTelemetry + Prometheus + Grafana + Alertmanager + cAdvisor |

> 📚 [Documentación de Arquitectura](./docs/ARCHITECTURE.md) · [Guía de Testing](./docs/TESTING.md) · [Guía de Contribución](./docs/CONTRIBUTING.md)

---

## Índice

- [Requisitos](#requisitos)
- [Inicio rápido (Dev)](#inicio-rápido-dev)
- [Entornos](#entornos)
  - [Desarrollo](#1-desarrollo-make-dev)
  - [Testing](#2-testing-make-test)
  - [Producción](#3-producción-make-prod)
  - [Observabilidad](#4-observabilidad-make-obs)
- [Comandos útiles](#comandos-útiles)
- [Documentación](#documentación)
- [Estructura del proyecto](#estructura-del-proyecto)

---

## Requisitos

- **Node.js** v22+
- **npm** 10+
- **Docker** + **Docker Compose** v2
- **Git**

Verificar:
```bash
node --version   # v22+
npm --version    # 10+
docker --version && docker compose version
```

---

## Inicio rápido (Dev)

```bash
# 1. Clonar
git clone <repo-url>
cd alentapp-docente-infra

# 2. Entorno de desarrollo (recomendado)
make dev
# → Frontend: http://localhost:5173
# → API:      http://localhost:3000
# → DB:       postgres://localhost:5432

# 3. Cargar datos de ejemplo
make seed
```

---

## Entornos

### 1. Desarrollo (`make dev`)

Entorno con hot-reloading para desarrollo activo.

```bash
make dev          # Levantar servicios
make dev-logs     # Logs en tiempo real
make dev-rebuild  # Reconstruir imágenes
make dev-down     # Detener
make dev-reset    # Reset completo (borra DB y reconstruye)
```

| Servicio | URL | Dockerfile |
|----------|-----|------------|
| Frontend | `http://localhost:5173` | `packages/web/Dockerfile` (vite dev) |
| API | `http://localhost:3000` | `packages/api/Dockerfile` (tsx watch) |
| DB | `postgres://localhost:5432` | `postgres:16-alpine` |

**Características**: bind mounts para hot-reload, `tsx watch` en API, `vite dev` en web, `pino-pretty` para logs legibles.

### 2. Testing (`make test`)

```bash
make test                # API + Web
make test-api            # Solo API (unitarios + integración)
make test-web            # Solo Web (frontend)
make test-coverage       # Reporte de cobertura
make test-e2e            # E2E con Playwright
make test-e2e-fullstack  # E2E con Docker + Playwright
```

**Cobertura actual**: ~295 tests (API: 255, Web: 40), ~87% statements.

### 3. Producción (`make prod`)

Entorno optimizado para producción con hardening de seguridad.

```bash
make prod         # Construir y levantar
make prod-down    # Detener
make prod-logs    # Logs
make prod-check   # Verificar healthchecks
make prod-build   # Reconstruir desde cero (--no-cache)
```

| Servicio | URL | Dockerfile |
|----------|-----|------------|
| Frontend | `http://localhost:80` | `packages/web/Dockerfile.prod` (nginx) |
| API | `http://localhost:3000` | `packages/api/Dockerfile.prod` (node runtime) |
| DB | `postgres://localhost:5432` | `postgres:16-alpine` |

**Seguridad aplicada**:
- ✅ Multi-stage builds (API < 300MB, Web < 170MB)
- ✅ Usuario no-root (`appuser`)
- ✅ `read_only: true` + `tmpfs` para /tmp y /var/cache/nginx
- ✅ `cap_drop: ALL` + `cap_add: NET_BIND_SERVICE`
- ✅ `no-new-privileges: true`
- ✅ Logging con rotación (`json-file`, max 10MB, 3 archivos)
- ✅ Red interna aislada (`alentapp-production`)
- ✅ Healthchecks en todos los servicios
- ✅ Sin herramientas de build en runtime (no npm/tsc/python)

### 4. Observabilidad (`make obs`)

Stack profesional de observabilidad con 4 dashboards.

```bash
make obs          # Levantar stack (Prometheus + Grafana + Alertmanager + cAdvisor + node-exporter)
make obs-down     # Detener
make obs-logs     # Logs
make obs-check    # Verificar estado
```

| Herramienta | URL | Credenciales | Propósito |
|-------------|-----|-------------|-----------|
| **Grafana** | `http://localhost:3001` | `admin / admin` | Dashboards y alertas |
| **Prometheus** | `http://localhost:9090` | — | Backend de métricas |
| **Alertmanager** | `http://localhost:9093` | — | Gestión de alertas |
| **cAdvisor** | `http://localhost:8080` | — | Métricas de contenedores (USE) |
| **node-exporter** | `http://localhost:9100` | — | Métricas del host |
| **OTel endpoint** | `http://localhost:9464/metrics` | — | Métricas OpenTelemetry de la API |

**Dashboards disponibles en Grafana**:

| Dashboard | Descripción | Paneles |
|-----------|-------------|---------|
| **RED — API** | Rendimiento de la API REST | Requests/s, error rate %, latencia p95/p99, status codes, memoria, top endpoints |
| **USE — Infra** | Salud de infraestructura | CPU%, memoria%, disk I/O, network I/O, uptime |
| **Business** | Métricas de negocio | Miembros activos, préstamos, ingresos/día, ocupación casilleros |
| **UX — Frontend** | Experiencia de usuario | Tiempo de carga, errores cliente, Core Web Vitals simulados |

**Alertas configuradas**:

| Alerta | Condición | Severidad |
|--------|-----------|-----------|
| API Down | Sin métricas por > 1 minuto | 🔴 CRITICAL |
| High Error Rate | Error rate 5xx > 5% en 5m | 🟡 WARNING |
| High Latency | p99 > 2s en 5m | 🟡 WARNING |
| High Memory | Memoria > 400MB en 5m | 🟡 WARNING |
| Container Down | Contenedor no reporta métricas | 🔴 CRITICAL |

---

## Comandos útiles

```bash
# Calidad
make lint        # ESLint (API + Web)
make typecheck   # TypeScript check
make format      # Prettier format
make check       # typecheck + lint + test-ci

# Datos
make seed        # Cargar datos de ejemplo
make seed-reset  # Reset DB + seed

# Release
make release VERSION=v1.2.3    # Crear tag y push
make docker-tag VERSION=v1.2.3  # Etiquetar imágenes
make docker-save VERSION=v1.2.3 # Exportar imágenes a .tar

# Utilidades
make info        # Información del proyecto
make clean       # Limpiar artefactos
```

---

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Arquitectura hexagonal, flujo de peticiones, estructura del monorepo |
| [`docs/TESTING.md`](./docs/TESTING.md) | Estrategia de testing, comandos, niveles |
| [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) | Feature branches, workflow, estándares |
| [`docs/MIGRATIONS.md`](./docs/MIGRATIONS.md) | Gestión de migraciones Prisma |
| [`docs/infrastructure/docker-analysis.md`](./docs/infrastructure/docker-analysis.md) | Análisis de infraestructura Docker |
| [`docs/observability/lab-guide.md`](./docs/observability/lab-guide.md) | Guía de laboratorio de observabilidad |
| [`docs/actividades-trabajo-practico/`](./docs/actividades-trabajo-practico/) | Actividades del TP Integrador |
| [`docs/notas-academicas/`](./docs/notas-academicas/) | Notas académicas y lecciones aprendidas |

---

## Estructura del proyecto

```
alentapp-docente-infra/
├── packages/
│   ├── api/                  # Backend (Fastify + Prisma)
│   │   ├── src/
│   │   │   ├── delivery/     # Controllers (HTTP layer)
│   │   │   ├── application/  # Use cases
│   │   │   ├── domain/       # Domain logic + ports
│   │   │   └── infrastructure/ # Adapters + telemetry
│   │   ├── Dockerfile        # Dev image
│   │   └── Dockerfile.prod   # Production multi-stage
│   ├── web/                  # Frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── views/        # Page components
│   │   │   ├── hooks/        # Custom hooks
│   │   │   ├── services/     # API clients
│   │   │   └── components/   # UI components (Chakra)
│   │   ├── Dockerfile        # Dev image
│   │   └── Dockerfile.prod   # Production multi-stage (nginx)
│   └── shared/               # DTOs, tipos, enums
├── observability/            # Stack de observabilidad
│   ├── prometheus/
│   │   ├── prometheus.yml
│   │   └── rules/alert-rules.yml
│   ├── grafana/
│   │   ├── datasources/
│   │   └── dashboards/
│   └── docker-compose.obs.yml
├── docs/                     # Documentación académica
├── docker-compose.yml        # Desarrollo
├── docker-compose.prod.yml   # Producción
└── Makefile                  # Comandos unificados
```

---

## Licencia

Proyecto educativo — Universidad Tecnológica Nacional, Facultad Regional La Plata.
