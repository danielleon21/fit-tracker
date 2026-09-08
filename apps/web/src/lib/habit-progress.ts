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

/**
 * Racha actual: días consecutivos con registro, contando hacia atrás desde hoy.
 * Si hoy aún no está marcado, no se considera rota todavía (el día no ha
 * terminado) — se cuenta desde ayer. Si tampoco ayer está marcado, la racha es 0.
 */
export function currentStreak(habit: Habit): number {
  const doneDates = new Set(habit.logs.map((log) => log.date.slice(0, 10)));

  let offset = doneDates.has(isoDateDaysAgo(0)) ? 0 : 1;
  let streak = 0;
  while (doneDates.has(isoDateDaysAgo(offset))) {
    streak++;
    offset++;
  }
  return streak;
}
