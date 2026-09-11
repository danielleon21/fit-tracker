import type { FoodSearchResult, MealEntry, MealType } from "@fit-tracker/types";

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

/**
 * "2 × grande (100g)" si se agregó por porción, o "100g" si fue directo en
 * gramos. Con "×" y no con plural porque las etiquetas son frases
 * ("rebanada regular") y pluralizarlas agregando una "s" saldría mal.
 */
export function formatQuantity(entry: Pick<MealEntry, "quantityG" | "unitCount" | "unitLabel">): string {
  if (entry.unitCount === null || !entry.unitLabel) return `${entry.quantityG}g`;
  return `${entry.unitCount} × ${entry.unitLabel} (${entry.quantityG}g)`;
}

/** ¿Se puede registrar por pieza sin escribir el peso? */
export function hasPortions(food: Pick<FoodSearchResult, "portions" | "lastUsedPortion">): boolean {
  return food.portions.length > 0 || food.lastUsedPortion !== null;
}

export function groupByMealType(entries: MealEntry[]): Record<MealType, MealEntry[]> {
  const grouped = { DESAYUNO: [], COMIDA: [], CENA: [], SNACK: [] } as Record<MealType, MealEntry[]>;
  for (const entry of entries) grouped[entry.mealType].push(entry);
  return grouped;
}

/**
 * Kcal por gramo de cada macro (factores de Atwater). El reparto de energía se
 * calcula desde los gramos y no desde `caloriesKcal` porque ese total también
 * incluye fibra y alcohol: los tres macros nunca sumarían exactamente 100%.
 */
const KCAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;

export interface MacroSplit {
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}

/**
 * Porcentaje de las calorías del día que aporta cada macro. `null` cuando aún
 * no hay macros con los que repartir (día vacío, o alimentos sin datos de USDA).
 */
export function macroSplit(totals: MacroTotals): MacroSplit | null {
  const proteinKcal = totals.proteinG * KCAL_PER_GRAM.protein;
  const carbsKcal = totals.carbsG * KCAL_PER_GRAM.carbs;
  const fatKcal = totals.fatG * KCAL_PER_GRAM.fat;
  const totalKcal = proteinKcal + carbsKcal + fatKcal;
  if (totalKcal <= 0) return null;

  return {
    proteinPct: (proteinKcal / totalKcal) * 100,
    carbsPct: (carbsKcal / totalKcal) * 100,
    fatPct: (fatKcal / totalKcal) * 100,
  };
}
