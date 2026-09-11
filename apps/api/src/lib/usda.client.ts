const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

export interface UsdaFoodNutrient {
  nutrientName: string;
  value: number;
  unitName: string;
}

export interface UsdaFood {
  fdcId: number;
  description: string;
  dataType: string;
  foodNutrients: UsdaFoodNutrient[];
  // Grupo de alimento de USDA ("Poultry Products", "Fast Foods"...). Las
  // medidas caseras no vienen en la búsqueda: se piden aparte (ver getFoods).
  foodCategory?: string;
}

export interface UsdaFoodPortion {
  gramWeight: number;
  // FNDDS: la medida completa ("1 large", o "Quantity not specified").
  portionDescription?: string;
  // SR Legacy y Foundation: la medida viene partida en cantidad + unidad +
  // modifier (1 + "undetermined" + "large"). En FNDDS modifier es un código
  // numérico interno, no texto.
  amount?: number;
  modifier?: string;
  measureUnit?: { name?: string };
}

export interface UsdaFoodDetail {
  fdcId: number;
  foodPortions?: UsdaFoodPortion[];
}

interface UsdaSearchResponse {
  foods: UsdaFood[];
}

interface SearchFoodsOptions {
  // "Foundation", "SR Legacy", "Survey (FNDDS)", "Branded". Sin valor, USDA
  // busca en los cuatro.
  dataTypes?: string[];
  pageSize?: number;
}

// USDA FoodData Central (CC0): se puede persistir/cachear libremente.
// Los valores de `foodNutrients` siempre vienen normalizados por 100g,
// sin importar el dataType del alimento.
export const usdaClient = {
  async searchFoods(query: string, { dataTypes, pageSize = 15 }: SearchFoodsOptions = {}): Promise<UsdaSearchResponse> {
    const url = new URL(`${USDA_BASE_URL}/foods/search`);
    url.searchParams.set("query", query);
    url.searchParams.set("pageSize", String(pageSize));
    if (dataTypes?.length) url.searchParams.set("dataType", dataTypes.join(","));
    url.searchParams.set("api_key", process.env.USDA_API_KEY ?? "");

    const res = await fetch(url);
    if (!res.ok) throw new Error(`USDA API error: ${res.status}`);
    return res.json();
  },

  // Detalle de varios alimentos en una sola llamada (USDA acepta hasta 20
  // fdcIds). Solo lo usamos por `foodPortions`: pedir un único nutriente
  // (208 = energía) reduce la respuesta ~6x y las porciones siguen viniendo.
  async getFoods(fdcIds: number[]): Promise<UsdaFoodDetail[]> {
    const url = new URL(`${USDA_BASE_URL}/foods`);
    url.searchParams.set("fdcIds", fdcIds.join(","));
    url.searchParams.set("nutrients", "208");
    url.searchParams.set("api_key", process.env.USDA_API_KEY ?? "");

    const res = await fetch(url);
    if (!res.ok) throw new Error(`USDA API error: ${res.status}`);
    return res.json();
  },
};
