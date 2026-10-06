import { useCallback, useState } from 'react';

import { deleteHabit } from '../api/habitApi';
import { getErrorMessage, toApiError } from '../utils/errors';

/**
 * Shared delete flow: ask for confirmation first (`request`), then `confirm` calls
 * DELETE /api/habits/{id}.
 */
export function useDeleteHabit(onDeleted: (id: number) => void) {
  const [target, setTarget] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback((id: number, name: string) => {
    setError(null);
    setTarget({ id, name });
  }, []);

  const cancel = useCallback(() => setTarget(null), []);

  const confirm = useCallback(async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await deleteHabit(target.id);
      onDeleted(target.id);
      setTarget(null);
    } catch (e) {
      const apiError = toApiError(e);
      setTarget(null);
      setError(
        apiError.kind === 'server'
          ? "The server couldn't delete this habit. Please try again later."
          : getErrorMessage(e, "Couldn't delete this habit."),
      );
    } finally {
      setDeleting(false);
    }
  }, [target, onDeleted]);

  const clearError = useCallback(() => setError(null), []);

  return { target, deleting, error, request, cancel, confirm, clearError };
}
