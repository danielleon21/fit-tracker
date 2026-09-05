import type { ExerciseSummary } from "./exercise";

export interface WorkoutSetLog {
  id: string;
  exerciseId: string;
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  exercise: ExerciseSummary;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  routineId: string | null;
  routine: { id: string; name: string } | null;
  date: string;
  notes: string | null;
  createdAt: string;
  sets: WorkoutSetLog[];
}

export interface WorkoutSetLogInput {
  exerciseId: string;
  setNumber: number;
  weightKg?: number | null;
  reps?: number | null;
}

export interface CreateWorkoutSessionInput {
  date: string;
  routineId?: string | null;
  notes?: string | null;
  sets?: WorkoutSetLogInput[];
}

export type UpdateWorkoutSessionInput = CreateWorkoutSessionInput;
