import { useCallback, useRef, useState } from 'react';

import { getTodayHabits, setCompletion } from '../api/habitApi';
import { getHabitStreak, getTodaySummary } from '../api/historyApi';
import { TodayHabit, TodaySummary } from '../types/api';
import { getErrorMessage } from '../utils/errors';
import { useFocusData } from './useFocusData';

export interface DashboardData {
  habits: TodayHabit[];
  summary: TodaySummary;
  /** habitId -> current streak (from GET /api/habits/{id}/streak) */
  streaks: Record<number, number>;
}

async function loadDashboard(): Promise<DashboardData> {
  const [habits, summary] = await Promise.all([getTodayHabits(), getTodaySummary()]);
  const sorted = [...habits].sort((a, b) => a.startTime.localeCompare(b.startTime) || a.name.localeCompare(b.name));

  const results = await Promise.allSettled(sorted.map((h) => getHabitStreak(h.habitId)));
  const streaks: Record<number, number> = {};
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') streaks[sorted[i].habitId] = result.value.currentStreak;
  });

  return { habits: sorted, summary, streaks };
}

/** Optimistic local update so the UI responds instantly; the backend value replaces it right after. */
function withCompletion(data: DashboardData, habitId: number, completed: boolean): DashboardData {
  const habits = data.habits.map((h) => (h.habitId === habitId ? { ...h, completed } : h));
  const done = habits.filter((h) => h.completed);
  return {
    ...data,
    habits,
    summary: {
      ...data.summary,
      total: habits.length,
      completed: done.length,
      completionRate: habits.length === 0 ? 0 : (done.length / habits.length) * 100,
      productiveMinutes: done.reduce((sum, h) => sum + h.targetMinutes, 0),
    },
  };
}

export function useDashboard() {
  const state = useFocusData(loadDashboard);
  const { data, setData, reload } = state;

  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const pending = useRef<Set<number>>(new Set());
  const dataRef = useRef(data);
  dataRef.current = data;

  const toggle = useCallback(
    async (habitId: number) => {
      const habit = dataRef.current?.habits.find((h) => h.habitId === habitId);
      if (!habit || pending.current.has(habitId)) return;

      const next = !habit.completed;
      pending.current.add(habitId);
      setPendingIds(Array.from(pending.current));
      setActionError(null);
      setData((prev) => (prev ? withCompletion(prev, habitId, next) : prev));

      try {
        await setCompletion(habitId, next);
        await reload('silent');
      } catch (e) {
        setData((prev) => (prev ? withCompletion(prev, habitId, !next) : prev));
        setActionError(getErrorMessage(e, "Couldn't update this habit. Please try again."));
      } finally {
        pending.current.delete(habitId);
        setPendingIds(Array.from(pending.current));
      }
    },
    [reload, setData],
  );

  const dismissActionError = useCallback(() => setActionError(null), []);

  return { ...state, toggle, pendingIds, actionError, dismissActionError };
}
