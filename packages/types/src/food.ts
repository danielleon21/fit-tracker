// Una medida casera con su peso, ej. { label: "grande", gramWeight: 50 } para
// un huevo. La etiqueta viene traducida al español cuando es un término
// conocido; si no, queda en inglés tal como la reporta USDA.
export interface FoodPortion {
  label: string;
  gramWeight: number;
}

// Macros siempre por 100g (así es como USDA FoodData Central normaliza sus
// valores, sin importar el dataType del alimento).
export interface FoodSearchResult {
  fdcId: number;
  description: string;
  // "Foundation" o "SR Legacy": la búsqueda solo trae alimentos genéricos
  // (ingredientes), no platillos de encuesta ni productos de marca.
  dataType: string;
  // Medidas caseras de USDA (tamaños de huevo, de tortilla, rebanadas de
  // pan...), ordenadas de menor a mayor peso. Sin la porción de referencia de
  // las etiquetas (RACC/NLEA) ni las onzas, que no son piezas. Vacío cuando
  // USDA no trae ninguna, algo que pasa sobre todo con los alimentos Foundation.
  portions: FoodPortion[];
  // La última porción con la que este usuario registró este alimento, para
  // proponérsela de nuevo sin que tenga que elegirla ni escribir su peso.
  lastUsedPortion: FoodPortion | null;
  // null cuando USDA no trae el dato: algunos Foundation vienen sin energía ni
  // macros. Esos van al final de los resultados y la web no deja agregarlos.
  caloriesKcal: number | null;
  proteinG: number | null;
  fatG: number | null;
  carbsG: number | null;
}
