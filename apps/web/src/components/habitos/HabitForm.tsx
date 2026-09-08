"use client";

import { useState, type FormEvent } from "react";
import type { CreateHabitInput, Habit } from "@fit-tracker/types";
import { FormField } from "@/components/shared/FormField";

interface HabitFormProps {
  submitLabel: string;
  onSubmit: (input: CreateHabitInput) => Promise<void>;
  initialHabit?: Habit;
}

export function HabitForm({ submitLabel, onSubmit, initialHabit }: HabitFormProps) {
  const [name, setName] = useState(initialHabit?.name ?? "");
  const [description, setDescription] = useState(initialHabit?.description ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Ponle un nombre al hábito.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() ? description.trim() : null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el hábito.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FormField
        id="habit-name"
        label="Nombre del hábito"
        type="text"
        placeholder="Leer 20 minutos"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <FormField
        id="habit-description"
        label="Descripción (opcional)"
        type="text"
        placeholder="Antes de dormir, sin pantallas"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-accent px-4 py-3.5 text-[15px] font-bold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {isSubmitting ? "Guardando…" : submitLabel}
      </button>
    </form>
  );
}
