import type { FoodSearchResult } from "@fit-tracker/types";
import { usdaClient, type UsdaFoodNutrient } from "@/lib/usda.client";

// USDA no siempre usa el mismo nombre para energía: los alimentos "Foundation"
// la reportan como "Energy (Atwater ... Factors)" en vez de simplemente "Energy".
const ENERGY_NUTRIENT_NAMES = ["Energy", "Energy (Atwater General Factors)", "Energy (Atwater Specific Factors)"];

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
    return foods.map((food) => ({
      fdcId: food.fdcId,
      description: food.description,
      dataType: food.dataType,
      caloriesKcal: pickNutrient(food.foodNutrients, ENERGY_NUTRIENT_NAMES),
      proteinG: pickNutrient(food.foodNutrients, ["Protein"]),
      fatG: pickNutrient(food.foodNutrients, ["Total lipid (fat)"]),
      carbsG: pickNutrient(food.foodNutrients, ["Carbohydrate, by difference"]),
    }));
  },
};
