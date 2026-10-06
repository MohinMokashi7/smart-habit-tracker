import { DayOfWeek, HabitSchedule } from '../types/api';

export const DAYS: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export const DAY_SHORT: Record<DayOfWeek, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
};

/** "08:30:00" -> "8:30 AM" */
export function formatTime(time: string): string {
  const [hh, mm] = time.split(':');
  const hour = Number(hh);
  const minute = Number(mm);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return time;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

/** "08:30:00" -> "08:30" */
export function trimTime(time: string): string {
  return time.slice(0, 5);
}

/** "08:30" -> "08:30:00" (what we send to the backend) */
export function toApiTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function formatSchedule(schedules: HabitSchedule[]): string {
  const days = new Set(schedules.map((s) => s.dayOfWeek));
  if (days.size === 7) return 'Every day';
  if (days.size === 5 && !days.has('SATURDAY') && !days.has('SUNDAY')) return 'Weekdays';
  if (days.size === 2 && days.has('SATURDAY') && days.has('SUNDAY')) return 'Weekends';
  return DAYS.filter((d) => days.has(d))
    .map((d) => DAY_SHORT[d])
    .join(' · ');
}

export function earliestTime(schedules: HabitSchedule[]): string | null {
  if (schedules.length === 0) return null;
  return schedules.map((s) => s.startTime).sort()[0];
}

export function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email;
  const cleaned = local.replace(/[._-]+/g, ' ').trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function percent(value: number): string {
  return `${Math.round(value)}%`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
