"use client";

import { useCallback, useEffect, useState } from "react";
import type { ExerciseProgressEntry } from "@fit-tracker/types";
import { apiFetch } from "@/lib/api-client";

/** Historial de series registradas para un ejercicio puntual, ordenado por fecha. */
export function useExerciseProgress(exerciseId: string | null) {
  const [entries, setEntries] = useState<ExerciseProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!exerciseId) {
      setEntries([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiFetch<{ data: ExerciseProgressEntry[] }>(
        `/api/exercises/${exerciseId}/progress`,
      );
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, isLoading, error, refresh };
}
