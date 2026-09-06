import type { ExerciseProgressEntry } from "@fit-tracker/types";

// `iso` es una fecha sin hora (medianoche UTC) — se fija timeZone: "UTC" para
// que no se recorra un día al formatear en zonas horarias detrás de UTC.
function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

interface ExerciseProgressHistoryProps {
  entries: ExerciseProgressEntry[];
}

export function ExerciseProgressHistory({ entries }: ExerciseProgressHistoryProps) {
  const mostRecentFirst = [...entries].reverse();

  return (
    <div className="flex flex-col gap-3">
      {mostRecentFirst.map((entry) => (
        <div key={entry.sessionId} className="flex flex-col gap-2 rounded-xl border border-border bg-surface-2 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold capitalize text-ink">{formatLongDate(entry.date)}</span>
            {entry.routineName ? (
              <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted">
                {entry.routineName}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {entry.sets.map((set) => (
              <span key={set.setNumber} className="rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-label">
                {set.weightKg != null ? `${set.weightKg} kg` : "—"} × {set.reps ?? "—"}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
