# Análisis de Infraestructura Docker — Alentapp Docente

**Versión**: v1.0.0  
**Fecha**: 25/05/2026  
**Analista**: Emanuel Rodriguez  

---

## 1. Estado Actual

### 1.1. Servicios

| Servicio | Imagen Base | Puerto | Modo | Dockerfile |
|----------|------------|--------|------|------------|
| `db` | `postgres:16-alpine` | 5432 | Producción | — |
| `api` | `node:20-alpine` | 3000 | Desarrollo (`tsx watch`) | `packages/api/Dockerfile` |
| `web` | `node:20-alpine` | 5173 | Desarrollo (`vite dev`) | `packages/web/Dockerfile` |
| `api-test` | `node:20-alpine` | 3001 | Test | mismo Dockerfile |
| `web-test` | `node:20-alpine` | 5174 | Test | mismo Dockerfile |

### 1.2. Tamaño de imágenes

```bash
alentapp-api   1.02 GB    # node:20-alpine + devDependencies + tsx watch
alentapp-web   570 MB     # node:20-alpine + devDependencies + vite
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

## 7. Resumen de Acciones

| # | Acción | Prioridad | Esfuerzo | Impacto |
|---|--------|-----------|----------|---------|
| 1 | Multi-stage Dockerfile para API | 🔴 Crítica | 2h | Tamaño: 1.02GB → ~150MB |
| 2 | Multi-stage Dockerfile para Web | 🔴 Crítica | 1h | Tamaño: 570MB → ~80MB |
| 3 | Secrets management (.env) | 🔴 Crítica | 30min | Seguridad: contraseñas visibles |
| 4 | .dockerignore completo | 🟡 Alta | 15min | Build context: 16MB → ~2MB |
| 5 | Resource limits | 🟡 Alta | 15min | Estabilidad: evitar OOM |
| 6 | Healthchecks en API/Web | 🟡 Alta | 30min | Orquestación: saber si está ready |
| 7 | Usuario no-root | 🟡 Alta | 15min | Seguridad: contenedores |
| 8 | Red personalizada | 🟡 Media | 15min | Aislamiento de red |
| 9 | Logging config | 🟡 Media | 15min | Debugging en producción |
| 10 | Labels organizativas | 🟢 Baja | 10min | Metadata para orquestadores |
| 11 | GitHub Actions CI/CD | 🟢 Baja | 3h | Automatización de deploy |
| 12 | Docker Compose profiles | 🟢 Baja | 30min | Separación dev/prod |
| 13 | Read-only filesystem | 🟢 Baja | 15min | Seguridad |
| 14 | Capabilities drop | 🟢 Baja | 10min | Seguridad |
