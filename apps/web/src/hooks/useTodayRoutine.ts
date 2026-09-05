"use client";

import { useCallback, useEffect, useState } from "react";
import type { TodayRoutineStatus } from "@fit-tracker/types";
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

  const markDone = useCallback(
    async (routineId: string) => {
      const todayIso = new Date().toISOString().slice(0, 10);
      await apiFetch("/api/workout-sessions", {
        method: "POST",
        body: JSON.stringify({ date: todayIso, routineId }),
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

  return { statuses, isLoading, error, markDone, undo, refresh };
}
