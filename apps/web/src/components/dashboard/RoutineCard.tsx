"use client";

import { useState } from "react";
import type { TodayRoutineStatus, WorkoutSetLogInput } from "@fit-tracker/types";
import { TrainingModal } from "@/components/gimnasio/TrainingModal";

interface RoutineCardProps {
  status: TodayRoutineStatus;
  onLogSession: (routineId: string, sets: WorkoutSetLogInput[]) => Promise<void>;
  onUpdateSession: (sessionId: string, routineId: string, sets: WorkoutSetLogInput[]) => Promise<void>;
  onUndo: (sessionId: string) => Promise<void>;
}

export function RoutineCard({ status, onLogSession, onUpdateSession, onUndo }: RoutineCardProps) {
  const [isUndoing, setIsUndoing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { routine, session } = status;
  const previewExercises = routine.exercises.slice(0, 3);
  const remainingCount = routine.exercises.length - previewExercises.length;

  async function handleUndo() {
    if (!session) return;
    setIsUndoing(true);
    try {
      await onUndo(session.id);
    } finally {
      setIsUndoing(false);
    }
  }

  async function handleSave(sets: WorkoutSetLogInput[]) {
    if (session) {
      await onUpdateSession(session.id, routine.id, sets);
    } else {
      await onLogSession(routine.id, sets);
    }
    setIsModalOpen(false);
  }

  return (
    <>
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
              {previewExercises.map((re) => (
                <span key={re.id} className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-medium text-label">
                  {re.exercise.name}
                </span>
              ))}
              {remainingCount > 0 ? <span className="text-xs text-muted">+{remainingCount} más</span> : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          {session ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3.5 py-1.5 text-[13px] font-bold text-success">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Completada
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="rounded-full border border-accent px-5 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent hover:text-accent-ink"
              >
                Ver / editar
              </button>
              <button
                type="button"
                onClick={handleUndo}
                disabled={isUndoing}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-muted hover:text-ink disabled:opacity-60"
              >
                {isUndoing ? "…" : "Deshacer"}
              </button>
            </>
          ) : (
            <>
              <span className="rounded-full border border-border px-3.5 py-1.5 text-[13px] font-semibold text-muted">Pendiente</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="rounded-full border border-accent px-5 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent hover:text-accent-ink"
              >
                Iniciar entrenamiento
              </button>
            </>
          )}
        </div>
      </div>

      {isModalOpen ? (
        <TrainingModal
          routine={routine}
          existingSession={session}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      ) : null}
    </>
  );
}
