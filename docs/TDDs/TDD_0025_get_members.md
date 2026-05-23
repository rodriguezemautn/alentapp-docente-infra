---
id: 0025
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Consulta de Socios
---

# TDD-0025: Consulta de Socios

## Contexto de Negocio (PRD)

### Objetivo

Permitir la consulta de socios con filtros de búsqueda. Aunque la funcionalidad ya existe en el código, no tiene un TDD asociado. Este documento formaliza el diseño de las operaciones de lectura de socios.

### User Persona

- **Nombre**: Alberto (Tesorero/Administrativo).
- **Necesidad**: Buscar socios por nombre, DNI o email, y filtrar por categoría o estado para hacer listados rápidos.

### Criterios de Aceptación

- El sistema debe listar todos los socios ordenados por fecha de creación descendente.
- El sistema debe permitir buscar por `name`, `dni` o `email` (texto parcial).
- El sistema debe permitir filtrar por `category` y `status`.
- El sistema debe permitir obtener un socio individual por ID.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

```ts
// GET /api/v1/socios?search=&category=&status=&page=&limit=
// GET /api/v1/socios/:id
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `MemberRepository` (Métodos existentes `findAll()`, `findById(id)`, extender con `findAll(filters)`).
2. **Casos de Uso**: `GetMembersUseCase` (extender con filtros), `GetMemberByIdUseCase`.
3. **Adaptador de Entrada**: `MemberController` (Rutas GET existentes, extender con query params).

## Casos de Borde y Errores

| Escenario                                    | Resultado Esperado                                           | Código HTTP |
|----------------------------------------------|--------------------------------------------------------------|-------------|
| Búsqueda sin resultados                      | Lista vacía                                                  | 200 OK |
| ID de socio inválido (uuid mal formado)      | Mensaje: "ID de socio inválido"                              | 400 Bad Request |
| Socio inexistente                            | Mensaje: "El socio no existe"                                | 404 Not Found |

## Plan de Implementación

1. Extender `MemberRepository.findAll` para aceptar filtros opcionales (search, category, status).
2. Implementar búsqueda por texto parcial en name, dni y email usando Prisma `contains` (case insensitive).
3. Agregar query params a la ruta GET existente en `MemberController`.
4. En el frontend, agregar campo de búsqueda y filtros en la cabecera de la vista.
