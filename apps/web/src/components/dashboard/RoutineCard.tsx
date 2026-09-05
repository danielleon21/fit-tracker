"use client";

import { useTodayRoutine } from "@/hooks/useTodayRoutine";

export function RoutineCard() {
  const { routine, toggleCompleted } = useTodayRoutine();
  const previewExercises = routine.exercises.slice(0, 3);
  const remainingCount = routine.exercises.length - previewExercises.length;

  return (
    <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="oklch(0.72 0.15 255)"
          strokeWidth="2"
          strokeLinecap="round"
          className="flex-none"
        >
          <path d="M6 7v10M2 9v6M22 9v6M18 7v10M6 12h12" />
        </svg>
        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-semibold uppercase tracking-wide text-label">Rutina de hoy</div>
          <div className="font-serif text-xl font-semibold text-ink">{routine.name}</div>
          <div className="flex flex-wrap items-center gap-2">
            {previewExercises.map((exercise) => (
              <span key={exercise} className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-medium text-label">
                {exercise}
              </span>
            ))}
            <span className="text-xs text-muted">
              {remainingCount > 0 ? `+${remainingCount} más · ` : ""}~{routine.durationMinutes} min
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        {routine.completed ? (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3.5 py-1.5 text-[13px] font-bold text-success">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Completada
            </span>
            <button
              type="button"
              onClick={toggleCompleted}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-muted hover:text-ink"
            >
              Deshacer
            </button>
          </>
        ) : (
          <>
            <span className="rounded-full border border-border px-3.5 py-1.5 text-[13px] font-semibold text-muted">
              Pendiente
            </span>
            <button
              type="button"
              onClick={toggleCompleted}
              className="rounded-full border border-accent px-5 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent hover:text-accent-ink"
            >
              Marcar como realizada
            </button>
          </>
        )}
      </div>
    </div>
  );
}
