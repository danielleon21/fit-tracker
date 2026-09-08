"use client";

import { useCallback, useState } from "react";
import type { FoodSearchResult } from "@fit-tracker/types";
import { apiFetch } from "@/lib/api-client";

export function useFoodSearch() {
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const { data } = await apiFetch<{ data: FoodSearchResult[] }>(
        `/api/nutrition/foods/search?q=${encodeURIComponent(query)}`,
      );
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { results, isLoading, error, hasSearched, search };
}
