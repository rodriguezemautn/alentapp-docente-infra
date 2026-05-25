# Alentapp Docente

Plataforma para la gestión de socios y administración de clubes. Construida como monorepo con TypeScript, React (Vite + Chakra UI) en el frontend, y Fastify con Prisma (PostgreSQL) en el backend, siguiendo **Arquitectura Hexagonal (Ports & Adapters)**.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| **Backend** | Fastify 5, TypeScript 6, Prisma 7, PostgreSQL 16 |
| **Frontend** | React 19, Chakra UI 3, Vite 8, React Router 7 |
| **Shared** | `@alentapp/shared` — DTOs y tipos compartidos |
| **Testing** | Vitest 4 (unit + integration), Playwright (E2E) |
| **Infra** | Docker Compose, nginx, GitHub Actions |
| **Arquitectura** | Hexagonal (Ports & Adapters) en API, componentes en Web |

---

## Estructura del repositorio

```
alentapp/
├── packages/
│   ├── api/           ← Fastify + Prisma (arquitectura hexagonal)
│   │   ├── src/
│   │   │   ├── domain/        ← Puertos, validadores, errores
│   │   │   ├── application/   ← Casos de uso
│   │   │   ├── delivery/      ← Controladores HTTP
│   │   │   └── infrastructure/← Repositorios Prisma
│   │   └── prisma/            ← Schema + migraciones
│   ├── web/           ← React + Vite + Chakra UI
│   │   ├── src/
│   │   │   ├── views/         ← Vistas por entidad
│   │   │   ├── services/      ← API clients
│   │   │   ├── hooks/         ← useApi, useDialog, useDebounce
│   │   │   ├── components/    ← UI components
│   │   │   └── constants.ts   ← Opciones compartidas
│   └── shared/        ← DTOs y tipos (MemberDTO, SportDTO, etc.)
├── docs/              ← Documentación técnica y académica
├── scripts/           ← Scripts de utilidad
└── docker-compose.yml ← Entorno de desarrollo
```

---

## Inicio rápido

```bash
# 1. Clonar
git clone https://github.com/rodriguezemautn/alentapp-docente-infra.git
cd alentapp-docente-infra

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Levantar todo (DB + API + Frontend)
make dev

# 4. Cargar datos de ejemplo
make seed
```

**Servicios:**
- 🌐 Frontend: `http://localhost:5173`
- ⚙️ API: `http://localhost:3000`
- 🐘 PostgreSQL: `localhost:5432`

---

## Makefile — Comandos disponibles

El proyecto incluye un `Makefile` con todos los comandos necesarios:

```bash
make help    # Muestra todos los comandos disponibles
```

### Desarrollo

| Comando | Descripción |
|---------|-------------|
| `make dev` | Levanta entorno desarrollo (docker compose up -d) |
| `make dev-down` | Detiene servicios |
| `make dev-logs` | Logs en tiempo real |
| `make dev-rebuild` | Reconstruye imágenes y reinicia |
| `make dev-reset` | Reset completo: borra volúmenes y levanta de nuevo |
| `make seed` | Carga 17 registros de ejemplo (miembros, deportes, etc.) |
| `make seed-reset` | Reset DB y carga datos de ejemplo |

### Testing

| Comando | Descripción |
|---------|-------------|
| `make test` | Corre todos los tests (API ~200 + Web ~40) |
| `make test-api` | Tests de API con output verbose |
| `make test-web` | Tests de frontend |
| `make test-coverage` | Reporte de cobertura |
| `make test-report` | Resumen de resultados |
| `make test-watch` | Tests en modo watch |
| `make test-e2e` | E2E con Playwright |
| `make check` | TypeScript + ESLint + tests (todo en uno) |

### Producción

| Comando | Descripción |
|---------|-------------|
| `make prod` | Construye y levanta entorno producción |
| `make prod-down` | Detiene producción |
| `make prod-check` | Verifica healthchecks |
| `make prod-logs` | Logs de producción |

### Calidad

| Comando | Descripción |
|---------|-------------|
| `make lint` | ESLint |
| `make typecheck` | `tsc --noEmit` |
| `make format` | Prettier |
| `make check` | TypeScript + ESLint + tests |

### Release

| Comando | Descripción |
|---------|-------------|
| `make release VERSION=v1.2.3` | Tag + push |
| `make docker-save VERSION=v1.0.0` | Exporta imágenes a .tar |

---

## Entornos

### Desarrollo (`make dev`)

```bash
# docker-compose.yml
- DB: PostgreSQL 16 con hot-reload
- API: tsx watch (recarga automática en cambios)
- Web: Vite dev server (HMR en cambios)
```

### Testing (`make test`)

```bash
# Tests unitarios + integración
# Cobertura con @vitest/coverage-v8
make test-coverage   # Reporte en packages/*/coverage/
```

### Producción (`make prod`)

```bash
# docker-compose.prod.yml
- Multi-stage builds (deps → build → runtime)
- nginx sirviendo estáticos (con gzip + security headers)
- Resource limits por servicio
- Read-only filesystem + tmpfs
- Capabilities drop (principio de mínimo privilegio)
- Healthchecks para todos los servicios
- Logging estructurado con rotación
```

---

## Testing

| Tipo | Herramienta | Cobertura |
|------|-------------|-----------|
| **Unitarios** | Vitest | Validators, Use Cases, Views |
| **Integración** | Vitest + Fastify.inject | Controladores HTTP |
| **E2E** | Playwright | Flujos completos en navegador |
| **Type checking** | `tsc --noEmit` | Tipado estático |

```bash
# Rápido
make test

# Detallado
make test-report

# Con cobertura
make test-coverage
```

---

## Entidades implementadas

| Entidad | Backend | Frontend | Endpoints API |
|---------|---------|----------|---------------|
| **Member** (socios) | ✅ CRUD | ✅ CRUD | 4 endpoints |
| **Sport** (deportes) | ✅ CRUD | ✅ CRUD | 4 endpoints |
| **Payment** (pagos) | ✅ CRUD | ✅ CRUD | 4 endpoints |
| **MedicalCertificate** | ✅ Create + GetActive | ✅ View + Create | 2 endpoints |
| **Discipline** | ✅ CRUD | ✅ CRUD | 5 endpoints |

---

## Documentación

| Documento | Descripción |
|-----------|-------------|
| `docs/architecture/hexagonal-map.md` | Mapa de arquitectura hexagonal con diagramas Mermaid |
| `docs/architecture/presentacion.md` | Slides para alumnos (formato Marp) |
| `docs/testing/strategy.md` | Estrategia de testing completa |
| `docs/infrastructure/docker-analysis.md` | Análisis de infraestructura Docker |
| `docs/notas-academicas/` | 12 notas académicas sobre SDD, testing, arquitectura |
| `openspec/specs/` | Especificaciones de todas las entidades |

---

## Metodología

El proyecto utiliza **Spec-Driven Development (SDD)**:

```
Proposal → Spec → Design → Tasks → Apply → Verify → Archive
```

Cada cambio pasa por las 7 fases SDD con artefactos persistidos en `openspec/`.
