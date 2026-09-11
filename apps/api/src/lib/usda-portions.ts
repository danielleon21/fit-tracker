import type { FoodPortion } from "@fit-tracker/types";
import type { UsdaFood, UsdaFoodPortion } from "@/lib/usda.client";

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
  // Rebanadas
  slice: "rebanada",
  "medium or regular slice": "rebanada regular",
  "small or thin/very thin slice": "rebanada delgada",
  "large or thick slice": "rebanada gruesa",
  "slice, snack-size": "rebanada chica",
  "slice, crust not eaten": "rebanada sin orilla",
  // Medidas de cocina
  cup: "taza",
  "cup, sliced": "taza (en rebanadas)",
  "cup, chopped": "taza (picado)",
  "cup, diced": "taza (en cubos)",
  "cup, mashed": "taza (machacado)",
  "cup, cooked": "taza (cocido)",
  tbsp: "cucharada",
  tablespoon: "cucharada",
  tsp: "cucharadita",
  teaspoon: "cucharadita",
  "cubic inch": "pulgada cúbica",
  oz: "onza",
  // Piezas y porciones de referencia
  piece: "pieza",
  pieces: "piezas",
  serving: "porción",
  "nlea serving": "porción estándar",
  racc: "porción de referencia",
  // Alimentos que USDA usa como unidad ("1 egg", "1 Banana Peeled")
  egg: "huevo",
  "egg whole without shell": "huevo sin cascarón",
  "egg white": "clara",
  "egg yolk": "yema",
  banana: "plátano",
  "banana peeled": "plátano pelado",
};

// Porción "default" de FNDDS, sin una medida real detrás.
const QUANTITY_NOT_SPECIFIED = "quantity not specified";

// Gramos por unidad de masa en la etiqueta de un producto de marca. Las de
// volumen ("MLT") no se pueden pasar a gramos sin la densidad: se ignoran.
const MASS_UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  GRM: 1,
  MG: 0.001,
  KG: 1000,
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Traduce una medida de USDA: "1 medium or regular slice" → "rebanada
 * regular", "1 large" → "grande", "30 pieces" → "30 piezas". El "1" inicial se
 * quita porque la cantidad la elige el usuario; el detalle entre paréntesis
 * (medidas en pulgadas, "(4.86 large eggs)"...) también.
 */
export function translatePortionLabel(raw: string): string {
  const normalized = raw
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const match = normalized.match(/^(\d+(?:[.,]\d+)?|\d+\/\d+)\s+(.+)$/);
  const quantity = match?.[1];
  const measure = match?.[2] ?? normalized;
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

    // Dos medidas pueden quedar con la misma etiqueta ya traducida; nos
    // quedamos con la primera para no mostrar botones repetidos.
    const label = translatePortionLabel(raw);
    if (!byLabel.has(label)) byLabel.set(label, { label, gramWeight: round2(portion.gramWeight) });
  }

  return [...byLabel.values()].sort((a, b) => a.gramWeight - b.gramWeight);
}

/** La porción que declara la etiqueta de un producto de marca, si viene en unidad de masa. */
export function brandedPortion(
  food: Pick<UsdaFood, "servingSize" | "servingSizeUnit" | "householdServingFullText">,
): FoodPortion | null {
  if (food.servingSize === undefined || !food.servingSizeUnit) return null;

  const factor = MASS_UNIT_TO_GRAMS[food.servingSizeUnit];
  if (factor === undefined) return null;

  const gramWeight = round2(food.servingSize * factor);
  if (!(gramWeight > 0)) return null;

  const label = food.householdServingFullText ? translatePortionLabel(food.householdServingFullText) : "porción";
  return { label, gramWeight };
}
