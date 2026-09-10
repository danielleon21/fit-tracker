/** Convierte un `Date` a "YYYY-MM-DD" usando sus campos LOCALES (no UTC). */
export function toIsoDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Fecha en formato YYYY-MM-DD, `offsetDays` días antes de hoy (0 = hoy),
 * según el calendario LOCAL del dispositivo (no UTC). `toISOString()`
 * primero convierte a UTC y luego formatea, así que cerca de la medianoche
 * — en cualquier huso horario detrás de UTC, es decir todo el continente
 * americano — devolvía el día SIGUIENTE en vez del día actual. Eso rompía
 * "rutina de hoy" y el registro de progreso/entrenamientos justo en horas
 * de la noche.
 */
export function isoDateDaysAgo(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  return toIsoDateLocal(date);
}

/** Fecha de "hoy" en formato YYYY-MM-DD según el calendario local del dispositivo. */
export function todayIsoLocal(): string {
  return isoDateDaysAgo(0);
}

/**
 * Convierte "YYYY-MM-DD" a un `Date` a medianoche LOCAL. `new Date("YYYY-MM-DD")`
 * lo interpreta como UTC, y en América eso cae en el día anterior.
 */
export function parseIsoDateLocal(iso: string): Date {
  const [year = 0, month = 1, day = 1] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** `true` si `value` es una fecha real en formato YYYY-MM-DD (rechaza "2026-02-30"). */
export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return toIsoDateLocal(parseIsoDateLocal(value)) === value;
}

/** Suma `days` días (negativo para restar) a una fecha YYYY-MM-DD. */
export function addDaysIso(iso: string, days: number): string {
  const date = parseIsoDateLocal(iso);
  date.setDate(date.getDate() + days);
  return toIsoDateLocal(date);
}

/** "miércoles 9 de septiembre" — con año solo si no es el actual. */
export function formatLongDate(iso: string): string {
  const date = parseIsoDateLocal(iso);
  const isCurrentYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(isCurrentYear ? {} : { year: "numeric" }),
  });
}

/** "Hoy", "Ayer" o la fecha larga para cualquier otro día. */
export function formatDayLabel(iso: string): string {
  const today = todayIsoLocal();
  if (iso === today) return "Hoy";
  if (iso === addDaysIso(today, -1)) return "Ayer";
  return formatLongDate(iso);
}
