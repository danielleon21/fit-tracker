"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ExerciseSummary } from "@fit-tracker/types";
import { useAuth } from "@/hooks/useAuth";
import { useRoutines } from "@/hooks/useRoutines";
import { useTrainedExercises } from "@/hooks/useTrainedExercises";
import { useExerciseProgress } from "@/hooks/useExerciseProgress";
import { bestWeightForEntry } from "@/lib/exercise-progress";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatCard } from "@/components/dashboard/StatCard";
import { SelectField } from "@/components/shared/Select";
import { GimnasioNav } from "@/components/gimnasio/GimnasioNav";
import { ExerciseProgressChart } from "@/components/gimnasio/ExerciseProgressChart";
import { ExerciseProgressHistory } from "@/components/gimnasio/ExerciseProgressHistory";

const ALL_ROUTINES = "all" as const;
type RoutineFilter = typeof ALL_ROUTINES | string;

export default function ProgresoGimnasioPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { routines, isLoading: isRoutinesLoading } = useRoutines();
  const { exercises: trainedExercises, isLoading: isExercisesLoading } = useTrainedExercises();
  const [routineFilter, setRoutineFilter] = useState<RoutineFilter | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { entries, isLoading: isProgressLoading } = useExerciseProgress(selectedId);

  const isListLoading = isRoutinesLoading || isExercisesLoading;

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, user, router]);

  // Por defecto se ve el progreso de todos los ejercicios ya entrenados; si
  // todavía no hay ninguno pero sí rutinas creadas, se arranca en la primera
  // para poder ver sus ejercicios (aunque aún no tengan series registradas).
  useEffect(() => {
    if (isListLoading || routineFilter !== null) return;
    if (trainedExercises.length > 0) {
      setRoutineFilter(ALL_ROUTINES);
    } else if (routines.length > 0) {
      setRoutineFilter(routines[0]?.id ?? ALL_ROUTINES);
    }
  }, [isListLoading, routineFilter, trainedExercises, routines]);

  const visibleExercises: ExerciseSummary[] = useMemo(() => {
    if (routineFilter === ALL_ROUTINES) return trainedExercises;
    const routine = routines.find((r) => r.id === routineFilter);
    return routine ? routine.exercises.map((re) => re.exercise) : [];
  }, [routineFilter, routines, trainedExercises]);

  useEffect(() => {
    const first = visibleExercises[0];
    setSelectedId(first ? first.id : null);
    // Solo debe reaccionar a un cambio de filtro/rutina, no a que la lista de
    // ejercicios visibles cambie de referencia en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routineFilter]);

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

        <GimnasioNav />

        {isListLoading ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
            Cargando…
          </div>
        ) : trainedExercises.length === 0 && routines.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <EmptyState
              title="Aún no has registrado ningún entrenamiento"
              description="Crea una rutina y entrénala desde Gimnasio para ver aquí cómo evolucionan tus pesos por ejercicio."
            />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SelectField
                label="Rutina"
                value={routineFilter ?? ""}
                onChange={(event) => setRoutineFilter(event.target.value)}
                options={[
                  ...(trainedExercises.length > 0 ? [{ value: ALL_ROUTINES, label: "Todas" }] : []),
                  ...routines.map((routine) => ({ value: routine.id, label: routine.name })),
                ]}
              />

              {visibleExercises.length > 0 ? (
                <SelectField
                  label="Ejercicio"
                  value={selectedId ?? ""}
                  onChange={(event) => setSelectedId(event.target.value)}
                  options={visibleExercises.map((exercise) => ({ value: exercise.id, label: exercise.name }))}
                />
              ) : null}
            </div>

            {visibleExercises.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface p-4">
                <EmptyState
                  title="Esta rutina no tiene ejercicios"
                  description="Agrégale ejercicios desde Gimnasio para poder ver su progreso aquí."
                />
              </div>
            ) : (
              <>
                {isProgressLoading ? (
                  <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
                    Cargando progreso…
                  </div>
                ) : entries.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <EmptyState
                      title="Aún no has registrado series de este ejercicio"
                      description="Entrénalo desde Gimnasio para empezar a ver su progreso aquí."
                    />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <StatCard
                        label="Mejor peso"
                        value={bestWeight != null ? bestWeight.toFixed(1) : "—"}
                        unit={bestWeight != null ? "kg" : ""}
                      />
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
