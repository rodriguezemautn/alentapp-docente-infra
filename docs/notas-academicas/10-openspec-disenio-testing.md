---
tema: Notas Académicas — OpenSpec, Documentos de Diseño y Testing
fecha: 2026-05-24
docente: Emanuel Rodriguez
---

# Notas Académicas: OpenSpec, Documentos de Diseño y Estrategia de Testing

## Índice

1. [OpenSpec: Especificaciones como Archivos](#1-openspec-especificaciones-como-archivos)
2. [Documentos de Diseño en OpenSpec](#2-documentos-de-diseño-en-openspec)
3. [Estrategia de Testing en el Proyecto](#3-estrategia-de-testing-en-el-proyecto)
4. [Strict TDD Mode: Testing como Disciplina](#4-strict-tdd-mode-testing-como-disciplina)
5. [Integración OpenSpec + Testing + SDD](#5-integración-openspec--testing--sdd)
6. [Métricas y Reflexiones](#6-métricas-y-reflexiones)
7. [Referencias Bibliográficas](#7-referencias-bibliográficas)

---

## 1. OpenSpec: Especificaciones como Archivos

### 1.1. ¿Qué es OpenSpec?

**OpenSpec** es un formato de persistencia para artefactos SDD basado en archivos de texto plano dentro del repositorio. A diferencia de sistemas de gestión de requisitos cerrados (Jira, Notion, Azure DevOps), OpenSpec:

- **Vive en el repo**: los artefactos se versionan con el código.
- **Es revisable en PRs**: cualquier cambio en una spec aparece en el diff del PR.
- **No depende de una herramienta externa**: solo necesita un editor de texto.
- **Es estructurado pero legible**: usa Markdown con convenciones predecibles.

### 1.2. Estructura del Directorio

```
openspec/
├── config.yaml                  ← Configuración del proyecto SDD
├── specs/                       ← Especificaciones fuente (single source of truth)
│   ├── sport/spec.md
│   ├── payment/spec.md
│   ├── medical-certificate/spec.md
│   └── discipline/spec.md
└── changes/                     ← Cambios activos y archivados
    ├── archive/                 ← Cambios completados (audit trail)
    │   ├── 2026-05-24-sport/
    │   ├── 2026-05-24-payment/
    │   ├── 2026-05-24-medical-certificate/
    │   └── 2026-05-24-discipline/
    ├── spec-medical-certificate.md
    ├── spec-payment.md
    └── ... (cambios activos)
```

### 1.3. Ciclo de Vida de un Artefacto OpenSpec

Cada cambio (change) comienza como archivos sueltos en `openspec/changes/` y pasa por las fases SDD:

```
Propuesta → Spec → Design → Tasks → Apply → Verify → Archive
                                                         ↓
                                              openspec/changes/archive/YYYY-MM-DD-nombre/
                                              openspec/specs/dominio/spec.md (fuente única)
```

La fase **Archive** es la que sincroniza el delta:
1. Copia la spec a `openspec/specs/<dominio>/spec.md` (fuente de verdad permanente).
2. Mueve todos los artefactos del cambio a `openspec/changes/archive/` con prefijo de fecha.
3. El resultado es un **audit trail** completo: se puede ver qué cambió, cuándo, y por qué.

### 1.4. OpenSpec vs. Engram

| Aspecto | OpenSpec | Engram |
|---------|----------|--------|
| **Persistencia** | Archivos en el repo | Base de conocimiento vectorial |
| **Trazabilidad en PRs** | ✅ Aparece en el diff | ❌ No visible en GitHub |
| **Búsqueda semántica** | ❌ Solo grep | ✅ Búsqueda por similitud |
| **Entre sesiones** | ✅ Siempre disponible | ✅ Con motor de persistencia |
| **Dependencia** | Ninguna | Requiere el motor Engram |
| **Colaboración** | ✅ Todos ven los archivos | Solo quien tiene acceso |

OpenSpec es el **formato portable**; Engram es el **motor de búsqueda y contexto**. Usarlos en conjunto (modo híbrido) da lo mejor de ambos mundos: archivos para el equipo, búsqueda semántica para el desarrollador.

---

## 2. Documentos de Diseño en OpenSpec

### 2.1. Rol del Documento de Diseño

Dentro del flujo SDD, el `design.md` ocupa un lugar particular: es el puente entre **qué** hay que construir (spec) y **cómo** se va a construir (tasks + código).

```
Spec (qué) ──→ Design (cómo) ──→ Tasks (plan) ──→ Apply (ejecución)
```

Sin design, las tasks se escriben sobre suposiciones arquitectónicas implícitas. Con design, cada tarea tiene un fundamento técnico verificable.

### 2.2. Componentes de un Design Doc en OpenSpec

Los documentos de diseño en este proyecto siguen una estructura consistente:

| Sección | Propósito | Ejemplo (design-sport.md) |
|---------|-----------|---------------------------|
| **Technical Approach** | Estrategia general en 2-3 párrafos | "Implementar Sport siguiendo el patrón hexagonal de Member" |
| **Architecture Overview** | Diagrama ASCII de capas | Prisma → DTOs → Domain → Application → Delivery → Infrastructure → Frontend |
| **Architecture Decisions (ADRs)** | Decisiones con opciones y fundamento | "Ruta `/sports` (inglés) vs `/deportes` (español)" |
| **Data Flow** | Cómo circulan los datos | Diagramas de secuencia para flujos complejos |
| **File Changes** | Lista de archivos a crear/modificar | Tabla con ruta, acción, descripción |
| **Interfaces / Contracts** | Definiciones de API, tipos y contratos | Method signatures, request/response shapes |
| **Testing Strategy** | Qué y cómo se prueba por capa | Unidad, integración, frontend |
| **Migration / Rollout** | Plan de despliegue si aplica | "No migration required" en la mayoría |
| **Open Questions** | Decisiones pendientes | "¿Usamos UUID auto-generado o secuencial?" |

### 2.3. Decisiones Arquitectónicas (ADRs)

Las Architecture Decision Records dentro del design doc son particularmente valiosas porque documentan **no solo lo que se eligió, sino lo que se rechazó y por qué**. Esto evita que futuros desarrolladores pregunten "¿por qué no usamos X?".

Formato usado:

```markdown
### Decision: {Título}

**Choice**: {Opción elegida}
**Alternatives considered**: {Opciones rechazadas}
**Rationale**: {Fundamento técnico}
```

Ejemplo real del proyecto:

```markdown
### Decision: Ruta frontend como `/sports`

**Choice**: `/sports` (inglés), consistente con `/members`.
**Rationale**: El patrón existente usa rutas en inglés. Las UI labels usan español.
**Alternatives considered**: `/deportes` — más natural en español, pero inconsistente.
```

### 2.4. Tamaño y Profundidad

Una lección importante de este proyecto: **el design doc no necesita ser extenso para ser efectivo**. La correlación no es lineal:

| Entidad | Líneas en design | Complejidad | ¿Fue útil? |
|---------|------------------|-------------|------------|
| Sport | 966 (primera, muy detallada) | Media | ✅ Sirvió como template |
| Payment | 181 | Media-alta | ✅ Justo lo necesario |
| MedicalCertificate | 123 | Baja | ✅ Suficiente |
| Discipline | 184 (frontend-only) | Baja | ✅ Perfecto para frontend |

Sport, al ser la primera entidad, tiene un design desproporcionadamente grande porque estableció el patrón y documentó cada decisión para referencia futura. Las entidades siguientes pudieron ser mucho más livianas porque el patrón ya estaba definido.

### 2.5. Design Docs en la Práctica: Aciertos y Errores

**Aciertos**:

- **Diseñar antes de codificar atrapó errores temprano**: en Payment, el design reveló que el `UpdatePaymentRequest` no tenía sentido (los pagos son inmutables, solo se cancelan). Se corrigió en la spec antes de escribir una línea de código.
- **Los ADRs aceleraron revisiones**: en lugar de discutir en el PR, las decisiones ya estaban documentadas y acordadas.
- **El diagrama de arquitectura evitó ambigüedad**: nuevos desarrolladores podían ver dónde iba cada archivo sin preguntar.

**Errores**:

- **Sobre-especificación en Sport**: 966 líneas para una entidad CRUD simple. Aprendimos que el design debe ser **suficiente**, no exhaustivo.
- **Design sin actualizar post-apply**: en algunos casos, el código final se desvió ligeramente del design y no se actualizó el documento. Archive captura esto, pero el ideal es mantener el design sincronizado durante Apply.
- **Falta de design para backend de Discipline**: el backend se implementó sin un design formal, lo que llevó a preguntas durante el desarrollo que un design habría respondido de entrada.

---

## 3. Estrategia de Testing en el Proyecto

### 3.1. Pirámide de Testing

El proyecto sigue una pirámide de testing clásica con tres capas bien definidas:

```
         ╱  E2E  ╲           ← Playwright (browser full-stack)
        ╱──────────╲
       ╱ Integration ╲       ← Vitest (controller + HTTP)
      ╱────────────────╲
     ╱     Unit Tests     ╲  ← Vitest (validators, use cases, frontend views)
    ╱────────────────────────╲
   ╱   TypeScript Compiler    ╲  ← tsc --noEmit (type checking == test de tipos)
  ╱──────────────────────────────╲
```

### 3.2. Distribución por Capa

| Capa | Tool | Qué prueba | Cantidad (aprox.) |
|------|------|------------|-------------------|
| **Validators** (domain) | Vitest | Reglas de negocio, casos borde, formato de datos | ~16 tests por entidad |
| **Use Cases** (application) | Vitest | Flujos completos con repositorios mockeados | ~13 tests por entidad |
| **Controllers** (delivery) | Vitest | Mapeo HTTP, errores, status codes, serialización | ~15 tests por entidad |
| **Controllers (integration)** | Vitest | HTTP real con Fastify inject, Prisma mockeado | ~8 tests por entidad |
| **Frontend views** | Vitest + Testing Library | Render, interacción del usuario, estados (loading, empty, error) | ~7 tests por vista |
| **E2E** | Playwright | Flujo completo en navegador | ~3 specs por entidad |
| **Type checking** | tsc --noEmit | Errores de tipos en todo el proyecto | Compilación completa |

### 3.3. Patrones de Testing

#### Patrón: Validator Tests

Los validators se prueban de forma aislada, sin bases de datos ni redes:

```typescript
describe('SportValidator', () => {
  it('debe rechazar nombre vacío', () => {
    expect(() => validator.validateName(''))
      .toThrow('El nombre es requerido');
  });

  it('debe rechazar nombre mayor a 100 caracteres', () => {
    const longName = 'a'.repeat(101);
    expect(() => validator.validateName(longName))
      .toThrow('no puede superar los 100 caracteres');
  });
});
```

#### Patrón: Use Case Tests con Mocks

Los use cases inyectan dependencias como puertos (interfaces), lo que permite mockear el repositorio sin configuración adicional:

```typescript
const mockRepo = {
  findById: vi.fn(),
  create: vi.fn(),
} as unknown as DisciplineRepository;

const useCase = new CreateDisciplineUseCase(mockRepo, mockValidator);
```

Esto es posible gracias a la **arquitectura hexagonal**: los puertos son interfaces, no implementaciones concretas. El test puede sustituir cualquier adaptador.

#### Patrón: Controller Tests con Fastify Inject

Los controllers se prueban inyectando requests HTTP directamente sin levantar un servidor:

```typescript
const response = await app.inject({
  method: 'POST',
  url: '/api/v1/disciplinas',
  payload: { name: 'Fútbol Infantil', sportId: 'abc', startDate: '2024-01-01', endDate: '2024-12-31' },
});
expect(response.statusCode).toBe(201);
```

#### Patrón: Frontend Tests con Testing Library

Las vistas se prueban renderizando el componente con proveedores (Chakra Provider, Router) y simulando interacción del usuario:

```typescript
const user = userEvent.setup();
render(<Provider><DisciplinesView /></Provider>);

await user.click(screen.getByText('Agregar Disciplina'));
await user.type(screen.getByLabelText(/Nombre/i), 'Fútbol Infantil');
await user.click(screen.getByText('Crear Disciplina'));

expect(disciplinesService.create).toHaveBeenCalledWith(
  expect.objectContaining({ name: 'Fútbol Infantil' })
);
```

### 3.4. Mocks vs. Fakes

El proyecto usa mayoritariamente **mocks** (vía Vitest `vi.fn()` y `vi.mock()`) en lugar de fakes o stubs. Esto es intencional:

| Enfoque | Ventaja | Desventaja |
|---------|---------|------------|
| **Mocks** (vi.fn) | Rápidos, setup explícito, buen feedback en tests | Acoplamiento a la implementación interna |
| **Fakes** | Menos acoplamiento, más realistas | Requieren mantenimiento, más setup |
| **Stubs** | Simple, predecible | Solo responden valores fijos, no verifican interacciones |

La decisión de priorizar mocks se basa en que el proyecto usa arquitectura hexagonal: como los puertos son interfaces pequeñas (4-5 métodos), los mocks son fáciles de configurar y el acoplamiento es bajo.

---

## 4. Strict TDD Mode: Testing como Disciplina

### 4.1. ¿Qué es Strict TDD Mode?

Cuando un proyecto soporta testing automatizado, SDD activa **Strict TDD Mode**: cada tarea dentro de la fase Apply DEBE seguir el ciclo TDD (test rojo → implementación verde → refactor) o reportar la tarea como fallida.

No es opcional, no tiene "modo standard" de respaldo. O se hace TDD o se reporta el incumplimiento.

### 4.2. Evidencia del Ciclo TDD

Cada tarea implementada en Strict TDD Mode produce una fila en la tabla de evidencia:

| Task | RED (test escrito) | GREEN (implementación) | REFACTOR | Safety Net |
|------|-------------------|----------------------|----------|------------|
| T-14 Disciplines view | ✅ 7 tests escritos primero | ✅ 7/7 pasan | ✅ Código limpio | ✅ 34 tests pre-existentes siguen pasando |

El `Safety Net` verifica que los tests existentes no se rompieron al agregar código nuevo — es la red de contención que permite refactorizar con confianza.

### 4.3. ¿Qué NO se prueba con TDD?

No todas las tareas usan TDD. Por definición del proyecto:

| No requiere TDD | Razón |
|----------------|-------|
| **DTOs e interfaces** | Son tipos, no tienen comportamiento que probar |
| **Repositorios (infrastructure)** | Son implementaciones de puertos; se prueban en integración |
| **Routing / wiring (app.ts)** | Es configuración declarativa |
| **Servicios frontend (API calls)** | Son wrappers delgados sobre fetch |
| **Migration / schema** | No hay lógica que probar |

### 4.4. Resultados de Strict TDD en el Proyecto

| Entidad | Tests TDD | Safety Net | Resultado |
|---------|-----------|------------|-----------|
| Sport | ~90 tests | ~34 pre-existentes | ✅ Sin regresiones |
| Payment | ~60 tests | ~124 pre-existentes | ✅ Sin regresiones |
| MedicalCertificate | ~30 tests | ~184 pre-existentes | ✅ Sin regresiones |
| Discipline (backend) | ~37 tests | ~214 pre-existentes | ✅ Sin regresiones |
| Discipline (frontend) | 7 tests | ~34 pre-existentes (web) | ✅ Sin regresiones |

La **red de seguridad** (total de tests acumulados) crece con cada entidad, y en ningún caso se introdujeron regresiones.

---

## 5. Integración OpenSpec + Testing + SDD

### 5.1. Flujo Completo

La integración entre los tres conceptos sigue este flujo:

```
1. OpenSpec define QUÉ construir (spec en openspec/specs/)
2. SDD organiza CÓMO construir (design → tasks)
3. Strict TDD garantiza CALIDAD (tests primero)
4. OpenSpec archiva el resultado (archive/)
        ↓
   Cada iteración refuerza la siguiente
```

### 5.2. Trazabilidad Cruzada

La verdadera potencia emerge cuando se cruzan los artefactos:

- **Especificación → Test**: cada escenario en `spec.md` tiene al menos un test que lo cubre.
- **Test → Spec**: si un test falla, se sabe exactamente qué requisito no se cumple.
- **Design → Arquitectura**: los ADRs explican por qué el código tiene cierta estructura.
- **Archive → Historia**: se puede reconstruir el estado del proyecto en cualquier fecha.

### 5.3. Ejemplo Concreto: Discipline

```
openspec/specs/discipline/spec.md
    ↓  RF-01: "POST /api/v1/disciplinas → 201"
    ↓  RN-01: "endDate debe ser posterior a startDate"
    ↓
packages/api/src/domain/services/DisciplineValidator.ts
    ↓  test: valida endDate > startDate
packages/api/src/application/CreateDisciplineUseCase.ts
    ↓  test: llama a validator antes de crear
packages/api/src/delivery/DisciplineController.ts
    ↓  test: POST → 201 con datos válidos
packages/web/src/views/Disciplines.tsx
    ↓  test: formulario muestra error si endDate <= startDate
```

Cada flecha es trazable. Cada test corresponde a un requisito. Cada archivo tiene un fundamento en el design.

---

## 6. Métricas y Reflexiones

### 6.1. Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Entidades implementadas** | 5 (Member, Sport, Payment, MedicalCertificate, Discipline) |
| **Tests totales** | ~200 (backend + frontend) |
| **Cambios SDD archivados** | 4 (Sport, Payment, MedicalCertificate, Discipline) |
| **PRs generados** | 7+ |
| **Documentos de diseño** | 4 (Sport extenso, Payment medio, MedicalCertificate liviano, Discipline frontend) |
| **Líneas en specs fuente** | ~450 (4 dominios) |

### 6.2. Reflexiones sobre OpenSpec

1. **Los archivos en el repo son el mejor seguro contra pérdida de contexto**: al abrir el proyecto después de semanas, los `specs/` te dicen exactamente qué hace cada cosa.
2. **El archive con fecha es invaluable**: poder ver `archive/2026-05-24-discipline/spec.md` y saber que ese es el estado final al momento del archivo.
3. **OpenSpec solo no alcanza para recuperación entre sesiones**: el modo híbrido (OpenSpec + Engram) es superior porque Engram permite búsqueda semántica ("¿dónde hablamos de la validación de fechas?").
4. **El costo de mantener OpenSpec es mínimo**: los specs se escriben una vez y solo se tocan en Archive. Son archivos Markdown, casi cero overhead.

### 6.3. Reflexiones sobre Testing

1. **El testing comenzó siendo un "nice to have" y se volvió indispensable**: sin los tests, ninguna refactorización sería segura, y el Safety Net hoy protege ~200 tests.
2. **Strict TDD al principio cuesta, pero después acelera**: el hábito de escribir tests primero reduce el tiempo de debugging a casi cero porque el feedback es inmediato.
3. **Los tests de frontend son los que más se rompen con cambios de UI**: los tests con `userEvent` son más robustos que los que usan `fireEvent`, pero siguen siendo frágiles ante cambios de librería de componentes.
4. **Tener una rama de integración (staging) para tests E2E sería el siguiente paso**: hoy los E2E tienen fallos pre-existentes que no bloquean el desarrollo local.

### 6.4. Recomendaciones para Proyectos Futuros

| Recomendación | Por qué |
|---------------|---------|
| **Siempre arrancar con un design, incluso si es chico** | Discipline backend sufrió por no tenerlo; frontend fue más rápido con design |
| **No sobre-diseñar la primera entidad** | Sport tiene 966 líneas de design; la próxima puede tener 150 |
| **Usar el modo híbrido OpenSpec + Engram desde el día 1** | Lo mejor de ambos mundos: archivos + búsqueda |
| **No saltarse el Safety Net** | Siempre ejecutar todos los tests después de cada cambio |
| **Documentar los ADRs aunque duelan** | La decisión de usar `/sports` vs `/deportes` parece trivial; documentarla evita discusiones infinitas |

---

## 7. Referencias Bibliográficas

1. **Beck, K.** (2002). *Test-Driven Development: By Example*. Addison-Wesley. — El texto fundacional de TDD que inspira el Strict TDD Mode.

2. **Meszaros, G.** (2007). *xUnit Test Patterns: Refactoring Test Code*. Addison-Wesley. — Patrones de testing (Mock, Stub, Fake) aplicados en la estrategia de testing del proyecto.

3. **Coplien, J. O. & Harrison, N. B.** (2004). *Organizational Patterns of Agile Software Development*. Pearson. — La noción de "artefactos como parte del proceso" que subyace a OpenSpec.

4. **Fowler, M.** (2003). *UML Distilled: A Brief Guide to the Standard Object Modeling Language* (3rd ed.). Addison-Wesley. — La filosofía de "diagramas justos y necesarios" que aplicamos a los design docs.

5. **Nygard, M.** (2018). *Documenting Architecture Decisions*. ThoughtWorks. — La práctica de ADRs que adoptamos en los documentos de diseño.

6. **IEEE Std 830-1998**. *IEEE Recommended Practice for Software Requirements Specifications*. — Estándar de especificación que informa la estructura de los specs en OpenSpec.

7. **Martin, R. C.** (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall. — Principios de arquitectura limpia que validan el uso de puertos y adaptadores en el diseño hexagonal.

8. **Fowler, M.** (2006). *Mocks Aren't Stubs*. martinfowler.com. — El artículo que fundamenta la decisión de usar mocks sobre fakes en los tests del proyecto.

9. **Humble, J. & Farley, D.** (2010). *Continuous Delivery: Reliable Software Releases Through Build, Test, and Deployment Automation*. Addison-Wesley. — El concepto de "build pipeline" como Safety Net que mantenemos con los tests automatizados.

10. **Kerievsky, J.** (2004). *Refactoring to Patterns*. Addison-Wesley. — La integración de refactoring con patrones que aplicamos en la fase REFACTOR del ciclo TDD.
