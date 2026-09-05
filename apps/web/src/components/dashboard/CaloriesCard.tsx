"use client";

import { useTodayNutrition } from "@/hooks/useTodayNutrition";

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CaloriesCard() {
  const { calorieGoal, caloriesConsumed } = useTodayNutrition();
  const remaining = Math.max(calorieGoal - caloriesConsumed, 0);
  const progress = Math.min(caloriesConsumed / calorieGoal, 1);
  const dashOffset = progress * CIRCUMFERENCE;

  return (
    <div className="flex items-center gap-7 rounded-2xl border border-border bg-surface p-5">
      <div className="relative h-[132px] w-[132px] flex-none">
        <svg width="132" height="132" viewBox="0 0 132 132">
          <circle cx="66" cy="66" r={RADIUS} fill="none" stroke="oklch(0.2 0.025 288)" strokeWidth="12" />
          <circle
            cx="66"
            cy="66"
            r={RADIUS}
            fill="none"
            stroke="oklch(0.72 0.15 255)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${dashOffset} ${CIRCUMFERENCE}`}
            transform="rotate(-90 66 66)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <div className="font-serif text-xl font-semibold text-ink">{remaining.toLocaleString("es-ES")}</div>
          <div className="text-[11px] text-muted">kcal restantes</div>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="text-xs font-semibold uppercase tracking-wide text-label">Calorías de hoy</div>
        <div className="text-[15px]">
          <span className="font-serif font-semibold text-ink">{caloriesConsumed.toLocaleString("es-ES")}</span>
          <span className="text-muted"> / {calorieGoal.toLocaleString("es-ES")} kcal consumidas</span>
        </div>
        <div className="h-2 w-[150px] overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-accent" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
