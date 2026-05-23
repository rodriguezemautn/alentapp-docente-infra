---
tema: Notas Académicas — Gestión de Conocimiento
fecha: 2026-05-23
docente: Emanuel Rodriguez
---

# Notas Académicas: Gestión de Conocimiento

## Índice

1. [Introducción](#1-introducción)
2. [El Conocimiento en Ingeniería de Software](#2-el-conocimiento-en-ingeniería-de-software)
3. [Modelo SECI y Conversión del Conocimiento](#3-modelo-seci-y-conversión-del-conocimiento)
4. [Estrategias de Gestión de Conocimiento en Alentapp](#4-estrategias-de-gestión-de-conocimiento-en-alentapp)
5. [Artefactos de Conocimiento](#5-artefactos-de-conocimiento)
6. [Onboarding y Transferencia](#6-onboarding-y-transferencia)
7. [Métricas de Conocimiento](#7-métricas-de-conocimiento)
8. [Referencias Bibliográficas](#8-referencias-bibliográficas)

---

## 1. Introducción

La Gestión de Conocimiento (Knowledge Management, KM) es el proceso sistemático de **identificar, crear, almacenar, compartir y aplicar** el conocimiento generado durante el desarrollo de software. A diferencia de la documentación tradicional (que suele ser un subproducto estático), la KM trata al conocimiento como un **activo vivo** que debe mantenerse, actualizarse y transferirse activamente.

En un proyecto educativo como Alentapp Docente, la KM cumple un rol doble:
1. **Preservar el conocimiento técnico** para que el equipo docente pueda mantener y evolucionar el proyecto.
2. **Transferir conocimiento a los estudiantes** mediante artefactos diseñados para el aprendizaje, no solo para la consulta.

---

## 2. El Conocimiento en Ingeniería de Software

### 2.1. Conocimiento Tácito vs. Explícito (Nonaka & Takeuchi)

| Tipo | Definición | Ejemplo en Alentapp |
|------|------------|---------------------|
| **Tácito** | Conocimiento personal, difícil de articular. "Saber cómo" | La experiencia del docente sobre por qué se eligió Fastify sobre Express |
| **Explícito** | Conocimiento codificado, transferible. "Saber qué" | El código fuente, los TDDs, los schemas de Prisma |

El objetivo de la KM es **externalizar** el conocimiento tácito en formas explícitas para que sea accesible, revisable y mejorable por otros.

### 2.2. Conocimiento de Proceso vs. Producto

| Dimensión | Descripción | Ejemplo |
|-----------|-------------|---------|
| **Proceso** | Cómo se construye el software | SDD workflow, conventional commits, code review |
| **Producto** | Qué se construyó | Código, API, schema de BD, tests |

Ambos tipos deben gestionarse. El conocimiento de proceso es tan valioso como el de producto.

### 2.3. La Paradoja del Conocimiento en Proyectos Académicos

En proyectos educativos, el conocimiento más valioso es el **conocimiento de proceso**: cómo se estructura un proyecto real, cómo se organizan las ramas, cómo se validan los commits, cómo se revisa el código. Los estudiantes pueden aprender la sintaxis de TypeScript en cualquier lado; lo que aporta el repositorio docente es el **contexto de ingeniería**.

---

## 3. Modelo SECI y Conversión del Conocimiento

El modelo SECI (Nonaka & Takeuchi, 1995) describe cuatro modos de conversión del conocimiento:

### 3.1. Socialización (Tácito → Tácito)

**Mecanismo**: Experiencia compartida, observación, mentoría.

**En Alentapp**: Code review, pair programming entre estudiantes, reuniones de equipo.

### 3.2. Externalización (Tácito → Explícito)

**Mecanismo**: Documentación, modelos, metáforas.

**En Alentapp**: TDDs, notas académicas, ADRs (Architecture Decision Records), SDD artifacts.

### 3.3. Combinación (Explícito → Explícito)

**Mecanismo**: Sistematización, clasificación, síntesis.

**En Alentapp**: CHANGELOG.md que sintetiza cambios dispersos en commits, openspec/config.yaml que unifica configuraciones.

### 3.4. Internalización (Explícito → Tácito)

**Mecanismo**: Práctica, aprendizaje haciendo.

**En Alentapp**: Estudiantes que implementan una entidad nueva siguiendo el patrón de Member y los TDDs, incorporando la arquitectura hexagonal como conocimiento internalizado.

---

## 4. Estrategias de Gestión de Conocimiento en Alentapp

### 4.1. Codificación (Codification Strategy)

**Enfoque**: El conocimiento se codifica y almacena en artefactos reutilizables.

**Implementación**:
- **Código como documentación ejecutable**: El código de Member es el mejor ejemplo de cómo implementar cualquier otra entidad.
- **TDDs como especificaciones formales**: Cada operación CRUD tiene un TDD que describe comportamiento esperado, no solo código.
- **Notas académicas como conocimiento explícito**: Las notas en `docs/notas-academicas/` capturan decisiones, contexto y fundamentos.
- **SDD artifacts**: Propuesta, especificación, diseño y tareas como archivos trazables en `openspec/`.

### 4.2. Personalización (Personalization Strategy)

**Enfoque**: El conocimiento reside en las personas y se transfiere por contacto directo.

**Implementación**:
- **Issue-first**: Los issues documentan discusiones y decisiones.
- **PR reviews**: Cada PR es una instancia de transferencia de conocimiento entre revisor y autor.
- **Commits con mensajes semánticos**: Un mensaje de commit bien escrito documenta la intención del cambio.

### 4.3. Estrategia Híbrida

Alentapp usa ambas estrategias en equilibrio: los artefactos codificados (TDDs, notas, SDD) sirven como base, y las interacciones humanas (PRs, issues, reviews) añaden el contexto que los artefactos no capturan.

---

## 5. Artefactos de Conocimiento

### 5.1. Taxonomía de Artefactos

| Tipo | Artefacto | Contenido | Ciclo de Vida |
|------|-----------|-----------|---------------|
| **Intención** | SDD Proposal | Qué y por qué | Se archiva al cambiar el alcance |
| **Especificación** | SDD Specs, TDDs | Qué debe hacer el sistema | Se archiva al completar el cambio |
| **Diseño** | SDD Design, ADRs | Cómo se implementa | Se archiva al completar el cambio |
| **Código** | Archivos fuente | Implementación | Evoluciona continuamente |
| **Validación** | Tests | Verificación | Evoluciona con el código |
| **Exploración** | SDD Explore Report | Investigación técnica | Se archiva al decidir |
| **Lecciones** | Archive Report, CHANGELOG | Qué se aprendió | Persiste indefinidamente |

### 5.2. El Rol de SDD en la Gestión de Conocimiento

SDD es inherentemente una práctica de gestión de conocimiento. Cada fase produce un artefacto que externaliza el conocimiento tácito del desarrollador en un formato estructurado y compartible:

1. **Exploración**: Externaliza el conocimiento sobre el código existente
2. **Propuesta**: Externaliza la justificación de un cambio
3. **Especificación**: Externaliza el entendimiento de los requisitos
4. **Diseño**: Externaliza las decisiones técnicas
5. **Tareas**: Externaliza el plan de implementación
6. **Aplicación**: Internaliza el conocimiento en código ejecutable
7. **Verificación**: Externaliza el delta entre lo planeado y lo implementado
8. **Archivo**: Externaliza las lecciones aprendidas

### 5.3. Engram como Memoria Persistente

Engram es un sistema de memoria persistente que permite:
- **Búsqueda semántica** sobre el conocimiento acumulado
- **Recuperación entre sesiones** sin pérdida de contexto
- **Trazabilidad** de decisiones a través del tiempo

---

## 6. Onboarding y Transferencia

### 6.1. Estrategia de Onboarding

El onboarding de un nuevo desarrollador (o estudiante) al proyecto Alentapp sigue una secuencia:

1. **Lectura de README.md**: Contexto general del proyecto
2. **Lectura de notas académicas**: Fundamentos de ingeniería
3. **Exploración de código existente**: Member como patrón de referencia
4. **Lectura de TDDs**: Especificaciones de las entidades
5. **Primer cambio guiado**: Implementación de una entidad simple (Sport) siguiendo SDD
6. **PR y code review**: Ciclo completo de integración

### 6.2. Documentación de Onboarding

El proyecto incluye:

| Recurso | Propósito |
|---------|-----------|
| `README.md` | Vista general, remotos, setup |
| `docs/notas-academicas/` | Fundamentos de ingeniería |
| `docs/TDDs/` | Especificaciones de comportamiento |
| `docs/metodologia-sdd/` | Guía práctica de SDD |
| `openspec/config.yaml` | Contexto técnico del proyecto |

---

## 7. Métricas de Conocimiento

Aunque el conocimiento es difícil de medir cuantitativamente, algunas métricas proxy pueden indicar la salud de la KM en el proyecto:

| Métrica | Indicador | Herramienta |
|---------|-----------|-------------|
| Cobertura de TDDs | % de entidades con TDDs asociados | Conteo manual |
| Commits sin conventional commit | Calidad de mensajes | commitlint |
| PR mergeados sin issue asociado | Trazabilidad de cambios | gh CLI |
| Días entre merge y próxima rama | Cadencia de entrega | git log |
| Artefactos SDD por cambio | Profundidad de planificación | Conteo manual |

---

## 8. Referencias Bibliográficas

1. **Nonaka, I. & Takeuchi, H.** (1995). *The Knowledge-Creating Company: How Japanese Companies Create the Dynamics of Innovation*. Oxford University Press. — Modelo SECI de creación de conocimiento organizacional.

2. **Davenport, T. H. & Prusak, L.** (1998). *Working Knowledge: How Organizations Manage What They Know*. Harvard Business School Press. — Marco teórico de gestión de conocimiento en organizaciones.

3. **Rus, I. & Lindvall, M.** (2002). "Knowledge Management in Software Engineering". *IEEE Software*, 19(3), 26-38. — Aplicación de KM específicamente a la ingeniería de software.

4. **Bjørnson, F. O. & Dingsøyr, T.** (2008). "Knowledge Management in Software Engineering: A Systematic Review of Studied Concepts, Findings and Research Methods". *Information and Software Technology*, 50(11), 1055-1068. — Revisión sistemática de la literatura.

5. **Nonaka, I. & von Krogh, G.** (2009). "Perspective—Tacit Knowledge and Knowledge Conversion: Controversy and Advancement in Organizational Knowledge Creation Theory". *Organization Science*, 20(3), 635-652. — Revisión y refinamiento del modelo SECI.

6. **Desouza, K. C. & Awazu, Y.** (2005). "Knowledge Management at SMEs: Five Peculiarities". *Journal of Knowledge Management*, 9(4), 7-15. — Particularidades de KM en equipos pequeños (aplicable al contexto del proyecto).

7. **Dingsøyr, T., Bjørnson, F. O., & Shull, F.** (2009). "What Do We Know about Knowledge Management in Software Engineering?". *IEEE Software*, 26(3), 12-13. — Estado del arte de KM en ingeniería de software.

8. **Lindvall, M. & Rus, I.** (2003). "Knowledge Management in Software Engineering". En *Encyclopedia of Software Engineering*. Taylor & Francis. — Visión enciclopédica de la disciplina.
