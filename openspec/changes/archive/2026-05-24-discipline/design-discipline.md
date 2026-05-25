# Diseño: Entidad Discipline (Frontend)

## Enfoque Técnico

El backend ya está implementado (Prisma → DTOs → Repository → Validator → 5 casos de uso → Controller → cableado en app.ts). El alcance del diseño es **solo frontend**: servicio → vista + pruebas → registro de rutas. Cada archivo sigue el patrón exacto establecido por `Sports.tsx` y `sports.ts`.

---

## Decisiones de Arquitectura

### Decisión: Ruta como `/disciplinas` (Español)

| Opción | Compensación | Decisión |
|--------|--------------|----------|
| `/disciplines` (Inglés) | Consistente con `/sports`, `/members` | ❌ Rechazado — Payments ya usa `/pagos`, MedicalCertificates usa `/certificados-medicos`. El precedente de rutas en español prevalece para nombres de entidades visibles al usuario. |
| `/disciplinas` (Español) | Rompe con `/sports`/`/members` pero es consistente con `/pagos` | ✅ Seleccionado |

**Fundamento**: Las rutas existentes `/pagos` y `/certificados-medicos` establecen la convención: las rutas están en español cuando el nombre de la entidad es visible para el usuario. Etiqueta de navegación: "Disciplinas".

### Decisión: Método del servicio `getAll` acepta filtro `sportId` opcional

| Opción | Compensación | Decisión |
|--------|--------------|----------|
| Dos métodos: `getAll()` y `getBySportId(id)` | API más clara, pero se desvía del patrón `sportsService.getAll()` | ❌ Rechazado — mantiene la divergencia al mínimo |
| Un solo `getAll(sportId?: string)` | Coincide con la estructura de firma de `sportsService.getAll()`. Una sola ruta de código. | ✅ Seleccionado |

**Fundamento**: El contrato de API usa un query param `?sportId=xxx`, por lo que el servicio simplemente lo agrega cuando se proporciona. Un único método flexible es más simple y sigue el mismo patrón `fetch`/`response`/`data` que `sportsService`.

### Decisión: El desplegable de deportes obtiene los deportes al montar, almacenados en estado local

**Elección**: `useEffect` llama a `sportsService.getAll()` al montar, almacena en `sports: SportDTO[]`. Usa `SelectRoot` de Chakra + `createListCollection` para el desplegable (mismo patrón que el selector de miembros de Payments).

**Fundamento**: El formulario necesita un selector de deportes y la vista muestra `sportName` en la tabla. Obtener todos los deportes una vez al montar es económico (es un conjunto de datos pequeño) y evita prop drilling o context.

**Alternativas consideradas**: Pasar deportes como prop desde un padre — sobreingeniería para una sola vista.

---

## Flujo de Datos

```
Montar:
  useEffect → sportsService.getAll() → sports[] para el desplegable + mostrar sportName en la tabla
  useEffect → disciplinesService.getAll() → disciplines[] para la tabla

Crear:
  Envío del formulario → disciplinesService.create(payload: CreateDisciplineRequest) → refrescar lista
  Payload: { sportId, name, description?, startDate, endDate, schedule?, professor? }

Actualizar:
  Abrir modal de edición → precargar formulario desde DisciplineDetailDTO
  Envío del formulario → disciplinesService.update(id, payload: UpdateDisciplineRequest) → refrescar lista

Eliminar:
  Click en eliminar → window.confirm → disciplinesService.delete(id) → refrescar lista
```

---

## Cambios de Archivos

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `packages/web/src/services/disciplines.ts` | Crear | Servicio con `getAll(sportId?)`, `getById`, `create`, `update`, `delete` — refleja `sports.ts` |
| `packages/web/src/views/Disciplines.tsx` | Crear | Vista CRUD completa con desplegable de deportes, inputs de fecha, tabla — refleja `Sports.tsx` |
| `packages/web/src/views/Disciplines.test.tsx` | Crear | 7 pruebas siguiendo exactamente el patrón de `Sports.test.tsx` |
| `packages/web/src/routes.ts` | Modificar | Agregar `import { DisciplinesView }` y ruta `{ path: "/disciplinas", Component: DisciplinesView }` |
| `packages/web/src/Layout.tsx` | Modificar | Agregar nav `<RouterLink to="/disciplinas">` con etiqueta "Disciplinas" |

---

## Interfaces / Contratos

### Servicio (`services/disciplines.ts`)

```typescript
import type { DisciplineDTO, DisciplineDetailDTO, CreateDisciplineRequest, UpdateDisciplineRequest } from '@alentapp/shared';
import type { SportDTO } from '@alentapp/shared';

export const disciplinesService = {
  getAll(sportId?: string): Promise<DisciplineDetailDTO[]>,
  getById(id: string): Promise<DisciplineDetailDTO>,
  create(data: CreateDisciplineRequest): Promise<DisciplineDetailDTO>,
  update(id: string, data: UpdateDisciplineRequest): Promise<DisciplineDetailDTO>,
  delete(id: string): Promise<void>,
};
```

### Estado de la Vista (`views/Disciplines.tsx`)

```typescript
// Lista de disciplinas + búsqueda de deportes
const [disciplines, setDisciplines] = useState<DisciplineDetailDTO[]>([]);
const [sports, setSports] = useState<SportDTO[]>([]); // para desplegable + mostrar sportName

// Fetch + error
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Diálogo
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [editingDisciplineId, setEditingDisciplineId] = useState<string | null>(null);

// Formulario coincide con CreateDisciplineRequest
const [formData, setFormData] = useState<CreateDisciplineRequest>({
  sportId: "",
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  schedule: "",
  professor: "",
});
```

### Campos del Formulario

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| sportId | Select (desplegable) | Sí | Obtenido de `sportsService.getAll()`. Primera opción como valor predeterminado al crear. Deshabilitado al editar. |
| name | Input | Sí | Siempre editable (a diferencia de Sport — el nombre SÍ puede cambiar aquí) |
| description | Textarea | No | Máx. 500 caracteres |
| startDate | Input type="date" | Sí | |
| endDate | Input type="date" | Sí | |
| schedule | Input | No | Texto libre (ej. "Lunes y Miércoles 18-20") |
| professor | Input | No | Texto libre |

### Columnas de la Tabla

| Columna | Fuente | Visualización |
|---------|--------|---------------|
| Deporte | `sportName` del DTO, fallback a búsqueda en `sports[]` local | Texto |
| Nombre | `name` | Texto, negrita |
| Inicio | `startDate` | Formateado como `dd/mm/aaaa` |
| Fin | `endDate` | Formateado como `dd/mm/aaaa` |
| Horario | `schedule` | Texto o `-` |
| Profesor | `professor` | Texto o `-` |
| Acciones | — | Iconos de Editar + Eliminar |

### Validación Frontend

| Campo | Regla | Mensaje de Error |
|-------|-------|-------------------|
| sportId | Debe estar seleccionado | "El deporte es requerido" |
| name | Requerido, máx. 100 caracteres | "El nombre es requerido" / "El nombre no puede superar los 100 caracteres" |
| startDate | Requerido, debe ser anterior a endDate | "La fecha de inicio es requerida" / "La fecha de inicio debe ser anterior a la fecha de fin" |
| endDate | Requerido, debe ser posterior a startDate | "La fecha de fin es requerida" / "La fecha de fin debe ser posterior a la fecha de inicio" |
| description | Opcional, máx. 500 caracteres | Contador de caracteres |
| schedule | Opcional, máx. 200 caracteres | — |
| professor | Opcional, máx. 200 caracteres | — |

---

## Estrategia de Pruebas

| Capa | Qué Probar | Enfoque |
|------|------------|---------|
| Servicio | N/A (envoltorio fetch fino) | Confiable por integración — sin pruebas unitarias en el servicio |
| Vista | 7 pruebas siguiendo el patrón de `Sports.test.tsx` | Mockear `disciplinesService` + `sportsService`. Usar `@testing-library/react` + `user-event` |

### Plan de Pruebas de la Vista (sigue Sports.test.tsx)

| # | Prueba | Comportamiento del Mock | Esperado |
|---|--------|-------------------------|----------|
| 1 | Muestra carga y luego tabla vacía | `getAll` devuelve `[]` | Muestra "Cargando disciplinas..." luego "No se encontraron disciplinas." |
| 2 | Renderiza lista de disciplinas | `getAll` devuelve 2 disciplinas, `getAll` (deportes) devuelve 2 deportes | Muestra ambos nombres, nombres de deportes, fechas en la tabla |
| 3 | Muestra error al fallar | `getAll` rechaza | Mensaje de error en cuadro rojo |
| 4 | Crea una nueva disciplina mediante formulario | `create` resuelve, `getAll` (deportes) devuelve deportes | Llama a `create` con datos del formulario incluyendo sportId |
| 5 | Edita una disciplina existente | `update` resuelve | Llama a `update` con los campos cambiados |
| 6 | Elimina con confirmación | `delete` resuelve, `confirm` devuelve true | Llama a `delete` con el id |
| 7 | Valida rango de fechas en el formulario | — | Muestra error cuando endDate <= startDate |

---

## Migración / Despliegue

No requiere migración. Cambio solo de frontend. La API del backend ya está desplegada y cableada. La ruta `/disciplinas` es nueva — no afecta rutas existentes.

---

## Preguntas Abiertas

Ninguna. Todas las decisiones están cubiertas por patrones existentes.
