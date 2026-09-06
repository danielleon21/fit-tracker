"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTrainedExercises } from "@/hooks/useTrainedExercises";
import { useExerciseProgress } from "@/hooks/useExerciseProgress";
import { bestWeightForEntry } from "@/lib/exercise-progress";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatCard } from "@/components/dashboard/StatCard";
import { ExerciseProgressChart } from "@/components/gimnasio/ExerciseProgressChart";
import { ExerciseProgressHistory } from "@/components/gimnasio/ExerciseProgressHistory";

export default function ProgresoGimnasioPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { exercises, isLoading: isExercisesLoading } = useTrainedExercises();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { entries, isLoading: isProgressLoading } = useExerciseProgress(selectedId);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, user, router]);

  useEffect(() => {
    const first = exercises[0];
    if (!selectedId && first) {
      setSelectedId(first.id);
    }
  }, [exercises, selectedId]);

  if (isAuthLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-muted">Cargando…</div>;
  }

  const bestWeight = entries.reduce<number | null>((best, entry) => {
    const weight = bestWeightForEntry(entry);
    if (weight == null) return best;
    return best == null || weight > best ? weight : best;
  }, null);
  const lastEntry = entries[entries.length - 1] ?? null;

  return (
    <div className="min-h-screen bg-bg p-6 sm:p-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="font-serif text-sm italic text-accent">Fit Tracker</div>
            <div className="font-serif text-2xl font-semibold text-ink">Gimnasio</div>
          </div>
          <Link href="/" className="text-sm font-semibold text-accent hover:text-accent-hover hover:underline">
            ← Volver al dashboard
          </Link>
        </div>

        <div className="flex gap-2">
          <Link
            href="/gimnasio"
            className="rounded-full border border-border-2 px-4 py-1.5 text-sm font-semibold text-muted hover:text-ink"
          >
            Rutinas
          </Link>
          <span className="rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-ink">Progreso</span>
        </div>

        {isExercisesLoading ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
            Cargando…
          </div>
        ) : exercises.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <EmptyState
              title="Aún no has registrado ningún entrenamiento"
              description="Entrena una rutina desde Gimnasio y aquí vas a ver cómo evolucionan tus pesos por ejercicio."
            />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              {exercises.map((exercise) => (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => setSelectedId(exercise.id)}
                  className={
                    exercise.id === selectedId
                      ? "rounded-full bg-accent px-3.5 py-1.5 text-sm font-bold text-accent-ink"
                      : "rounded-full border border-border-2 px-3.5 py-1.5 text-sm font-semibold text-muted hover:text-ink"
                  }
                >
                  {exercise.name}
                </button>
              ))}
            </div>

            {isProgressLoading ? (
              <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
                Cargando progreso…
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard label="Mejor peso" value={bestWeight != null ? bestWeight.toFixed(1) : "—"} unit={bestWeight != null ? "kg" : ""} />
                  <StatCard
                    label="Última vez"
                    value={
                      lastEntry
                        ? new Date(lastEntry.date).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            timeZone: "UTC",
                          })
                        : "—"
                    }
                    unit=""
                  />
                </div>

                <div className="rounded-2xl border border-border bg-surface p-5">
                  <ExerciseProgressChart entries={entries} />
                </div>

                <ExerciseProgressHistory entries={entries} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
