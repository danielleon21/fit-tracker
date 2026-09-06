"use client";

import { useCallback, useEffect, useState } from "react";
import type { WorkoutSession } from "@fit-tracker/types";
import { apiFetch } from "@/lib/api-client";
import { isoDateDaysAgo, todayIsoLocal } from "@/lib/date";

/** Sesiones de entrenamiento de los últimos `days` días (incluye hoy), para Histórico y el Heatmap. */
export function useWorkoutHistory(days: number) {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const from = isoDateDaysAgo(days - 1);
      const to = todayIsoLocal();
      const { data } = await apiFetch<{ data: WorkoutSession[] }>(
        `/api/workout-sessions?from=${from}&to=${to}`,
      );
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sessions, isLoading, error, refresh };
}
