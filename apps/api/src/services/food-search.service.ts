import type { FoodPortion, FoodSearchResult } from "@fit-tracker/types";
import { usdaClient, type UsdaFoodNutrient } from "@/lib/usda.client";
import { toFoodPortions } from "@/lib/usda-portions";
import { rankIngredients } from "@/services/food-ranking";
import { mealEntryRepository } from "@/repositories/meal-entry.repository";

// USDA no siempre usa el mismo nombre para energía: los alimentos "Foundation"
// la reportan como "Energy (Atwater ... Factors)" en vez de simplemente "Energy".
const ENERGY_NUTRIENT_NAMES = ["Energy", "Energy (Atwater General Factors)", "Energy (Atwater Specific Factors)"];

// Solo ingredientes. USDA mezcla en un mismo buscador alimentos genéricos
// analizados en laboratorio (Foundation y SR Legacy) con platillos de
// encuestas de dieta (Survey/FNDDS: "Egg burrito", "Biryani with chicken") y
// productos de marca (Branded: comidas congeladas, sopas enlatadas, dulces).
// Se piden solo los genéricos.
const INGREDIENT_DATA_TYPES = ["Foundation", "SR Legacy"];

// SR Legacy también trae platillos, agrupados en estas categorías ("McDONALD'S,
// Egg McMUFFIN", "DENNY'S, chicken strips", "Rice pilaf mix"). La búsqueda de
// USDA no filtra por categoría, así que se descartan después. "Sweets" y
// "Snacks" se quedan a propósito: ahí viven el azúcar, la miel o las galletas
// de arroz, que no son comidas completas.
const EXCLUDED_CATEGORIES = new Set([
  "Fast Foods",
  "Restaurant Foods",
  "Meals, Entrees, and Side Dishes",
  "Soups, Sauces, and Gravies",
  "Baby Foods",
  "American Indian/Alaska Native Foods",
]);

// Se pide el máximo que permite USDA (200) y no solo lo que se muestra: su
// orden es por texto, y los ingredientes básicos suelen quedar muy atrás
// ("Milk, whole" sale en el #82 buscando "milk"). rankIngredients los sube.
const USDA_PAGE_SIZE = 200;
const RESULT_LIMIT = 15;

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

// La búsqueda de USDA no trae las medidas caseras: se piden aparte, todas en
// una sola llamada. Si esa llamada falla, la búsqueda sigue funcionando — solo
// que sin porciones, y se registra por gramos.
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
    const { foods: candidates } = await usdaClient.searchFoods(query, {
      dataTypes: INGREDIENT_DATA_TYPES,
      pageSize: USDA_PAGE_SIZE,
    });
    const foods = rankIngredients(
      candidates.filter((food) => !food.foodCategory || !EXCLUDED_CATEGORIES.has(food.foodCategory)),
      query,
    ).slice(0, RESULT_LIMIT);

    const fdcIds = foods.map((food) => food.fdcId);
    const [portions, lastUsed] = await Promise.all([
      portionsByFdcId(fdcIds),
      mealEntryRepository.findLatestPortionsByFdcIds(userId, fdcIds),
    ]);

    return foods.map((food) => ({
      fdcId: food.fdcId,
      description: food.description,
      dataType: food.dataType,
      portions: portions.get(food.fdcId) ?? [],
      lastUsedPortion: lastUsed.get(food.fdcId) ?? null,
      caloriesKcal: pickNutrient(food.foodNutrients, ENERGY_NUTRIENT_NAMES, "KCAL"),
      proteinG: pickNutrient(food.foodNutrients, ["Protein"]),
      fatG: pickNutrient(food.foodNutrients, ["Total lipid (fat)"]),
      carbsG: pickNutrient(food.foodNutrients, ["Carbohydrate, by difference"]),
    }));
  },
};
