import { useFocusEffect } from '@react-navigation/native';
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

import { ApiError, toApiError } from '../utils/errors';

export type LoadMode = 'blocking' | 'refresh' | 'silent';

export interface FocusData<T> {
  data: T | null;
  setData: Dispatch<SetStateAction<T | null>>;
  /** true only while there is nothing to show yet */
  loading: boolean;
  /** true during pull-to-refresh */
  refreshing: boolean;
  error: ApiError | null;
  reload: (mode?: LoadMode) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Loads data whenever the screen gains focus. Existing data stays on screen while a
 * silent re-fetch runs, which is how lists stay in sync after create/edit/delete/complete
 * actions performed on other screens.
 */
export function useFocusData<T>(loader: () => Promise<T>): FocusData<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const hasData = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const reload = useCallback(async (mode: LoadMode = 'silent') => {
    if (mode === 'blocking') setLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    try {
      const result = await loaderRef.current();
      if (!alive.current) return;
      hasData.current = true;
      setData(result);
      setError(null);
    } catch (e) {
      if (!alive.current) return;
      const apiError = toApiError(e);
      // Session problems are handled globally (redirect to login).
      if (apiError.kind !== 'unauthorized') setError(apiError);
    } finally {
      if (alive.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload(hasData.current ? 'silent' : 'blocking');
    }, [reload]),
  );

  const refresh = useCallback(() => reload('refresh'), [reload]);

  return { data, setData, loading, refreshing, error, reload, refresh };
}
