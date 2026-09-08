"use client";

import { useCallback, useEffect, useState } from "react";
import type { CreateHabitInput, Habit, UpdateHabitInput } from "@fit-tracker/types";
import { apiFetch } from "@/lib/api-client";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiFetch<{ data: Habit[] }>("/api/habits");
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addHabit = useCallback(async (input: CreateHabitInput) => {
    const { data } = await apiFetch<{ data: Habit }>("/api/habits", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setHabits((prev) => [...prev, data]);
    return data;
  }, []);

  const updateHabit = useCallback(
    async (id: string, input: UpdateHabitInput) => {
      await apiFetch(`/api/habits/${id}`, { method: "PUT", body: JSON.stringify(input) });
      await refresh();
    },
    [refresh],
  );

  const removeHabit = useCallback(async (id: string) => {
    await apiFetch(`/api/habits/${id}`, { method: "DELETE" });
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  }, []);

  const logDay = useCallback(
    async (habitId: string, date: string) => {
      await apiFetch(`/api/habits/${habitId}/logs/${date}`, { method: "PUT" });
      await refresh();
    },
    [refresh],
  );

  const unlogDay = useCallback(
    async (habitId: string, date: string) => {
      await apiFetch(`/api/habits/${habitId}/logs/${date}`, { method: "DELETE" });
      await refresh();
    },
    [refresh],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { habits, isLoading, error, addHabit, updateHabit, removeHabit, logDay, unlogDay, refresh };
}
