# Docker Production Specification

## Purpose

Define la infraestructura Docker para entornos productivos con multi-stage builds, hardening de seguridad, optimización de recursos y buenas prácticas de industria.

## Requirements

### Requirement: Multi-stage Dockerfile API

The API `Dockerfile.prod` MUST have 3 stages (deps, build, runtime) usando `node:22-alpine`.

#### Scenario: Build API productiva

- GIVEN el archivo `packages/api/Dockerfile.prod`
- WHEN se ejecuta `docker build -f packages/api/Dockerfile.prod -t alentapp-api:prod .`
- THEN la imagen resultante pesa < 300MB
- AND NO contiene `tsc`, `npm`, `python` ni herramientas de build

### Requirement: Multi-stage Dockerfile Web

The Web `Dockerfile.prod` MUST have 3 stages (deps, build, runtime) usando `nginx:stable-alpine` para servir static files.

#### Scenario: Build Web productiva

- GIVEN el archivo `packages/web/Dockerfile.prod`
- WHEN se ejecuta `docker build -f packages/web/Dockerfile.prod -t alentapp-web:prod .`
- THEN la imagen resultante pesa < 170MB
- AND sirve archivos estáticos vía nginx con gzip y security headers

### Requirement: Hardening docker-compose.prod.yml

El `docker-compose.prod.yml` MUST aplicar: read_only, cap_drop ALL + cap_add NET_BIND_SERVICE, no-new-privileges, tmpfs para /tmp, logging con rotación json-file, healthchecks en todos los servicios, resource limits, red interna aislada, secrets via .env.

#### Scenario: Verificar seguridad

- GIVEN `docker-compose.prod.yml` levantado
- WHEN se ejecuta `docker exec alentapp-api touch /test`
- THEN falla con error de read-only filesystem
- AND `docker exec alentapp-api whoami` muestra `appuser` (no root)

#### Scenario: Verificar healthchecks

- GIVEN servicios levantados con `docker compose -f docker-compose.prod.yml up -d`
- WHEN se ejecuta `docker compose -f docker-compose.prod.yml ps`
- THEN todos los servicios muestran estado "healthy"
