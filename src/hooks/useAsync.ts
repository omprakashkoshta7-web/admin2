import { useEffect, useState, useCallback } from 'react';

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export const useAsync = <T>(promiseFactory: () => Promise<T>, initialData: T | null = null, deps: unknown[] = []): AsyncState<T> => {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    promiseFactory()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'Failed to load');
          console.warn('useAsync error:', err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [promiseFactory]);

  useEffect(() => {
    const cleanup = execute();
    return cleanup;
  }, deps);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch };
};
