"use client";

import { useCallback, useEffect, useState } from "react";
import type { CreateRoutineInput, Routine, UpdateRoutineInput } from "@fit-tracker/types";
import { apiFetch } from "@/lib/api-client";

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiFetch<{ data: Routine[] }>("/api/routines");
      setRoutines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addRoutine = useCallback(async (input: CreateRoutineInput) => {
    const { data } = await apiFetch<{ data: Routine }>("/api/routines", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setRoutines((prev) => [...prev, data]);
    return data;
  }, []);

  const updateRoutine = useCallback(
    async (id: string, input: UpdateRoutineInput) => {
      await apiFetch(`/api/routines/${id}`, { method: "PUT", body: JSON.stringify(input) });
      await refresh();
    },
    [refresh],
  );

  const removeRoutine = useCallback(async (id: string) => {
    await apiFetch(`/api/routines/${id}`, { method: "DELETE" });
    setRoutines((prev) => prev.filter((routine) => routine.id !== id));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { routines, isLoading, error, addRoutine, updateRoutine, removeRoutine, refresh };
}
