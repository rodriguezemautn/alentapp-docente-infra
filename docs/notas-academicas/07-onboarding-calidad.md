---
tema: Notas Académicas — Onboarding y Desarrollo: Proceso, Producto y Calidad
fecha: 2026-05-23
docente: Emanuel Rodriguez
---

# Notas Académicas: Onboarding, Proceso de Desarrollo y Atributos de Calidad

## Índice

1. [Onboarding para Nuevos Desarrolladores](#1-onboarding-para-nuevos-desarrolladores)
2. [Proceso de Desarrollo en Alentapp](#2-proceso-de-desarrollo-en-alentapp)
3. [Atributos de Calidad del Producto](#3-atributos-de-calidad-del-producto)
4. [Decisiones de Diseño y Arquitectura](#4-decisiones-de-diseño-y-arquitectura)
5. [Frontend: Decisiones Técnicas](#5-frontend-decisiones-técnicas)
6. [Backend: Decisiones Técnicas](#6-backend-decisiones-técnicas)
7. [Integración Continua y Calidad](#7-integración-continua-y-calidad)
8. [Referencias Bibliográficas](#8-referencias-bibliográficas)

---

## 1. Onboarding para Nuevos Desarrolladores

### 1.1. Propósito

Este documento sirve como guía de incorporación para cualquier desarrollador (docente, ayudante, estudiante avanzado) que se sume al proyecto Alentapp Docente. No asume conocimiento previo del proyecto.

### 1.2. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Runtime | Node.js | 22+ |
| Lenguaje | TypeScript | 6.0 (strict) |
| Backend framework | Fastify | 5.x |
| ORM | Prisma | 7.x |
| Base de datos | PostgreSQL | 16+ |
| Frontend framework | React + Vite | 19 / 8.x |
| UI Library | Chakra UI | 3.x |
| Routing | React Router | 7.x |
| Testing (unit/integ) | Vitest | 4.x |
| Testing (E2E) | Playwright | 1.59 |
| Linter | ESLint | 9.x (flat config) |
| Formatter | Prettier | — |

### 1.3. Setup Inicial

```bash
# 1. Clonar
git clone https://github.com/rodriguezemautn/alentapp-docente-infra.git
cd alentapp-docente-infra

# 2. Instalar dependencias (raíz + workspaces)
npm install

# 3. Inicializar husky hooks
npm run prepare

# 4. Configurar variables de entorno
cp .env.example .env  # o crear manualmente con DATABASE_URL

# 5. Inicializar BD (Docker)
docker compose up -d
npx prisma migrate dev
npx prisma db seed

# 6. Verificar que todo funciona
npm test -w packages/api
npm test -w packages/web
```

### 1.4. Estructura del Repositorio

```
alentapp-docente-infra/
├── packages/
│   ├── api/             # Backend hexagonal (Fastify + Prisma)
│   │   ├── src/
│   │   │   ├── domain/      # Entidades y puertos
│   │   │   ├── application/ # Casos de uso
│   │   │   ├── delivery/    # Controladores HTTP
│   │   │   └── infrastructure/ # Adaptadores (Prisma)
│   │   └── prisma/
│   │       ├── schema.prisma  # Modelo de datos
│   │       └── migrations/    # Migraciones versionadas
│   ├── web/              # Frontend (React + Chakra UI)
│   │   └── src/
│   │       ├── views/        # Vistas por entidad
│   │       ├── services/     # Clientes HTTP
│   │       ├── components/   # Componentes UI
│   │       └── routes.ts     # Definición de rutas
│   └── shared/           # DTOs y tipos compartidos
│       └── index.ts
├── docs/
│   ├── TDDs/             # Text Design Documents (30 TDDs)
│   ├── notas-academicas/ # Notas académicas (7 archivos)
│   └── metodologia-sdd/  # Guía práctica de SDD
├── openspec/             # Artefactos SDD (OpenSpec)
├── scripts/              # Scripts de automatización
├── .husky/               # Git hooks (husky)
├── .github/              # PR templates
├── docker-compose.yml    # Desarrollo
└── docker-compose.e2e.yml # E2E testing
```

### 1.5. Flujo de Trabajo Diario

```bash
# 1. Actualizar main
git checkout main && git pull

# 2. Crear rama para el cambio
git checkout -b feat/mi-cambio

# 3. Hacer commits atómicos
git add packages/api/src/domain/nuevo.ts
git commit -m "feat(api): agrega entidad NuevaEntidad"

# 4. Pushear y crear PR
git push -u origin feat/mi-cambio
npm run pr:create main feat/mi-cambio "feat(api): implementa NuevaEntidad"

# 5. Revisar y mergear (después de aprobación)
npm run pr:merge <pr-number> --squash
```

### 1.6. Primeros Pasos Recomendados

1. Leer `README.md`
2. Leer `docs/metodologia-sdd/guia-practica-sdd.md`
3. Explorar el código de Member (backend y frontend)
4. Leer 2-3 TDDs de entidades simples
5. Implementar Sport siguiendo el patrón SDD

---

## 2. Proceso de Desarrollo en Alentapp

### 2.1. SDD como Proceso Principal

El proyecto usa **Spec-Driven Development (SDD)** como proceso de desarrollo. Cada cambio significativo pasa por las fases:

```
Idea → Propuesta → Especificación → Diseño → Tareas → Aplicación → Verificación → Archivo
```

Este proceso asegura que **cada cambio esté justificado, especificado, diseñado, implementado y verificado** antes de integrarse.

### 2.2. Patrón de Implementación por Entidad

Cada entidad nueva sigue exactamente el patrón de Member:

```
1. Schema + migración (Prisma)
2. DTOs (shared)
3. Puerto (domain/repository)
4. Validador (domain/service)
5. Casos de uso (application)
6. Controlador HTTP (delivery)
7. Repositorio (infrastructure)
8. Registro en app.ts
9. Servicio frontend (web/services)
10. Vista frontend (web/views)
11. Tests (cada capa)
```

### 2.3. Strict TDD Mode

El proyecto tiene **Strict TDD Mode activado**. Dentro de la fase de aplicación, cada tarea debe:

1. Escribir el test primero (rojo)
2. Implementar el código mínimo (verde)
3. Refactorizar si es necesario
4. Commit

Esto aplica tanto a backend como a frontend.

---

## 3. Atributos de Calidad del Producto

### 3.1. Atributos de Calidad (ISO/IEC 25010)

| Atributo | Definición | Implementación en Alentapp |
|----------|------------|---------------------------|
| **Funcionalidad** | ¿Hace lo que debe? | TDDs como especificación verificable |
| **Confiabilidad** | ¿Funciona sin fallos? | Tests unitarios + integración + E2E |
| **Mantenibilidad** | ¿Es fácil de modificar? | Arquitectura hexagonal, SDD, conventional commits |
| **Testeabilidad** | ¿Es fácil de testear? | Inyección de dependencias, puertos/adaptadores |
| **Usabilidad** | ¿Es fácil de usar? | Chakra UI, React, diseño responsivo |
| **Eficiencia** | ¿Usa recursos adecuadamente? | Fastify (alto rendimiento), consultas optimizadas |
| **Portabilidad** | ¿Funciona en distintos entornos? | Docker, Node.js, PostgreSQL |
| **Seguridad** | ¿Protege los datos? | Validación en capa de dominio |

### 3.2. Decisiones que Impactan la Calidad

| Decisión | Atributo Impactado | Fundamento |
|----------|-------------------|------------|
| Arquitectura hexagonal | Mantenibilidad, Testeabilidad | Separación de responsabilidades, dependencias invertidas |
| Fastify + TypeScript | Eficiencia, Confiabilidad | Tipado estático, alto throughput |
| Prisma ORM | Mantenibilidad, Portabilidad | Migraciones automáticas, schema como fuente de verdad |
| Chakra UI 3.x | Usabilidad, Mantenibilidad | Componentes accesibles, tema consistente |
| Strict TDD Mode | Confiabilidad, Testeabilidad | Test-first garantiza cobertura |
| Conventional Commits | Mantenibilidad | Historial legible, generación automática de CHANGELOG |

---

## 4. Decisiones de Diseño y Arquitectura

### 4.1. Arquitectura Hexagonal (Ports & Adapters)

La arquitectura hexagonal separa el **dominio** (reglas de negocio) de la **infraestructura** (bases de datos, HTTP, UI) mediante **puertos** (interfaces) y **adaptadores** (implementaciones).

```
                    ┌──────────────┐
                    │   Dominio    │
                    │ (entities +  │
                    │  services)   │
                    └──────┬───────┘
                           │ puertos (interfaces)
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │ Aplicación│ │  HTTP    │ │  DB      │
       │ (use cases)│ │  delivery│ │ Prisma   │
       └──────────┘ └──────────┘ └──────────┘
```

**Beneficios**:
- El dominio no depende de frameworks ni de la base de datos
- Los casos de uso se testean sin infraestructura real
- Se puede cambiar Prisma por otro ORM sin tocar el dominio
- Las rutas HTTP se pueden reemplazar por GraphQL o gRPC

### 4.2. Decisiones Arquitectónicas Registradas (ADRs)

| ADR | Decisión | Alternativas Consideradas |
|-----|----------|--------------------------|
| **ADR-001** | Fastify sobre Express | Express, Hono, Koa |
| **ADR-002** | Prisma sobre TypeORM | TypeORM, Drizzle, MikroORM |
| **ADR-003** | npm workspaces sobre monorepo tools | Nx, Turborepo, Lerna |
| **ADR-004** | Vitest sobre Jest | Jest, Mocha, Ava |
| **ADR-005** | Chakra UI sobre Tailwind | Tailwind, Material UI, shadcn/ui |
| **ADR-006** | React Router sobre TanStack Router | TanStack Router, Next.js (pages) |

### 4.3. Patrón de Inyección de Dependencias

El proyecto usa **inyección manual** (sin DI container): cada dependencia se crea y pasa explícitamente en `app.ts`:

```typescript
const repo = new PostgresSportRepository();
const validator = new SportValidator();
const createUseCase = new CreateSportUseCase(repo, validator);
const controller = new SportController(createUseCase, ...);
server.post('/api/v1/sports', controller.create.bind(controller));
```

Esto evita la complejidad de un DI container (Inversify, tsyringe) manteniendo la testabilidad.

---

## 5. Frontend: Decisiones Técnicas

### 5.1. Stack y Justificación

| Decisión | Justificación |
|----------|---------------|
| **React 19** | Ecosistema maduro, componentes reutilizables, testing estable |
| **Vite 8** | Build rápido, HMR instantáneo, configuración mínima |
| **Chakra UI 3.x** | Componentes accesibles, tema customizable, responsive |
| **React Router 7** | Routing declarativo, loaders, error boundaries |

### 5.2. Patrón de Vista

Cada entidad tiene una vista CRUD completa que sigue el patrón:

```
Vista (Sports.tsx)
├── Tabla con datos (listado)
├── Botón "Nuevo" → Modal de creación
├── Botón "Editar" → Modal de edición
└── Botón "Eliminar" → Confirmación → Delete
```

### 5.3. Servicios HTTP

Los servicios (`web/src/services/*.ts`) encapsulan el llamado a la API:

```typescript
// packages/web/src/services/sports.ts
import type { SportDTO, CreateSportRequest, UpdateSportRequest } from '@alentapp/shared';

const BASE = '/api/v1/sports';

export async function getSports(): Promise<SportDTO[]> {
  const res = await fetch(BASE);
  return res.json();
}
```

---

## 6. Backend: Decisiones Técnicas

### 6.1. Capa de Dominio

Contiene las **entidades** y **servicios de dominio**. No tiene dependencias externas.

```
packages/api/src/domain/
├── SportRepository.ts       # Puerto (interfaz)
└── services/
    └── SportValidator.ts    # Validación de reglas de negocio
```

### 6.2. Capa de Aplicación

Contiene los **casos de uso** (use cases). Dependen de los puertos del dominio.

```
packages/api/src/application/
├── CreateSportUseCase.ts
├── GetSportsUseCase.ts
├── UpdateSportUseCase.ts
└── DeleteSportUseCase.ts
```

### 6.3. Capa de Delivery (HTTP)

Contiene los **controladores Fastify**. Convierten requests HTTP en llamadas a casos de uso.

```
packages/api/src/delivery/
└── SportController.ts    # POST, GET, PUT, DELETE /api/v1/sports
```

### 6.4. Capa de Infraestructura

Contiene los **adaptadores concretos**. Solo esta capa conoce Prisma.

```
packages/api/src/infrastructure/
└── PostgresSportRepository.ts  # Implementa SportRepository
```

---

## 7. Integración Continua y Calidad

### 7.1. Gates de Calidad Automatizados

| Gate | Momento | Herramienta | Acción si falla |
|------|---------|-------------|-----------------|
| Lint | pre-commit | lint-staged | Se bloquea el commit |
| Commit message | commit-msg | commitlint | Se bloquea el commit |
| Tests unitarios | PR / CI | Vitest | Se bloquea el merge |
| Tests E2E | PR / CI | Playwright | Se bloquea el merge |
| Budget de líneas | pre-merge | gh-automation verify-pr | Advertencia |

### 7.2. Estrategia de Testing por Capa

| Capa | Tipo de Test | Herramienta | Cobertura Esperada |
|------|-------------|-------------|-------------------|
| Domain (validator) | Unitario | Vitest | Reglas de negocio individuales |
| Application (use case) | Unitario | Vitest (repo mockeado) | Flujos completos + casos borde |
| Delivery (controller) | Unitario + Integración | Vitest (use case mockeado, repo real opcional) | HTTP contract + errores |
| Infrastructure (repository) | Integración | Vitest (BD real o testcontainer) | Consultas Prisma |
| Frontend (views) | Unitario | Vitest + testing-library | Renderizado + interacciones |
| Fullstack | E2E | Playwright | Flujos completos (front + back + BD) |

### 7.3. Cobertura Mínima

El proyecto aspira a:
- **Cobertura de línea**: > 80%
- **Cobertura de ramas**: > 70%
- **Tests por caso de uso**: mínimo 3 (feliz, error, borde)

---

## 8. Referencias Bibliográficas

1. **ISO/IEC 25010:2011**. *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models*. — Modelo de calidad de producto software.

2. **Martin, R. C.** (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall. — Arquitectura hexagonal y principios de diseño.

3. **Cockburn, A.** (2005). *Hexagonal Architecture (Ports and Adapters)*. alistair.cockburn.us. — Artículo original sobre el patrón de puertos y adaptadores.

4. **Gamma, E., Helm, R., Johnson, R., & Vlissides, J.** (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley. — Catálogo de patrones de diseño.

5. **Fowler, M.** (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley. — Patrones de arquitectura de aplicaciones empresariales.

6. **Beck, K.** (2002). *Test-Driven Development: By Example*. Addison-Wesley. — Práctica de TDD que informa Strict TDD Mode.

7. **Meszaros, G.** (2007). *xUnit Test Patterns: Refactoring Test Code*. Addison-Wesley. — Patrones de testing automatizado.

8. **Coplien, J. O. & Harrison, N. B.** (2004). *Organizational Patterns of Agile Software Development*. Pearson. — Patrones organizacionales que influyen en la estructura del proyecto.

9. **Nygard, M.** (2018). *Documenting Architecture Decisions*. ThoughtWorks. — Práctica de ADRs como documentación de decisiones arquitectónicas.

10. **Fowler, M.** (2014). *Refactoring: Improving the Design of Existing Code* (2nd ed.). Addison-Wesley. — Técnicas de refactorización para mantener la calidad del código.

11. **Vernon, V.** (2013). *Implementing Domain-Driven Design*. Addison-Wesley. — DDD táctico que informa la estructura de dominio del proyecto.

12. **Newman, S.** (2019). *Monolith to Microservices*. O'Reilly Media. — Patrones de evolución arquitectónica (relevante para entender la estructura monorepo).
