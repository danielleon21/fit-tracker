/**
 * Fecha de "hoy" en formato YYYY-MM-DD según el calendario LOCAL del
 * dispositivo (no UTC). `Date.prototype.toISOString()` primero convierte a
 * UTC y luego formatea, así que cerca de la medianoche — en cualquier huso
 * horario detrás de UTC, es decir todo el continente americano — devolvía
 * el día SIGUIENTE en vez del día actual. Eso rompía "rutina de hoy" y el
 * registro de progreso/entrenamientos justo en horas de la noche.
 */
export function todayIsoLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
