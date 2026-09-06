"use client";

import { useEffect, useMemo, useState } from "react";
import type { ExerciseProgressEntry, Routine, WorkoutSession, WorkoutSetLogInput } from "@fit-tracker/types";
import { Modal } from "@/components/shared/Modal";
import { apiFetch } from "@/lib/api-client";
import { bestWeightForEntry } from "@/lib/exercise-progress";

interface SetRow {
  weightKg: string;
  reps: string;
  done: boolean;
}

interface ExerciseBlock {
  exerciseId: string;
  name: string;
  notes: string | null;
  targetReps: number | null;
  targetWeightKg: number | null;
  rows: SetRow[];
}

interface TrainingModalProps {
  routine: Routine;
  existingSession?: WorkoutSession | null;
  onClose: () => void;
  onSave: (sets: WorkoutSetLogInput[]) => Promise<void>;
}

function buildInitialBlocks(routine: Routine, existingSession?: WorkoutSession | null): ExerciseBlock[] {
  return [...routine.exercises]
    .sort((a, b) => a.position - b.position)
    .map((re) => {
      const loggedSets = existingSession?.sets
        .filter((set) => set.exerciseId === re.exercise.id)
        .sort((a, b) => a.setNumber - b.setNumber);

      const rowCount = Math.max(loggedSets?.length ?? 0, re.targetSets ?? 3, 1);
      const rows: SetRow[] = Array.from({ length: rowCount }, (_, index) => {
        const logged = loggedSets?.[index];
        return {
          weightKg: logged?.weightKg != null ? String(logged.weightKg) : "",
          reps: logged?.reps != null ? String(logged.reps) : "",
          done: Boolean(logged),
        };
      });

      return {
        exerciseId: re.exercise.id,
        name: re.exercise.name,
        notes: re.notes,
        targetReps: re.targetReps,
        targetWeightKg: re.targetWeightKg,
        rows,
      };
    });
}

export function TrainingModal({ routine, existingSession, onClose, onSave }: TrainingModalProps) {
  const [blocks, setBlocks] = useState<ExerciseBlock[]>(() => buildInitialBlocks(routine, existingSession));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ key: string; message: string } | null>(null);
  const [progressByExercise, setProgressByExercise] = useState<Record<string, ExerciseProgressEntry[]>>({});

  // Referencia informativa (solo lectura): peso de la sesión anterior y
  // mejor peso histórico de cada ejercicio, para saber qué peso usar sin
  // tener que salir del modal a consultar Progreso.
  useEffect(() => {
    let cancelled = false;
    async function loadProgress() {
      try {
        const results = await Promise.all(
          routine.exercises.map(async (re) => {
            const { data } = await apiFetch<{ data: ExerciseProgressEntry[] }>(
              `/api/exercises/${re.exercise.id}/progress`,
            );
            return [re.exercise.id, data] as const;
          }),
        );
        if (!cancelled) setProgressByExercise(Object.fromEntries(results));
      } catch {
        // Es solo informativo — si falla, el modal sigue funcionando sin esa referencia.
      }
    }
    loadProgress();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routine.id]);

  const { doneCount, totalCount, nextPendingKey } = useMemo(() => {
    let done = 0;
    let total = 0;
    let nextKey: string | null = null;
    for (const block of blocks) {
      for (let i = 0; i < block.rows.length; i += 1) {
        const row = block.rows[i];
        if (!row) continue;
        total += 1;
        if (row.done) {
          done += 1;
        } else if (nextKey === null) {
          nextKey = `${block.exerciseId}-${i}`;
        }
      }
    }
    return { doneCount: done, totalCount: total, nextPendingKey: nextKey };
  }, [blocks]);

  function updateRow(exerciseId: string, rowIndex: number, patch: Partial<SetRow>) {
    setRowError((prev) => (prev?.key === `${exerciseId}-${rowIndex}` ? null : prev));
    setBlocks((prev) =>
      prev.map((block) =>
        block.exerciseId === exerciseId
          ? { ...block, rows: block.rows.map((row, i) => (i === rowIndex ? { ...row, ...patch } : row)) }
          : block,
      ),
    );
  }

  function toggleDone(exerciseId: string, rowIndex: number) {
    const block = blocks.find((b) => b.exerciseId === exerciseId);
    const row = block?.rows[rowIndex];
    if (!row) return;

    const key = `${exerciseId}-${rowIndex}`;
    if (!row.done && (row.weightKg.trim() === "" || row.reps.trim() === "")) {
      setRowError({ key, message: "Completa el peso y las repeticiones para marcarla como realizada." });
      return;
    }

    setRowError((prev) => (prev?.key === key ? null : prev));
    setBlocks((prev) =>
      prev.map((b) =>
        b.exerciseId === exerciseId
          ? { ...b, rows: b.rows.map((r, i) => (i === rowIndex ? { ...r, done: !r.done } : r)) }
          : b,
      ),
    );
  }

  function addSet(exerciseId: string) {
    setBlocks((prev) =>
      prev.map((block) =>
        block.exerciseId === exerciseId
          ? { ...block, rows: [...block.rows, { weightKg: "", reps: "", done: false }] }
          : block,
      ),
    );
  }

  function removeSet(exerciseId: string, rowIndex: number) {
    setBlocks((prev) =>
      prev.map((block) =>
        block.exerciseId === exerciseId && block.rows.length > 1
          ? { ...block, rows: block.rows.filter((_, i) => i !== rowIndex) }
          : block,
      ),
    );
  }

  async function handleFinish() {
    setError(null);
    setIsSaving(true);
    try {
      const sets: WorkoutSetLogInput[] = [];
      for (const block of blocks) {
        let setNumber = 0;
        for (const row of block.rows) {
          if (!row.done) continue;
          setNumber += 1;
          sets.push({
            exerciseId: block.exerciseId,
            setNumber,
            weightKg: row.weightKg.trim() ? Number.parseFloat(row.weightKg) : null,
            reps: row.reps.trim() ? Number.parseInt(row.reps, 10) : null,
          });
        }
      }
      await onSave(sets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el entrenamiento.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal title={routine.name} onClose={onClose} widthClassName="max-w-2xl">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-2.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-label">Progreso</span>
          <span className="text-sm font-bold text-ink">
            {doneCount} / {totalCount} series
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {blocks.map((block, blockIndex) => {
            const entries = progressByExercise[block.exerciseId] ?? [];
            const otherEntries = entries.filter((entry) => entry.sessionId !== existingSession?.id);
            const lastEntry = otherEntries[otherEntries.length - 1] ?? null;
            const lastWeight = lastEntry ? bestWeightForEntry(lastEntry) : null;
            const bestWeight = entries.reduce<number | null>((best, entry) => {
              const weight = bestWeightForEntry(entry);
              if (weight == null) return best;
              return best == null || weight > best ? weight : best;
            }, null);

            return (
              <div key={block.exerciseId} className="flex flex-col gap-3 rounded-xl border border-border bg-surface-2 p-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-ink">
                    {blockIndex + 1}. {block.name}
                  </span>
                  <span className="text-xs text-muted">
                    {block.notes ? `${block.notes} · ` : ""}
                    Objetivo: {block.targetReps ?? "—"} reps
                    {block.targetWeightKg != null ? ` @ ${block.targetWeightKg} kg` : ""}
                  </span>
                  <span className="text-xs text-placeholder">
                    Sesión anterior: {lastWeight != null ? `${lastWeight} kg` : "—"} · Mejor: {bestWeight != null ? `${bestWeight} kg` : "—"}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {block.rows.map((row, rowIndex) => {
                    const key = `${block.exerciseId}-${rowIndex}`;
                    const isNext = key === nextPendingKey;
                    return (
                      <div key={key} className="flex flex-col gap-1">
                        <div
                          className={`flex items-center gap-2.5 rounded-lg border p-2 transition-colors ${
                            row.done
                              ? "border-success-bg bg-success-bg/40"
                              : isNext
                                ? "border-accent bg-surface"
                                : "border-border bg-surface"
                          }`}
                        >
                          <span className="w-5 flex-none text-center text-xs font-bold text-muted">{rowIndex + 1}</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.5"
                            min="0"
                            placeholder={block.targetWeightKg != null ? String(block.targetWeightKg) : "kg"}
                            value={row.weightKg}
                            onChange={(event) => updateRow(block.exerciseId, rowIndex, { weightKg: event.target.value })}
                            className="w-20 rounded-lg border border-border-2 bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-placeholder focus:outline-none focus:ring-[3px] focus:ring-accent/20 focus:border-accent"
                          />
                          <span className="text-xs text-placeholder">kg</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            placeholder={block.targetReps != null ? String(block.targetReps) : "reps"}
                            value={row.reps}
                            onChange={(event) => updateRow(block.exerciseId, rowIndex, { reps: event.target.value })}
                            className="w-20 rounded-lg border border-border-2 bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-placeholder focus:outline-none focus:ring-[3px] focus:ring-accent/20 focus:border-accent"
                          />
                          <span className="text-xs text-placeholder">reps</span>

                          <div className="flex flex-1 items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleDone(block.exerciseId, rowIndex)}
                              className={
                                row.done
                                  ? "flex h-8 w-8 flex-none items-center justify-center rounded-full bg-success-bg text-success"
                                  : "flex h-8 w-8 flex-none items-center justify-center rounded-full border border-border-2 text-muted hover:border-accent hover:text-accent"
                              }
                              aria-label={row.done ? "Marcar como pendiente" : "Marcar como realizada"}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSet(block.exerciseId, rowIndex)}
                              disabled={block.rows.length <= 1}
                              aria-label="Quitar serie"
                              className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-muted hover:bg-surface hover:text-danger disabled:opacity-30"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        {rowError?.key === key ? <p className="pl-7 text-xs text-danger">{rowError.message}</p> : null}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => addSet(block.exerciseId)}
                  className="self-start text-xs font-semibold text-accent hover:text-accent-hover"
                >
                  + Agregar serie
                </button>
              </div>
            );
          })}
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <button
          type="button"
          onClick={handleFinish}
          disabled={isSaving}
          className="w-full rounded-full bg-accent px-4 py-3.5 text-[15px] font-bold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {isSaving ? "Guardando…" : "Finalizar entrenamiento"}
        </button>
      </div>
    </Modal>
  );
}
