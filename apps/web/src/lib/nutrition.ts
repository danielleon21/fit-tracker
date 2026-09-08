import type { MealEntry, MealType } from "@fit-tracker/types";

export const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "DESAYUNO", label: "Desayuno" },
  { value: "COMIDA", label: "Comida" },
  { value: "CENA", label: "Cena" },
  { value: "SNACK", label: "Snack" },
];

export interface MacroTotals {
  caloriesKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}

/** Escala un macro "por 100g" a una cantidad real, redondeado a 1 decimal. */
export function scaleMacro(per100g: number | null, quantityG: number): number | null {
  if (per100g === null || Number.isNaN(quantityG)) return null;
  return Math.round(per100g * (quantityG / 100) * 10) / 10;
}

export function sumMacros(entries: MealEntry[]): MacroTotals {
  return entries.reduce<MacroTotals>(
    (totals, entry) => ({
      caloriesKcal: totals.caloriesKcal + (entry.caloriesKcal ?? 0),
      proteinG: totals.proteinG + (entry.proteinG ?? 0),
      fatG: totals.fatG + (entry.fatG ?? 0),
      carbsG: totals.carbsG + (entry.carbsG ?? 0),
    }),
    { caloriesKcal: 0, proteinG: 0, fatG: 0, carbsG: 0 },
  );
}

export function groupByMealType(entries: MealEntry[]): Record<MealType, MealEntry[]> {
  const grouped = { DESAYUNO: [], COMIDA: [], CENA: [], SNACK: [] } as Record<MealType, MealEntry[]>;
  for (const entry of entries) grouped[entry.mealType].push(entry);
  return grouped;
}
