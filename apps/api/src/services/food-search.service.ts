import type { FoodSearchResult } from "@fit-tracker/types";
import { usdaClient, type UsdaFoodNutrient } from "@/lib/usda.client";

// USDA no siempre usa el mismo nombre para energía: los alimentos "Foundation"
// la reportan como "Energy (Atwater ... Factors)" en vez de simplemente "Energy".
const ENERGY_NUTRIENT_NAMES = ["Energy", "Energy (Atwater General Factors)", "Energy (Atwater Specific Factors)"];

// USDA mezcla 4 tipos de datos muy distintos en un mismo buscador: Foundation
// y SR Legacy son alimentos genéricos analizados en laboratorio (los más
// verídicos para "cuánta proteína tiene una pechuga de pollo"), Survey (FNDDS)
// son promedios de encuestas de dieta, y Branded es un producto de marca
// específico (solo correcto si es exactamente esa marca). Se ordenan del más
// al menos genérico/confiable, preservando el orden de relevancia de USDA
// dentro de cada grupo (Array#sort es estable).
const DATA_TYPE_PRIORITY: Record<string, number> = {
  Foundation: 0,
  "SR Legacy": 1,
  "Survey (FNDDS)": 2,
  Branded: 3,
};

function pickNutrient(nutrients: UsdaFoodNutrient[], names: string[]): number | null {
  for (const name of names) {
    const match = nutrients.find((nutrient) => nutrient.nutrientName === name);
    if (match) return match.value;
  }
  return null;
}

export const foodSearchService = {
  async search(query: string): Promise<FoodSearchResult[]> {
    const { foods } = await usdaClient.searchFoods(query);
    return foods
      .map((food) => ({
        fdcId: food.fdcId,
        description: food.description,
        dataType: food.dataType,
        brandOwner: food.brandOwner ?? null,
        caloriesKcal: pickNutrient(food.foodNutrients, ENERGY_NUTRIENT_NAMES),
        proteinG: pickNutrient(food.foodNutrients, ["Protein"]),
        fatG: pickNutrient(food.foodNutrients, ["Total lipid (fat)"]),
        carbsG: pickNutrient(food.foodNutrients, ["Carbohydrate, by difference"]),
      }))
      .sort((a, b) => (DATA_TYPE_PRIORITY[a.dataType] ?? 9) - (DATA_TYPE_PRIORITY[b.dataType] ?? 9));
  },
};
