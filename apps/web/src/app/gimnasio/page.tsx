"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRoutines } from "@/hooks/useRoutines";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";
import { todayIsoLocal } from "@/lib/date";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { GimnasioNav } from "@/components/gimnasio/GimnasioNav";
import { RoutineListItem } from "@/components/gimnasio/RoutineListItem";

export default function GimnasioPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { routines, isLoading: isRoutinesLoading, removeRoutine } = useRoutines();
  const { sessions, logSession, updateSession, undo } = useWorkoutSessions(todayIsoLocal());

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-muted">Cargando…</div>;
  }

  return (
    <div className="min-h-screen bg-bg p-6 sm:p-12">
      <div className="flex flex-col gap-6">
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

        <div className="flex items-center justify-between">
          <div className="font-serif text-lg font-semibold text-ink">Tus rutinas</div>
          <Link
            href="/gimnasio/rutinas/nueva"
            className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink hover:bg-accent-hover"
          >
            + Crear rutina
          </Link>
        </div>

        {isRoutinesLoading ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
            Cargando tus rutinas…
          </div>
        ) : routines.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <EmptyState
              title="Aún no tienes rutinas"
              description="Crea tu primera rutina para empezar a programar tus días de entrenamiento."
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {routines.map((routine) => (
              <RoutineListItem
                key={routine.id}
                routine={routine}
                existingSession={sessions.find((session) => session.routineId === routine.id) ?? null}
                onDelete={removeRoutine}
                onLogSession={logSession}
                onUpdateSession={updateSession}
                onUndo={undo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
