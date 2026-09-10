import type { MealEntry } from "@fit-tracker/types";
import { MEAL_TYPES, formatQuantity, groupByMealType, sumMacros } from "@/lib/nutrition";

function round(value: number) {
  return Math.round(value * 10) / 10;
}

interface MealEntriesSectionProps {
  entries: MealEntry[];
  onRemove: (id: string) => void;
}

export function MealEntriesSection({ entries, onRemove }: MealEntriesSectionProps) {
  const grouped = groupByMealType(entries);
  const totals = sumMacros(entries);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-2 px-5 py-4">
        <div className="font-serif text-sm font-semibold text-ink">Total del día</div>
        <div className="flex gap-4 text-sm">
          <span className="font-bold text-ink">{round(totals.caloriesKcal)} kcal</span>
          <span className="text-muted">{round(totals.proteinG)}g prot</span>
          <span className="text-muted">{round(totals.carbsG)}g carbs</span>
          <span className="text-muted">{round(totals.fatG)}g grasa</span>
        </div>
      </div>

      {MEAL_TYPES.map((meal) => {
        const mealEntries = grouped[meal.value];
        if (mealEntries.length === 0) return null;

        return (
          <div key={meal.value} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5">
            <div className="font-serif text-base font-semibold text-ink">{meal.label}</div>
            <div className="flex flex-col gap-2">
              {mealEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-3.5 py-2.5"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold capitalize text-ink">
                      {entry.description.toLowerCase()}
                    </span>
                    <span className="text-xs text-muted">
                      {formatQuantity(entry)} · {entry.caloriesKcal ?? "—"} kcal · {entry.proteinG ?? "—"}g prot ·{" "}
                      {entry.carbsG ?? "—"}g carbs · {entry.fatG ?? "—"}g grasa
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(entry.id)}
                    aria-label="Quitar"
                    className="flex h-7 w-7 flex-none items-center justify-center rounded-lg text-danger hover:bg-surface"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
