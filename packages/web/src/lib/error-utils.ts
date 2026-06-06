/**
 * Extrae un mensaje de error de cualquier tipo de valor capturado en catch.
 * Útil para evitar el uso de `err: any` en bloques catch.
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as Record<string, unknown>).message);
  }
  return 'Error desconocido';
}
