"use client";

import { useTodayNutrition } from "@/hooks/useTodayNutrition";

interface MacroRowProps {
  label: string;
  consumedG: number;
  goalG: number;
}

function MacroRow({ label, consumedG, goalG }: MacroRowProps) {
  const remaining = Math.max(goalG - consumedG, 0);
  const progress = Math.min((consumedG / goalG) * 100, 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-[13px]">
        <span className="font-semibold text-ink">{label}</span>
        <span className="text-muted">
          {consumedG}g / {goalG}g · {remaining}g restantes
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function MacrosCard() {
  const { macros } = useTodayNutrition();

  return (
    <div className="flex flex-col justify-center gap-4 rounded-2xl border border-border bg-surface p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-label">Macronutrientes</div>
      <div className="flex flex-col gap-3.5">
        <MacroRow label="Proteína" consumedG={macros.protein.consumedG} goalG={macros.protein.goalG} />
        <MacroRow label="Carbohidratos" consumedG={macros.carbs.consumedG} goalG={macros.carbs.goalG} />
        <MacroRow label="Grasas" consumedG={macros.fat.consumedG} goalG={macros.fat.goalG} />
      </div>
    </div>
  );
}
