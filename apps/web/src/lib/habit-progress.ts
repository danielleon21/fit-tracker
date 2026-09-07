import type { Habit } from "@fit-tracker/types";
import { isoDateDaysAgo } from "@/lib/date";

/** ¿Este hábito tiene un registro para esa fecha (YYYY-MM-DD)? */
export function isDoneOn(habit: Habit, isoDate: string): boolean {
  return habit.logs.some((log) => log.date.slice(0, 10) === isoDate);
}

/** Últimos 7 días (incluye hoy), del más antiguo al más reciente. */
export function last7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => isoDateDaysAgo(6 - i));
}
