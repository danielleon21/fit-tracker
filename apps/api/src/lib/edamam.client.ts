const EDAMAM_BASE_URL = "https://api.edamam.com/api/food-database/v2";

// Edamam Food Database: solo uso en vivo, NO cachear ni persistir permanentemente.
export const edamamClient = {
  async parseFood(ingredient: string) {
    const url = new URL(`${EDAMAM_BASE_URL}/parser`);
    url.searchParams.set("app_id", process.env.EDAMAM_APP_ID ?? "");
    url.searchParams.set("app_key", process.env.EDAMAM_APP_KEY ?? "");
    url.searchParams.set("ingr", ingredient);
    url.searchParams.set("nutrition-type", "logging");

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Edamam API error: ${res.status}`);
    return res.json();
  },
};
