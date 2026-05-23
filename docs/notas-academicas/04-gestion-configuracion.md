---
tema: Notas Académicas — Gestión de Configuración
fecha: 2026-05-23
docente: Emanuel Rodriguez
---

# Notas Académicas: Gestión de Configuración

## Índice

1. [Introducción](#1-introducción)
2. [Conceptos Fundamentales](#2-conceptos-fundamentales)
3. [Gestión de Configuración en Alentapp](#3-gestión-de-configuración-en-alentapp)
4. [Control de Versiones](#4-control-de-versiones)
5. [Gestión de Dependencias](#5-gestión-de-dependencias)
6. [Configuración del Entorno](#6-configuración-del-entorno)
7. [Integridad y Reproducibilidad](#7-integridad-y-reproducibilidad)
8. [Herramientas Implementadas](#8-herramientas-implementadas)
9. [Referencias Bibliográficas](#9-referencias-bibliográficas)

---

## 1. Introducción

La Gestión de Configuración (Configuration Management, CM) es la disciplina de la ingeniería de software que se ocupa de **identificar, controlar, registrar y auditar** los elementos de configuración de un sistema a lo largo de su ciclo de vida. Según el IEEE Std 828-2012, la CM abarca la identificación de ítems de configuración, el control de cambios, el registro de estado y las auditorías de configuración.

En el contexto del repositorio Alentapp Docente, la CM asegura que cada cambio sea trazable, cada versión sea reproducible, y cada desarrollador (o estudiante) trabaje sobre una base conocida y controlada.

---

## 2. Conceptos Fundamentales

### 2.1. Item de Configuración (CI)

Un **item de configuración** es cualquier elemento del sistema que se gestiona de forma controlada: archivos de código, documentación, configuraciones de herramientas, schemas de base de datos, scripts de CI/CD, etc.

En Alentapp, los CIs incluyen:
- Código fuente en `packages/`
- Schema de Prisma (`prisma/schema.prisma`)
- Configuraciones de herramientas (`commitlint.config.mjs`, `.husky/`, `eslint.config.js`)
- Documentación (`docs/`)
- Manifiestos de Docker (`docker-compose.yml`)
- Archivos de dependencias (`package.json`, `package-lock.json`)

### 2.2. Línea Base (Baseline)

Una **línea base** es una instantánea aprobada de uno o más CIs que sirve como referencia para el desarrollo posterior. En Alentapp, cada commit en `main` representa una línea base del sistema completo.

### 2.3. Gestión de Versiones

La gestión de versiones asigna identificadores únicos a cada estado del sistema. Este proyecto usa **Semantic Versioning** (SemVer 2.0.0) con formato `MAJOR.MINOR.PATCH`, donde:

- **MAJOR**: cambios incompatibles en la API o schema de datos
- **MINOR**: funcionalidades nuevas compatibles hacia atrás
- **PATCH**: correcciones de bugs compatibles hacia atrás

---

## 3. Gestión de Configuración en Alentapp

### 3.1. Identificación de CIs

Cada elemento de configuración se identifica por su **ruta relativa** en el repositorio y su **hash** (SHA de git). La combinación ruta + hash + tag de versión identifica unívocamente cualquier estado del sistema.

### 3.2. Ramas como Líneas de Evolución

```
main           → Línea base estable, solo llega vía PR
feat/*         → Evolución de funcionalidades nuevas
fix/*          → Correcciones
chore/*        → Mantenimiento y tooling
docs/*         → Documentación
```

Cada rama `feat/*` representa una **línea de evolución** de un CI que, al integrarse a `main`, actualiza la línea base.

### 3.3. Control de Cambios

Todo cambio en Alentapp sigue un proceso controlado:

1. **Creación de rama** desde `main`
2. **Commits atómicos** con conventional commits (validados por commitlint)
3. **PR a main** con revisión
4. **Merge con squash** (un commit = un cambio completo)
5. **Eliminación de rama fuente** (post-merge automático)

---

## 4. Control de Versiones

### 4.1. Git como Sistema de Control de Versiones

Git es un DVCS (Distributed Version Control System) que registra el historial completo del proyecto. Cada commit es un snapshot del estado completo del repositorio, identificado por un hash SHA-256.

### 4.2. Conventional Commits

El proyecto usa Conventional Commits 1.0.0, validados automáticamente por commitlint en el hook `commit-msg`:

```
feat(api): agrega endpoint de creación de deportes
fix(web): corrige validación de fecha en formulario
docs(root): actualiza README con instrucciones de setup
chore(deps): actualiza vitest a v4
```

**Estructura**: `tipo(alcance): descripción`

**Tipos permitidos**: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

**Alcances permitidos**: api, web, shared, prisma, root, docs, e2e, infra, deps

### 4.3. Tagging de Versiones

```bash
git tag -a v1.0.0 -m "v1.0.0: Primera versión estable"
git push origin --tags
```

Los tags siguen SemVer y se asocian a commits en `main`.

---

## 5. Gestión de Dependencias

### 5.1. npm Workspaces

El monorepo usa **npm workspaces** (no Lerna, no Turborepo). La resolución de dependencias es:

```
root package.json → devDependencies globales
packages/api/     → dependencias del backend
packages/web/     → dependencias del frontend
packages/shared/  → dependencias compartidas (mínimas)
```

### 5.2. Lock File

`package-lock.json` es el archivo de bloqueo que garantiza **reproducibilidad** de instalaciones. Debe estar versionado y nunca editarse manualmente.

### 5.3. Auditoría

```bash
npm audit        # Reporta vulnerabilidades conocidas
npm audit fix    # Corrige vulnerabilidades automáticamente
```

---

## 6. Configuración del Entorno

### 6.1. Variables de Entorno

El backend usa `dotenv` para cargar configuración desde `.env`. Las variables documentadas son:

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgres://...` |
| `PORT` | Puerto del servidor Fastify | `3000` |

### 6.2. Docker Compose

Dos entornos contenerizados:

| Archivo | Propósito |
|---------|-----------|
| `docker-compose.yml` | Desarrollo local (PostgreSQL) |
| `docker-compose.e2e.yml` | Tests end-to-end (PostgreSQL + app) |

### 6.3. Husky + commitlint

Validaciones automáticas en hooks de git:

| Hook | Acción | Herramienta |
|------|--------|-------------|
| `pre-commit` | Lint de archivos staged | lint-staged |
| `commit-msg` | Validación de mensaje | commitlint |

---

## 7. Integridad y Reproducibilidad

### 7.1. Package Lock

El `package-lock.json` asegura que cada instalación produzca exactamente el mismo árbol de dependencias.

### 7.2. Docker Images

Los contenedores de Docker aseguran que el entorno de ejecución es idéntico entre desarrolladores y CI.

### 7.3. Migraciones de Prisma

Los cambios en el schema de base de datos son **migraciones versionadas** en `prisma/migrations/`. Cada migración es un CI que se aplica en orden.

---

## 8. Herramientas Implementadas

| Herramienta | Propósito | Verificación |
|-------------|-----------|--------------|
| Git | Control de versiones | Historial de commits |
| husky | Git hooks | Ejecución pre-commit y commit-msg |
| commitlint | Validación de mensajes | Hook commit-msg |
| lint-staged | Lint de archivos staged | Hook pre-commit |
| conventional-changelog | Generación de CHANGELOG | `npm run changelog` |
| gh-automation.sh | Automatización de PRs | `npm run pr:create` |

---

## 9. Referencias Bibliográficas

1. **IEEE Std 828-2012**. *IEEE Standard for Configuration Management in Systems and Software Engineering*. — Estándar de referencia para procesos de CM.

2. **ISO/IEC 12207:2008**. *Systems and software engineering — Software life cycle processes*. — Define procesos de gestión de configuración en el ciclo de vida del software.

3. **Chacon, S. & Straub, B.** (2014). *Pro Git* (2nd ed.). Apress. — Libro de referencia sobre Git. Disponible en https://git-scm.com/book/.

4. **Conventional Commits 1.0.0**. https://www.conventionalcommits.org/ — Especificación de mensajes de commit estructurados.

5. **Semantic Versioning 2.0.0**. https://semver.org/ — Especificación de versionado semántico.

6. **npm Workspaces Documentation**. https://docs.npmjs.com/cli/v10/using-npm/workspaces — Gestión de monorepos con npm.

7. **Humphrey, W. S.** (1995). *A Discipline for Software Engineering*. Addison-Wesley. — El PSP (Personal Software Process) establece la medición y control de cambios como prácticas fundamentales.

8. **Pressman, R. S.** (2014). *Software Engineering: A Practitioner's Approach* (8th ed.). McGraw-Hill. — Capítulo de Gestión de Configuración como actividad de soporte en la ingeniería de software.
