"use client";

import { useEffect, useState } from "react";
import type { ExerciseSummary } from "@fit-tracker/types";
import { apiFetch } from "@/lib/api-client";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export function useExerciseSearch(query: string) {
  const [results, setResults] = useState<ExerciseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const { data } = await apiFetch<{ data: ExerciseSummary[] }>(
          `/api/exercises?search=${encodeURIComponent(trimmed)}`,
        );
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return { results, isLoading };
}
