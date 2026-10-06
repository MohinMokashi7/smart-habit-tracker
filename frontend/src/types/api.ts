/**
 * Types mirroring the real backend DTOs (user-service + habit-service).
 * Dates/times are serialised by Spring as ISO strings:
 *   LocalDate     -> "2026-10-04"
 *   LocalTime     -> "08:30:00"
 *   LocalDateTime -> "2026-10-04T08:30:12.123456"
 */

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

// ---------- user-service ----------

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  fullName: string;
  email: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  message: string;
}

// ---------- habit-service ----------

export interface ScheduleRequest {
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:mm" or "HH:mm:ss"
}

export interface CreateHabitRequest {
  name: string;
  description?: string;
  targetMinutes: number;
  schedules: ScheduleRequest[];
}

export interface HabitSchedule {
  id: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
}

export interface Habit {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  targetMinutes: number;
  active: boolean;
  createdAt: string;
  schedules: HabitSchedule[];
}

export interface TodayHabit {
  habitId: number;
  name: string;
  description: string | null;
  targetMinutes: number;
  startTime: string;
  completed: boolean;
}

export interface CompletionRequest {
  completed: boolean;
}

// ---------- analytics ----------

export interface TodaySummary {
  date: string;
  completed: number;
  total: number;
  completionRate: number; // 0..100
  productiveMinutes: number;
  /** The backend always returns null here; the list comes from /api/habits/today. */
  habits: TodayHabit[] | null;
}

export interface DailyStat {
  date: string;
  dayOfWeek: DayOfWeek;
  scheduled: number;
  completed: number;
  completionRate: number; // 0..100
  productiveMinutes: number;
}

export interface WeeklyAnalytics {
  weekStart: string;
  weekEnd: string;
  totalScheduled: number;
  totalCompleted: number;
  completionRate: number; // 0..100
  productiveMinutes: number;
  dailyStats: DailyStat[];
}

export interface HistoryDay {
  date: string;
  scheduled: boolean;
  completed: boolean;
  completedAt: string | null;
}

export interface HabitHistory {
  habitId: number;
  habitName: string;
  targetMinutes: number;
  currentStreak: number;
  longestStreak: number;
  /** Empty for the /streak endpoint, populated for /history. */
  history: HistoryDay[];
}
