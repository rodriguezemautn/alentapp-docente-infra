# Tareas: Entidad Sport

## Pronóstico de Carga de Revisión

| Campo | Valor |
|-------|-------|
| Líneas modificadas estimadas | ~900–1100 |
| Riesgo del presupuesto de 400 líneas | Alto |
| PR encadenadas recomendadas | Sí |
| División sugerida | PR1: Backend (T-01→T-10), PR2: Frontend (T-11→T-13), PR3: E2E+Docs (T-14→T-16) |
| Estrategia de entrega | auto-chain |
| Estrategia de cadena | stacked-to-main |

Decisión necesaria antes de aplicar: No
PR encadenadas recomendadas: Sí
Estrategia de cadena: stacked-to-main
Riesgo del presupuesto de 400 líneas: Alto

### Unidades de Trabajo Sugeridas

| Unidad | Objetivo | PR probable | Notas |
|------|------|-----------|-------|
| 1 | Backend: Prisma → app.ts | PR 1 | base=main; incluye todas las capas con pruebas |
| 2 | Frontend: servicio + vista + ruteo | PR 2 | base=main; depende de los endpoints del PR 1 |
| 3 | E2E + notas académicas | PR 3 | base=main; liviano, ~100 líneas |

### Referencia de Registro de Decisiones

| ID | Decisión | Ubicación (design-sport.md) |
|----|----------|---------------------------|
| D-01 | Ruta del frontend como `/sports` (inglés, consistente con Members) | L39–43 |
| D-02 | `SportDetailDTO` extiende `SportDTO` con `disciplineCount` | L45–49 |
| D-03 | Guardia de eliminación via `countDisciplines()` en el repositorio | L51–55 |
| D-04 | Inmutabilidad del nombre aplicada a nivel de caso de uso (defensa de 2 capas) | L57–61 |
| D-05 | Modelo stub mínimo `Discipline` en Prisma para consultas de relación | L617–634 |

---

## Fase 1: Base

### T-01: Schema de Prisma + migración para Sport y el stub de Discipline
- **Deps**: —
- **Archivos**: `packages/api/prisma/schema.prisma` (modificar), migración (auto)
- **AC**: Modelo `Sport` con todos los campos, stub `Discipline` con `id` + FK `sportId`, `npx prisma migrate dev` exitoso, `prisma generate` exitoso
- **Commit**: `feat(db): add Sport model and Discipline stub`
- **TDD**: No — solo schema, sin lógica
- **Est**: S
- **Val**: `name` @unique, maxCapacity `Int`, description `String?`, FK `sportId` en Discipline
- **Estado**: ✅ Completada

### T-02: DTOs Compartidos (SportDTO, SportDetailDTO, CreateSportRequest, UpdateSportRequest)
- **Deps**: —
- **Archivos**: `packages/shared/index.ts` (modificar)
- **AC**: 4 tipos exportados, `UpdateSportRequest` excluye `name`, `SportDetailDTO` extiende `SportDTO` con `disciplineCount: number`, sin errores de tipo en TS
- **Commit**: `feat(shared): add Sport DTOs`
- **TDD**: No — solo tipos
- **Est**: XS
- **Val**: `UpdateSportRequest` omite `name` según RN-02
- **Estado**: ✅ Completada

---

## Fase 2: Dominio

### T-03: Interfaz de puerto SportRepository
- **Deps**: T-02
- **Archivos**: `packages/api/src/domain/SportRepository.ts`
- **AC**: Interfaz con 7 métodos: `create`, `findById`, `findByName`, `findAll` (retorna `SportDetailDTO[]`), `update`, `delete`, `countDisciplines`; sigue el patrón de `MemberRepository`
- **Commit**: `feat(domain): add SportRepository port interface`
- **TDD**: No — solo interfaz
- **Est**: XS
- **Val**: —
- **Estado**: ✅ Completada

### T-04: SportValidator + SportValidator.test.ts
- **Deps**: T-03
- **Archivos**: `packages/api/src/domain/services/SportValidator.ts` (crear), `SportValidator.test.ts` (crear)
- **AC**: Las 16 pruebas del plan de diseño pasan (nombre requerido, nombre máx. 100, descripción opcional/máx. 500, maxCapacity requerido/entero/>0, unicidad con excludeSportId, verificación de inmutabilidad del nombre)
- **Commit**: `feat(domain): add SportValidator with all validation rules`
- **TDD**: Sí — pruebas primero
- **Est**: S
- **Val**: nombre requerido/máx100/único; descripción opcional/máx500; maxCapacity requerido/entero/>0; cambio de nombre bloqueado via `validateNameNotInPayload`
- **Estado**: ✅ Completada

---

## Fase 3: Aplicación (TDD estricto — prueba primero en todos)

### T-05: CreateSportUseCase + prueba
- **Deps**: T-03, T-04
- **Archivos**: `packages/api/src/application/CreateSportUseCase.ts`, `CreateSportUseCase.test.ts`
- **AC**: 3 pruebas pasan — creación válida (retorna SportDTO), nombre duplicado (lanza error), maxCapacity inválido (lanza error)
- **Commit**: `feat(use-case): add CreateSportUseCase`
- **TDD**: Sí — prueba primero
- **Est**: S
- **Val**: Todos los validadores llamados en orden: name → description → maxCapacity → unicidad

### T-06: GetSportsUseCase + prueba
- **Deps**: T-03
- **Archivos**: `packages/api/src/application/GetSportsUseCase.ts`, `GetSportsUseCase.test.ts`
- **AC**: 1 prueba pasa — retorna `SportDetailDTO[]` desde `repo.findAll()`
- **Commit**: `feat(use-case): add GetSportsUseCase`
- **TDD**: Sí — prueba primero
- **Est**: XS
- **Val**: —

### T-07: UpdateSportUseCase + prueba
- **Deps**: T-03, T-04
- **Archivos**: `packages/api/src/application/UpdateSportUseCase.ts`, `UpdateSportUseCase.test.ts`
- **AC**: 4 pruebas pasan — actualización válida, no encontrado (404), cambio de nombre rechazado (400), maxCapacity inválido (400)
- **Commit**: `feat(use-case): add UpdateSportUseCase`
- **TDD**: Sí — prueba primero
- **Est**: S
- **Val**: nombre inmutable via `validateNameNotInPayload`; maxCapacity validado si está presente; descripción validada si está presente

### T-08: DeleteSportUseCase + prueba
- **Deps**: T-03
- **Archivos**: `packages/api/src/application/DeleteSportUseCase.ts`, `DeleteSportUseCase.test.ts`
- **AC**: 3 pruebas pasan — eliminación exitosa, no encontrado (lanza error), tiene disciplinas (lanza error + delete NO llamado)
- **Commit**: `feat(use-case): add DeleteSportUseCase`
- **TDD**: Sí — prueba primero
- **Est**: S
- **Val**: eliminación protegida por `countDisciplines > 0` según RN-03

---

## Fase 4: Delivery

### T-09: SportController + SportController.test.ts + SportController.integration.test.ts
- **Deps**: T-05, T-06, T-07, T-08
- **Archivos**: `packages/api/src/delivery/SportController.ts`, `SportController.test.ts` (crear), `SportController.integration.test.ts` (crear)
- **AC**: 13 pruebas unitarias del controller cubren los 4 métodos + mapeo de errores; 9 pruebas de integración cubren el ciclo HTTP completo (GET vacío, POST+GET, duplicado, inválido, PUT actualizar, PUT cambio de nombre, PUT no encontrado, DELETE, DELETE con disciplinas)
- **Commit**: `feat(api): add SportController with CRUD endpoints and error mapping`
- **TDD**: Sí — prueba primero
- **Est**: M
- **Val**: Mapeo error-a-HTTP según tabla de especificación: 400/404/409/500 con mensajes de error en español

### T-10: PostgresSportRepository
- **Deps**: T-01, T-03
- **Archivos**: `packages/api/src/infrastructure/PostgresSportRepository.ts`
- **AC**: Implementa los 7 métodos de `SportRepository`; `findAll` usa `_count` para disciplineCount; `countDisciplines` consulta la relación Discipline; `mapToDTO` convierte `null` en `undefined` para la descripción
- **Commit**: `feat(infra): add PostgresSportRepository`
- **TDD**: No — implementación de acceso a datos
- **Est**: S
- **Val**: —

### T-10b: Cablear Sport en app.ts
- **Deps**: T-09, T-10
- **Archivos**: `packages/api/src/app.ts` (modificar)
- **AC**: Todos los imports presentes, cadena de DI (repo→validator→use cases→controller) cableada, 4 rutas registradas en `/api/v1/deportes`, el servidor inicia sin errores
- **Commit**: `feat(api): wire Sport into app with DI and route registration`
- **TDD**: No — solo composición
- **Est**: XS
- **Val**: —

---

## Fase 5: Frontend

### T-11: Servicio frontend sports.ts
- **Deps**: T-02
- **Archivos**: `packages/web/src/services/sports.ts`
- **AC**: 4 métodos (`getAll`, `create`, `update`, `delete`) siguiendo el patrón de `members.ts`; `getAll` retorna `SportDetailDTO[]`; lanza error en respuestas no exitosas con el mensaje de error del servidor
- **Commit**: `feat(web): add sports API service`
- **TDD**: No — solo cliente HTTP
- **Est**: XS
- **Val**: —

### T-12: Sports.tsx + Sports.test.tsx
- **Deps**: T-11
- **Archivos**: `packages/web/src/views/Sports.tsx`, `Sports.test.tsx`
- **AC**: 7 pruebas del frontend pasan (cargando/vacío/lista/error/crear/editar/eliminar); modo edición tiene nombre de solo lectura; botón de eliminar deshabilitado cuando `disciplineCount > 0`; formulario tiene `maxLength={100}` en nombre, `maxLength={500}` en descripción, `min={1}` en maxCapacity
- **Commit**: `feat(web): add Sports view with full CRUD and frontend validation`
- **TDD**: Sí — prueba primero
- **Est**: M
- **Val**: nombre de solo lectura en edición; maxCapacity `min={1}`; contador de caracteres en descripción; eliminar deshabilitado con tooltip si existen disciplinas

### T-13: Registro de ruta (routes.ts + Layout.tsx)
- **Deps**: T-12
- **Archivos**: `packages/web/src/routes.ts` (modificar), `packages/web/src/Layout.tsx` (modificar)
- **AC**: Ruta `/sports` renderiza `SportsView`; enlace de navegación etiquetado "Deportes" visible en Layout
- **Commit**: `feat(web): register Sports route and nav link`
- **TDD**: No — cableado
- **Est**: XS
- **Val**: —

---

## Fase 6: Documentación

### T-14: Notas académicas sobre la implementación de Sport
- **Deps**: —
- **Archivos**: `academic/sport-entity.md`
- **AC**: Cubre decisiones de arquitectura hexagonal, reglas de validación (inmutabilidad del nombre, guardia de disciplinas), proceso TDD seguido, estrategia de mapeo de errores, diferencias clave con el patrón Member
- **Commit**: `docs: add Sport implementation academic notes`
- **TDD**: No
- **Est**: XS
- **Val**: —

---

## Fase 7: Integración

### T-15: Prueba E2E (Playwright)
- **Deps**: T-13
- **Archivos**: (especificación E2E para CRUD de Sport)
- **AC**: Flujo completo en navegador: crear deporte → verificar en tabla → editar → verificar actualización → eliminar → verificar eliminación; todos los escenarios de la especificación cubiertos
- **Commit**: `test(e2e): add Sport CRUD E2E test`
- **TDD**: No
- **Est**: S
- **Val**: Prueba todos los estados de error: duplicado, capacidad inválida, cambio de nombre, eliminar con disciplinas

### T-16: Verificación final + PR
- **Deps**: T-01→T-15
- **Archivos**: Todos
- **AC**: Todas las pruebas pasan (`vitest run`, `vitest run --config vitest.web.config.ts`), TypeScript compila, build exitoso, descripción del PR documenta las decisiones de arquitectura
- **Commit**: —
- **TDD**: No
- **Est**: XS
- **Val**: Validación final de todas las reglas de extremo a extremo
