const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

// USDA FoodData Central (CC0): se puede persistir/cachear libremente.
export const usdaClient = {
  async searchFoods(query: string) {
    const url = new URL(`${USDA_BASE_URL}/foods/search`);
    url.searchParams.set("query", query);
    url.searchParams.set("api_key", process.env.USDA_API_KEY ?? "");

    const res = await fetch(url);
    if (!res.ok) throw new Error(`USDA API error: ${res.status}`);
    return res.json();
  },
};
