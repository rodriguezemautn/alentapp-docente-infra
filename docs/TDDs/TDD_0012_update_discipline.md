---
id: 0012
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Actualización de Disciplinas
---

# TDD-0012: Actualización de Disciplinas

## Contexto de Negocio (PRD)

### Objetivo

Permitir modificar los datos de una disciplina existente, incluyendo su nombre, fechas, horario o profesor. Si se modifican las fechas, se debe re-validar que `endDate` siga siendo posterior a `startDate`.

### User Persona

- **Nombre**: Carla (Coordinadora de actividades).
- **Necesidad**: Corregir horarios, cambiar profesores o extender la fecha de fin de una disciplina cuando sea necesario.

### Criterios de Aceptación

- El sistema debe permitir actualizar uno o varios campos de una disciplina.
- El sistema debe re-validar las fechas si `startDate` o `endDate` son modificados.
- El sistema debe validar que la disciplina exista.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

- Endpoint: `PUT /api/v1/disciplinas/:id`

```ts
export interface UpdateDisciplineRequest {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    schedule?: string;
    professor?: string;
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `DisciplineRepository` (Método `update(id, data)`).
2. **Servicio de Dominio**: `DisciplineValidator` (Re-valida `endDate > startDate` si alguna fecha cambia).
3. **Caso de Uso**: `UpdateDisciplineUseCase` (Orquesta la validación y llama al repositorio).
4. **Adaptador de Salida**: `PostgresDisciplineRepository` (Actualización con Prisma).
5. **Adaptador de Entrada**: `DisciplineController` (Ruta HTTP PUT).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Disciplina inexistente                         | Mensaje: "La disciplina no existe"                           | 404 Not Found |
| Actualizar endDate a una fecha inválida        | Mensaje: "La fecha de fin debe ser posterior a la fecha de inicio" | 400 Bad Request |
| Actualizar startDate sin cambiar endDate (y queda inválido) | Mensaje: "La fecha de fin debe ser posterior a la fecha de inicio" | 400 Bad Request |
| Error de conexión a DB                         | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Ampliar `DisciplineRepository` con el método `update`.
2. Implementar `UpdateDisciplineUseCase` con re-validación de fechas.
3. Agregar ruta `PUT /api/v1/disciplinas/:id` en `DisciplineController`.
4. Registrar en `app.ts`.
5. Consumir desde el frontend.
