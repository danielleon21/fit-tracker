// Macros siempre por 100g (así es como USDA FoodData Central normaliza sus
// valores, sin importar el dataType del alimento).
export interface FoodSearchResult {
  fdcId: number;
  description: string;
  dataType: string;
  caloriesKcal: number | null;
  proteinG: number | null;
  fatG: number | null;
  carbsG: number | null;
}
