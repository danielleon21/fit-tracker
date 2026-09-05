"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { CreateRoutineInput } from "@fit-tracker/types";
import { useAuth } from "@/hooks/useAuth";
import { useRoutines } from "@/hooks/useRoutines";
import { RoutineForm } from "@/components/gimnasio/RoutineForm";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function EditarRutinaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { routines, isLoading: isRoutinesLoading, updateRoutine } = useRoutines();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || !user || isRoutinesLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-muted">Cargando…</div>;
  }

  const routine = routines.find((r) => r.id === params.id);

  async function handleSubmit(input: CreateRoutineInput) {
    if (!routine) return;
    await updateRoutine(routine.id, input);
    router.push("/gimnasio");
  }

  return (
    <div className="min-h-screen bg-bg p-6 sm:p-12">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="font-serif text-sm italic text-accent">Fit Tracker</div>
            <div className="font-serif text-2xl font-semibold text-ink">Editar rutina</div>
          </div>
          <Link href="/gimnasio" className="text-sm font-semibold text-accent hover:text-accent-hover hover:underline">
            ← Volver
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          {routine ? (
            <RoutineForm submitLabel="Guardar cambios" onSubmit={handleSubmit} initialRoutine={routine} />
          ) : (
            <EmptyState
              title="Rutina no encontrada"
              description="Puede que ya la hayas borrado o que el enlace esté mal."
            />
          )}
        </div>
      </div>
    </div>
  );
}
