import { useState, useEffect, useCallback } from "react";
import { getErrorMessage } from "../lib/error-utils";

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refresh: () => Promise<void>;
  setData: (data: T) => void;
}

/**
 * Hook genérico para manejar el ciclo de vida de llamadas API.
 *
 * Centraliza los estados isLoading / error / data y el refresh.
 * Cada view puede usar `setData` para actualizaciones optimistas.
 *
 * @example
 * const { data: sports, isLoading, error, refresh } = useApi(() => sportsService.getAll());
 */
export function useApi<T>(fetcher: () => Promise<T>): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, isLoading: false, error: null });
    } catch (err: unknown) {
      setState({ data: null, isLoading: false, error: getErrorMessage(err) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const setData = useCallback((data: T) => {
    setState({ data, isLoading: false, error: null });
  }, []);

  return { ...state, refresh, setData };
}
