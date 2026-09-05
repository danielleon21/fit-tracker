"use client";

import { useState, type FormEvent } from "react";
import { FormField } from "@/components/shared/FormField";

export interface ProgressFormValues {
  weightKg: number;
  idealWeightKg: number | null;
  bodyFatPct: number | null;
  muscleMassPct: number | null;
  heightCm: number | null;
}

interface ProgressEntryFormProps {
  initialValues?: Partial<ProgressFormValues>;
  submitLabel: string;
  onSubmit: (values: ProgressFormValues) => Promise<void>;
}

function toInputValue(value: number | null | undefined) {
  return value == null ? "" : String(value);
}

function toNullableNumber(raw: string) {
  const trimmed = raw.trim();
  return trimmed === "" ? null : Number(trimmed);
}

export function ProgressEntryForm({ initialValues, submitLabel, onSubmit }: ProgressEntryFormProps) {
  const [weightKg, setWeightKg] = useState(toInputValue(initialValues?.weightKg));
  const [idealWeightKg, setIdealWeightKg] = useState(toInputValue(initialValues?.idealWeightKg));
  const [bodyFatPct, setBodyFatPct] = useState(toInputValue(initialValues?.bodyFatPct));
  const [muscleMassPct, setMuscleMassPct] = useState(toInputValue(initialValues?.muscleMassPct));
  const [heightCm, setHeightCm] = useState(toInputValue(initialValues?.heightCm));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedWeight = Number(weightKg.trim());
    if (!weightKg.trim() || Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      setError("Ingresa un peso actual válido.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        weightKg: parsedWeight,
        idealWeightKg: toNullableNumber(idealWeightKg),
        bodyFatPct: toNullableNumber(bodyFatPct),
        muscleMassPct: toNullableNumber(muscleMassPct),
        heightCm: toNullableNumber(heightCm),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar tu progreso.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        id="weightKg"
        label="Peso actual (kg)"
        type="number"
        step="0.1"
        min="0"
        placeholder="78.4"
        required
        value={weightKg}
        onChange={(event) => setWeightKg(event.target.value)}
      />
      <FormField
        id="idealWeightKg"
        label="Peso ideal (kg)"
        type="number"
        step="0.1"
        min="0"
        placeholder="75"
        value={idealWeightKg}
        onChange={(event) => setIdealWeightKg(event.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="bodyFatPct"
          label="% Grasa"
          type="number"
          step="0.1"
          min="0"
          max="100"
          placeholder="18.2"
          value={bodyFatPct}
          onChange={(event) => setBodyFatPct(event.target.value)}
        />
        <FormField
          id="muscleMassPct"
          label="% Músculo"
          type="number"
          step="0.1"
          min="0"
          max="100"
          placeholder="41.5"
          value={muscleMassPct}
          onChange={(event) => setMuscleMassPct(event.target.value)}
        />
      </div>
      <FormField
        id="heightCm"
        label="Estatura (cm)"
        type="number"
        step="0.1"
        min="0"
        placeholder="170"
        value={heightCm}
        onChange={(event) => setHeightCm(event.target.value)}
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
