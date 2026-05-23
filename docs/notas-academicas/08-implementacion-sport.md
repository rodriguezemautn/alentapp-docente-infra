---
tema: Notas Académicas — Implementación de Sport (Actividad 2)
fecha: 2026-05-23
docente: Emanuel Rodriguez
---

# Notas Académicas: Implementación de Sport con SDD

## Índice

1. [Contexto](#1-contexto)
2. [Proceso de Implementación](#2-proceso-de-implementación)
3. [Decisiones Técnicas](#3-decisiones-técnicas)
4. [Lecciones Aprendidas](#4-lecciones-aprendidas)
5. [Métricas del Proceso](#5-métricas-del-proceso)
6. [Referencias](#6-referencias)

---

## 1. Contexto

La entidad **Sport** fue la primera en implementarse dentro de la Actividad 2 del TP Integrador. Se eligió como entidad inicial por ser **independiente** (no depende de ninguna otra entidad nueva), de complejidad **baja-media**, y sirvió como **template** para las entidades siguientes.

### Stack Utilizado

| Capa | Tecnología |
|------|------------|
| Backend | Fastify 5 + TypeScript 6.0 |
| ORM | Prisma 7 + PostgreSQL 16 |
| Frontend | React 19 + Chakra UI 3 |
| Testing | Vitest 4 (unit + integration) |
| Patrón | Arquitectura Hexagonal (Ports & Adapters) |

---

## 2. Proceso de Implementación

### 2.1. Fases SDD Aplicadas

| Fase | Artefacto | Tiempo estimado |
|------|-----------|-----------------|
| **Exploración** | Reporte de exploración del código base | Previo |
| **Propuesta** | `proposal-actividad-2-entidades.md` | Previo |
| **Especificación** | `spec-sport.md` (219 líneas, 4 RF, 6 RN) | ~15 min |
| **Diseño** | `design-sport.md` (966 líneas, 4 ADRs) | ~20 min |
| **Tareas** | `tasks-sport.md` (17 tareas, 3 PRs) | ~10 min |
| **Aplicación** | 2 PRs (backend + frontend) | ~45 min |
| **Verificación** | 90 tests backend + 18 frontend | Automático |
| **Archivo** | Notas académicas + CHANGELOG | Actual |

### 2.2. Estrategia de PRs

Se siguió el enfoque de **chained PRs** (PRs encadenados) para respetar el budget de revisión de 400 líneas:

| PR | Contenido | Commits | Líneas |
|----|-----------|---------|--------|
| #4 | Backend completo (Prisma → app.ts) | 11 atómicos | +1345 |
| #5 | Frontend (service → view → routing) | 3 atómicos | +675 |

**Nota**: Ambos PRs excedieron individualmente el budget de 400 líneas. Se documentó como excepción aceptada por tratarse de la primera entidad que establece el patrón para las siguientes.

### 2.3. Strict TDD Mode

El proyecto tiene **Strict TDD Mode habilitado**. Esto implicó:

1. Para cada use case: escribir el test **antes** del código de implementación
2. Para el controller: tests primero, implementación después
3. Para el frontend: `Sports.test.tsx` antes que `Sports.tsx`

**Resultado**: 108 tests escritos siguiendo la secuencia rojo → verde → refactor. Cero casos de "primero código, después tests".

---

## 3. Decisiones Técnicas

### 3.1. Decisiones Documentadas (ADRs)

| Decisión | Opción Elegida | Alternativa | Fundamento |
|----------|---------------|-------------|------------|
| Ruta frontend | `/sports` (inglés) | `/deportes` (español) | Consistencia con `/members` existente |
| DTO de listado | `SportDetailDTO` extiende `SportDTO` | Un solo DTO con `disciplineCount?` | Contrato de API limpio |
| Conteo de disciplinas | Método `countDisciplines()` en repositorio | `\_count` en Prisma query | Separación de responsabilidades |
| Inmutabilidad de nombre | Type + Runtime | Solo runtime | Defensa en profundidad |

### 3.2. Validación en Dos Capas

Siguiendo el requerimiento explícito del usuario, toda validación se implementó en **backend y frontend**:

| Campo | Backend (SportValidator) | Frontend (Sports.tsx) |
|-------|--------------------------|----------------------|
| `name` | Requerido, max 100 chars, único | Requerido, max 100 chars, disabled en edit |
| `description` | Opcional, max 500 chars | Textarea con contador 0/500 |
| `maxCapacity` | Requerido, entero > 0 | Number input con min=1 |

### 3.3. Discipline Stub

Se incluyó un modelo `Discipline` mínimo (id + name + sportId) en la misma migración de Prisma. Esto permite:

- Que `SportDetailDTO.disciplineCount` funcione desde el día 1
- Que `DeleteSportUseCase` pueda validar la restricción de integridad
- Que la entidad Discipline futura solo agregue campos sin nueva migración estructural

---

## 4. Lecciones Aprendidas

### 4.1. Lo que Funcionó Bien

1. **Patrón Member como template**: Copiar la estructura exacta de Member para Sport redujo el tiempo de implementación drásticamente. Cada archivo nuevo seguía un molde conocido.
2. **SDD como guía**: Tener spec, design y tasks antes de codificar eliminó la ambigüedad. No hubo "vueltas atrás" por requerimientos mal entendidos.
3. **Strict TDD**: Los tests detectaron 2 errores de validación durante el desarrollo que habrían pasado desapercibidos hasta la revisión.
4. **Commits atómicos**: Cada commit representa exactamente una tarea SDD. El historial de git es legible y revisable.
5. **Chained PRs**: Separar backend y frontend en PRs distintos facilitó la revisión.

### 4.2. Lo que se Podría Mejorar

1. **Budget de 400 líneas**: Tanto el PR de backend (+1345) como el de frontend (+675) excedieron el budget. Para entidades futuras, convendría dividir aún más (ej: PR de schema + DTOs, PR de use cases, PR de controller).
2. **commitlint subject-case**: El hook rechazó la primera mayúscula en los mensajes de commit. Los mensajes quedaron en minúscula (ej: "agrega modelo sport" en vez de "agrega modelo Sport"). El scope `prisma` vs `Prisma` también tuvo que ajustarse.
3. **E2E tests**: No se ejecutaron porque requieren Docker + DB. Quedan pendientes para el tercer PR de Sport.

---

## 5. Métricas del Proceso

| Métrica | Valor |
|---------|-------|
| Tiempo total de implementación | ~90 min (estimado) |
| Commits totales | 14 (11 backend + 3 frontend) |
| Archivos creados/modificados | 25 |
| Líneas de código agregadas | ~2020 |
| Tests escritos (Strict TDD) | 108 |
| Tests pasando | 108 |
| PRs creados y mergeados | 2 |
| Decisiones documentadas (ADRs implícitos) | 4 |
| Bugs encontrados por tests TDD | 2 |

---

## 6. Referencias

1. **Martin, R. C.** (2017). *Clean Architecture*. Prentice Hall. — Patrón de puertos y adaptadores usado en Sport.
2. **Beck, K.** (2002). *Test-Driven Development: By Example*. Addison-Wesley. — Strict TDD Mode aplicado.
3. **Nonaka, I. & Takeuchi, H.** (1995). *The Knowledge-Creating Company*. — Las notas académicas externalizan el conocimiento tácito del proceso.
4. Documentos SDD de Sport: `openspec/changes/spec-sport.md`, `design-sport.md`, `tasks-sport.md`.
