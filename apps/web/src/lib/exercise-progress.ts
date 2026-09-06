import type { ExerciseProgressEntry } from "@fit-tracker/types";

/** El mejor peso registrado en cualquiera de las series de una sesión (null si no se anotó peso). */
export function bestWeightForEntry(entry: ExerciseProgressEntry): number | null {
  const weights = entry.sets.map((set) => set.weightKg).filter((weight): weight is number => weight != null);
  return weights.length > 0 ? Math.max(...weights) : null;
}
