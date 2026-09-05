"use client";

import { useState, type FormEvent } from "react";
import type { CreateRoutineInput, ExerciseSummary } from "@fit-tracker/types";
import { FormField } from "@/components/shared/FormField";
import { ExercisePicker } from "@/components/gimnasio/ExercisePicker";

const WEEKDAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
];

interface DraftExercise {
  exerciseId: string;
  name: string;
  targetSets: string;
  targetReps: string;
  targetWeightKg: string;
}

interface RoutineFormProps {
  submitLabel: string;
  onSubmit: (input: CreateRoutineInput) => Promise<void>;
}

function toNullableInt(raw: string) {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const value = Number.parseInt(trimmed, 10);
  return Number.isNaN(value) ? null : value;
}

function toNullableFloat(raw: string) {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const value = Number.parseFloat(trimmed);
  return Number.isNaN(value) ? null : value;
}

export function RoutineForm({ submitLabel, onSubmit }: RoutineFormProps) {
  const [name, setName] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [exercises, setExercises] = useState<DraftExercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleDay(day: number) {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function addExercise(exercise: ExerciseSummary) {
    setExercises((prev) => [
      ...prev,
      { exerciseId: exercise.id, name: exercise.name, targetSets: "", targetReps: "", targetWeightKg: "" },
    ]);
  }

  function removeExercise(exerciseId: string) {
    setExercises((prev) => prev.filter((ex) => ex.exerciseId !== exerciseId));
  }

  function moveExercise(index: number, direction: -1 | 1) {
    setExercises((prev) => {
      const target = index + direction;
      const current = prev[index];
      const swapped = prev[target];
      if (!current || !swapped) return prev;

      const next = [...prev];
      next[index] = swapped;
      next[target] = current;
      return next;
    });
  }

  function updateExerciseField(exerciseId: string, field: keyof DraftExercise, value: string) {
    setExercises((prev) => prev.map((ex) => (ex.exerciseId === exerciseId ? { ...ex, [field]: value } : ex)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Ponle un nombre a la rutina.");
      return;
    }
    if (exercises.length === 0) {
      setError("Agrega al menos un ejercicio.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        daysOfWeek: selectedDays,
        exercises: exercises.map((ex, index) => ({
          exerciseId: ex.exerciseId,
          position: index + 1,
          targetSets: toNullableInt(ex.targetSets),
          targetReps: toNullableInt(ex.targetReps),
          targetWeightKg: toNullableFloat(ex.targetWeightKg),
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la rutina.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FormField
        id="routine-name"
        label="Nombre de la rutina"
        type="text"
        placeholder="Empuje — pecho, hombro y tríceps"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-semibold text-label">Días de la semana</label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => {
            const isSelected = selectedDays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={
                  isSelected
                    ? "rounded-full bg-accent px-3.5 py-1.5 text-sm font-bold text-accent-ink"
                    : "rounded-full border border-border-2 px-3.5 py-1.5 text-sm font-semibold text-muted hover:text-ink"
                }
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[13px] font-semibold text-label">Ejercicios</label>
        <ExercisePicker onAdd={addExercise} excludeIds={exercises.map((ex) => ex.exerciseId)} />

        {exercises.length > 0 ? (
          <div className="flex flex-col gap-3">
            {exercises.map((exercise, index) => (
              <div key={exercise.exerciseId} className="flex flex-col gap-3 rounded-xl border border-border bg-surface-2 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">
                    {index + 1}. {exercise.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveExercise(index, -1)}
                      disabled={index === 0}
                      aria-label="Subir"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-ink disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveExercise(index, 1)}
                      disabled={index === exercises.length - 1}
                      aria-label="Bajar"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-ink disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExercise(exercise.exerciseId)}
                      aria-label="Quitar"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-danger hover:bg-surface"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <FormField
                    id={`sets-${exercise.exerciseId}`}
                    label="Sets"
                    type="number"
                    min="1"
                    placeholder="4"
                    value={exercise.targetSets}
                    onChange={(event) => updateExerciseField(exercise.exerciseId, "targetSets", event.target.value)}
                  />
                  <FormField
                    id={`reps-${exercise.exerciseId}`}
                    label="Reps"
                    type="number"
                    min="1"
                    placeholder="8"
                    value={exercise.targetReps}
                    onChange={(event) => updateExerciseField(exercise.exerciseId, "targetReps", event.target.value)}
                  />
                  <FormField
                    id={`weight-${exercise.exerciseId}`}
                    label="Peso (kg)"
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="60"
                    value={exercise.targetWeightKg}
                    onChange={(event) => updateExerciseField(exercise.exerciseId, "targetWeightKg", event.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-placeholder">Busca y agrega los ejercicios de esta rutina.</p>
        )}
      </div>

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
