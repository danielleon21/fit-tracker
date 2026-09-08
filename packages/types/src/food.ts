// Macros siempre por 100g (así es como USDA FoodData Central normaliza sus
// valores, sin importar el dataType del alimento).
export interface FoodSearchResult {
  fdcId: number;
  description: string;
  dataType: string;
  // Solo presente cuando dataType === "Branded".
  brandOwner: string | null;
  // Peso en gramos de "una pieza" según USDA (ej. "1 EGG" = 31g) — solo viene
  // poblado cuando el alimento trae un serving size en una unidad de masa.
  // Casi nunca está presente en alimentos genéricos (Foundation/SR Legacy),
  // típicamente solo en productos de marca (Branded).
  pieceWeightG: number | null;
  pieceWeightLabel: string | null;
  caloriesKcal: number | null;
  proteinG: number | null;
  fatG: number | null;
  carbsG: number | null;
}
