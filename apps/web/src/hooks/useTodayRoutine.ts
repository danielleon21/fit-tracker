"use client";

import { useCallback, useEffect, useState } from "react";
import type { TodayRoutineStatus, WorkoutSetLogInput } from "@fit-tracker/types";
import { apiFetch } from "@/lib/api-client";

export function useTodayRoutine() {
  const [statuses, setStatuses] = useState<TodayRoutineStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiFetch<{ data: TodayRoutineStatus[] }>("/api/routines/today");
      setStatuses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logSession = useCallback(
    async (routineId: string, sets: WorkoutSetLogInput[]) => {
      const todayIso = new Date().toISOString().slice(0, 10);
      await apiFetch("/api/workout-sessions", {
        method: "POST",
        body: JSON.stringify({ date: todayIso, routineId, sets }),
      });
      await refresh();
    },
    [refresh],
  );

  const updateSession = useCallback(
    async (sessionId: string, routineId: string, sets: WorkoutSetLogInput[]) => {
      const todayIso = new Date().toISOString().slice(0, 10);
      await apiFetch(`/api/workout-sessions/${sessionId}`, {
        method: "PUT",
        body: JSON.stringify({ date: todayIso, routineId, sets }),
      });
      await refresh();
    },
    [refresh],
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

  return { statuses, isLoading, error, logSession, updateSession, undo, refresh };
}
