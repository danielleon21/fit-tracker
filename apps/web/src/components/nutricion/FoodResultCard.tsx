import type { FoodSearchResult } from "@fit-tracker/types";

function formatMacro(value: number | null, unit: string) {
  return value === null ? "—" : `${Math.round(value * 10) / 10}${unit}`;
}

interface FoodResultCardProps {
  food: FoodSearchResult;
}

export function FoodResultCard({ food }: FoodResultCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-col gap-0.5">
        <div className="font-serif text-base font-semibold capitalize text-ink">{food.description.toLowerCase()}</div>
        <div className="text-xs text-muted">Macros por 100g</div>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="flex flex-col gap-0.5 rounded-xl bg-surface-2 py-2.5">
          <span className="text-sm font-bold text-ink">{formatMacro(food.caloriesKcal, "")}</span>
          <span className="text-[10px] uppercase text-placeholder">Kcal</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl bg-surface-2 py-2.5">
          <span className="text-sm font-bold text-ink">{formatMacro(food.proteinG, "g")}</span>
          <span className="text-[10px] uppercase text-placeholder">Proteína</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl bg-surface-2 py-2.5">
          <span className="text-sm font-bold text-ink">{formatMacro(food.carbsG, "g")}</span>
          <span className="text-[10px] uppercase text-placeholder">Carbs</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl bg-surface-2 py-2.5">
          <span className="text-sm font-bold text-ink">{formatMacro(food.fatG, "g")}</span>
          <span className="text-[10px] uppercase text-placeholder">Grasa</span>
        </div>
      </div>
    </div>
  );
}
