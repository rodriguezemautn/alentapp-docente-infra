import { useState, useEffect } from "react";

/**
 * Hook que debouncea un valor.
 * Útil para filtrar/mientras el usuario escribe sin disparar requests en cada tecla.
 *
 * @param value - El valor a debouncear
 * @param delay - Milisegundos de espera (default: 300)
 *
 * @example
 * const [search, setSearch] = useState("");
 * const debouncedSearch = useDebounce(search, 400);
 * // useEffect dispara solo cuando debouncedSearch cambia
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
