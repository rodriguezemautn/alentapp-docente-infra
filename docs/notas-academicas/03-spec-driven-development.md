---
tema: Notas Académicas — Spec-Driven Development (SDD)
fecha: 2026-05-22
docente: Emanuel Rodriguez
---

# Notas Académicas: Spec-Driven Development (SDD)

## Índice

1. [Introducción](#1-introducción)
2. [¿Qué es Spec-Driven Development?](#2-qué-es-spec-driven-development)
3. [Fases del SDD](#3-fases-del-sdd)
4. [Artefactos y Persistencia](#4-artefactos-y-persistencia)
5. [SDD y TDD: Complemento, No Reemplazo](#5-sdd-y-tdd-complemento-no-reemplazo)
6. [SDD en el Contexto del TP Integrador](#6-sdd-en-el-contexto-del-tp-integrador)
7. [Análisis Crítico: Ventajas y Riesgos](#7-análisis-crítico-ventajas-y-riesgos)
8. [Referencias Bibliográficas](#8-referencias-bibliográficas)

---

## 1. Introducción

El desarrollo de software impulsado por especificaciones — **Spec-Driven Development (SDD)** — es una metodología estructurada de planificación y ejecución que pone las *especificaciones* en el centro del proceso de construcción. A diferencia de enfoques que arrancan directamente codificando (code-first) o que delegan toda la planificación a la mente del desarrollador, SDD propone una cadena de fases que va desde la intención hasta la verificación, pasando por especificaciones formales, diseño técnico y descomposición en tareas atómicas.

SDD no es una invención nueva en el sentido académico clásico, sino una **sistematización de prácticas existentes** de la ingeniería de software: análisis de requisitos, diseño arquitectónico, planificación de tareas, y verificación. Su valor está en formalizar el *orden* y la *trazabilidad* entre estas fases, de forma que cada artefacto producido sea insumo necesario del siguiente.

Este documento analiza SDD como metodología, sus fases, su relación con TDD/BDD, y su aplicación al repositorio Alentapp Docente.

---

## 2. ¿Qué es Spec-Driven Development?

### 2.1. Definición

Spec-Driven Development es un flujo de trabajo estructurado donde un cambio en el código comienza con una **propuesta**, se refina en una **especificación**, se traduce a un **diseño técnico**, se descompone en **tareas**, se **implementa** contra esas tareas, se **verifica** contra las especificaciones, y finalmente se **archiva** cerrando el ciclo.

La premisa fundamental es: **no implementes lo que no especificaste, no especifiques lo que no diseñaste, no diseñes lo que no propusiste**.

Formalmente, SDD se puede representar como una secuencia de transformaciones entre capas de abstracción:

```
Intención (propuesta)
    → Requisitos (especificación)
        → Solución técnica (diseño)
            → Plan de trabajo (tareas)
                → Código real (aplicación)
                    → Validación (verificación)
                        → Cierre (archivo)
```

Cada flecha representa una actividad de refinamiento que reduce la incertidumbre y aumenta el detalle técnico.

### 2.2. Orígenes e Inspiración

SDD se inspira en:

- **Waterfall con iteraciones**: Toma de la cascada la idea de fases secuenciales con artefactos definidos, pero la adapta a cambios pequeños y acotados típicos del desarrollo ágil.
- **BDD (Behavior-Driven Development)**: Toma la noción de especificar el comportamiento esperado antes de codificar, pero la extiende a toda la arquitectura, no solo a las pruebas.
- **ADRs (Architecture Decision Records)**: Toma la práctica de documentar decisiones arquitectónicas, pero las integra como parte del flujo, no como un artefacto aislado.
- **TDD (Test-Driven Development)**: Toma el ciclo rojo-verde-refactor, pero lo escala al nivel de funcionalidad completa en lugar de unidades individuales.

No existe un paper fundacional único de SDD como tal; es más bien un **patrón organizacional** que emerge de combinar estas prácticas bajo un flujo gobernado por especificaciones.

---

## 3. Fases del SDD

SDD se estructura en 7 fases secuenciales, donde cada fase produce un artefacto que es prerrequisito de la siguiente.

### 3.1. Propuesta (Proposal)

**Objetivo**: Definir la *intención* del cambio: qué problema resuelve, por qué vale la pena, y cuál es el enfoque general.

**Preguntas que responde**:
- ¿Qué vamos a hacer?
- ¿Por qué?
- ¿Cuál es el alcance?
- ¿Qué enfoque general vamos a tomar?

**Artefacto**: `proposal` — documento liviano que captura la intención, el contexto, las alternativas consideradas y la decisión inicial.

**Criterio de aceptación**: Un revisor (o el mismo autor tras una reflexión) puede entender el *qué* y el *porqué* sin necesidad de leer código.

### 3.2. Especificación (Specs)

**Objetivo**: Refinar la propuesta en **requisitos concretos y verificables**. Definir el comportamiento esperado del sistema, las reglas de negocio, los casos borde, y los criterios de aceptación.

**Preguntas que responde**:
- ¿Qué debe hacer el sistema exactamente?
- ¿Cuáles son las reglas de negocio?
- ¿Qué casos borde existen?
- ¿Cómo se verifica que está bien?

**Artefacto**: `spec` — documento de especificación que puede incluir escenarios, ejemplos, tablas de decisión, o incluso tests de alto nivel.

**Criterio de aceptación**: Un desarrollador puede leer la spec y saber exactamente qué implementar sin ambigüedad.

### 3.3. Diseño (Design)

**Objetivo**: Traducir la especificación en una **solución técnica concreta**. Definir archivos, módulos, interfaces, flujos de datos, y decisiones arquitectónicas.

**Preguntas que responde**:
- ¿Qué archivos vamos a crear o modificar?
- ¿Qué patrones de diseño aplican?
- ¿Cómo se conecta con el código existente?
- ¿Qué decisiones arquitectónicas se toman?

**Artefacto**: `design` — documento de diseño técnico que describe la arquitectura de la solución.

**Criterio de aceptación**: Un desarrollador puede implementar siguiendo el diseño sin tomar decisiones arquitectónicas adicionales.

### 3.4. Tareas (Tasks)

**Objetivo**: Descomponer el diseño en **tareas atómicas, ordenadas y verificables**. Cada tarea debe ser un paso ejecutable de forma independiente.

**Preguntas que responde**:
- ¿Cuál es la unidad mínima de trabajo?
- ¿En qué orden hay que hacerlas?
- ¿Cómo sé que una tarea está completa?
- ¿Cuánto trabajo estimamos?

**Artefacto**: `tasks` — lista de tareas con dependencias, criterios de aceptación y estimación de esfuerzo.

**Criterio de aceptación**: Cada tarea se puede asignar a un desarrollador y producir un commit con sentido completo.

### 3.5. Aplicación (Apply)

**Objetivo**: Implementar las tareas en código real, una por una, siguiendo el diseño y cumpliendo la especificación.

**Preguntas que responde**:
- ¿El código implementa lo que dice la tarea?
- ¿Cumple con el diseño acordado?
- ¿Pasaron las pruebas?

**Artefacto**: `apply-progress` — registro de avance que mapea tareas completadas a commits y archivos modificados.

**Criterio de aceptación**: Cada tarea produce código funcional que pasa las pruebas correspondientes y satisface los criterios de aceptación de la tarea.

### 3.6. Verificación (Verify)

**Objetivo**: Validar que la implementación cumple con la especificación original. No es solo "pasaron los tests", sino una revisión integral.

**Preguntas que responde**:
- ¿Se implementó todo lo especificado?
- ¿Hay discrepancias entre lo pedido y lo hecho?
- ¿Cubrimos los casos borde?
- ¿El diseño se respetó?

**Artefacto**: `verify-report` — informe que lista hallazgos clasificados como CRITICAL, WARNING o SUGGESTION.

**Criterio de aceptación**: No hay hallazgos CRITICAL, y los WARNING/SUGGESTION están documentados para seguimiento.

### 3.7. Archivo (Archive)

**Objetivo**: Cerrar el cambio formalmente, sincronizar artefactos, y persistir el estado final para referencia futura.

**Preguntas que responde**:
- ¿Qué aprendimos?
- ¿Qué delta hubo entre lo planeado y lo implementado?
- ¿Qué decisiones de último momento se tomaron?
- ¿Dónde quedó registrado todo?

**Artefacto**: `archive-report` — resumen final del cambio con lecciones aprendidas y estado de los artefactos.

**Criterio de aceptación**: El cambio está cerrado, todos los artefactos están persistidos y trazables.

---

## 4. Artefactos y Persistencia

### 4.1. Modelo de Datos de SDD

Cada fase produce un artefacto que se persiste con una estructura común:

| Campo | Descripción |
|-------|-------------|
| `status` | Estado del artefacto: `draft`, `review`, `approved`, `superseded` |
| `executive_summary` | Resumen ejecutivo del contenido |
| `artifacts` | Referencias a archivos o recursos producidos |
| `next_recommended` | Fase siguiente sugerida |
| `risks` | Riesgos identificados |
| `skill_resolution` | Cómo se resolvieron las habilidades/estándares aplicables |

### 4.2. Backends de Persistencia

SDD puede usar distintos backends para almacenar artefactos:

- **Engram**: Base de conocimiento persistente con búsqueda semántica. Rápido, liviano, no genera archivos en el repo.
- **OpenSpec**: Artefactos como archivos en el repositorio (`openspec/`). Trazables en revisiones, compartibles por equipo.
- **Híbrido (Both)**: Ambos simultáneamente — archivos para el equipo, motor semántico para recuperación entre sesiones.

### 4.3. Trazabilidad

La clave del modelo de artefactos es la **trazabilidad hacia adelante y hacia atrás**:

```
Proposal ──→ Specs ──→ Design ──→ Tasks ──→ Apply ──→ Verify ──→ Archive
   ↑            ↑          ↑          ↑         ↑          ↑          ↑
   └───── referencias cruzadas ──────────────────────────────────────┘
```

Cada artefacto referencia a su predecesor. Esto permite responder preguntas como:
- "¿Por qué se implementó esta función?" → Proposal
- "¿Qué tareas implementan este requisito?" → Tasks → Apply
- "¿Qué especificación validamos?" → Specs → Verify

---

## 5. SDD y TDD: Complemento, No Reemplazo

### 5.1. Relación

SDD y TDD operan en **niveles diferentes** y son complementarios:

| Aspecto | TDD | SDD |
|---------|-----|-----|
| **Nivel** | Unidad / función individual | Cambio / funcionalidad completa |
| **Ciclo** | Rojo → Verde → Refactor | Propuesta → Spec → ... → Archive |
| **Artefacto** | Test automatizado | Documento de especificación |
| **Frecuencia** | Minutos | Horas a días |
| **Audiencia** | Desarrollador (máquina) | Desarrolladores + revisores (humanos) |
| **Verificación** | Automática (test runner) | Manual + automática |

SDD **no reemplaza** a TDD. Un flujo completo puede usar ambas:

1. SDD define QUÉ construir (especificación)
2. TDD garantiza CÓMO se construye correctamente (tests)
3. SDD verifica que lo construido coincide con lo especificado

### 5.2. Integración Práctica

En un proyecto como Alentapp Docente, la integración sería:

1. **SDD Proposal**: "Agregar ABM de Locker con reglas de negocio X"
2. **SDD Spec**: Escenarios detallados para cada operación CRUD
3. **SDD Design**: Arquitectura hexagonal con puertos y adaptadores
4. **SDD Tasks**: Tareas individuales (crear ruta, implementar caso de uso, etc.)
5. **TDD (dentro de Apply)**: Para cada tarea, ciclo rojo-verde-refactor
6. **SDD Verify**: Verificar que todo lo especificado está implementado
7. **SDD Archive**: Cerrar el cambio

### 5.3. Strict TDD Mode

Cuando el proyecto soporta testing automatizado, SDD puede activar *Strict TDD Mode*: dentro de la fase Apply, cada tarea DEBE seguir TDD (test primero, código después). Esto combina la planificación estructurada de SDD con la disciplina de calidad de TDD.

---

## 6. SDD en el Contexto del TP Integrador

### 6.1. Aplicación al Repositorio Alentapp Docente

El repositorio `alentapp-docente-infra` puede usar SDD como metodología para:

1. **Planificar entregas**: Cada actividad del TP puede modelarse como un cambio SDD con sus fases completas.
2. **Guiar a los estudiantes**: Los artefactos SDD (specs, design, tasks) sirven como guía de implementación.
3. **Evaluar calidad**: La fase Verify permite evaluar si el estudiante implementó todo lo pedido.
4. **Mantener trazabilidad**: Cada decisión queda registrada y trazable hasta la actividad que la originó.

### 6.2. Ejemplo: Actividad 3 con SDD

La Actividad 3 (Testing) podría estructurarse como:

| Fase SDD | Artefacto | Contenido |
|----------|-----------|-----------|
| Proposal | SDD Proposal | "Qué tests escribir, con qué framework, alcance" |
| Spec | SDD Spec | Escenarios de prueba por entidad y operación |
| Design | SDD Design | Estructura de test suites, mocks, helpers |
| Tasks | SDD Tasks | Tests de Member, Locker, Sport, etc. |
| Apply | Implementación | Tests escritos con TDD |
| Verify | SDD Verify | Reporte de cobertura y completitud |
| Archive | SDD Archive | Lecciones aprendidas, delta con lo planeado |

### 6.3. Beneficios para el Aula

- **Los estudiantes ven el proceso**, no solo el resultado: pueden leer specs y diseño antes de ver código.
- **El docente puede revisar por fases**: corregir la spec antes de que el estudiante codee.
- **Los PRs son más revisables**: cada PR está respaldado por el cambio SDD completo.
- **Se fomenta la disciplina de ingeniería**: los estudiantes aprenden a pensar antes de codificar.

---

## 7. Análisis Crítico: Ventajas y Riesgos

### 7.1. Ventajas

| Ventaja | Descripción |
|---------|-------------|
| **Claridad antes de código** | Todo cambio está especificado antes de implementarse |
| **Trazabilidad total** | Cada línea de código se puede rastrear hasta una intención |
| **PRs más pequeños** | Las tareas SDD tienden a producir commits atómicos y revisables |
| **Contexto preservado** | Los artefactos persisten entre sesiones, evitando pérdida de contexto |
| **Fácil onboarding** | Un nuevo desarrollador puede leer los artefactos para entender el proyecto |

### 7.2. Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| **Sobredocumentación**: gastar más tiempo en artefactos que en código | Usar artefactos livianos; SDD no exige documentos extensos |
| **Falsa precisión**: especificar algo que cambia al implementar | SDD permite iterar; la verificación captura deltas |
| **Dependencia de herramientas**: sin el motor de persistencia se pierde trazabilidad | Usar OpenSpec (archivos) que viven en el repo |
| **Resistencia cultural**: "planificar es perder tiempo" | Mostrar el costo de no planificar: bugs, retrabajo, contexto perdido |

### 7.3. ¿Cuándo NO usar SDD?

SDD no es apropiado para:

- **Cambios triviales**: corregir un typo, renombrar una variable, ajustar estilo.
- **Exploración pura**: spikes técnicos donde no se sabe la solución.
- **Prototipado descartable**: código que se va a tirar.

Para estos casos, el sentido común del desarrollador determina si SDD agrega valor o es burocracia innecesaria.

---

## 8. Referencias Bibliográficas

1. **Beck, K.** (2002). *Test-Driven Development: By Example*. Addison-Wesley. — El texto fundacional de TDD, cuya disciplina de "test primero" inspira la fase Apply en Strict TDD Mode.

2. **North, D.** (2006). *Introducing BDD*. Better Software Magazine. — Define Behavior-Driven Development como extensión de TDD al nivel de comportamiento, precursora conceptual de la fase Specs de SDD.

3. **Fowler, M.** (2014). *Refactoring: Improving the Design of Existing Code* (2nd ed.). Addison-Wesley. — Las técnicas de refactorización informan la fase Design de SDD.

4. **Coplien, J. O. & Harrison, N. B.** (2004). *Organizational Patterns of Agile Software Development*. Pearson. — Patrones organizacionales que inspiran la estructura de fases y artefactos de SDD.

5. **Gamma, E., Helm, R., Johnson, R., & Vlissides, J.** (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley. — Los patrones GoF informan las decisiones de diseño en la fase Design de SDD.

6. **Nygard, M.** (2018). *Documenting Architecture Decisions*. ThoughtWorks. — La práctica de ADRs (Architecture Decision Records) inspira la documentación de decisiones en las fases Design y Archive de SDD.

7. **IEEE Std 830-1998**. *IEEE Recommended Practice for Software Requirements Specifications*. — Estándar clásico de especificación de requisitos que informa la estructura de la fase Specs.

8. **Humphrey, W. S.** (1995). *A Discipline for Software Engineering*. Addison-Wesley. — El PSP (Personal Software Process) de Watts Humphrey establece la importancia de la medición y la planificación estructurada, antecedente conceptual de SDD.

9. **Martin, R. C.** (2008). *Clean Code: A Handbook of Agile Software Craftsmanship*. Prentice Hall. — Principios de código limpio y diseño que se aplican en la fase Apply.

10. **Meszaros, G.** (2007). *xUnit Test Patterns: Refactoring Test Code*. Addison-Wesley. — Patrones de testing que informan la fase Verify y la integración SDD+TDD.
