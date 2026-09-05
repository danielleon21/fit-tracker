import type { ExerciseSummary } from "./exercise";

export interface RoutineExercise {
  id: string;
  position: number;
  targetSets: number | null;
  targetReps: number | null;
  targetWeightKg: number | null;
  exercise: ExerciseSummary;
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  daysOfWeek: number[];
  createdAt: string;
  updatedAt: string;
  exercises: RoutineExercise[];
}

export interface RoutineExerciseInput {
  exerciseId: string;
  position: number;
  targetSets?: number | null;
  targetReps?: number | null;
  targetWeightKg?: number | null;
}

export interface CreateRoutineInput {
  name: string;
  daysOfWeek: number[];
  exercises: RoutineExerciseInput[];
}

export type UpdateRoutineInput = CreateRoutineInput;
