---
tema: Notas Académicas — Ingeniería y Calidad de Software
fecha: 2026-05-22
docente: Emanuel Rodriguez
---

# Notas Académicas: Arquitectura Hexagonal, TDDs, Git y Metodologías

## Índice

1. [Arquitectura Hexagonal](#1-arquitectura-hexagonal)
2. [Text Design Document (TDD)](#2-text-design-document-tdd)
3. [Git y Workflow](#3-git-y-workflow)
4. [Metodologías y Prácticas de Ingeniería](#4-metodologías-y-prácticas-de-ingeniería)
5. [Referencias Bibliográficas](#5-referencias-bibliográficas)

---

## 1. Arquitectura Hexagonal

### 1.1 Origen y Fundamentos

La **Arquitectura Hexagonal** (también llamada *Puertos y Adaptadores*) fue propuesta por **Alistair Cockburn** en 2005 como respuesta al acoplamiento excesivo entre la lógica de negocio y los detalles técnicos (bases de datos, frameworks web, APIs externas).

El nombre "hexagonal" no implica que deban haber seis lados — es una metáfora visual para mostrar que el dominio central se comunica con el exterior a través de **puertos** (interfaces) y **adaptadores** (implementaciones).

### 1.2 Principios Clave

| Principio | Descripción |
|-----------|-------------|
| **Inversión de Dependencias (DIP)** | El dominio no depende de la infraestructura; ambos dependen de abstracciones |
| **Aislamiento del Dominio** | La lógica de negocio vive en el centro, sin imports de frameworks o DB |
| **Puertos (Ports)** | Interfaces que definen contratos: "quiero persistir un socio, no importa cómo" |
| **Adaptadores (Adapters)** | Implementaciones concretas de los puertos (Postgres, Mongo, REST, GraphQL) |

### 1.3 Estructura en Alentapp

El proyecto implementa 4 capas hexagonales:

```
┌────────────────────────────────────────────┐
│              delivery/                      │
│  MemberController.ts  ← Adaptador ENTRADA  │  HTTP → Casos de Uso
├────────────────────────────────────────────┤
│              application/                   │
│  NewMemberUseCase.ts   ← Casos de USO      │  Orquesta lógica
│  GetMembersUseCase.ts                      │
├────────────────────────────────────────────┤
│              domain/                        │
│  MemberRepository.ts  ← PUERTO (interfaz)  │  Contratos
│  MemberValidator.ts   ← SERVICIO DOMINIO   │  Reglas de negocio puras
├────────────────────────────────────────────┤
│           infrastructure/                   │
│  PostgresMemberRepository  ← ADAPTADOR      │  DB real (Prisma)
└────────────────────────────────────────────┘
```

#### Flujo de una petición

```
Cliente HTTP
    ↓ POST /api/v1/socios
MemberController.create()         ← Delivery (recibe HTTP)
    ↓
CreateMemberUseCase.execute()     ← Application (orquesta)
    ↓
MemberValidator.validate()        ← Domain (reglas de negocio)
MemberRepository.create()         ← Domain (interfaz)
    ↓
PostgresMemberRepository.create() ← Infrastructure (Prisma → PostgreSQL)
    ↓
Response JSON
```

### 1.4 Ventajas Pedagógicas

- **Separación de responsabilidades clara**: Cada capa tiene un rol bien definido.
- **Testabilidad**: Se puede testear el caso de uso con un mock del repositorio sin tocar DB.
- **Independencia tecnológica**: Cambiar de Prisma a otro ORM solo requiere reescribir el adaptador.
- **Curva de aprendizaje gradual**: Los estudiantes pueden empezar entendiendo una capa a la vez.

### 1.5 Patrones Relacionados

| Patrón | Relación | Dónde se ve en Alentapp |
|--------|----------|------------------------|
| **Repository Pattern** | Abstrae la persistencia | `MemberRepository` es la interfaz, `PostgresMemberRepository` la implementación |
| **DTO (Data Transfer Object)** | Transporta datos entre capas | `@alentapp/shared` define `MemberDTO`, `CreateMemberRequest` |
| **Dependency Injection** | Inyecta dependencias en constructores | `app.ts`: `new CreateMemberUseCase(memberRepo, memberValidator)` |
| **Service Layer** | Encapsula lógica de negocio | `MemberValidator` con reglas de email, DNI único, minoría de edad |

---

## 2. Text Design Document (TDD)

### 2.1 ¿Qué es un TDD?

Un **Text Design Document (TDD)** es un artefacto de diseño textual que describe una funcionalidad antes de ser implementada. No debe confundirse con *Test-Driven Development* (también TDD). Es una práctica de **diseño guiado por documentación** donde:

> "Primero se diseña, después se codifica, y el diseño queda documentado."

### 2.2 Estructura del TDD (Template)

Todo TDD en este proyecto sigue esta estructura:

```
┌─ FRONTMATTER ─────────────────────────────┐
│  id, estado, autor, fecha, titulo          │
├─ 1. CONTEXTO DE NEGOCIO (PRD) ────────────┤
│  1.1 Objetivo                               │
│  1.2 User Persona                           │
│  1.3 Criterios de Aceptación               │
├─ 2. DISEÑO TÉCNICO (RFC) ─────────────────┤
│  2.1 Modelo de Datos                       │
│  2.2 Contrato de API (@alentapp/shared)    │
│  2.3 Componentes Hexagonales               │
├─ 3. CASOS DE BORDE Y ERRORES ─────────────┤
│  Tabla: Escenario / Resultado / HTTP       │
├─ 4. PLAN DE IMPLEMENTACIÓN ───────────────┤
│  Pasos secuenciales ordenados por capa     │
└────────────────────────────────────────────┘
```

### 2.3 Función de Cada Sección

| Sección | Propósito | Analogía |
|---------|-----------|----------|
| **Frontmatter** | Metadatos (quién, cuándo, estado) | Ficha catalográfica |
| **PRD** | *¿Qué problema de negocio resuelve?* | "El POR QUÉ" — visión del producto |
| **User Persona** | *¿Quién usa esto?* | Empatía con el usuario |
| **Criterios de Aceptación** | *¿Qué debe pasar para darlo por bueno?* | Contrato de calidad |
| **Modelo de Datos** | *¿Qué datos persiste?* | Esquema de DB |
| **Contrato de API** | *¿Cómo se comunica?* | Interfaz pública (Frontend ↔ Backend) |
| **Componentes Hexagonales** | *¿Cómo se distribuye en las capas?* | Plano arquitectónico |
| **Casos de Borde** | *¿Qué puede salir mal?* | Mapa de riesgos |
| **Plan de Implementación** | *¿En qué orden se construye?* | Hoja de ruta técnica |

### 2.4 Técnicas Aplicadas en los TDDs del Proyecto

#### a) Personas Consistentes por Entidad

Cada entidad tiene UNA user persona que aparece en TODOS sus TDDs:

| Entidad | Persona | Rol |
|---------|---------|-----|
| Payment | Alberto | Tesorero |
| MedicalCertificate | Laura | Secretaria |
| Locker | Martín | Administrativo de instalaciones |
| Sport / Discipline | Carla | Coordinadora de actividades |
| EquipmentLoan | Roberto | Encargado de depósito |

**Técnica**: La consistencia de persona genera familiaridad y hace que el documento sea más legible y cercano.

#### b) Un TDD por Operación (Patrón CRUD)

Siguiendo el patrón del repo original (Member), se creó **un TDD por operación atómica**, no uno por entidad:

```
Entidad: Locker
├── TDD-0006: CREATE → define modelo, DTOs, validaciones iniciales
├── TDD-0010: UPDATE → actualización con reglas de asignación
├── TDD-0014: DELETE → borrado físico condicional
├── TDD-0021: GET → consulta con filtros
├── TDD-0027: REPORT → reporte de ocupación
└── TDD-0029: HISTORY → historial de asignaciones (nuevo modelo)
```

**Técnica**: Cada TDD es atómico y construye sobre el anterior. El CREATE define la entidad; los siguientes referencian ese modelo sin repetirlo.

#### c) Inmutabilidad y Borrado Lógico

Se identificaron distintos tipos de baja según la naturaleza de la entidad:

| Tipo | Entidades | Implementación |
|------|-----------|----------------|
| **Hard Delete** | Locker, Sport, Discipline, EquipmentLoan | DELETE físico con condiciones |
| **Soft Delete (status)** | Payment | Status → "Canceled" |
| **Soft Delete (flag)** | MedicalCertificate | isActive → false (automático) |
| **Sin DELETE** | MedicalCertificate | Inmutabilidad por trazabilidad |

**Técnica**: Documentar la decisión de borrado en el TDD evita implementar DELETE donde no corresponde.

#### d) Tabla de Casos de Borde

Cada TDD incluye una tabla con:
- **Escenario**: situación concreta
- **Resultado Esperado**: mensaje de error exacto
- **Código HTTP**: estándar REST

```
| Escenario                   | Resultado Esperado                 | Código HTTP |
|-----------------------------|-------------------------------------|-------------|
| DNI duplicado               | "Ya existe un miembro con ese DNI" | 409 Conflict |
| Email con formato inválido  | "Formato de correo inválido"       | 400 Bad Request |
```

**Técnica**: La tabla de errores es el puente entre el TDD y los tests — cada fila es un caso de prueba potencial.

### 2.5 Errores Comunes al Redactar TDDs (para señalar en clase)

1. **Mezclar operaciones**: Poner CREATE y UPDATE en un mismo TDD (pierde atomicidad).
2. **User persona genérica**: "El usuario" no alcanza; un nombre y una necesidad concreta ayudan aempatizar.
3. **Modelo de datos incompleto**: Olvidar campos como `created_at` o relaciones como `memberId`.
4. **Códigos HTTP incorrectos**: Usar 400 para todo en lugar de 404, 409, 403 según corresponda.
5. **Casos de borde insuficientes**: Solo cubrir el "camino feliz" (happy path) y olvidar duplicados, inexistentes o estados inválidos.

---

## 3. Git y Workflow

### 3.1 Feature Branch Workflow

El proyecto sigue el **Feature Branch Workflow** definido en `CONTRIBUTING.md`:

```
main ────●────────────●────────────●──────────
          \          / \          /
           \── feat/A ──   \── feat/B ──
```

#### Reglas:

1. **No se commitea directo a `main`**. Toda modificación va en una branch.
2. **Naming**: `feature/*`, `fix/*`, `docs/*`, `refactor/*`.
3. **Commits convencionales**: `tipo(alcance): descripción`.
4. **PR obligatorio**: Toda branch se integra vía Pull Request.
5. **Revisión cruzada**: Alguien más revisa el código antes de mergear.

### 3.2 Conventional Commits

Formato: `tipo(alcance opcional): descripción`

```
feat(api): agrega endpoint de registro de pagos
fix(web): corrige validación de email en formulario
docs(tdds): actualiza TDD-0005 con casos de borde
refactor(api): extrae MemberValidator a servicio separado
test(api): agrega tests de integración para PaymentController
chore: configura ESLint para el workspace web
```

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `refactor` | Cambio de código sin cambiar funcionalidad |
| `test` | Agregar o modificar tests |
| `chore` | Mantenimiento, configuraciones, tooling |
| `style` | Formato, estilos de código (no funcional) |

### 3.3 Pull Request (PR)

#### Estructura recomendada

```
## Resumen
[1-3 líneas de qué hace el PR]

## Cambios
| Archivo | Cambio |
|---------|--------|
| path/file.ts | Se agregó X |

## Plan de pruebas
- [ ] Test unitarios pasan
- [ ] Test de integración pasan
- [ ] Verificado manualmente

## Checklist
- [ ] Commits convencionales
- [ ] Sin Co-Authored-By ni atribuciones AI
- [ ] Documentación actualizada si aplica
```

#### Proceso de revisión

1. **Autor** abre el PR con descripción clara.
2. **Revisor** analiza: ¿la solución cumple el objetivo? ¿hay edge cases no cubiertos?
3. **Autor** corrige si hay hallazgos.
4. **Revisor** aprueba.
5. **Autor** mergea (squash merge recomendado para mantener historial limpio).

### 3.4 Comandos Esenciales para Estudiantes

```bash
# 1. Crear branch desde main actualizado
git checkout main
git pull origin main
git checkout -b feature/mi-funcionalidad

# 2. Trabajar y commiter
git add archivo.ts
git commit -m "feat(scope): descripción"

# 3. Mantener branch actualizada con main
git fetch origin
git rebase origin/main

# 4. Publicar y crear PR
git push -u origin feature/mi-funcionalidad
# → Abrir PR en GitHub

# 5. Traer cambios del PR aprobado (después del merge)
git checkout main
git pull origin main
```

### 3.5 Errores Comunes de Git (para señalar en clase)

| Error | Causa | Solución |
|-------|-------|----------|
| Commits directo a main | No se creó branch | `git reset HEAD~1`, crear branch, cherry-pick |
| Merge conflicts | No se actualizó la branch | `git rebase origin/main`, resolver conflictos |
| Push rechazado | Branch atrasada | `git pull --rebase origin feature/x` |
| Mensaje de commit vago | "arreglos varios" | Usar conventional commits |
| Archivos no deseados en commit | `git add .` sin revisar | Siempre `git add archivo.ts` específico |

---

## 4. Metodologías y Prácticas de Ingeniería

### 4.1 Pirámide de Testing

Aplicada al proyecto:

```
        ╱╲
       ╱ E2E ╲            3 tests (Playwright full-stack)
      ╱────────╲
     ╱ Integra- ╲         6 tests (Vitest + Fastify inject)
    ╱   ción     ╲
   ╱──────────────╲
  ╱   Unitarios    ╲      12+ tests (Vitest, Testing Library)
 ╱──────────────────╲
```

Ver TDD-0017 (actividad 3) para los mínimos requeridos.

### 4.2 API-First Design

El contrato de API se define en `@alentapp/shared` **antes** de implementar:

```ts
// 1. Se define el DTO en shared
export interface CreatePaymentRequest {
    memberId: string;
    amount: number;
    paymentType: PaymentType;
}

// 2. Se usa en backend para validar el body
// 3. Se usa en frontend para tipar el formulario
```

Ventajas pedagógicas:
- Obliga a pensar el diseño antes de codificar.
- El frontend y backend evolucionan en paralelo.
- Los errores de tipo se detectan en compilación, no en runtime.

### 4.3 Monorepo con npm Workspaces

```
alentapp/
├── packages/
│   ├── api/        → @alentapp/api      (Fastify, Prisma)
│   ├── web/        → @alentapp/web      (React, Vite, Chakra UI)
│   └── shared/     → @alentapp/shared   (tipos, DTOs, contratos)
├── package.json    → "workspaces": ["packages/*"]
└── tsconfig.json   → paths: "@alentapp/shared"
```

**Beneficios**:
- Un solo `npm install`.
- Tipos compartidos sin publicar a npm.
- Refactors atómicos (cambio en shared afecta a todos los paquetes).

### 4.4 Infraestructura como Código (Docker Compose)

```
Desarrollo (docker-compose.yml):
  db (5432) + api (3000, hot-reload) + web (5173, hot-reload)

E2E (docker-compose.e2e.yml):
  db-test (5433) + api-test (3001) + web-test (5174)
```

**Conceptos que ilustra**:
- Entornos reproducibles (no más "en mi máquina funciona").
- Puertos separados para desarrollo y testing.
- `prisma migrate deploy` vs `prisma migrate dev`.
- Variables de entorno por ambiente.

### 4.5 DTOs vs Entidades de Dominio

En el proyecto se usa `@alentapp/shared` para DTOs compartidos, pero no hay **Value Objects** de dominio (como `Email`, `DNI`, `MontoPositivo`). Esto es una oportunidad de mejora:

```
// Actual: string plano
email: string;

// Ideal: Value Object
class Email {
    private constructor(public readonly value: string) {}
    static create(email: string): Email { /* valida */ }
}
```

### 4.6 Relación con Otras Metodologías

| Metodología | Relación con este proyecto |
|-------------|---------------------------|
| **Domain-Driven Design (DDD)** | La arquitectura hexagonal es compatible con DDD, aunque el proyecto no implementa agregados ni eventos de dominio |
| **Test-Driven Development (TDD)** | El proyecto usa TDD (Text) como diseño previo; los tests (Vitest) verifican la implementación, no guían el diseño |
| **SOLID** | Cada principio se aplica: SRP (una capa = una responsabilidad), DIP (interfaces en dominio), OCP (nuevos repositorios sin modificar casos de uso) |
| **RESTful API** | Verbos HTTP estándar (GET, POST, PUT, DELETE), códigos de estado, recursos con nombres en plural |
| **Continuous Integration** | Pendiente de implementar (GH Actions). Los tests existen pero no se ejecutan automáticamente en cada PR |

---

## 5. Referencias Bibliográficas

### Arquitectura y Diseño

1. **Cockburn, A.** (2005). *Hexagonal Architecture (Ports and Adapters)*.
   https://alistair.cockburn.us/hexagonal-architecture/

2. **Martin, R. C.** (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall.
   - Cap. 1-4: Paradigmas y diseño
   - Cap. 16-20: Arquitectura hexagonal y DIP

3. **Evans, E.** (2003). *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Addison-Wesley.
   - Cap. 4: Aislamiento del dominio
   - Cap. 5: Entidades y Value Objects

4. **Fowler, M.** (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley.
   - Patrón Repository (p. 322)
   - Patrón Data Transfer Object (p. 401)
   - Patrón Service Layer (p. 133)

5. **Gamma, E.; Helm, R.; Johnson, R.; Vlissides, J.** (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley.
   - GoF — Patrones creacionales, estructurales y de comportamiento

### Testing

6. **Fowler, M.** (2012). *Test Pyramid*.
   https://martinfowler.com/bliki/TestPyramid.html

7. **Beck, K.** (2002). *Test-Driven Development: By Example*. Addison-Wesley.

### Git y Workflow

8. **Chacon, S.; Straub, B.** (2014). *Pro Git* (2nd ed.). Apress.
   https://git-scm.com/book/es/v2
   - Cap. 3: Ramificaciones (branching)
   - Cap. 6: GitHub — PRs y colaboración

9. **Conventional Commits** (2021). *Specification v1.0.0*.
   https://www.conventionalcommits.org/

### Docker e Infraestructura

10. **Docker Inc.** (2026). *Docker Compose Overview*.
    https://docs.docker.com/compose/

### Ingeniería de Software General

11. **Sommerville, I.** (2015). *Software Engineering* (10th ed.). Pearson.
    - Cap. 7: Diseño arquitectónico
    - Cap. 8: Diseño detallado
    - Cap. 22: Gestión de configuración de software

12. **Pressman, R.** (2014). *Software Engineering: A Practitioner's Approach* (8th ed.). McGraw-Hill.
    - Cap. 9: Modelos de diseño arquitectónico
    - Cap. 14: Estrategias de testing

---

*Documento generado como parte del repositorio alentapp-docente-infra — material de apoyo para la cátedra de Ingeniería y Calidad de Software (2026).*
