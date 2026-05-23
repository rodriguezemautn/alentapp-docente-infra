# Guía Práctica de SDD — Alentapp Docente

Guía paso a paso para aplicar **Spec-Driven Development (SDD)** en el repositorio Alentapp
Docente. Pensada para docentes y estudiantes que quieran un flujo estructurado y trazable.

---

## Índice

1. [¿Qué es SDD?](#1-qué-es-sdd)
2. [Prerrequisitos](#2-prerrequisitos)
3. [Flujo Completo Paso a Paso](#3-flujo-completo-paso-a-paso)
4. [Ejemplo: Agregar ABM de Locker](#4-ejemplo-agregar-abm-de-locker)
5. [Referencia Rápida de Comandos](#5-referencia-rápida-de-comandos)
6. [Checklist de Calidad](#6-checklist-de-calidad)

---

## 1. ¿Qué es SDD?

SDD es una metodología donde **cada cambio en el código arranca con una especificación**.
Las fases son:

```
Propuesta → Especificación → Diseño → Tareas → Aplicación → Verificación → Archivo
```

Cada fase produce un artefacto que alimenta a la siguiente. Nada se implementa sin estar
especificado, nada se especifica sin estar propuesto.

**Relación con TDD**: SDD no reemplaza TDD. SDD planifica el QUÉ, TDD garantiza el CÓMO.
Pueden (y deberían) usarse juntos.

---

## 2. Prerrequisitos

Antes de arrancar un ciclo SDD, asegurate de tener:

- [ ] Repositorio clonado y en la rama correcta (`main` actualizada)
- [ ] Entorno de desarrollo funcionando (npm install, docker-compose, etc.)
- [ ] Tests ejecutándose (`npm test` o equivalente)
- [ ] Lectura de las [notas académicas de SDD](../notas-academicas/03-spec-driven-development.md)

---

## 3. Flujo Completo Paso a Paso

### Fase 1: Propuesta

**Qué hacer**: Definir la intención del cambio en 1-2 párrafos.

**Preguntas guía**:
- ¿Qué problema resuelve este cambio?
- ¿Por qué vale la pena ahora?
- ¿Cuál es el alcance (qué entra y qué no)?

**Formato** (archivo: `openspec/proposal.md`):

```markdown
# Propuesta: [nombre del cambio]

## Problema
[qué problema resuelve]

## Motivación
[por qué ahora]

## Alcance
- Incluye: [lista de lo que SÍ]
- Excluye: [lista de lo que NO]

## Enfoque
[idea general de la solución]
```

**Criterio de salida**: Podés explicarle el cambio a alguien más sin mostrar código.

---

### Fase 2: Especificación

**Qué hacer**: Refinar la propuesta en requisitos concretos.

**Preguntas guía**:
- ¿Qué debe hacer el sistema exactamente?
- ¿Cuáles son las reglas de negocio?
- ¿Qué pasa en los casos borde?
- ¿Cómo validamos que está bien?

**Formato** (archivo: `openspec/spec.md`):

```markdown
# Especificación: [nombre del cambio]

## Requisitos Funcionales
1. RF-01: [descripción]
2. RF-02: [descripción]

## Reglas de Negocio
- RN-01: [regla]

## Casos de Uso / Escenarios
### CU-01: [nombre]
- **Precondiciones**: [estado inicial]
- **Entrada**: [datos]
- **Salida esperada**: [resultado]
- **Postcondiciones**: [estado final]

## Criterios de Aceptación
- [ ] CA-01: [condición verificable]
```

**Criterio de salida**: Cualquier desarrollador puede leer la spec y saber exactamente qué
implementar.

---

### Fase 3: Diseño

**Qué hacer**: Traducir la especificación en una solución técnica.

**Preguntas guía**:
- ¿Qué archivos hay que crear o modificar?
- ¿Qué patrones de diseño aplican?
- ¿Cómo se conecta con el código existente?

**Formato** (archivo: `openspec/design.md`):

```markdown
# Diseño: [nombre del cambio]

## Archivos a modificar
- `src/ruta/archivo.ts` — [qué cambia]

## Arquitectura
[diagrama o descripción de la solución]

## Decisiones Técnicas
- DT-01: [decisión] — [fundamento]
```

**Criterio de salida**: Podés implementar siguiendo el diseño sin tomar decisiones
arquitectónicas adicionales.

---

### Fase 4: Tareas

**Qué hacer**: Descomponer el diseño en tareas atómicas.

**Preguntas guía**:
- ¿Cuál es la unidad mínima de trabajo?
- ¿En qué orden hay que hacerlas?
- ¿Cómo sé que una tarea está completa?

**Formato** (archivo: `openspec/tasks.md`):

```markdown
# Tareas: [nombre del cambio]

## T-01: [nombre corto]
- **Depende de**: [ninguna | T-XX]
- **Archivos**: [lista de archivos]
- **Criterio de aceptación**: [qué verifica que está bien]
- **Estimación**: [XS | S | M | L | XL]

## T-02: [nombre corto]
...
```

**Criterio de salida**: Cada tarea produce un commit con sentido completo.

---

### Fase 5: Aplicación

**Qué hacer**: Implementar las tareas una por una.

**Reglas**:
1. Trabajá UNA tarea a la vez.
2. Si activaste Strict TDD Mode: test primero, código después.
3. Cada tarea completa → commit semántico.
4. Marcá el progreso contra la lista de tareas.

**Strict TDD Mode** (cuando el proyecto tiene tests configurados):

```
Para CADA tarea:
  1. Escribí el test que falla (rojo)
  2. Escribí el código mínimo para que pase (verde)
  3. Refactorizá si hace falta (refactor)
  4. Commit
```

**Criterio de salida**: Todas las tareas están implementadas y los tests pasan.

---

### Fase 6: Verificación

**Qué hacer**: Validar que la implementación cumple con la especificación.

**Checklist**:
- [ ] Todos los requisitos funcionales están implementados
- [ ] Todas las reglas de negocio se respetan
- [ ] Los casos borde están cubiertos
- [ ] Los tests pasan
- [ ] El diseño se respetó (o hay desvíos documentados)

**Clasificación de hallazgos**:
| Nivel | Significado | Acción |
|-------|-------------|--------|
| CRITICAL | No cumple la spec | Debe corregirse |
| WARNING | Cumple pero hay riesgo potencial | Evaluar |
| SUGGESTION | Mejora posible | Opcional |

**Criterio de salida**: No hay CRITICALs, los WARNINGs están evaluados.

---

### Fase 7: Archivo

**Qué hacer**: Cerrar el cambio formalmente.

**Checklist**:
- [ ] Todos los artefactos están actualizados
- [ ] Las decisiones de último momento están documentadas
- [ ] El delta entre lo planeado y lo implementado está registrado
- [ ] El estado final está persistido

**Criterio de salida**: El cambio está cerrado, cualquier consulta futura encuentra
la información en los artefactos.

---

## 4. Ejemplo: Agregar ABM de Locker

### Propuesta

```markdown
# Propuesta: ABM de Locker

## Problema
El sistema no permite gestionar lockers (asignación, consulta, baja).

## Motivación
Es requisito de la Actividad 1 del TP Integrador.

## Alcance
- Incluye: CRUD de Locker con reglas de negocio
- Excluye: asignación a socios (futura actividad)

## Enfoque
Seguir el patrón hexagonal existente en Member.
```

### Especificación (extracto)

```markdown
## RF-01: Crear Locker
El sistema debe permitir crear un locker con número, ubicación y tamaño.

## RN-01: Número único
No pueden existir dos lockers con el mismo número.

## CU-01: Crear locker exitoso
- Entrada: { numero: "A-101", ubicacion: "Planta Baja", tamaño: "CHICO" }
- Postcondición: Locker creado con estado DISPONIBLE
```

### Diseño (extracto)

```markdown
## Archivos a crear
- packages/api/src/domain/locker/entities/Locker.ts
- packages/api/src/domain/locker/repositories/ILockerRepository.ts
- packages/api/src/application/locker/usecases/CreateLockerUseCase.ts
- packages/api/src/infrastructure/database/repositories/LockerRepository.ts
- packages/api/src/infrastructure/http/routes/lockerRoutes.ts
```

### Tareas (extracto)

```markdown
## T-01: Crear entidad Locker y enumeradores
- Archivos: Locker.ts, LockerSize.ts, LockerStatus.ts
- Criterio: La entidad tiene todos los atributos del DER

## T-02: Crear contrato ILockerRepository
- Depende de: T-01
- Archivos: ILockerRepository.ts
- Criterio: Define create, findById, findAll, delete

## T-03: Implementar CreateLockerUseCase
- Depende de: T-02
- Archivos: CreateLockerUseCase.ts
- Criterio: Crea locker con estado DISPONIBLE, valida número único
```

---

## 5. Referencia Rápida de Comandos

### Iniciar un cambio SDD

```bash
# Crear rama
git checkout -b feat/abm-locker

# Trabajar las fases (los artefactos van en openspec/)
# ... propuesta, especificación, diseño, tareas ...

# Aplicar tareas
# ... implementar tarea por tarea ...

# Verificar
# ... revisar contra la spec ...

# Archivar y mergear
git add -A && git commit -m "feat: implementa ABM de Locker"
git push origin feat/abm-locker
# Crear PR en GitHub
```

### Conventional Commits para SDD

| Tipo | Uso |
|------|-----|
| `docs:` | Artefactos SDD (spec, design, tasks) |
| `feat:` | Implementación de una tarea |
| `fix:` | Corrección encontrada en Verify |
| `test:` | Tests (Strict TDD Mode) |
| `refactor:` | Refactor post-verde en TDD |

---

## 6. Checklist de Calidad

Usar este checklist antes de dar por terminado un ciclo SDD:

- [ ] **Propuesta clara**: Cualquiera entiende qué y por qué
- [ ] **Spec completa**: Todos los escenarios están cubiertos
- [ ] **Diseño trazable**: Cada requisito tiene su implementación mapeada
- [ ] **Tareas atómicas**: Cada tarea produce un commit revisable
- [ ] **Tests pasan**: `npm test` (o equivalente) da verde
- [ ] **Verify sin CRITICALs**: Todo lo especificado está implementado
- [ ] **Artefactos persistidos**: No se pierde contexto entre sesiones
- [ ] **Branch mergeada**: El cambio está integrado en `main`
