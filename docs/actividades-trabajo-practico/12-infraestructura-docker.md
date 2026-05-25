# Ingeniería y Calidad de Software

2026

TP Integrador - Actividad 4: Infraestructura Docker y DevOps

**Límite de entrega: Domingo 14/06 23:59 hs**

***[IMPORTANTE:]*** *Las dudas sobre este TP se realizan en <https://github.com/orgs/frlp-utn-ingsoft/discussions/categories/q-a>.*

***No se contestan dudas por email.***

***Nota para los alumnos:*** *Esta actividad puede ejecutarse en paralelo con la Actividad 3 (Testing) ya que son independientes. Pueden trabajar sobre el mismo repositorio en ramas separadas.*

---

## Objetivos

- Comprender y aplicar multi-stage builds en Docker
- Implementar buenas prácticas de seguridad en contenedores
- Configurar logging estructurado y monitoreo
- Diseñar una estrategia de CI/CD
- Optimizar imágenes Docker para producción

## Contenidos cubiertos

1. **Multi-stage builds** — etapas deps → build → runtime
2. **Seguridad en contenedores** — usuario no-root, read-only filesystem, capabilities
3. **Docker Compose profiles** — separación de entornos dev vs prod
4. **Healthchecks y resource limits** — estabilidad y orquestación
5. **Logging estructurado** — driver json-file, rotación, niveles por entorno
6. **CI/CD con GitHub Actions** — automatización de build, test y deploy
7. **GitOps concepts** — introducción a ArgoCD / Flux

---

## Tareas correspondientes a esta actividad

### Actividad 4.1: Analizar infraestructura actual (individual, 2hs)

Leer el análisis completo en `docs/infrastructure/docker-analysis.md` y realizar las siguientes tareas:

1. Identificar **3 vulnerabilidades críticas** en la configuración Docker actual del proyecto.
2. Proponer una **solución concreta** para cada vulnerabilidad identificada, incluyendo el código necesario (Dockerfile, YAML, etc.).
3. Estimar el **impacto en el tamaño de las imágenes** después de aplicar las soluciones propuestas, expresado en MB y porcentaje de reducción.

Formato de entrega: documento Markdown en `docs/infraestructura/analisis-individual-{usuario}.md`.

### Actividad 4.2: Multi-stage Dockerfile (grupal, 3hs)

Crear los siguientes archivos:

- `packages/api/Dockerfile.prod`
- `packages/web/Dockerfile.prod`

Ambos deben implementar **3 etapas**:

| Etapa | Nombre | Propósito |
|-------|--------|-----------|
| Stage 1 | `deps` | `npm ci --omit=dev` — solo dependencias de producción |
| Stage 2 | `build` | Compilación TypeScript (`tsc -b`) y build de frontend (`vite build`) |
| Stage 3 | `runtime` | Solo lo necesario para ejecutar: binarios compilados, node_modules de prod, usuario no-root |

Requisitos:

- La imagen final debe ejecutarse con un **usuario no-root** (`appuser` / `node`).
- El tamaño debe reducirse **al menos un 70%** respecto a las imágenes actuales (1.02 GB API, 570 MB Web).
- No debe incluir devDependencies, source TypeScript, ni herramientas de build.
- Agregar `.dockerignore` completo si no existe.

### Actividad 4.3: Docker Compose production profile (grupal, 2hs)

Crear `docker-compose.prod.yml` con los servicios `api`, `web` y `db` configurados para producción:

| Aspecto | Requisito |
|---------|-----------|
| **Resource limits** | CPU y memoria definidos por servicio (ej: API 512M/0.5 CPU) |
| **Healthchecks** | Endpoint `/health` para API, `curl -f http://localhost:3000/health` |
| **Logging** | Driver `json-file` con `max-size: 10m` y `max-file: 3` |
| **Secrets** | Almacenar contraseñas y claves vía `secrets:` o `.env.production` |
| **Read-only filesystem** | Aplicar `read_only: true` en api y web, con `tmpfs` para `/tmp` |
| **Capabilities** | `cap_drop: ALL` + `cap_add: NET_BIND_SERVICE` |
| **Red personalizada** | Red interna `alentapp-net` con driver `bridge` |
| **Reinicio** | `restart: unless-stopped` en todos los servicios |

### Actividad 4.4: CI/CD Pipeline (grupal, 3hs)

Crear `.github/workflows/deploy.yml` con los siguientes jobs:

1. **Job `test`** — Se ejecuta en push a `main`:
   - `actions/checkout@v4`
   - `npm ci`
   - `npm test` (unit + integration)

2. **Job `build-and-push`** — Depende de `test`:
   - Login a container registry (GitHub Container Registry o Docker Hub)
   - Build de imágenes usando los Dockerfile.prod
   - Push con tag `:latest` y `:${{ github.sha }}`

3. **Job `deploy`** — Depende de `build-and-push`:
   - Conexión SSH al servidor de producción
   - `docker compose pull`
   - `docker compose up -d`
   - Limpieza de imágenes viejas

### Actividad 4.5: Documentación y presentación (grupal, 2hs)

1. Documentar la **estrategia de infraestructura** en `docs/infraestructura/estrategia-despliegue.md` incluyendo:
   - Arquitectura de contenedores
   - Flujo de CI/CD
   - Decisiones de seguridad adoptadas
   - Justificación de cada perfil (dev vs prod)

2. Preparar una **presentación de 10 minutos** para el curso:
   - Comparar tamaño de imágenes antes/después con capturas de `docker images`
   - Mostrar el pipeline de CI/CD funcionando
   - Demostrar un deploy exitoso

---

## Entregables

| # | Archivo | Ubicación |
|---|---------|-----------|
| 1 | Dockerfile.prod de API | `packages/api/Dockerfile.prod` |
| 2 | Dockerfile.prod de Web | `packages/web/Dockerfile.prod` |
| 3 | Docker Compose producción | `docker-compose.prod.yml` |
| 4 | Pipeline CI/CD | `.github/workflows/deploy.yml` |
| 5 | Informe de métricas | `docs/infraestructura/metrics-{grupo}.md` |

El informe de métricas debe incluir:

| Métrica | Antes | Después | Reducción |
|---------|-------|---------|-----------|
| Tamaño imagen API | 1.02 GB | | |
| Tamaño imagen Web | 570 MB | | |
| Tiempo de build API | | | |
| Tiempo de build Web | | | |
| Memoria en runtime API | | | |
| Memoria en runtime Web | | | |
| Tiempo de startup API | | | |
| Tiempo de startup Web | | | |

---

## Criterios de evaluación

| Criterio | Puntos |
|----------|--------|
| Multi-stage correcto (3 etapas: deps → build → runtime) | 25 |
| Reducción de tamaño ≥ 70% | 15 |
| Seguridad (no-root, read-only, secrets, capabilities) | 20 |
| Resource limits y healthchecks | 15 |
| CI/CD pipeline funcional | 15 |
| Documentación y presentación | 10 |
| **Total** | **100** |

---

## Entrega

La entrega se realiza a través del GitHub Discussions perteneciente a la organización de la cátedra, con la categoría Show and Tell: <https://github.com/orgs/frlp-utn-ingsoft/discussions/categories/show-and-tell>

Ahí van a tener que crear una discusión con el título *Actividad 4 - GRUPO X* y dejando el link al repositorio en la descripción.

***[IMPORTANTE:]*** *No se puede resolver el trabajo haciendo commits desde la interfaz de Github.*

---

## Referencias

- Documentación oficial de Docker multi-stage builds: <https://docs.docker.com/build/building/multi-stage/>
- Seguridad en Docker: <https://docs.docker.com/engine/security/>
- Docker Compose profiles: <https://docs.docker.com/compose/profiles/>
- GitHub Actions: <https://docs.github.com/en/actions>
- 12 Factor App (logging, config, disposabilidad): <https://12factor.net/>
- Buenas prácticas de Dockerfile: <https://docs.docker.com/develop/develop-images/dockerfile_best-practices/>
- GitOps con ArgoCD: <https://argo-cd.readthedocs.io/>
- GitOps con Flux: <https://fluxcd.io/>

---

## Ayuda y Documentación general

- Comandos principales de git (sólo secciones EFECTUAR CAMBIOS, CREAR REPOSITORIOS y SINCRONIZAR CAMBIOS): <https://training.github.com/downloads/es_ES/github-git-cheat-sheet.pdf>
- git: <https://git-scm.com/>
- Docker: <https://www.docker.com/>
- Documentación sobre markdown para escribir un README.md:
  - <https://dillinger.io/>
  - <https://guides.github.com/features/mastering-markdown/>
