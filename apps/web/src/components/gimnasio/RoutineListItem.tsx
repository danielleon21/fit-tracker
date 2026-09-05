"use client";

import type { Routine } from "@fit-tracker/types";

const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface RoutineListItemProps {
  routine: Routine;
  onDelete: (id: string) => void;
}

export function RoutineListItem({ routine, onDelete }: RoutineListItemProps) {
  const days = [...routine.daysOfWeek].sort((a, b) => a - b).map((day) => WEEKDAY_LABELS[day]);

  function handleDelete() {
    if (window.confirm(`¿Borrar la rutina "${routine.name}"?`)) {
      onDelete(routine.id);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="font-serif text-lg font-semibold text-ink">{routine.name}</div>
          <div className="text-xs text-muted">{days.length > 0 ? days.join(", ") : "Sin días programados"}</div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-muted hover:border-danger hover:text-danger"
        >
          Borrar
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {routine.exercises.map((re) => (
          <div key={re.id} className="flex flex-col gap-0.5 rounded-lg bg-surface-2 px-2.5 py-1.5">
            <span className="text-xs font-medium text-label">{re.exercise.name}</span>
            {re.notes ? <span className="text-[11px] text-muted">{re.notes}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
