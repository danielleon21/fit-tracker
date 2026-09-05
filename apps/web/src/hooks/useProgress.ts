"use client";

import { useCallback, useEffect, useState } from "react";
import type { CreateProgressEntryInput, ProgressEntry, UpdateProgressEntryInput } from "@fit-tracker/types";
import { apiFetch } from "@/lib/api-client";

export function useProgress() {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiFetch<{ data: ProgressEntry[] }>("/api/progress");
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addEntry = useCallback(
    async (input: CreateProgressEntryInput) => {
      await apiFetch("/api/progress", { method: "POST", body: JSON.stringify(input) });
      await refresh();
    },
    [refresh],
  );

  const updateEntry = useCallback(
    async (id: string, input: UpdateProgressEntryInput) => {
      await apiFetch(`/api/progress/${id}`, { method: "PUT", body: JSON.stringify(input) });
      await refresh();
    },
    [refresh],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, isLoading, error, addEntry, updateEntry, refresh };
}
