---
tema: Notas Académicas — Gestión de Cambios
fecha: 2026-05-23
docente: Emanuel Rodriguez
---

# Notas Académicas: Gestión de Cambios

## Índice

1. [Introducción](#1-introducción)
2. [Fundamentos de Gestión de Cambios](#2-fundamentos-de-gestión-de-cambios)
3. [El Proceso de Cambio en Alentapp](#3-el-proceso-de-cambio-en-alentapp)
4. [SDD como Marco de Gestión de Cambios](#4-sdd-como-marco-de-gestión-de-cambios)
5. [Control de Cambios con Conventional Commits](#5-control-de-cambios-con-conventional-commits)
6. [PRs como Unidad de Revisión de Cambios](#6-prs-como-unidad-de-revisión-de-cambios)
7. [Chained PRs para Cambios Grandes](#7-chained-prs-para-cambios-grandes)
8. [Análisis de Riesgo en Cambios](#8-análisis-de-riesgo-en-cambios)
9. [Referencias Bibliográficas](#9-referencias-bibliográficas)

---

## 1. Introducción

La Gestión de Cambios (Change Management, CM) es el proceso de **controlar, documentar y comunicar** las modificaciones al sistema a lo largo de su ciclo de vida. En ingeniería de software, un cambio no es solo una edición de código: es una transformación controlada que debe entenderse, aprobarse, implementarse, verificarse y registrarse.

Este documento analiza cómo se aplica la gestión de cambios en el repositorio Alentapp Docente, combinando las prácticas de SDD (Spec-Driven Development) con herramientas automatizadas de validación y revisión.

---

## 2. Fundamentos de Gestión de Cambios

### 2.1. Elementos del Proceso de Cambio

| Elemento | Definición | En Alentapp |
|----------|------------|-------------|
| **Solicitud de Cambio** | Petición formal de modificación | Issue en GitHub |
| **Análisis de Impacto** | Evaluación de alcance y riesgo | SDD Proposal + Explore |
| **Aprobación** | Decisión de proceder | Aprobación de PR |
| **Implementación** | Ejecución del cambio | Commits en rama |
| **Verificación** | Confirmación de correctitud | Tests + SDD Verify |
| **Cierre** | Registro final del cambio | SDD Archive + merge |

### 2.2. Tipos de Cambio (IEEE Std 828)

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **Correctivo** | Corrige un defecto | Bug fix |
| **Perfectivo** | Mejora funcionalidad existente | Refactor, optimización |
| **Adaptativo** | Responde a cambios externos | Actualizar dependencias |
| **Preventivo** | Previene problemas futuros | Agregar tests faltantes |

---

## 3. El Proceso de Cambio en Alentapp

### 3.1. Ciclo Completo de Cambio

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  1. IDEA    │───→│  2. RAMA    │───→│  3. SDD     │
│  (issue/    │    │  feat/*     │    │  Propuesta  │
│  propuesta) │    │  desde main │    │  + Explore  │
└─────────────┘    └─────────────┘    └─────────────┘
                                             │
                                             ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  7. ARCHIVE │←───│  6. MERGE   │←───│  5. PR      │
│  (cierre    │    │  squash a   │    │  + Review   │
│  formal)    │    │  main       │    │  + Verify   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 3.2. Reglas del Proceso

1. **Toda rama nace de `main`** actualizada.
2. **Todo commit debe pasar commitlint** (hook `commit-msg`).
3. **Todo staged file pasa lint-staged** (hook `pre-commit`).
4. **Todo cambio significativo sigue SDD** (propuesta → spec → design → tasks → apply → verify → archive).
5. **Todo merge se hace por PR** (no commits directos a main).
6. **Post-merge se elimina la rama fuente**.

---

## 4. SDD como Marco de Gestión de Cambios

SDD es inherentemente un **proceso de gestión de cambios**. Cada fase controla una dimensión del cambio:

| Fase SDD | Dimensión del Cambio | Control |
|----------|---------------------|---------|
| **Exploración** | Análisis de impacto inicial | ¿Qué existe? ¿Qué toca? |
| **Propuesta** | Justificación del cambio | ¿Por qué? ¿Vale la pena? |
| **Especificación** | Definición del alcance | ¿Qué exactamente? |
| **Diseño** | Plan de implementación | ¿Cómo? ¿Qué archivos? |
| **Tareas** | Descomposición atómica | ¿En qué orden? |
| **Aplicación** | Ejecución controlada | ¿Se implementó cada tarea? |
| **Verificación** | Validación contra la spec | ¿Cumple lo prometido? |
| **Archivo** | Cierre y lecciones | ¿Qué aprendimos? |

### 4.1. Decision Gates (Compuertas de Decisión)

Cada fase SDD tiene un **punto de decisión** donde se puede:
- **Avanzar** a la siguiente fase
- **Retroceder** a la fase anterior para ajustar
- **Cancelar** el cambio

Este patrón de compuertas es análogo al modelo de **Quality Gate** en procesos de ingeniería.

### 4.2. Trazabilidad de Cambios

```
Issue #42 ──→ SDD Proposal ──→ Specs ──→ Design ──→ Tasks ──→ Commits ──→ PR #69 ──→ Merge → Archive
   ↑                                                                                        ↓
   └────────────────────── trazabilidad bidireccional ──────────────────────────────────────┘
```

Cada artefacto referencia al anterior, creando una cadena de trazabilidad que permite responder preguntas como:

- "¿Por qué se cambió este archivo?" → Issue o SDD Proposal
- "¿Qué tareas implementan esta funcionalidad?" → SDD Tasks → commits
- "¿Se verificó que cumple la especificación?" → SDD Verify

---

## 5. Control de Cambios con Conventional Commits

### 5.1. Estructura del Commit

```
feat(api): agrega endpoint POST /api/v1/sports
       ↑     ↑
    tipo  alcance
```

Cada commit documenta:
- **Tipo**: La naturaleza del cambio (feat, fix, docs, etc.)
- **Alcance**: El componente afectado (api, web, shared, prisma, etc.)
- **Descripción**: Qué se hizo, en presente imperativo

### 5.2. Mapeo Tipo → Significado del Cambio

| Tipo | Naturaleza del Cambio | Ejemplo |
|------|----------------------|---------|
| `feat` | Nueva funcionalidad | Endpoint nuevo, componente nuevo |
| `fix` | Corrección de bug | Error de validación, crash |
| `docs` | Documentación | Notas académicas, TDDs, README |
| `style` | Formato, estilo | ESLint auto-fix, prettier |
| `refactor` | Sin cambio funcional | Renombrar, extraer método |
| `perf` | Optimización | Mejora de performance |
| `test` | Tests | Test nuevo, fix de test |
| `build` | Build system | Config de Vite, tsconfig |
| `ci` | CI/CD | GitHub Actions, scripts |
| `chore` | Mantenimiento | Dependencias, husky, tooling |
| `revert` | Reversión | Revert de commit anterior |

---

## 6. PRs como Unidad de Revisión de Cambios

### 6.1. Estructura del PR

Cada PR contiene:

1. **Título**: Sigue conventional commit format
2. **Descripción**: Resumen, archivos cambiados, plan de test
3. **Labels**: Para filtrado y clasificación
4. **Reviews**: Aprobación explícita antes de merge

### 6.2. Budget de Revisión

El proyecto establece un **budget de 400 líneas** por PR (configurable via `BUDGET_LINES`). Cuando un cambio excede este límite, se recomienda dividirlo en **chained PRs** (PRs encadenados) para preservar la calidad de la revisión.

### 6.3. Automatización con gh-automation.sh

El script `scripts/gh-automation.sh` proporciona:

| Comando | Función |
|---------|---------|
| `create-pr` | Crea PR con validación previa (rama existe, commits nuevos) |
| `merge-pr` | Mergea con confirmación y delete-branch |
| `status` | Estado detallado del PR |
| `verify-pr` | Verificación pre-merge (budget, estado, conflictos, checks) |

---

## 7. Chained PRs para Cambios Grandes

### 7.1. Cuándo Usarlos

Un cambio se divide en PRs encadenados cuando:

- Supera las **400 líneas** de diff
- Afecta **múltiples entidades** independientes
- Tiene **dependencias secuenciales** (una entidad depende de otra)
- Requiere **múltiples revisores** o sesiones de revisión

### 7.2. Estrategia de Chained PRs

Para la Actividad 2 del TP Integrador, la estrategia es:

```
PR #1:  feat/sport        → main
PR #2:  feat/discipline   → main  (depende de Sport)
PR #3:  feat/payment      → main  (independiente, paralelo a #2)
PR #4:  feat/mc           → main  (depende de Member)
PR #5:  feat/locker       → main  (depende de Member)
PR #6:  feat/equipment    → main  (depende de Sport + Member)
PR #7:  feat/reports      → main  (depende de todas)
```

Cada PR se mergea directamente a `main` secuencialmente.

### 7.3. Ventajas

- **Cada PR es revisable** (~400-800 líneas vs. miles)
- **Cada entidad se integra individualmente** (menos conflictos)
- **El progreso es visible** (PRs mergeados vs. pendientes)
- **Se puede corregir sobre la marcha** (sin bloquear entidades futuras)

---

## 8. Análisis de Riesgo en Cambios

### 8.1. Matriz de Riesgo por Tipo de Cambio

| Tipo de Cambio | Riesgo | Impacto | Mitigación |
|----------------|--------|---------|------------|
| Schema de BD (Prisma) | Alto | Migraciones, datos existentes | PR con review forzoso |
| Lógica de negocio (UseCases) | Medio | Reglas de negocio incorrectas | Tests exhaustivos (Strict TDD) |
| Controladores (routes) | Bajo | API contract | Tests de integración |
| Frontend (views) | Medio | UX, datos mostrados | Component tests |
| Tooling (husky, scripts) | Bajo | Developer experience | PR separado de tooling |

### 8.2. Rollback Plan

Cada cambio mergeado es **reversible**:

1. **Revert commit**: `git revert <sha>` deshace el cambio completo
2. **Revert PR**: GitHub permite revertir PRs desde la UI
3. **Migración down**: Prisma soporta `prisma migrate down` si es necesario

---

## 9. Referencias Bibliográficas

1. **IEEE Std 828-2012**. *IEEE Standard for Configuration Management in Systems and Software Engineering*. — Estándar para procesos de gestión de cambios.

2. **ISO/IEC 20000-1:2018**. *Information technology — Service management — Part 1: Service management system requirements*. — Estándar de gestión de servicios que incluye gestión de cambios.

3. **ITIL Foundation**. (2019). *ITIL 4 Foundation*. AXELOS. — Marco de mejores prácticas que define el Change Enablement como práctica de gestión de servicios.

4. **Pressman, R. S.** (2014). *Software Engineering: A Practitioner's Approach* (8th ed.). McGraw-Hill. — Capítulo de Gestión de Cambios como actividad de soporte.

5. **Fowler, M.** (2019). *Patterns of Enterprise Application Architecture*. Addison-Wesley. — Patrones de arquitectura que informan decisiones de cambio.

6. **Kersten, M.** (2018). "Change Management in Software Engineering". En *Encyclopedia of Software Engineering*. CRC Press. — Visión general de la disciplina.

7. **Boehm, B. W.** (1988). "A Spiral Model of Software Development and Enhancement". *IEEE Computer*, 21(5), 61-72. — Modelo en espiral que integra análisis de riesgo en cada ciclo de cambio.

8. **Humphrey, W. S.** (1995). *A Discipline for Software Engineering*. Addison-Wesley. — El PSP establece el registro y control de cambios como práctica de calidad.
