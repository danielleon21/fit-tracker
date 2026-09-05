"use client";

import { useState } from "react";
import Link from "next/link";
import type { Routine, WorkoutSession, WorkoutSetLogInput } from "@fit-tracker/types";
import { TrainingModal } from "@/components/gimnasio/TrainingModal";

const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface RoutineListItemProps {
  routine: Routine;
  existingSession?: WorkoutSession | null;
  onDelete: (id: string) => void;
  onLogSession: (routineId: string, sets: WorkoutSetLogInput[]) => Promise<void>;
  onUpdateSession: (sessionId: string, routineId: string, sets: WorkoutSetLogInput[]) => Promise<void>;
  onUndo: (sessionId: string) => Promise<void>;
}

export function RoutineListItem({
  routine,
  existingSession,
  onDelete,
  onLogSession,
  onUpdateSession,
  onUndo,
}: RoutineListItemProps) {
  const [isUndoing, setIsUndoing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const days = [...routine.daysOfWeek].sort((a, b) => a - b).map((day) => WEEKDAY_LABELS[day]);

  function handleDelete() {
    if (window.confirm(`¿Borrar la rutina "${routine.name}"?`)) {
      onDelete(routine.id);
    }
  }

  async function handleUndo() {
    if (!existingSession) return;
    setIsUndoing(true);
    try {
      await onUndo(existingSession.id);
    } finally {
      setIsUndoing(false);
    }
  }

  async function handleSave(sets: WorkoutSetLogInput[]) {
    if (existingSession) {
      await onUpdateSession(existingSession.id, routine.id, sets);
    } else {
      await onLogSession(routine.id, sets);
    }
    setIsModalOpen(false);
  }

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="font-serif text-lg font-semibold text-ink">{routine.name}</div>
            <div className="text-xs text-muted">{days.length > 0 ? days.join(", ") : "Sin días programados"}</div>
          </div>
          <div className="flex flex-none items-center gap-2">
            <Link
              href={`/gimnasio/rutinas/${routine.id}/editar`}
              className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-muted hover:border-accent hover:text-accent"
            >
              Editar
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-muted hover:border-danger hover:text-danger"
            >
              Borrar
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {routine.exercises.map((re) => (
            <div key={re.id} className="flex flex-col gap-0.5 rounded-lg bg-surface-2 px-2.5 py-1.5">
              <span className="text-xs font-medium text-label">{re.exercise.name}</span>
              {re.notes ? <span className="text-[11px] text-muted">{re.notes}</span> : null}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          {existingSession ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 text-xs font-bold text-success">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Completada hoy
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-full border border-accent px-4 py-1.5 text-xs font-bold text-accent transition-colors hover:bg-accent hover:text-accent-ink"
                >
                  Ver / editar
                </button>
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={isUndoing}
                  className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-muted hover:text-ink disabled:opacity-60"
                >
                  {isUndoing ? "…" : "Deshacer"}
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="text-xs text-placeholder">Registra tus pesos y reps al entrenarla.</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="rounded-full border border-accent px-4 py-1.5 text-xs font-bold text-accent transition-colors hover:bg-accent hover:text-accent-ink"
              >
                Entrenar
              </button>
            </>
          )}
        </div>
      </div>

      {isModalOpen ? (
        <TrainingModal
          routine={routine}
          existingSession={existingSession}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      ) : null}
    </>
  );
}
