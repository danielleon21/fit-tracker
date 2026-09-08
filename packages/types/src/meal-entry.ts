export type MealType = "DESAYUNO" | "COMIDA" | "CENA" | "SNACK";

export interface MealEntry {
  id: string;
  date: string;
  mealType: MealType;
  description: string;
  quantityG: number;
  caloriesKcal: number | null;
  proteinG: number | null;
  fatG: number | null;
  carbsG: number | null;
  fdcId: number | null;
}

export interface CreateMealEntryInput {
  date: string;
  mealType: MealType;
  description: string;
  quantityG: number;
  fdcId?: number | null;
  // Macros por 100g del alimento elegido (vienen del buscador de USDA) — el
  // backend los escala a `quantityG` y guarda ya el total resultante.
  caloriesPer100g?: number | null;
  proteinPer100g?: number | null;
  fatPer100g?: number | null;
  carbsPer100g?: number | null;
}
