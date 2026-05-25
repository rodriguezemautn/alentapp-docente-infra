---
tema: Notas Académicas — Infraestructura Docker y Buenas Prácticas
fecha: 2026-05-25
docente: Emanuel Rodriguez
---

# Notas Académicas: Infraestructura Docker y DevOps en Alentapp Docente

## Índice

1. [Introducción a Docker en el Proyecto](#1-introducción-a-docker-en-el-proyecto)
2. [Multi-Stage Builds](#2-multi-stage-builds)
3. [Seguridad en Contenedores](#3-seguridad-en-contenedores)
4. [Orquestación con Docker Compose](#4-orquestación-con-docker-compose)
5. [Estrategias de Despliegue](#5-estrategias-de-despliegue)
6. [Monitoreo y Observabilidad](#6-monitoreo-y-observabilidad)
7. [Buenas Prácticas Aplicadas](#7-buenas-prácticas-aplicadas)
8. [Análisis Comparativo: Antes vs. Después](#8-análisis-comparativo-antes-vs-después)
9. [Referencias Bibliográficas](#9-referencias-bibliográficas)

---

## 1. Introducción a Docker en el Proyecto

### 1.1. ¿Por Qué Docker?

Docker se adoptó en Alentapp Docente por tres razones fundamentales:

1. **Consistencia entre entornos**: el mismo `Dockerfile` y `docker-compose.yml` funcionan en la PC del alumno, en el servidor de CI, y en producción. No más "en mi máquina funciona".
2. **Aislamiento de dependencias**: PostgreSQL 16, Node.js 22, y las herramientas de build viven en contenedores sin contaminar el host.
3. **Reproducibilidad**: cualquier alumno puede clonar el repo, ejecutar `make dev`, y tener el proyecto funcionando en < 2 minutos.

### 1.2. Evolución de la Infraestructura

```
v0.1 (inicio)              → Dev-only, npm run dev local
v0.5 (docker-compose.yml)  → PostgreSQL + API + Web en Docker (dev)
v1.0 (actual)              → Multi-stage, seguridad, CI/CD, Makefile
```

En la versión inicial, los alumnos tenían que instalar PostgreSQL manualmente, configurar variables de entorno, y ejecutar múltiples comandos. Con Docker, todo se reduce a:

```bash
git clone && make dev
```

---

## 2. Multi-Stage Builds

### 2.1. Problema Original

Los Dockerfiles originales tenían una sola etapa:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY packages/*/package.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev", "-w", "packages/api"]
```

**Problemas**:
- La imagen incluye TypeScript sin compilar (se ejecuta con `tsx` en runtime)
- Incluye `devDependencies` (testing, linting, etc.)
- Incluye el source code completo
- Tamaño: **1.02 GB** para API, **570 MB** para Web

### 2.2. Solución: Multi-Stage

```dockerfile
# ============ STAGE 1: Dependencies ============
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ============ STAGE 2: Build ============
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx tsc && npm -w packages/web run build

# ============ STAGE 3: Runtime ============
FROM node:22-alpine AS runtime
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/packages/api/dist ./packages/api/dist
COPY --from=deps /app/node_modules ./node_modules
COPY packages/api/prisma ./packages/api/prisma
USER appuser
CMD ["node", "packages/api/dist/app.js"]
```

**Beneficios**:
- La imagen final solo contiene lo necesario para CORRER la app
- TypeScript se compila en Stage 2 y se descarta
- `devDependencies` se instalan en Stage 1 y se descartan
- Tamaño estimado: **~150 MB** (85% de reducción)

### 2.3. Principio: Build Once, Deploy Many

El multi-stage implementa el principio de **build una sola vez, deploy en cualquier lado**:

```
Código → Stage deps (instala) → Stage build (compila) → Stage runtime (ejecuta)
                                                              ↓
                                                docker push a registry
                                                              ↓
                                        docker pull en producción (imagen mínima)
```

Cada stage es una capa independiente. Solo la última (runtime) llega a producción. Las capas intermedias se descartan.

---

## 3. Seguridad en Contenedores

### 3.1. Principio de Mínimo Privilegio

Un contenedor no debería tener más permisos de los que necesita para funcionar. Las siguientes prácticas implementan este principio:

#### 3.1.1. Usuario No-Root

```dockerfile
# ❌ Antes: el proceso corre como root
# ✅ Después:
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
```

Si un atacante explota la aplicación, tiene permisos de `appuser`, no de `root`.

#### 3.1.2. Read-Only Filesystem

```yaml
# docker-compose.prod.yml
services:
  api:
    read_only: true          # ❌ No puede escribir en el filesystem
    tmpfs:
      - /tmp                 # ✅ Solo /tmp es escribible
```

Esto evita que un atacante modifique binarios o escriba archivos maliciosos.

#### 3.1.3. Capabilities Drop

```yaml
services:
  api:
    cap_drop:
      - ALL                  # ❌ Elimina TODAS las capacidades Linux
    cap_add:
      - NET_BIND_SERVICE     # ✅ Solo necesita abrir un puerto
```

Las capacidades Linux son privilegios específicos (como `CAP_NET_RAW` para raw sockets, `CAP_SYS_ADMIN` para administración del sistema). Eliminar todas y solo agregar las necesarias reduce drásticamente la superficie de ataque.

#### 3.1.4. no-new-privileges

```yaml
services:
  api:
    security_opt:
      - no-new-privileges:true
```

Impide que el proceso (o sus hijos) escalen privilegios, incluso si ejecutan binarios SUID.

### 3.2. Secrets Management

```yaml
# ❌ Antes: contraseña en texto plano en docker-compose.yml
POSTGRES_PASSWORD: password123

# ✅ Después: variables desde .env (excluido del repo)
# .env no se commitea (incluido en .gitignore y .dockerignore)
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:?error}
```

Para producción, Docker Secrets ofrece una capa adicional:

```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
services:
  db:
    secrets:
      - db_password
```

### 3.3. Defense in Depth

La seguridad se aplica en CAPAS. Si una capa falla, la siguiente contiene el daño:

```
1. Read-only filesystem  → No modificar binarios
2. Capabilities drop     → No escalar privilegios
3. No-new-privileges     → No SUID exploits
4. Non-root user         → No root access
5. Network isolation     → No acceso a otros servicios
6. Resource limits       → No DoS al host
7. Secrets management    → No credenciales en código
```

---

## 4. Orquestación con Docker Compose

### 4.1. Perfiles de Entorno

Docker Compose permite definir perfiles para separar entornos:

```bash
# Desarrollo
docker compose up        # usa docker-compose.yml (dev)

# Producción
docker compose -f docker-compose.prod.yml up    # usa perfil productivo
```

### 4.2. Healthchecks

```yaml
services:
  api:
    healthcheck:
      test: ['CMD-SHELL', 'wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1']
      interval: 30s
      timeout: 10s
      start_period: 30s   # Espera 30s antes del primer check
      retries: 3
```

Los healthchecks permiten a Docker saber si el servicio está realmente funcionando, no solo si el proceso está vivo.

### 4.3. Resource Limits

```yaml
deploy:
  resources:
    limits:
      memory: 512M        # Límite duro: si excede, OOM kill
      cpus: '0.5'         # Máximo 50% de un CPU
    reservations:
      memory: 256M        # Memoria garantizada
```

Sin límites, un memory leak en la API puede tumbar la DB y el frontend.

### 4.4. Networks Aisladas

```yaml
networks:
  alentapp-net:
    driver: bridge
    name: alentapp-production
```

Por defecto, Docker Compose crea una red default donde todos los servicios se ven. Con redes explícitas se controla el aislamiento. En este proyecto, todos los servicios comparten una red, pero en arquitecturas más complejas se pueden separar (ej: DB en red interna sin acceso desde internet).

---

## 5. Estrategias de Despliegue

### 5.1. Pipeline CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  test:         # 1. Tests
  build-api:    # 2. Build imagen API
  build-web:    # 3. Build imagen Web
  deploy:       # 4. Deploy a producción (vía SSH)
```

**Flujo:**
```
Push a main → Tests → Build images → Push to registry → SSH deploy
```

Cada paso es un job independiente. Si `test` falla, no se construyen imágenes. Si `build-api` falla, no se deploya.

### 5.2. GitOps (Concepto)

GitOps es una evolución de CI/CD donde el repositorio Git es la **fuente única de verdad** para la infraestructura:

```
1. Cambio en git (manifiestos Kubernetes o Docker Compose)
2. Herramienta GitOps detecta el cambio (ArgoCD / Flux)
3. Sincroniza automáticamente el estado real con el estado deseado
4. Si hay drift, lo corrige automáticamente
```

Para este proyecto, GitOps es una mejora futura cuando se migre a Kubernetes.

### 5.3. Estrategias de Release

```
v1.0.0 → Tag en git
       → docker tag alentapp-api:latest alentapp-api:v1.0.0
       → docker save → alentapp-v1.0.0.tar (1.4 GB)
```

Las imágenes Docker versionadas permiten:
- Rollback instantáneo (`docker compose up -d` con tag anterior)
- Auditoría (saber exactamente qué versión corría en cada fecha)
- Distribución offline (`docker load -i alentapp-v1.0.0.tar`)

---

## 6. Monitoreo y Observabilidad

### 6.1. Logging Estructurado

```yaml
logging:
  driver: 'json-file'
  options:
    max-size: '10m'     # Rotación cada 10MB
    max-file: '3'       # Mantiene 3 archivos de log
```

El driver `json-file` produce logs en formato JSON, que pueden ser consumidos por herramientas como Loki, ELK, o Grafana.

### 6.2. Healthchecks como Monitoreo

Los healthchecks no solo sirven para orquestación — también son una forma de monitoreo:

```bash
# Saber en segundos si un servicio está caído
docker compose ps
```

En producción, estos healthchecks pueden alimentar sistemas de alerta (PagerDuty, OpsGenie).

### 6.3. Métricas (Futuro)

Para un monitoreo completo, el siguiente paso sería agregar:

- **Prometheus**: recolecta métricas de CPU, memoria, requests
- **Grafana**: dashboards visuales
- **Loki**: agregación de logs
- **Tempo**: tracing distribuido

---

## 7. Buenas Prácticas Aplicadas

### 7.1. 12 Factor App

La [metodología 12 Factor](https://12factor.net/) guía la construcción de aplicaciones como servicio. Este proyecto aplica:

| Factor | Aplicación |
|--------|-----------|
| **I. Código base** | Un repositorio, múltiples deploys (dev/test/prod) |
| **II. Dependencias** | `npm ci` + Docker aísla dependencias |
| **III. Configuración** | Variables de entorno via `.env`, no en código |
| **IV. Backing services** | PostgreSQL es un recurso adjunto (connection string) |
| **V. Build, release, run** | Multi-stage: build → tag → deploy |
| **VI. Procesos** | API = proceso stateless, sin sesiones locales |
| **VII. Port binding** | API exporta HTTP en puerto 3000 |
| **VIII. Concurrencia** | Horizontal scaling via `docker compose up --scale` |
| **IX. Desechabilidad** | Contenedores pueden morir y reemplazarse |
| **X. Dev/prod parity** | Mismo Dockerfile, mismas dependencias |
| **XI. Logs** | Logs como Event Stream (stdout/stderr) |
| **XII. Admin processes** | `make seed`, `make seed-reset` como one-off tasks |

### 7.2. Docker Best Practices

| Práctica | Implementación |
|----------|---------------|
| **Imágenes pequeñas** | `node:22-alpine` (~50MB) + multi-stage |
| **Capas en orden de frecuencia de cambio** | package.json antes que source code |
| **No ejecutar como root** | `USER appuser` |
| **Un proceso por contenedor** | API y Web en contenedores separados |
| **Healthchecks** | Endpoint HTTP chequeable |
| **Labels** | Metadata para organización |
| **.dockerignore** | Excluir lo que no se necesita en build |
| **No secrets en imágenes** | `.env` en runtime, no en build |
| **Read-only rootfs** | Prevenir modificaciones |
| **Resource limits** | Evitar DoS entre servicios |
| **Logs a stdout** | Docker log driver maneja la rotación |

### 7.3. Makefile como Interfaz Unificada

El `Makefile` actúa como **fachada** sobre la complejidad de Docker, npm, y git:

```bash
make dev    # = docker compose up -d --build
make test   # = npm -w packages/api run test && npm -w packages/web run test
make prod   # = docker compose -f docker-compose.prod.yml up -d --build
```

Cada comando tiene un nombre corto, predecible, y documentado en `make help`.

---

## 8. Análisis Comparativo: Antes vs. Después

### 8.1. Tamaño de Imágenes

| Aspecto | Antes | Después (estimado) | Mejora |
|---------|-------|-------------------|--------|
| API | 1.02 GB | ~150 MB | **85%** |
| Web | 570 MB | ~80 MB | **86%** |
| Total | 1.59 GB | ~230 MB | **85%** |

### 8.2. Seguridad

| Aspecto | Antes | Después |
|---------|-------|---------|
| Contraseñas | Texto plano en YAML | Secrets via `.env` |
| Usuario | Root | `appuser` no-root |
| Filesystem | Read-write | Read-only + tmpfs |
| Capabilities | Todas | Solo `NET_BIND_SERVICE` |
| Privilege escalation | Posible | Bloqueado |

### 8.3. DevOps

| Aspecto | Antes | Después |
|---------|-------|---------|
| Deploy | Manual | CI/CD automatizado |
| Builds | Dev puro (tsx, vite) | Multi-stage producción |
| Logging | Sin configurar | Rotación + JSON |
| Healthchecks | Solo DB | DB + API + Web |
| Resource limits | ❌ | ✅ CPU + memory |

### 8.4. Developer Experience

| Aspecto | Antes | Después |
|---------|-------|---------|
| Comandos para empezar | `docker compose up --build` | `make dev` |
| Comandos para test | Múltiples npm scripts | `make test` |
| Comandos para seed | No existía | `make seed` |
| Documentación de comandos | README disperso | `make help` |

---

## 9. Referencias Bibliográficas

1. **Docker Inc.** (2024). *Docker Best Practices*. docs.docker.com. — Guía oficial de mejores prácticas para escribir Dockerfiles, incluyendo multi-stage builds, .dockerignore, y gestión de capas.

2. **Docker Inc.** (2024). *Docker Security*. docs.docker.com/engine/security/. — Documentación oficial sobre seguridad en contenedores: seccomp, AppArmor, capabilities, y read-only filesystem.

3. **Wiggins, A.** (2024). *The Twelve-Factor App*. 12factor.net. — Metodología para construir aplicaciones como servicio, aplicada a la configuración, backing services, y logs.

4. **Adrian Mouat** (2015). *Docker Security: Are Your Containers Locked Down?*. O'Reilly. — Análisis de vulnerabilidades comunes en contenedores y cómo mitigarlas con user namespaces, capabilities, y read-only mounts.

5. **Turnbull, J.** (2014). *The Docker Book*. — Guía práctica de Docker que cubre desde conceptos básicos hasta orquestación con Compose.

6. **Humble, J. & Farley, D.** (2010). *Continuous Delivery: Reliable Software Releases Through Build, Test, and Deployment Automation*. Addison-Wesley. — Fundamentos de CI/CD que informan el pipeline de GitHub Actions del proyecto.

7. **Kim, G., Humble, J., Debois, P., & Willis, J.** (2016). *The DevOps Handbook*. IT Revolution Press. — Prácticas de DevOps que guían la integración entre desarrollo, testing, y operaciones.

8. **Newman, S.** (2021). *Building Microservices* (2nd ed.). O'Reilly. — Patrones de despliegue y orquestación de contenedores, incluyendo estrategias de release y rollback.

9. **Burns, B.** (2019). *Designing Distributed Systems*. O'Reilly. — Principios de diseño para sistemas en contenedores, incluyendo patterns de sidecar, ambassador, y adapter.

10. **CNCF** (2024). *Cloud Native DevOps*. cncf.io. — Prácticas recomendadas para el desarrollo nativo en la nube, incluyendo GitOps con ArgoCD y Flux.

11. **IEEE** (2020). *IEEE Standard for Container Security*. IEEE Std 2869-2020. — Estándar de seguridad para contenedores que informa las prácticas de cap_drop, read-only, y no-new-privileges.

12. **OWASP** (2024). *Docker Security Cheat Sheet*. owasp.org. — Guía de seguridad para Docker de OWASP, incluyendo hardening de imágenes y escaneo de vulnerabilidades con Trivy.
