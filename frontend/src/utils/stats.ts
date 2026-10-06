import { HabitHistory, HistoryDay } from '../types/api';
import { addDays } from './dates';

export type RangeKey = '7d' | '30d' | '90d' | 'all';

export const RANGE_OPTIONS: Array<{ key: RangeKey; label: string; days: number | null }> = [
  { key: '7d', label: '7 Days', days: 7 },
  { key: '30d', label: '30 Days', days: 30 },
  { key: '90d', label: '3 Months', days: 90 },
  { key: 'all', label: 'All', days: null },
];

export interface RangeStats {
  scheduled: number;
  completed: number;
  /** 0..100, or null when nothing was scheduled in the range */
  rate: number | null;
}

/** The most recent date present in the histories — the server's idea of "today". */
export function referenceDate(histories: HabitHistory[]): string | null {
  let latest: string | null = null;
  for (const h of histories) {
    for (const day of h.history) {
      if (latest === null || day.date > latest) latest = day.date;
    }
  }
  return latest;
}

function inRange(day: HistoryDay, cutoff: string | null): boolean {
  return cutoff === null || day.date >= cutoff;
}

export function statsForDays(days: HistoryDay[], rangeDays: number | null, reference: string | null): RangeStats {
  const cutoff = rangeDays !== null && reference ? addDays(reference, -(rangeDays - 1)) : null;
  let scheduled = 0;
  let completed = 0;
  for (const day of days) {
    if (!day.scheduled || !inRange(day, cutoff)) continue;
    scheduled += 1;
    if (day.completed) completed += 1;
  }
  return { scheduled, completed, rate: scheduled === 0 ? null : (completed / scheduled) * 100 };
}

export function combineStats(histories: HabitHistory[], rangeDays: number | null): RangeStats {
  const reference = referenceDate(histories);
  let scheduled = 0;
  let completed = 0;
  for (const h of histories) {
    const s = statsForDays(h.history, rangeDays, reference);
    scheduled += s.scheduled;
    completed += s.completed;
  }
  return { scheduled, completed, rate: scheduled === 0 ? null : (completed / scheduled) * 100 };
}
