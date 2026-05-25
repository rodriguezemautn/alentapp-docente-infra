# Frontend Quality Improvements

**Branch**: `feat/frontend-quality`

---

## Resumen de cambios

| Archivo | Acción | Propósito |
|---------|--------|-----------|
| `src/hooks/useApi.ts` | Creación | Hook genérico para ciclo de vida API (loading/error/data/refresh) |
| `src/hooks/useDialog.ts` | Creación | Hook para estado de diálogos modales (open/close/edit/create) |
| `src/hooks/useDebounce.ts` | Creación | Hook para debounce de búsquedas y filtros |
| `src/components/ErrorBoundary.tsx` | Creación | Error Boundary con fallback UI y botón de reintento |
| `src/constants.ts` | Creación | Opciones compartidas (categorías, tipos de pago, estados) |
| `src/Layout.tsx` | Modificación | Dark mode toggle + Toaster + nav links completos |
| `src/routes.ts` | Modificación | ErrorBoundary envolviendo cada ruta + ruta /disciplinas |
| `src/views/Sports.tsx` | Refactor | Uso de hooks useApi + useDialog, toasts en vez de alert(), actualización optimista |
| `src/views/Sports.test.tsx` | Sin cambios | 7/7 tests siguen pasando |

---

## Hooks creados

### `useApi<T>(fetcher)`

```typescript
// Antes: ~40 líneas de boilerplate por view
const [data, setData] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);
const fetchData = async () => { /* repetido en cada view */ };
useEffect(() => { fetchData(); }, []);

// Después: 1 línea
const { data, isLoading, error, refresh, setData } = useApi(() => sportsService.getAll());
```

### `useDialog<T>()`

```typescript
// Antes: ~15 líneas de estado repetido por view
const [isOpen, setIsOpen] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [editingItem, setEditingItem] = useState(null);
const openCreate = () => { setEditingItem(null); setIsOpen(true); };
const openEdit = (item) => { setEditingItem(item); setIsOpen(true); };

// Después: 1 línea
const dialog = useDialog<SportDetailDTO>();
// dialog.openCreate(), dialog.openEdit(item), dialog.close()
```

### `useDebounce<T>(value, delay)`

```typescript
const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 400); // 300ms default
```

---

## Mejoras implementadas en SportsView (caso demostrativo)

| Antes | Después |
|-------|---------|
| `alert()` para errores y confirmaciones | `toaster.create()` con Chakra Toast |
| Re-fetch completo tras cada operación | Actualización optimista local |
| 4 estados separados (sports, isLoading, error, dialog) | 2 hooks (`useApi`, `useDialog`) |
| ~90 líneas de lógica repetitiva | ~40 líneas con hooks |
| Sin tipos de retorno en operaciones | Tipado completo gracias a genéricos |

---

## Pendiente (próximos pasos)

Los hooks están disponibles para refactorizar el resto de las views siguiendo el mismo patrón:

- [ ] Members.tsx
- [ ] Payments.tsx
- [ ] MedicalCertificates.tsx
- [ ] Disciplines.tsx

Cada view se puede refactorizar de forma independiente sin riesgo de romper las demás.
