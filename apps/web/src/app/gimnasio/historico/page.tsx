"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { GimnasioNav } from "@/components/gimnasio/GimnasioNav";
import { TrainingHeatmap } from "@/components/gimnasio/TrainingHeatmap";
import { WorkoutHistoryList } from "@/components/gimnasio/WorkoutHistoryList";

const HISTORY_DAYS = 371; // 53 semanas completas, igual que un calendario de contribuciones

export default function HistoricoGimnasioPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { sessions, isLoading: isHistoryLoading } = useWorkoutHistory(HISTORY_DAYS);

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

        {isHistoryLoading ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
            Cargando…
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <EmptyState
              title="Aún no has registrado ningún entrenamiento"
              description="Entrena una rutina desde Gimnasio para empezar a ver tu histórico y tu calendario de días entrenados."
            />
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <TrainingHeatmap sessions={sessions} />
            </div>

            <WorkoutHistoryList sessions={sessions} />
          </>
        )}
      </div>
    </div>
  );
}
