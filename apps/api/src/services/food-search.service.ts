import type { FoodPortion, FoodSearchResult } from "@fit-tracker/types";
import { usdaClient, type UsdaFoodNutrient } from "@/lib/usda.client";
import { brandedPortion, toFoodPortions } from "@/lib/usda-portions";
import { mealEntryRepository } from "@/repositories/meal-entry.repository";

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

// `unit` es necesario para la energía: los SR Legacy la reportan dos veces con
// el mismo nombre "Energy", una en kJ y otra en kcal, sin orden fijo. Sin
// filtrar por unidad, a veces se tomaban los kJ como si fueran kcal (~4.2x).
function pickNutrient(nutrients: UsdaFoodNutrient[], names: string[], unit?: string): number | null {
  for (const name of names) {
    const match = nutrients.find(
      (nutrient) => nutrient.nutrientName === name && (!unit || nutrient.unitName.toUpperCase() === unit),
    );
    if (match) return match.value;
  }
  return null;
}

// La búsqueda de USDA no trae las medidas caseras de los genéricos: se piden
// aparte, todas en una sola llamada. Si esa llamada falla, la búsqueda sigue
// funcionando — solo que sin porciones, y se registra por gramos.
async function portionsByFdcId(fdcIds: number[]): Promise<Map<number, FoodPortion[]>> {
  if (fdcIds.length === 0) return new Map();

  try {
    const details = await usdaClient.getFoods(fdcIds);
    return new Map(details.map((detail) => [detail.fdcId, toFoodPortions(detail.foodPortions)]));
  } catch (error) {
    console.error("No se pudieron cargar las porciones de USDA:", error);
    return new Map();
  }
}

export const foodSearchService = {
  async search(userId: string, query: string): Promise<FoodSearchResult[]> {
    const { foods } = await usdaClient.searchFoods(query);

    // Los de marca ya traen su porción (la de la etiqueta) en la búsqueda.
    const genericIds = foods.filter((food) => food.dataType !== "Branded").map((food) => food.fdcId);
    const [portions, lastUsed] = await Promise.all([
      portionsByFdcId(genericIds),
      mealEntryRepository.findLatestPortionsByFdcIds(
        userId,
        foods.map((food) => food.fdcId),
      ),
    ]);

    return foods
      .map((food) => {
        const labelPortion = food.dataType === "Branded" ? brandedPortion(food) : null;
        return {
          fdcId: food.fdcId,
          description: food.description,
          dataType: food.dataType,
          brandOwner: food.brandOwner ?? null,
          portions: labelPortion ? [labelPortion] : (portions.get(food.fdcId) ?? []),
          lastUsedPortion: lastUsed.get(food.fdcId) ?? null,
          caloriesKcal: pickNutrient(food.foodNutrients, ENERGY_NUTRIENT_NAMES, "KCAL"),
          proteinG: pickNutrient(food.foodNutrients, ["Protein"]),
          fatG: pickNutrient(food.foodNutrients, ["Total lipid (fat)"]),
          carbsG: pickNutrient(food.foodNutrients, ["Carbohydrate, by difference"]),
        };
      })
      .sort((a, b) => (DATA_TYPE_PRIORITY[a.dataType] ?? 9) - (DATA_TYPE_PRIORITY[b.dataType] ?? 9));
  },
};
