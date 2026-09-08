"use client";

import { useState } from "react";
import type { Habit } from "@fit-tracker/types";
import { isDoneOn, last7Days } from "@/lib/habit-progress";
import { todayIsoLocal } from "@/lib/date";

function weekdayInitial(iso: string) {
  // Sin "Z": se interpreta como medianoche LOCAL, no UTC.
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES", { weekday: "narrow" }).toUpperCase();
}

function dayNumber(iso: string) {
  return String(Number(iso.slice(8, 10)));
}

interface HabitListItemProps {
  habit: Habit;
  onToggleToday: (habit: Habit) => Promise<void>;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export function HabitListItem({ habit, onToggleToday, onEdit, onDelete }: HabitListItemProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = todayIsoLocal();
  const doneToday = isDoneOn(habit, today);
  const days = last7Days();

  function handleDelete() {
    if (window.confirm(`¿Borrar el hábito "${habit.name}"?`)) {
      onDelete(habit.id);
    }
  }

  async function handleToggle() {
    setIsSubmitting(true);
    try {
      await onToggleToday(habit);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="font-serif text-lg font-semibold text-ink">{habit.name}</div>
          {habit.description ? <div className="text-xs text-muted">{habit.description}</div> : null}
        </div>
        <div className="flex flex-none items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(habit)}
            className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-muted hover:border-accent hover:text-accent"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-muted hover:border-danger hover:text-danger"
          >
            Borrar
          </button>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          {days.map((iso) => {
            const done = isDoneOn(habit, iso);
            const isToday = iso === today;
            return (
              <div key={iso} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-semibold uppercase text-placeholder">{weekdayInitial(iso)}</span>
                <div
                  title={iso}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                    done
                      ? "bg-success-bg text-success"
                      : isToday
                        ? "border border-accent text-muted"
                        : "border border-border text-placeholder"
                  }`}
                >
                  {dayNumber(iso)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-none items-center gap-3">
          {doneToday ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3.5 py-1.5 text-[13px] font-bold text-success">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Hecho hoy
            </span>
          ) : (
            <span className="rounded-full border border-border px-3.5 py-1.5 text-[13px] font-semibold text-muted">Pendiente</span>
          )}
          <button
            type="button"
            onClick={handleToggle}
            disabled={isSubmitting}
            className={
              doneToday
                ? "rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-muted hover:text-ink disabled:opacity-60"
                : "rounded-full border border-accent px-5 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent hover:text-accent-ink disabled:opacity-60"
            }
          >
            {isSubmitting ? "…" : doneToday ? "Deshacer" : "Marcar hoy"}
          </button>
        </div>
      </div>
    </div>
  );
}
