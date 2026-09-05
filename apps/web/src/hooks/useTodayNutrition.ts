"use client";

import { useFakeStore } from "@/hooks/useFakeStore";
import { todayNutritionStore } from "@/lib/fake-data/dashboard-data";

export function useTodayNutrition() {
  return useFakeStore(todayNutritionStore);
}
