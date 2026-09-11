"use client";

import { useMemo, useState } from "react";
import type { CreateMealEntryInput, FoodPortion, FoodSearchResult, MealType } from "@fit-tracker/types";
import { MEAL_TYPES, scaleMacro } from "@/lib/nutrition";

type UnitMode = "GRAMOS" | "PIEZAS";

// Porción elegida: el índice en `portionOptions`, o CUSTOM para escribir el
// peso de una pieza a mano.
const CUSTOM = "CUSTOM";
type PortionChoice = number | typeof CUSTOM;

interface PortionOption extends FoodPortion {
  isLastUsed: boolean;
}

const PILL = "rounded-full border border-border-2 px-3.5 py-1.5 text-sm font-semibold text-muted hover:text-ink";
const PILL_SELECTED = "rounded-full bg-accent px-3.5 py-1.5 text-sm font-bold text-accent-ink";
const INPUT =
  "w-full rounded-xl border border-border-2 bg-surface-2 px-3.5 py-3 text-[15px] text-ink focus:outline-none focus:ring-[3px] focus:ring-accent/20 focus:border-accent";

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Las porciones de USDA y, si la última vez el usuario usó una que no está en
 * esa lista (ej. un peso escrito a mano), esa también — al principio.
 */
function buildPortionOptions(food: FoodSearchResult): PortionOption[] {
  const options = food.portions.map((portion) => ({ ...portion, isLastUsed: false }));
  const last = food.lastUsedPortion;
  if (!last) return options;

  const match = options.find((option) => option.label === last.label && option.gramWeight === last.gramWeight);
  if (match) {
    match.isLastUsed = true;
    return options;
  }
  return [{ ...last, isLastUsed: true }, ...options];
}

/**
 * Preseleccionada: la que usó la última vez; si no, la mediana/regular; si no,
 * la primera. "mediano" a secas gana sobre "rebanada mediana": de una cebolla
 * lo normal es contar cebollas, no rebanadas.
 */
function defaultPortionChoice(options: PortionOption[]): PortionChoice {
  if (options.length === 0) return CUSTOM;

  const lastUsed = options.findIndex((option) => option.isLastUsed);
  if (lastUsed !== -1) return lastUsed;

  const medium = options.findIndex((option) => option.label === "mediano");
  if (medium !== -1) return medium;

  const regular = options.findIndex((option) => /median[oa]|regular/.test(option.label));
  return regular !== -1 ? regular : 0;
}

interface AddMealEntryPanelProps {
  food: FoodSearchResult;
  /** Día al que se agrega el registro, YYYY-MM-DD. */
  date: string;
  /** Comida preseleccionada (ver `suggestMealType`). */
  defaultMealType: MealType;
  onConfirm: (input: CreateMealEntryInput) => Promise<void>;
  onCancel: () => void;
}

export function AddMealEntryPanel({ food, date, defaultMealType, onConfirm, onCancel }: AddMealEntryPanelProps) {
  const portionOptions = useMemo(() => buildPortionOptions(food), [food]);

  // Si ya lo registró por piezas antes, lo más probable es que lo vuelva a hacer.
  const [unitMode, setUnitMode] = useState<UnitMode>(food.lastUsedPortion ? "PIEZAS" : "GRAMOS");
  const [quantityG, setQuantityG] = useState("100");
  const [pieceCount, setPieceCount] = useState("1");
  const [portionChoice, setPortionChoice] = useState<PortionChoice>(() => defaultPortionChoice(portionOptions));
  const [customGramsPerPiece, setCustomGramsPerPiece] = useState("");
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPortion = portionChoice === CUSTOM ? null : portionOptions[portionChoice];
  const gramsEach = selectedPortion ? selectedPortion.gramWeight : Number(customGramsPerPiece);
  const pieces = Number(pieceCount);
  const isGramsEachValid = selectedPortion !== null || (customGramsPerPiece.trim() !== "" && gramsEach > 0);
  const isPiecesValid = pieceCount.trim() !== "" && pieces > 0 && isGramsEachValid;

  const directGrams = Number(quantityG);
  const isDirectGramsValid = quantityG.trim() !== "" && directGrams > 0;

  const isQuantityValid = unitMode === "GRAMOS" ? isDirectGramsValid : isPiecesValid;
  const totalGrams = unitMode === "GRAMOS" ? directGrams : Math.round(pieces * gramsEach * 100) / 100;

  async function handleConfirm() {
    if (!isQuantityValid) {
      setError(
        unitMode === "GRAMOS"
          ? "Ingresa una cantidad válida en gramos."
          : selectedPortion
            ? "Ingresa cuántas piezas."
            : "Ingresa piezas y peso por pieza válidos.",
      );
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm({
        date,
        mealType,
        description: food.description,
        quantityG: totalGrams,
        unitCount: unitMode === "PIEZAS" ? pieces : null,
        unitLabel: unitMode === "PIEZAS" ? (selectedPortion?.label ?? "pieza") : null,
        fdcId: food.fdcId,
        caloriesPer100g: food.caloriesKcal,
        proteinPer100g: food.proteinG,
        fatPer100g: food.fatG,
        carbsPer100g: food.carbsG,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo agregar el alimento.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-accent bg-surface p-5">
      <div className="font-serif text-base font-semibold capitalize text-ink">{food.description.toLowerCase()}</div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold text-label">¿Cómo lo vas a medir?</span>
        <div className="flex gap-2">
          {(["GRAMOS", "PIEZAS"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setUnitMode(mode)}
              aria-pressed={unitMode === mode}
              className={unitMode === mode ? PILL_SELECTED : PILL}
            >
              {mode === "GRAMOS" ? "Gramos" : "Piezas"}
            </button>
          ))}
        </div>
      </div>

      {unitMode === "GRAMOS" ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="meal-quantity" className="text-[13px] font-semibold text-label">
            Cantidad (g)
          </label>
          <input
            id="meal-quantity"
            type="number"
            min="1"
            step="1"
            value={quantityG}
            onChange={(event) => setQuantityG(event.target.value)}
            className={INPUT}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="meal-pieces" className="text-[13px] font-semibold text-label">
              ¿Cuántas?
            </label>
            <input
              id="meal-pieces"
              type="number"
              min="0.5"
              step="0.5"
              value={pieceCount}
              onChange={(event) => setPieceCount(event.target.value)}
              className={INPUT}
            />
          </div>

          {portionOptions.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-label">Tamaño</span>
              <div className="flex flex-wrap gap-2">
                {portionOptions.map((option, index) => (
                  <button
                    key={`${option.label}-${option.gramWeight}`}
                    type="button"
                    onClick={() => setPortionChoice(index)}
                    aria-pressed={portionChoice === index}
                    className={portionChoice === index ? PILL_SELECTED : PILL}
                  >
                    {capitalize(option.label)} · {option.gramWeight}g{option.isLastUsed ? " · última vez" : ""}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPortionChoice(CUSTOM)}
                  aria-pressed={portionChoice === CUSTOM}
                  className={portionChoice === CUSTOM ? PILL_SELECTED : PILL}
                >
                  Otro peso
                </button>
              </div>
            </div>
          ) : null}

          {portionChoice === CUSTOM ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="meal-piece-weight" className="text-[13px] font-semibold text-label">
                Peso por pieza (g)
              </label>
              <input
                id="meal-piece-weight"
                type="number"
                min="1"
                step="1"
                value={customGramsPerPiece}
                onChange={(event) => setCustomGramsPerPiece(event.target.value)}
                className={INPUT}
              />
              {portionOptions.length === 0 ? (
                <span className="text-xs text-muted">
                  USDA no trae medidas caseras para este alimento. Busca un resultado marcado como “Por pieza”, o
                  escribe cuánto pesa una pieza.
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold text-label">Comida</span>
        <div className="flex flex-wrap gap-2">
          {MEAL_TYPES.map((meal) => (
            <button
              key={meal.value}
              type="button"
              onClick={() => setMealType(meal.value)}
              aria-pressed={mealType === meal.value}
              className={mealType === meal.value ? PILL_SELECTED : PILL}
            >
              {meal.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="flex flex-col gap-0.5 rounded-xl bg-surface-2 py-2.5">
          <span className="text-sm font-bold text-ink">
            {isQuantityValid ? Math.round(scaleMacro(food.caloriesKcal, totalGrams) ?? 0) : "—"}
          </span>
          <span className="text-[10px] uppercase text-placeholder">Kcal</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl bg-surface-2 py-2.5">
          <span className="text-sm font-bold text-ink">
            {isQuantityValid ? `${scaleMacro(food.proteinG, totalGrams) ?? "—"}g` : "—"}
          </span>
          <span className="text-[10px] uppercase text-placeholder">Proteína</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl bg-surface-2 py-2.5">
          <span className="text-sm font-bold text-ink">
            {isQuantityValid ? `${scaleMacro(food.carbsG, totalGrams) ?? "—"}g` : "—"}
          </span>
          <span className="text-[10px] uppercase text-placeholder">Carbs</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl bg-surface-2 py-2.5">
          <span className="text-sm font-bold text-ink">
            {isQuantityValid ? `${scaleMacro(food.fatG, totalGrams) ?? "—"}g` : "—"}
          </span>
          <span className="text-[10px] uppercase text-placeholder">Grasa</span>
        </div>
      </div>

      {unitMode === "PIEZAS" && isQuantityValid ? (
        <span className="text-xs text-muted">= {totalGrams}g en total</span>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border border-border-2 px-4 py-2.5 text-sm font-semibold text-muted hover:text-ink"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="flex-1 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-hover disabled:opacity-60"
        >
          {isSubmitting ? "Agregando…" : `+ Agregar a ${MEAL_TYPES.find((m) => m.value === mealType)?.label}`}
        </button>
      </div>
    </div>
  );
}
