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

// servingSizeUnit no siempre es una unidad de masa (ej. "MLT" = mililitros
// para líquidos) — solo tiene sentido como "peso de una pieza" cuando sí lo
// es. Factor para convertir esa unidad a gramos.
const MASS_UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  GRM: 1,
  MG: 0.001,
  KG: 1000,
};

function pieceWeightInGrams(food: { servingSize?: number; servingSizeUnit?: string }): number | null {
  if (food.servingSize === undefined || !food.servingSizeUnit) return null;
  const factor = MASS_UNIT_TO_GRAMS[food.servingSizeUnit];
  return factor === undefined ? null : Math.round(food.servingSize * factor * 100) / 100;
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
        pieceWeightG: pieceWeightInGrams(food),
        pieceWeightLabel: food.householdServingFullText ?? null,
        caloriesKcal: pickNutrient(food.foodNutrients, ENERGY_NUTRIENT_NAMES),
        proteinG: pickNutrient(food.foodNutrients, ["Protein"]),
        fatG: pickNutrient(food.foodNutrients, ["Total lipid (fat)"]),
        carbsG: pickNutrient(food.foodNutrients, ["Carbohydrate, by difference"]),
      }))
      .sort((a, b) => (DATA_TYPE_PRIORITY[a.dataType] ?? 9) - (DATA_TYPE_PRIORITY[b.dataType] ?? 9));
  },
};
