"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CreateMealEntryInput, FoodSearchResult } from "@fit-tracker/types";
import { useAuth } from "@/hooks/useAuth";
import { useFoodSearch } from "@/hooks/useFoodSearch";
import { useMealEntries } from "@/hooks/useMealEntries";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { FormField } from "@/components/shared/FormField";
import { FoodResultCard } from "@/components/nutricion/FoodResultCard";
import { AddMealEntryPanel } from "@/components/nutricion/AddMealEntryPanel";
import { MealEntriesSection } from "@/components/nutricion/MealEntriesSection";

export default function NutricionPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { results, isLoading, error, hasSearched, search } = useFoodSearch();
  const { entries, addEntry, removeEntry } = useMealEntries();
  const [query, setQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-muted">Cargando…</div>;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim()) search(query.trim());
  }

  async function handleAddEntry(input: CreateMealEntryInput) {
    await addEntry(input);
    setSelectedFood(null);
  }

  return (
    <div className="min-h-screen bg-bg p-6 sm:p-12">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="font-serif text-sm italic text-accent">Fit Tracker</div>
            <div className="font-serif text-2xl font-semibold text-ink">Nutrición</div>
          </div>
          <Link href="/" className="text-sm font-semibold text-accent hover:text-accent-hover hover:underline">
            ← Volver al dashboard
          </Link>
        </div>

        {entries.length > 0 ? (
          <MealEntriesSection entries={entries} onRemove={removeEntry} />
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <EmptyState
              title="Aún no registras nada hoy"
              description="Busca un alimento abajo, elige la cantidad y agrégalo a una comida."
            />
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="font-serif text-lg font-semibold text-ink">Agregar alimento</div>

          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="flex-1">
              <FormField
                id="food-query"
                label="Buscar alimento"
                type="text"
                placeholder="Pechuga de pollo, arroz, huevo…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-ink hover:bg-accent-hover disabled:opacity-60"
            >
              {isLoading ? "Buscando…" : "Buscar"}
            </button>
          </form>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          {!hasSearched ? (
            <div className="rounded-2xl border border-border bg-surface p-4">
              <EmptyState
                title="Busca un alimento para ver sus macros"
                description="La información viene de USDA FoodData Central, siempre normalizada por 100g."
              />
            </div>
          ) : isLoading ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
              Buscando…
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-4">
              <EmptyState title="Sin resultados" description="Intenta con otro nombre o en inglés." />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {results.map((food) =>
                selectedFood?.fdcId === food.fdcId ? (
                  <AddMealEntryPanel
                    key={food.fdcId}
                    food={food}
                    onConfirm={handleAddEntry}
                    onCancel={() => setSelectedFood(null)}
                  />
                ) : (
                  <FoodResultCard key={food.fdcId} food={food} onAdd={setSelectedFood} />
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
