# Análisis de Infraestructura Docker — Alentapp Docente

**Versión**: v2.0.0  
**Fecha**: 08/06/2026  
**Analista**: Emanuel Rodriguez

> ⚠️ Este documento se actualizó tras la implementación de la Actividad 4 Version Pro.  
> Las vulnerabilidades identificadas en v1.0.0 fueron corregidas.

---

## 1. Estado Actual

### 1.1. Servicios — Desarrollo

| Servicio | Imagen Base | Puerto | Modo | Dockerfile |
|----------|------------|--------|------|------------|
| `db` | `postgres:16-alpine` | 5432 | Producción | — |
| `api` | `node:22-alpine` | 3000 | Desarrollo (`tsx watch`) | `packages/api/Dockerfile` |
| `web` | `node:22-alpine` | 5173 | Desarrollo (`vite dev`) | `packages/web/Dockerfile` |

### 1.2. Servicios — Producción

| Servicio | Imagen Base | Puerto | Modo | Dockerfile |
|----------|------------|--------|------|------------|
| `db` | `postgres:16-alpine` | 5432 | Producción | — |
| `api` | `node:22-alpine` | 3000 | Producción (`node` runtime) | `packages/api/Dockerfile.prod` |
| `web` | `nginx:stable-alpine` | 8080:80 | Producción (nginx static) | `packages/web/Dockerfile.prod` |

### 1.3. Tamaño de imágenes

```bash
# Desarrollo
alentapp-api   1.02 GB    # node:22-alpine + devDependencies + tsx watch
alentapp-web   570 MB     # node:22-alpine + devDependencies + vite

# Producción (multi-stage)
alentapp-api   ~250 MB    # Solo runtime + producción deps
alentapp-web   ~50 MB     # nginx + static assets compilados
```

---

## 2. Vulnerabilidades y Problemas Identificados

### 🔴 CRÍTICO: Contraseña en texto plano

```yaml
# docker-compose.yml
POSTGRES_PASSWORD: password123
DATABASE_URL: postgres://admin:password123@db:5432/alentapp_db
```

**Riesgo**: Cualquiera con acceso al repo tiene acceso a la DB.
**Solución**: Usar `.env` file + variables de entorno con valores por defecto seguros.

### 🔴 CRÍTICO: Modo desarrollo en Dockerfiles

```dockerfile
CMD ["npm", "run", "dev", "-w", "packages/api"]
```

**Riesgo**: Los contenedores de producción ejecutan `tsx watch` (hot reload) y `vite dev`. Esto:
- No compila TypeScript a JS
- Consume más recursos (watchers, HMR)
- Expone el source code completo
- Es más lento en startup

**Solución**: Dockerfiles multi-stage con build de producción y runtime minimizado.

### 🟡 ALTO: Sin `.dockerignore` completo

```bash
# .dockerignore actual
node_modules
dist
.git
*.log
```

**Problemas**:
- No excluye `docs/`, `.gitignore`, `.env`, `*.md`, `coverage/`
- El contexto de build se lleva ~16MB innecesarios
- `COPY . .` en los Dockerfiles copia TODO

### 🟡 ALTO: Sin límites de recursos

```yaml
# Ausente en todos los servicios
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
```

**Riesgo**: Un servicio con memory leak puede tumbar el host completo.

### 🟡 ALTO: Volúmenes bind mount en producción

```yaml
volumes:
  - .:/app    # 🚨 EXPONE TODO EL REPO
```

**Riesgo**: `.:/app` monta el directorio host completo sobre el código del contenedor. Esto es para desarrollo con hot reload, pero NO debe estar en producción.

### 🟡 MEDIO: Sin red interna dedicada

```yaml
# No definida — usa la default "alentapp_default"
networks:  # ausente
```

**Beneficio**: Las redes personalizadas permiten aislar servicios y controlar qué puede comunicarse con qué.

### 🟡 MEDIO: Sin healthchecks en API y Web

Solo `db` tiene healthcheck. La API y Web no.

**Riesgo**: `docker compose up` no sabe si la app realmente está lista.

### 🟡 MEDIO: Sin logging estructurado

Fastify tiene logs en JSON (`pino`) pero no hay:
- Colector centralizado (ELK, Loki, Grafana)
- Rotación de logs
- Niveles de log configurables por entorno

### 🟢 BAJO: Sin etiquetas de metadata

```yaml
# Ausente en todos los servicios
labels:
  app: alentapp
  environment: production
  team: docente
  version: v1.0.0
```

**Beneficio**: Las labels ayudan a orquestadores (Kubernetes, Nomad) y herramientas de monitoreo.

### 🟢 BAJO: Sin usuario no-root

Los contenedores corren como `root` por defecto.

**Riesgo**: Si un atacante explota la app, tiene acceso root en el contenedor.

**Solución**: `USER node` en los Dockerfiles.

---

## 3. Oportunidades de Optimización

### 3.1. Multi-stage builds

**Actual**: 1 etapa → imagen de 1.02 GB / 570 MB  
**Propuesto**: 3 etapas → estimado ~150 MB / 80 MB

```dockerfile
# ============ STAGE 1: Dependencies ============
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/web/package.json ./packages/web/
RUN npm ci --omit=dev && npm cache clean --force

# ============ STAGE 2: Build ============
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx tsc -b packages/api && npm -w packages/web run build

# ============ STAGE 3: Runtime ============
FROM node:22-alpine AS runtime
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/packages/api/dist ./packages/api/dist
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=deps /app/node_modules ./node_modules
COPY packages/api/package.json ./packages/api/
COPY packages/api/prisma ./packages/api/prisma

USER appuser
EXPOSE 3000
CMD ["node", "packages/api/dist/app.js"]
```

**Ahorro estimado**: ~85% de reducción de tamaño.

### 3.2. Compresión de capas

```dockerfile
RUN npm ci --omit=dev && \
    npm cache clean --force && \
    rm -rf /tmp/*
```

Cada `RUN` crea una capa. Combinar comandos relacionados reduce capas.

### 3.3. Cache de dependencias

```dockerfile
# Copy solo package.json primero para cachear npm install
COPY package*.json ./
COPY packages/*/package.json ./
RUN npm ci
# Después copiar el source (cambia más seguido)
COPY . .
```

Esto aprovecha el cache de Docker: si `package.json` no cambia, `npm ci` usa cache.

### 3.4. Production vs Development profiles

```yaml
services:
  api:
    build:
      target: ${BUILD_TARGET:-runtime}  # default: production
    # ...
    profiles:
      - production
      - development
```

Usar Docker Compose profiles para separar entornos.

---

## 4. Seguridad

### 4.1. Secrets management

```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

### 4.2. No-root user

```dockerfile
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
```

### 4.3. Read-only filesystem

```yaml
services:
  api:
    read_only: true
    tmpfs:
      - /tmp
```

### 4.4. Capabilities drop

```yaml
services:
  api:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

---

## 5. Logging y Monitoreo

### 5.1. Logging driver

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 5.2. Colector centralizado (opcional)

```yaml
services:
  loki:
    image: grafana/loki:latest
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
```

---

## 6. Estrategias de Deploy

### 6.1. GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Build & Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build & Push API
        run: |
          docker build -f packages/api/Dockerfile.prod -t ghcr.io/.../api:${{ github.sha }} .
          docker push ghcr.io/.../api:${{ github.sha }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        run: |
          ssh user@host "docker compose pull && docker compose up -d"
```

### 6.2. GitOps (ArgoCD / Flux)

```
GitRepo (manifests/)
├── kustomization.yaml
├── base/
│   ├── deployment-api.yaml
│   ├── deployment-web.yaml
│   └── service.yaml
└── overlays/
    ├── dev/
    └── prod/
```

### 6.3. Docker Compose Production Profile

```yaml
services:
  api:
    build:
      target: runtime
    env_file: .env.production
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
    security_opt:
      - no-new-privileges:true
```

---

## 7. Estado de Acciones

| # | Acción | Estado | Prioridad | Detalle |
|---|--------|--------|-----------|---------|
| 1 | Multi-stage Dockerfile para API | ✅ Completado | 🔴 Crítica | `Dockerfile.prod`: 3 stages (deps/build/runtime), ~250MB |
| 2 | Multi-stage Dockerfile para Web | ✅ Completado | 🔴 Crítica | `Dockerfile.prod`: 3 stages (deps/build/nginx runtime), ~50MB |
| 3 | Secrets management (.env) | ✅ Completado | 🔴 Crítica | Passwords via `.env`, vars con `:?error` en producción |
| 4 | .dockerignore completo | ✅ Completado | 🟡 Alta | Excluye node_modules, .git, docs, scripts |
| 5 | Resource limits | ✅ Completado | 🟡 Alta | Memory + CPU limits en todos los servicios |
| 6 | Healthchecks en API/Web | ✅ Completado | 🟡 Alta | HTTP healthchecks con wget, interval 30s |
| 7 | Usuario no-root | ✅ Completado | 🟡 Alta | `appuser` en API, `nginx` en web |
| 8 | Red personalizada | ✅ Completado | 🟡 Media | `alentapp-production` interna |
| 9 | Logging config | ✅ Completado | 🟡 Media | `json-file`, max-size 10m, max-file 3 |
| 10 | Read-only filesystem | ✅ Completado | 🟢 Baja | `read_only: true` + tmpfs para /tmp |
| 11 | Capabilities drop | ✅ Completado | 🟢 Baja | `cap_drop: ALL` + `cap_add: NET_BIND_SERVICE, CHOWN, SETUID, SETGID` |
| 12 | Labels organizativas | ⬜ Pendiente | 🟢 Baja | Para futura iteración |
| 13 | GitHub Actions CI/CD | ⬜ Pendiente | 🟢 Baja | Para futura iteración |
| 14 | Docker Compose profiles | ⬜ Pendiente | 🟢 Baja | Separación dev/prod ya resuelta con archivos separados |
| 15 | nginx read-only fs | ✅ Completado | 🟡 Media | `nginx-main.conf` con temp paths en /tmp (fix IPv6 healthcheck) |
