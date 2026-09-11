import { stripAccents } from "@/lib/text";

// Orden de los resultados del buscador: ingredientes antes que recetas.
//
// USDA ordena por coincidencia de texto, así que buscando "rice" empata igual
// "Rice crackers" o "Bread, rice bran" que "Rice, white, cooked" (que ni
// siquiera sale entre sus primeros 50). Pero sus nombres siguen una
// convención: lo que va antes de la primera coma es el alimento en sí, y lo
// demás lo describe. "Rice, white, cooked" es arroz; "Bread, rice bran" es pan.

export interface RankableFood {
  description: string;
  dataType: string;
  foodCategory?: string;
}

// Categorías de alimentos ya elaborados. Si la búsqueda no es el alimento en
// sí ("Muffins, oat bran", "Rice crackers"), es una receta que lo lleva.
const PROCESSED_CATEGORIES = new Set([
  "Baked Products",
  "Snacks",
  "Sweets",
  "Breakfast Cereals",
  "Beverages",
  "Sausages and Luncheon Meats",
]);

// Segmentos que USDA pone antes del alimento sin cambiar lo que es: "Fish,
// salmon, Atlantic" es salmón y "Chicken, broilers or fryers, breast" es
// pechuga. Se saltan al leer la cabeza del nombre.
const FILLER_SEGMENTS = new Set(["fish", "crustacean", "mollusk", "broiler or fryer"]);

// Plural en inglés → singular, lo justo para que "eggs" empate con "Egg" y
// "tortilla" con "Tortillas". No es un stemmer completo, ni hace falta.
function singular(word: string): string {
  if (word.length <= 3 || word.endsWith("ss")) return word;
  if (word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.endsWith("oes")) return word.slice(0, -2);
  if (word.endsWith("s")) return word.slice(0, -1);
  return word;
}

function isProcessed(food: RankableFood): boolean {
  return food.foodCategory !== undefined && PROCESSED_CATEGORIES.has(food.foodCategory);
}

function toWords(text: string): string[] {
  return stripAccents(text.toLowerCase())
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(singular);
}

/**
 * 0 = el alimento buscado: el nombre arranca solo con las palabras buscadas,
 *     aunque vengan repartidas en segmentos ("Chicken, breast, raw" para
 *     "chicken breast") o con relleno de por medio (FILLER_SEGMENTS). Aplica
 *     aunque la categoría sea procesada: las tortillas son "Baked Products" y
 *     el azúcar, "Sweets".
 * 1 = variante del alimento: la búsqueda va en el primer segmento junto con
 *     otras palabras ("Rice noodles", "Oat bran").
 * 2 = la búsqueda aparece después, como detalle ("Flour, oat").
 * 3 = lo demás, y cualquier procesado que no sea tier 0 ("Rice crackers").
 */
export function ingredientTier(food: RankableFood, query: string): number {
  const queryWords = new Set(toWords(query));
  if (queryWords.size === 0) return 3;

  const segments = food.description.split(",").map(toWords).filter((segment) => segment.length > 0);

  const head = new Set<string>();
  for (const segment of segments) {
    if (segment.every((word) => queryWords.has(word))) {
      segment.forEach((word) => head.add(word));
      if (head.size === queryWords.size) return 0;
    } else if (!FILLER_SEGMENTS.has(segment.join(" "))) {
      break;
    }
  }

  if (isProcessed(food)) return 3;

  const allIn = (words: string[]) => [...queryWords].every((word) => words.includes(word));
  if (segments[0] && allIn(segments[0])) return 1;
  if (allIn(segments.flat())) return 2;
  return 3;
}

/**
 * Ordena por tier. Dentro de cada uno: primero lo no procesado (la pechuga
 * antes que el embutido de pechuga), luego Foundation antes que SR Legacy
 * (análisis más reciente) y, al final, el orden de relevancia original de USDA.
 */
export function rankIngredients<T extends RankableFood>(foods: T[], query: string): T[] {
  return foods
    .map((food, index) => ({
      food,
      index,
      tier: ingredientTier(food, query),
      processed: isProcessed(food) ? 1 : 0,
      foundation: food.dataType === "Foundation" ? 0 : 1,
    }))
    .sort((a, b) => a.tier - b.tier || a.processed - b.processed || a.foundation - b.foundation || a.index - b.index)
    .map(({ food }) => food);
}
