/**
 * Flags para pausar un módulo sin borrar su código. Cada una se lee de una
 * variable de entorno:
 *   - "true"      → módulo en pausa: se muestra "En construcción".
 *   - "false"     → módulo disponible.
 *   - sin definir → en pausa en producción (`next build` / `next start`, lo que
 *     corre en Vercel) y disponible en local (`next dev`), para poder seguir
 *     desarrollándolo sin que se vea en la app en vivo.
 *
 * Solo se leen en el servidor (desde un layout) y se resuelven al hacer el
 * build: en Vercel, cambiar la variable requiere redesplegar. Por eso también
 * están en el `env` del build en turbo.json; sin eso, Turborepo serviría el
 * build viejo de su caché aunque la variable cambie.
 */
function isPaused(value: string | undefined): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  return process.env.NODE_ENV === "production";
}

/** Nutrición, en pausa desde 2026-09-11 mientras se replantean sus cambios. */
export function isNutritionUnderConstruction(): boolean {
  return isPaused(process.env.NUTRITION_UNDER_CONSTRUCTION);
}
