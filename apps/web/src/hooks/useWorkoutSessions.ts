"use client";

import { useCallback, useEffect, useState } from "react";
import type { WorkoutSession, WorkoutSetLogInput } from "@fit-tracker/types";
import { apiFetch } from "@/lib/api-client";

/** Sesiones de entrenamiento de una fecha puntual (por defecto hoy), con acciones para registrarlas. */
export function useWorkoutSessions(date: string) {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiFetch<{ data: WorkoutSession[] }>(
        `/api/workout-sessions?from=${date}&to=${date}`,
      );
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  const logSession = useCallback(
    async (routineId: string, sets: WorkoutSetLogInput[]) => {
      await apiFetch("/api/workout-sessions", {
        method: "POST",
        body: JSON.stringify({ date, routineId, sets }),
      });
      await refresh();
    },
    [date, refresh],
  );

  const updateSession = useCallback(
    async (sessionId: string, routineId: string, sets: WorkoutSetLogInput[]) => {
      await apiFetch(`/api/workout-sessions/${sessionId}`, {
        method: "PUT",
        body: JSON.stringify({ date, routineId, sets }),
      });
      await refresh();
    },
    [date, refresh],
  );

  const undo = useCallback(
    async (sessionId: string) => {
      await apiFetch(`/api/workout-sessions/${sessionId}`, { method: "DELETE" });
      await refresh();
    },
    [refresh],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sessions, isLoading, error, logSession, updateSession, undo, refresh };
}
