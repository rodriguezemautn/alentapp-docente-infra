import { createListCollection } from "../components/ui/select";

// ==========================================
// Member
// ==========================================
export const MEMBER_CATEGORIES = createListCollection({
  items: [
    { label: "Pleno", value: "Pleno" },
    { label: "Cadete", value: "Cadete" },
    { label: "Honorario", value: "Honorario" },
  ],
});

export const MEMBER_STATUSES = createListCollection({
  items: [
    { label: "Activo", value: "Activo" },
    { label: "Moroso", value: "Moroso" },
    { label: "Suspendido", value: "Suspendido" },
  ],
});

// ==========================================
// Payment
// ==========================================
export const PAYMENT_TYPES = createListCollection({
  items: [
    { label: "Cuota", value: "Cuota" },
    { label: "Mensualidad", value: "Mensualidad" },
    { label: "Inscripción", value: "Inscripcion" },
    { label: "Otro", value: "Otro" },
  ],
});

export const PAYMENT_TYPES_FILTER = createListCollection({
  items: [
    { label: "Todos los tipos", value: "" },
    { label: "Cuota", value: "Cuota" },
    { label: "Mensualidad", value: "Mensualidad" },
    { label: "Inscripción", value: "Inscripcion" },
    { label: "Otro", value: "Otro" },
  ],
});

export const PAYMENT_STATUSES_FILTER = createListCollection({
  items: [
    { label: "Todos los estados", value: "" },
    { label: "Completado", value: "Completed" },
    { label: "Cancelado", value: "Canceled" },
  ],
});
