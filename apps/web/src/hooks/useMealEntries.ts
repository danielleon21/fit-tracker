"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CreateMealEntryInput, MealEntry } from "@fit-tracker/types";
import { apiFetch } from "@/lib/api-client";
import { todayIsoLocal } from "@/lib/date";

export function useMealEntries(date: string = todayIsoLocal()) {
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Al cambiar de día rápido (‹ ‹ ‹) las respuestas pueden llegar en desorden;
  // solo la última petición tiene derecho a escribir el estado.
  const latestRequestId = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++latestRequestId.current;
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiFetch<{ data: MealEntry[] }>(`/api/nutrition/meal-entries?date=${date}`);
      if (requestId === latestRequestId.current) setEntries(data);
    } catch (err) {
      if (requestId === latestRequestId.current) setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      if (requestId === latestRequestId.current) setIsLoading(false);
    }
  }, [date]);

  const addEntry = useCallback(
    async (input: CreateMealEntryInput) => {
      await apiFetch("/api/nutrition/meal-entries", { method: "POST", body: JSON.stringify(input) });
      await refresh();
    },
    [refresh],
  );

  const removeEntry = useCallback(async (id: string) => {
    await apiFetch(`/api/nutrition/meal-entries/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, isLoading, error, addEntry, removeEntry, refresh };
}
