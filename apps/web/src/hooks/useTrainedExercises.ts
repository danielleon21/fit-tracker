"use client";

import { useCallback, useEffect, useState } from "react";
import type { ExerciseSummary } from "@fit-tracker/types";
import { apiFetch } from "@/lib/api-client";

/** Ejercicios que el usuario ya entrenó al menos una vez (para elegir cuál ver en Progreso). */
export function useTrainedExercises() {
  const [exercises, setExercises] = useState<ExerciseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiFetch<{ data: ExerciseSummary[] }>("/api/exercises/trained");
      setExercises(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { exercises, isLoading, error, refresh };
}
