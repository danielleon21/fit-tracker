"use client";

import { useFakeStore } from "@/hooks/useFakeStore";
import { progressSummaryStore } from "@/lib/fake-data/dashboard-data";

export function useProgressSummary() {
  return useFakeStore(progressSummaryStore);
}
