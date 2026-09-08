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

export function groupByMealType(entries: MealEntry[]): Record<MealType, MealEntry[]> {
  const grouped = { DESAYUNO: [], COMIDA: [], CENA: [], SNACK: [] } as Record<MealType, MealEntry[]>;
  for (const entry of entries) grouped[entry.mealType].push(entry);
  return grouped;
}

// USDA junta en un mismo buscador 4 tipos de datos muy distintos: Foundation
// y SR Legacy son alimentos genéricos analizados en laboratorio (los más
// verídicos para "cuánta proteína tiene una pechuga de pollo"), Survey (FNDDS)
// son promedios de encuestas de dieta, y Branded es un producto de marca
// específico (solo correcto si es exactamente esa marca).
const DATA_TYPE_LABELS: Record<string, string> = {
  Foundation: "Genérico (USDA)",
  "SR Legacy": "Genérico (USDA)",
  "Survey (FNDDS)": "Promedio de encuesta",
  Branded: "Producto de marca",
};

export function isGenericFood(food: Pick<FoodSearchResult, "dataType">): boolean {
  return food.dataType === "Foundation" || food.dataType === "SR Legacy";
}

export function foodSourceLabel(food: Pick<FoodSearchResult, "dataType" | "brandOwner">): string {
  if (food.dataType === "Branded" && food.brandOwner) return food.brandOwner;
  return DATA_TYPE_LABELS[food.dataType] ?? food.dataType;
}
