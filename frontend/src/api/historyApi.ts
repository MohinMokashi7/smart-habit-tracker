import { HabitHistory, TodaySummary, WeeklyAnalytics } from '../types/api';
import { http } from './client';

/** GET /api/analytics/today -> counts for today (its `habits` field is always null) */
export async function getTodaySummary(): Promise<TodaySummary> {
  const { data } = await http.get<TodaySummary>('/api/analytics/today');
  return data;
}

/** GET /api/analytics/weekly -> Monday..Sunday of the current week */
export async function getWeeklyAnalytics(): Promise<WeeklyAnalytics> {
  const { data } = await http.get<WeeklyAnalytics>('/api/analytics/weekly');
  return data;
}

/** GET /api/habits/{id}/history -> every day since the habit was created + streaks */
export async function getHabitHistory(habitId: number): Promise<HabitHistory> {
  const { data } = await http.get<HabitHistory>(`/api/habits/${habitId}/history`);
  return data;
}

/** GET /api/habits/{id}/streak -> same shape as history but with an empty `history` list */
export async function getHabitStreak(habitId: number): Promise<HabitHistory> {
  const { data } = await http.get<HabitHistory>(`/api/habits/${habitId}/streak`);
  return data;
}
