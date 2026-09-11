import type { FoodPortion } from "@fit-tracker/types";
import type { UsdaFoodPortion } from "@/lib/usda.client";

// Traducción de las medidas caseras más comunes de USDA. Va por frase
// completa y no palabra por palabra: en español el adjetivo va después del
// sustantivo y cambia de género ("medium or regular slice" → "rebanada
// regular"), así que traducir palabra por palabra saldría mal. Lo que no esté
// aquí se muestra tal cual, en inglés.
const PHRASES: Record<string, string> = {
  // Tamaños: SR Legacy y FNDDS los usan solos ("1 large" = un huevo grande)
  "extra small": "extra chico",
  small: "chico",
  medium: "mediano",
  large: "grande",
  "extra large": "extra grande",
  jumbo: "jumbo",
  // Rebanadas. SR Legacy escribe la misma medida con y sin coma ("slice,
  // thin" y "slice thin") según el alimento.
  slice: "rebanada",
  "medium or regular slice": "rebanada regular",
  "small or thin/very thin slice": "rebanada delgada",
  "large or thick slice": "rebanada gruesa",
  "slice, snack-size": "rebanada chica",
  "slice, crust not eaten": "rebanada sin orilla",
  "slice, thin": "rebanada delgada",
  "slice thin": "rebanada delgada",
  "slice, medium": "rebanada mediana",
  "slice medium": "rebanada mediana",
  "slice, large": "rebanada gruesa",
  "slice large": "rebanada gruesa",
  // Medidas de cocina
  cup: "taza",
  "cup, sliced": "taza (en rebanadas)",
  "cup, chopped": "taza (picado)",
  "cup chopped": "taza (picado)",
  "cup, chopped or diced": "taza (picado)",
  "cup, diced": "taza (en cubos)",
  "cup, mashed": "taza (machacado)",
  "cup, cooked": "taza (cocido)",
  tbsp: "cucharada",
  tablespoon: "cucharada",
  "tbsp chopped": "cucharada (picado)",
  tsp: "cucharadita",
  teaspoon: "cucharadita",
  "cubic inch": "pulgada cúbica",
  // Piezas y empaques
  piece: "pieza",
  pieces: "piezas",
  serving: "porción",
  leaf: "hoja",
  bunch: "manojo",
  package: "paquete",
  // Alimentos que USDA usa como unidad ("1 egg", "1 Banana Peeled", "1 pepper")
  egg: "huevo",
  "egg whole without shell": "huevo sin cascarón",
  "egg white": "clara",
  "egg yolk": "yema",
  banana: "plátano",
  "banana peeled": "plátano pelado",
  onion: "cebolla",
  "onion edible": "cebolla sin cáscara",
  tomato: "jitomate",
  // Una pieza de chile (jalapeño, serrano) o de pimiento, que en México
  // también se llama chile morrón.
  pepper: "chile",
  "tortilla, medium": "tortilla mediana",
  "tortilla medium": "tortilla mediana",
  // La tortilla de maíz chica, del tamaño de las que se usan para enchiladas.
  enchilada: "tortilla para enchilada",
};

// Medidas que no son piezas: la porción de referencia de las etiquetas
// nutrimentales (RACC en Foundation, "NLEA serving" en SR Legacy), que es la
// misma para toda una categoría (85 g para casi cualquier verdura), y la onza,
// que es peso. Se descartan: si un alimento solo trae esas, se registra por
// gramos en vez de ofrecer una "pieza" que no existe.
const NON_HOUSEHOLD_MEASURES = new Set(["racc", "nlea serving", "oz"]);

// Porción "default" de FNDDS, sin una medida real detrás.
const QUANTITY_NOT_SPECIFIED = "quantity not specified";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Separa la cantidad de la medida: "0.5 cup, chopped or diced" → "0.5" y
 * "cup, chopped or diced". En minúsculas y sin el detalle entre paréntesis
 * (medidas en pulgadas, "(4.86 large eggs)"...).
 */
function parseMeasure(raw: string): { quantity: string | null; measure: string } {
  const normalized = raw
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const match = normalized.match(/^(\d+(?:[.,]\d+)?|\d+\/\d+)\s+(.+)$/);
  return { quantity: match?.[1] ?? null, measure: match?.[2] ?? normalized };
}

/**
 * Traduce una medida de USDA: "1 medium or regular slice" → "rebanada
 * regular", "1 large" → "grande", "30 pieces" → "30 piezas". El "1" inicial se
 * quita porque la cantidad la elige el usuario.
 */
export function translatePortionLabel(raw: string): string {
  const { quantity, measure } = parseMeasure(raw);
  const translated = PHRASES[measure] ?? measure;
  return quantity && quantity !== "1" ? `${quantity} ${translated}` : translated;
}

/** La medida tal como la describe USDA, o `null` si no es una medida real. */
function rawPortionLabel(portion: UsdaFoodPortion): string | null {
  const description = portion.portionDescription?.trim();
  if (description) {
    return description.toLowerCase() === QUANTITY_NOT_SPECIFIED ? null : description;
  }

  const unit = portion.measureUnit?.name;
  const parts = [unit && unit !== "undetermined" ? unit : null, portion.modifier].filter(
    (part): part is string => Boolean(part),
  );
  if (parts.length === 0) return null;

  const amount = portion.amount && portion.amount !== 1 ? `${portion.amount} ` : "";
  return `${amount}${parts.join(" ")}`;
}

/** Medidas caseras de un alimento genérico, traducidas y de menor a mayor peso. */
export function toFoodPortions(portions: UsdaFoodPortion[] = []): FoodPortion[] {
  const byLabel = new Map<string, FoodPortion>();

  for (const portion of portions) {
    const raw = rawPortionLabel(portion);
    if (!raw || !(portion.gramWeight > 0)) continue;
    if (NON_HOUSEHOLD_MEASURES.has(parseMeasure(raw).measure)) continue;

    // Dos medidas pueden quedar con la misma etiqueta ya traducida; nos
    // quedamos con la primera para no mostrar botones repetidos.
    const label = translatePortionLabel(raw);
    if (!byLabel.has(label)) byLabel.set(label, { label, gramWeight: round2(portion.gramWeight) });
  }

  return [...byLabel.values()].sort((a, b) => a.gramWeight - b.gramWeight);
}
