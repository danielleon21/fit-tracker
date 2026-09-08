"use client";

import { useState } from "react";
import type { CreateMealEntryInput, FoodSearchResult, MealType } from "@fit-tracker/types";
import { MEAL_TYPES, foodSourceLabel, isGenericFood, scaleMacro } from "@/lib/nutrition";
import { todayIsoLocal } from "@/lib/date";

interface AddMealEntryPanelProps {
  food: FoodSearchResult;
  onConfirm: (input: CreateMealEntryInput) => Promise<void>;
  onCancel: () => void;
}

export function AddMealEntryPanel({ food, onConfirm, onCancel }: AddMealEntryPanelProps) {
  const [quantityG, setQuantityG] = useState("100");
  const [mealType, setMealType] = useState<MealType>("DESAYUNO");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quantity = Number(quantityG);
  const isQuantityValid = quantityG.trim() !== "" && quantity > 0;

  async function handleConfirm() {
    if (!isQuantityValid) {
      setError("Ingresa una cantidad válida en gramos.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm({
        date: todayIsoLocal(),
        mealType,
        description: food.description,
        quantityG: quantity,
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

  const generic = isGenericFood(food);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-accent bg-surface p-5">
      <div className="flex flex-col gap-1">
        <div className="font-serif text-base font-semibold capitalize text-ink">{food.description.toLowerCase()}</div>
        <span
          className={
            generic
              ? "w-fit rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-bold uppercase text-success"
              : "w-fit rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase text-muted"
          }
        >
          {foodSourceLabel(food)}
        </span>
      </div>

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
          className="w-full rounded-xl border border-border-2 bg-surface-2 px-3.5 py-3 text-[15px] text-ink focus:outline-none focus:ring-[3px] focus:ring-accent/20 focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold text-label">Comida</span>
        <div className="flex flex-wrap gap-2">
          {MEAL_TYPES.map((meal) => {
            const isSelected = mealType === meal.value;
            return (
              <button
                key={meal.value}
                type="button"
                onClick={() => setMealType(meal.value)}
                className={
                  isSelected
                    ? "rounded-full bg-accent px-3.5 py-1.5 text-sm font-bold text-accent-ink"
                    : "rounded-full border border-border-2 px-3.5 py-1.5 text-sm font-semibold text-muted hover:text-ink"
                }
              >
                {meal.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="flex flex-col gap-0.5 rounded-xl bg-surface-2 py-2.5">
          <span className="text-sm font-bold text-ink">
            {isQuantityValid ? Math.round(scaleMacro(food.caloriesKcal, quantity) ?? 0) : "—"}
          </span>
          <span className="text-[10px] uppercase text-placeholder">Kcal</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl bg-surface-2 py-2.5">
          <span className="text-sm font-bold text-ink">
            {isQuantityValid ? `${scaleMacro(food.proteinG, quantity) ?? "—"}g` : "—"}
          </span>
          <span className="text-[10px] uppercase text-placeholder">Proteína</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl bg-surface-2 py-2.5">
          <span className="text-sm font-bold text-ink">
            {isQuantityValid ? `${scaleMacro(food.carbsG, quantity) ?? "—"}g` : "—"}
          </span>
          <span className="text-[10px] uppercase text-placeholder">Carbs</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl bg-surface-2 py-2.5">
          <span className="text-sm font-bold text-ink">
            {isQuantityValid ? `${scaleMacro(food.fatG, quantity) ?? "—"}g` : "—"}
          </span>
          <span className="text-[10px] uppercase text-placeholder">Grasa</span>
        </div>
      </div>

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
