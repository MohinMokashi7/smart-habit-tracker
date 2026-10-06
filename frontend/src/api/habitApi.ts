import { CompletionRequest, CreateHabitRequest, Habit, TodayHabit } from '../types/api';
import { http } from './client';

/** GET /api/habits -> Habit[] (all of the user's habits) */
export async function getHabits(): Promise<Habit[]> {
  const { data } = await http.get<Habit[]>('/api/habits');
  return data;
}

/** GET /api/habits/{id} -> Habit */
export async function getHabit(id: number): Promise<Habit> {
  const { data } = await http.get<Habit>(`/api/habits/${id}`);
  return data;
}

/** POST /api/habits -> 201 Habit | 409 {message} when same name + same weekdays already exist */
export async function createHabit(request: CreateHabitRequest): Promise<Habit> {
  const { data } = await http.post<Habit>('/api/habits', request);
  return data;
}

/** PUT /api/habits/{id} -> Habit (same body as create) */
export async function updateHabit(id: number, request: CreateHabitRequest): Promise<Habit> {
  const { data } = await http.put<Habit>(`/api/habits/${id}`, request);
  return data;
}

/** DELETE /api/habits/{id} -> 204 */
export async function deleteHabit(id: number): Promise<void> {
  await http.delete(`/api/habits/${id}`);
}

/** GET /api/habits/today -> habits scheduled for today with their completion state */
export async function getTodayHabits(): Promise<TodayHabit[]> {
  const { data } = await http.get<TodayHabit[]>('/api/habits/today');
  return data;
}

/** PATCH /api/habits/{id}/completion  { completed } -> 204 (today only) */
export async function setCompletion(habitId: number, completed: boolean): Promise<void> {
  const body: CompletionRequest = { completed };
  await http.patch(`/api/habits/${habitId}/completion`, body);
}
