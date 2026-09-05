"use client";

import { useCallback } from "react";
import { useFakeStore } from "@/hooks/useFakeStore";
import { todayRoutineStore } from "@/lib/fake-data/dashboard-data";

export function useTodayRoutine() {
  const routine = useFakeStore(todayRoutineStore);

  const toggleCompleted = useCallback(() => {
    todayRoutineStore.set((prev) => ({ ...prev, completed: !prev.completed }));
  }, []);

  return { routine, toggleCompleted };
}
