"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProgressSummary } from "@/hooks/useProgressSummary";
import { AppHeader } from "@/components/dashboard/AppHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { DeltaPill } from "@/components/dashboard/DeltaPill";
import { CaloriesCard } from "@/components/dashboard/CaloriesCard";
import { MacrosCard } from "@/components/dashboard/MacrosCard";
import { RoutineCard } from "@/components/dashboard/RoutineCard";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const progress = useProgressSummary();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-muted">Cargando…</div>;
  }

  const idealDiff = progress.idealWeightKg - progress.currentWeightKg;
  const idealDiffLabel = `${idealDiff > 0 ? "+" : ""}${idealDiff.toFixed(1)} kg para tu objetivo`;
  const userInitial = (user.name ?? user.email)[0]?.toUpperCase() ?? "?";

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -right-36 -top-44 h-[480px] w-[480px] rounded-full bg-blob-violet blur-[80px]" />

      <div className="relative flex flex-col gap-6 p-6 sm:p-12">
        <AppHeader userInitial={userInitial} />

        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          <StatCard label="Peso actual" value={progress.currentWeightKg.toFixed(1)} unit="kg">
            <DeltaPill direction={progress.weightDeltaKg <= 0 ? "up" : "down"}>
              {progress.weightDeltaKg > 0 ? "+" : ""}
              {progress.weightDeltaKg.toFixed(1)} kg esta semana
            </DeltaPill>
          </StatCard>

          <StatCard label="% Grasa" value={progress.bodyFatPct.toFixed(1)} unit="%">
            <DeltaPill direction={progress.bodyFatDeltaPct <= 0 ? "up" : "down"}>
              {progress.bodyFatDeltaPct > 0 ? "+" : ""}
              {progress.bodyFatDeltaPct.toFixed(1)}% esta semana
            </DeltaPill>
          </StatCard>

          <StatCard label="Músculo" value={progress.musclePct.toFixed(1)} unit="%">
            <DeltaPill direction={progress.muscleDeltaPct >= 0 ? "up" : "down"}>
              {progress.muscleDeltaPct > 0 ? "+" : ""}
              {progress.muscleDeltaPct.toFixed(1)}% esta semana
            </DeltaPill>
          </StatCard>

          <StatCard label="Peso ideal" value={progress.idealWeightKg.toFixed(1)} unit="kg">
            <DeltaPill direction="neutral">{idealDiffLabel}</DeltaPill>
          </StatCard>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <CaloriesCard />
          <MacrosCard />
        </div>

        <RoutineCard />
      </div>
    </div>
  );
}
