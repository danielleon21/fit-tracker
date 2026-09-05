"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CreateRoutineInput } from "@fit-tracker/types";
import { useAuth } from "@/hooks/useAuth";
import { useRoutines } from "@/hooks/useRoutines";
import { RoutineForm } from "@/components/gimnasio/RoutineForm";

export default function NuevaRutinaPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { addRoutine } = useRoutines();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-muted">Cargando…</div>;
  }

  async function handleSubmit(input: CreateRoutineInput) {
    await addRoutine(input);
    router.push("/gimnasio");
  }

  return (
    <div className="min-h-screen bg-bg p-6 sm:p-12">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="font-serif text-sm italic text-accent">Fit Tracker</div>
            <div className="font-serif text-2xl font-semibold text-ink">Nueva rutina</div>
          </div>
          <Link href="/gimnasio" className="text-sm font-semibold text-accent hover:text-accent-hover hover:underline">
            ← Volver
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <RoutineForm submitLabel="Crear rutina" onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
