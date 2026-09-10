import Link from "next/link";
import type { MealEntry } from "@fit-tracker/types";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { MEAL_TYPES, groupByMealType, sumMacros } from "@/lib/nutrition";

interface CaloriesCardProps {
  entries: MealEntry[];
  isLoading: boolean;
}

export function CaloriesCard({ entries, isLoading }: CaloriesCardProps) {
  const totals = sumMacros(entries);
  const grouped = groupByMealType(entries);
  const mealsWithEntries = MEAL_TYPES.filter((meal) => grouped[meal.value].length > 0);

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-label">Calorías de hoy</div>
        <Link href="/nutricion" className="text-xs font-semibold text-accent hover:text-accent-hover hover:underline">
          Nutrición →
        </Link>
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-sm text-muted">Cargando…</div>
      ) : entries.length === 0 ? (
        <EmptyState
          title="Sin registro de comidas"
          description="Registra lo que comiste en Nutrición y aquí vas a ver el total del día."
        />
      ) : (
        <>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <div className="font-serif text-3xl font-semibold text-ink">{Math.round(totals.caloriesKcal)}</div>
            <div className="text-sm font-medium text-muted">kcal</div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {mealsWithEntries.map((meal) => {
              const mealEntries = grouped[meal.value];
              const mealKcal = sumMacros(mealEntries).caloriesKcal;

              return (
                <div
                  key={meal.value}
                  className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-3.5 py-2"
                >
                  <span className="text-sm font-semibold text-ink">{meal.label}</span>
                  <span className="text-xs text-muted">
                    {mealEntries.length} alimento{mealEntries.length === 1 ? "" : "s"} · {Math.round(mealKcal)} kcal
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
