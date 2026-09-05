"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";
import { AppHeader } from "@/components/dashboard/AppHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { DeltaPill } from "@/components/dashboard/DeltaPill";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { CaloriesCard } from "@/components/dashboard/CaloriesCard";
import { MacrosCard } from "@/components/dashboard/MacrosCard";
import { RoutineCard } from "@/components/dashboard/RoutineCard";
import { ProgressOnboardingModal } from "@/components/dashboard/ProgressOnboardingModal";
import { ProgressProfileModal } from "@/components/dashboard/ProgressProfileModal";
import type { ProgressFormValues } from "@/components/dashboard/ProgressEntryForm";

function delta(current: number | null, previous: number | null) {
  if (current == null || previous == null) return null;
  return current - previous;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const { entries, isLoading: isProgressLoading, addEntry, updateEntry } = useProgress();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-muted">Cargando…</div>;
  }

  const latest = entries[0] ?? null;
  const previous = entries[1] ?? null;
  const userInitial = (user.name ?? user.email)[0]?.toUpperCase() ?? "?";
  const showOnboarding = !isProgressLoading && entries.length === 0;

  async function handleOnboardingSubmit(values: ProgressFormValues) {
    await addEntry({ date: new Date().toISOString().slice(0, 10), ...values });
  }

  async function handleProfileSubmit(values: ProgressFormValues) {
    if (!latest) return;
    await updateEntry(latest.id, values);
    setIsProfileModalOpen(false);
  }

  const weightDelta = latest ? delta(latest.weightKg, previous?.weightKg ?? null) : null;
  const bodyFatDelta = latest ? delta(latest.bodyFatPct, previous?.bodyFatPct ?? null) : null;
  const muscleDelta = latest ? delta(latest.muscleMassPct, previous?.muscleMassPct ?? null) : null;
  const idealDiff = latest?.idealWeightKg != null ? latest.idealWeightKg - latest.weightKg : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -right-36 -top-44 h-[480px] w-[480px] rounded-full bg-blob-violet blur-[80px]" />

      <div className="relative flex flex-col gap-6 p-6 sm:p-12">
        <AppHeader
          userInitial={userInitial}
          userLabel={user.name ?? user.email}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onLogout={logout}
        />

        {isProgressLoading ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
            Cargando tu progreso…
          </div>
        ) : !latest ? (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <EmptyState
              title="Aún no tienes registros de progreso"
              description="Cuando registres tu peso, % de grasa y músculo vas a ver tus estadísticas aquí."
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            <StatCard label="Peso actual" value={latest.weightKg.toFixed(1)} unit="kg">
              {weightDelta != null ? (
                <DeltaPill direction={weightDelta <= 0 ? "up" : "down"}>
                  {weightDelta > 0 ? "+" : ""}
                  {weightDelta.toFixed(1)} kg desde tu último registro
                </DeltaPill>
              ) : null}
            </StatCard>

            <StatCard
              label="% Grasa"
              value={latest.bodyFatPct != null ? latest.bodyFatPct.toFixed(1) : "—"}
              unit={latest.bodyFatPct != null ? "%" : ""}
            >
              {bodyFatDelta != null ? (
                <DeltaPill direction={bodyFatDelta <= 0 ? "up" : "down"}>
                  {bodyFatDelta > 0 ? "+" : ""}
                  {bodyFatDelta.toFixed(1)}% desde tu último registro
                </DeltaPill>
              ) : null}
            </StatCard>

            <StatCard
              label="Músculo"
              value={latest.muscleMassPct != null ? latest.muscleMassPct.toFixed(1) : "—"}
              unit={latest.muscleMassPct != null ? "%" : ""}
            >
              {muscleDelta != null ? (
                <DeltaPill direction={muscleDelta >= 0 ? "up" : "down"}>
                  {muscleDelta > 0 ? "+" : ""}
                  {muscleDelta.toFixed(1)}% desde tu último registro
                </DeltaPill>
              ) : null}
            </StatCard>

            <StatCard
              label="Peso ideal"
              value={latest.idealWeightKg != null ? latest.idealWeightKg.toFixed(1) : "—"}
              unit={latest.idealWeightKg != null ? "kg" : ""}
            >
              {idealDiff != null ? (
                <DeltaPill direction="neutral">
                  {idealDiff > 0 ? "+" : ""}
                  {idealDiff.toFixed(1)} kg para tu objetivo
                </DeltaPill>
              ) : null}
            </StatCard>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <CaloriesCard />
          <MacrosCard />
        </div>

        <RoutineCard />
      </div>

      {showOnboarding ? <ProgressOnboardingModal onSubmit={handleOnboardingSubmit} /> : null}

      {isProfileModalOpen && latest ? (
        <ProgressProfileModal
          latestEntry={latest}
          onSubmit={handleProfileSubmit}
          onClose={() => setIsProfileModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
