'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export interface UseCollectionResult<T> {
  data: T[] | null;
  isLoading: boolean;
  error: Error | null;
}

export function useCollection<T>(
  table: string,
  filter?: { column: string; value: string | number | boolean } | null,
  options?: { order?: string; ascending?: boolean; limit?: number }
): UseCollectionResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    let query = supabase.from(table).select('*');

    if (filter) {
      query = query.eq(filter.column, filter.value);
    }

    if (options?.order) {
      query = query.order(options.order, { ascending: options.ascending ?? true });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    query.then(({ data: result, error: fetchError }) => {
      if (!mountedRef.current) return;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      if (fetchError) {
        if (fetchError.message.includes('permission')) {
          setError(fetchError);
          setData(null);
          setIsLoading(false);
        } else {
          setError(null);
          setIsLoading(false);
          retryTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) setRetryCount(c => c + 1);
          }, 1000);
        }
      } else {
        setData(result as T[]);
        setError(null);
        setIsLoading(false);
      }
    });

    return () => {
      mountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [table, filter, retryCount]);

  return { data, isLoading, error };
}