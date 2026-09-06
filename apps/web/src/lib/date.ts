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
