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
  // Solo presente cuando dataType === "Branded" — el nombre de marca del
  // producto, útil para dejar claro que ese resultado no es un alimento
  // genérico sino un producto comercial específico.
  brandOwner?: string;
  // Peso de "una porción/pieza" tal como lo reporta USDA — casi siempre
  // ausente en alimentos genéricos (Foundation/SR Legacy), presente sobre
  // todo en productos de marca. servingSizeUnit no siempre es masa (puede
  // ser "MLT" para volumen) — hay que filtrar eso al usarlo.
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
}

interface UsdaSearchResponse {
  foods: UsdaFood[];
}

// USDA FoodData Central (CC0): se puede persistir/cachear libremente.
// Los valores de `foodNutrients` siempre vienen normalizados por 100g,
// sin importar el dataType del alimento (Foundation, SR Legacy o Branded).
export const usdaClient = {
  async searchFoods(query: string, pageSize = 15): Promise<UsdaSearchResponse> {
    const url = new URL(`${USDA_BASE_URL}/foods/search`);
    url.searchParams.set("query", query);
    url.searchParams.set("pageSize", String(pageSize));
    url.searchParams.set("api_key", process.env.USDA_API_KEY ?? "");

    const res = await fetch(url);
    if (!res.ok) throw new Error(`USDA API error: ${res.status}`);
    return res.json();
  },
};
