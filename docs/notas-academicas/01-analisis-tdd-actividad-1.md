---
tema: Análisis y Diseño de TDDs — Actividad 1
fecha: 2026-05-22
docente: Ezequiel Rodriguez
---

# Notas Académicas: Análisis y Diseño de TDDs — Actividad 1

## Contexto

Se analizaron las 6 entidades del DER del club social y deportivo para generar los TDDs correspondientes al ABM de cada una, según lo requerido en la Actividad 1 del TP Integrador.

## Observaciones del Proceso de Análisis

### 1. Lectura del DER
El DER (Diagrama Entidad-Relación) existe como imagen PNG en `docs/DER.png`. Durante este análisis no se pudo leer la imagen directamente, por lo que los TDDs se basaron en:
- Las reglas de negocio explícitas de la Actividad 1
- El esquema de Prisma existente (solo `Member`)
- La coherencia del dominio de un club social y deportivo

**Lección**: En un escenario real de ingeniería, el DER es EL artefacto fuente de verdad para el modelo de datos. Debería existir también como definición textual (DDL o schema) para trazabilidad y diff.

### 2. Patrón Arquitectónico Establecido
La implementación existente de `Member` define un patrón hexagonal muy claro que todas las entidades deben seguir:

```
Dominio (Puertos/Interfaces) → Servicios de Dominio → Casos de Uso → Controladores
                                                                     ↓
                                                          Infraestructura (PostgresRepo)
```

Cada nueva entidad puede replicar este patrón como plantilla:
- 1 Puerto (interfaz del repositorio)
- 1 Validador de dominio (reglas de negocio)
- 1 Caso de Uso por operación (Create, Get, Update, Delete, o variantes)
- 1 Controlador (traduce HTTP → UseCase)
- 1 Repositorio concreto (implementación Prisma)

### 3. Inmutabilidad vs. Borrado Físico
Las 6 entidades muestran distintos grados de "borrado":

| Entidad | Delete físico? | Alternativa |
|---------|---------------|-------------|
| Member | ✅ Sí (hard delete) | — |
| Payment | ❌ No | Status → "Canceled" |
| MedicalCertificate | ❌ No | isActive → false (automático al crear nuevo) |
| Locker | ✅ Sí (solo si Available) | — |
| Sport | ✅ Sí (si sin disciplinas) | — |
| Discipline | ✅ Sí | — |
| EquipmentLoan | ✅ Sí (solo si Returned/Lost) | — |

Esto es un excelente ejemplo para discutir en clase:
- **Auditability**: ¿Por qué algunos registros no se borran?
- **Soft delete vs. Hard delete**: Cuándo usar cada uno
- **Event sourcing**: Payments como ejemplos de eventos inmutables

### 4. Discrepancias Detectadas (para tratar en clase)

#### a) Categorías de EquipmentLoan vs MemberCategory
La regla de negocio de EquipmentLoan dice: "Solo socios Senior o Lifetime pueden recibir préstamos; Cadet no." Pero el modelo actual de `MemberCategory` usa: `Pleno | Cadete | Honorario`.

Posibles enfoques para resolver:
1. **Mapeo semántico**: Pleno→Senior, Honorario→Lifetime, Cadete→Cadet (traducción ES→EN)
2. **Extender el enum**: Agregar Senior y Lifetime al MemberCategory (incompatible con Member actual)
3. **Regla de negocio por lista blanca**: Definir qué categorías pueden acceder a préstamos como una lista configurable fuera del código

**Recomendación**: Discutir con los estudiantes que las reglas de negocio vienen del negocio (en español) pero el modelo técnico puede usar otros nombres. No asumir que están sincronizados — el TDD debe explicitar la decisión de diseño.

#### b) Migraciones redundantes
El historial de migraciones de Member muestra:
- `init_members` (crea la tabla)
- `init` (renombra campo mal tipeado)
- `add_birth_date` (agrega columna)
- `rename_birthdate` (la renombra)

Esto es normal en desarrollo real, pero es útil señalarlo en clase como "deuda técnica de migraciones" y discutir planificación vs. descubrimiento.

#### c) Sin autenticación ni autorización
Ninguna entidad implementa control de acceso. Esto es intencional (alcance acotado), pero mencionarlo: en un sistema real, las operaciones como cancelar pagos o reportar pérdida de equipamiento requerirían roles y permisos.

### 5. Temas de Ingeniería de Software que Emergen

| Concepto | Dónde aparece en los TDDs |
|----------|--------------------------|
| **Inversión de Dependencias** | Repositorios como interfaces, no implementaciones concretas |
| **Transacciones** | MedicalCertificate: invalidar anteriores + crear nuevo en una misma transacción |
| **Inmutabilidad** | Payment y MedicalCertificate no se modifican ni eliminan |
| **Validación en Dominio vs. Controlador** | Reglas de negocio en servicios de dominio, parseo de errores en controladores |
| **API RESTful** | Verbos HTTP, códigos de estado, naming de endpoints |
| **DTOs como contratos** | Tipos compartidos en `@alentapp/shared` |
| **Feature Branch Workflow** | Rama por entidad, PR, revisión, merge a main |
| **Diseño guiado por TDD (Text)** | El TDD se escribe ANTES del código, describe el QUÉ antes del CÓMO |

### 6. Estimación de Esfuerzo por Entidad

Basado en la complejidad de cada entidad:

| Entidad | Operaciones | Reglas especiales | Dificultad estimada |
|---------|-------------|-------------------|---------------------|
| Sport | CRUD completo | name inmutable, maxCapacity > 0 | 🟢 Baja |
| Discipline | CRUD completo | endDate > startDate, FK a Sport | 🟢 Baja |
| Locker | CRUD completo + asignación | number único, status Maintenance | 🟡 Media |
| Payment | Crear + Cancelar (no modificar) | Inmutabilidad, sin DELETE | 🟡 Media |
| EquipmentLoan | Crear + Devolver + Perder + Listar | Restricción por categoría, transiciones de estado | 🔴 Alta |
| MedicalCertificate | Crear + Listar (no modificar) | Desactivación automática en transacción | 🔴 Alta |

### 7. Errores Comunes que Pueden Tener los Estudiantes

- **No separar capas**: Mezclar lógica de negocio en el controlador (ej: validar fechas en el handler HTTP)
- **Olvidar transacciones**: En MedicalCertificate, crear el nuevo sin desactivar el anterior (inconsistencia)
- **No respetar inmutabilidad**: Agregar endpoint PUT o DELETE en Payment
- **Nombre del endpoint inconsistente**: Usar inglés cuando el resto usa español (`/members` vs `/socios`)
- **No seguir el patrón de errores**: Tirar errores sin el `.includes()` que espera el controlador
- **Falta de tests**: Implementar el ABM pero no los tests que validan las reglas de negocio específicas
