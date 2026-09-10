import type { MealEntry } from "@fit-tracker/types";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { macroSplit, sumMacros } from "@/lib/nutrition";

interface MacroRow {
  label: string;
  grams: number;
  pct: number | null;
  colorClass: string;
}

interface MacrosCardProps {
  entries: MealEntry[];
  isLoading: boolean;
}

export function MacrosCard({ entries, isLoading }: MacrosCardProps) {
  const totals = sumMacros(entries);
  const split = macroSplit(totals);

  const rows: MacroRow[] = [
    { label: "Proteína", grams: totals.proteinG, pct: split?.proteinPct ?? null, colorClass: "bg-macro-protein" },
    { label: "Carbohidratos", grams: totals.carbsG, pct: split?.carbsPct ?? null, colorClass: "bg-macro-carbs" },
    { label: "Grasa", grams: totals.fatG, pct: split?.fatPct ?? null, colorClass: "bg-macro-fat" },
  ];

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-label">Macronutrientes</div>

      {isLoading ? (
        <div className="py-6 text-center text-sm text-muted">Cargando…</div>
      ) : entries.length === 0 ? (
        <EmptyState
          title="Aún no hay macros registrados"
          description="Proteína, carbohidratos y grasas del día van a aparecer aquí."
        />
      ) : (
        <>
          {/* La barra solo repite lo que ya dicen las filas de abajo (nombre,
              gramos y %), así que para un lector de pantalla es decorativa. */}
          {split ? (
            <div aria-hidden className="mt-4 flex h-2.5 gap-[2px] overflow-hidden rounded-full">
              {rows
                .filter((row) => row.pct !== null && row.pct > 0)
                .map((row) => (
                  <div key={row.label} className={`h-full ${row.colorClass}`} style={{ width: `${row.pct}%` }} />
                ))}
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-2.5">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 flex-none rounded-full ${row.colorClass}`} />
                <span className="text-sm text-label">{row.label}</span>
                <span className="ml-auto text-sm font-semibold text-ink">{Math.round(row.grams)} g</span>
                <span className="w-9 text-right text-xs tabular-nums text-muted">
                  {row.pct !== null ? `${Math.round(row.pct)}%` : "—"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-3 text-[11px] text-muted">% de las calorías del día que aporta cada macro</div>
        </>
      )}
    </div>
  );
}
