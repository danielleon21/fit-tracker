"use client";

import { useState } from "react";
import type { ExerciseSummary } from "@fit-tracker/types";
import { useExerciseSearch } from "@/hooks/useExerciseSearch";

interface ExercisePickerProps {
  onAdd: (exercise: ExerciseSummary) => void;
  excludeIds: string[];
}

export function ExercisePicker({ onAdd, excludeIds }: ExercisePickerProps) {
  const [query, setQuery] = useState("");
  const { results, isLoading } = useExerciseSearch(query);
  const visibleResults = results.filter((exercise) => !excludeIds.includes(exercise.id));

  function handleAdd(exercise: ExerciseSummary) {
    onAdd(exercise);
    setQuery("");
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar ejercicio (mín. 2 letras)…"
        className="w-full rounded-xl border border-border-2 bg-surface-2 px-3.5 py-3 text-[15px] text-ink placeholder:text-placeholder focus:outline-none focus:ring-[3px] focus:ring-accent/20 focus:border-accent"
      />

      {query.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 max-h-72 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
          {isLoading ? (
            <div className="px-2.5 py-2 text-sm text-muted">Buscando…</div>
          ) : visibleResults.length === 0 ? (
            <div className="px-2.5 py-2 text-sm text-muted">Sin resultados.</div>
          ) : (
            visibleResults.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => handleAdd(exercise)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-surface-2"
              >
                <span>{exercise.name}</span>
                {exercise.category ? <span className="text-xs text-muted">{exercise.category.name}</span> : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
