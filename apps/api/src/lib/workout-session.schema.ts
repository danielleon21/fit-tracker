import { z } from "zod";

const workoutSetLogSchema = z.object({
  exerciseId: z.string().min(1),
  setNumber: z.number().int().positive(),
  weightKg: z.number().nonnegative().nullable().optional(),
  reps: z.number().int().positive().nullable().optional(),
});

const workoutSessionFieldsSchema = z.object({
  date: z.string().date(),
  routineId: z.string().min(1).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  sets: z.array(workoutSetLogSchema).optional(),
});

export const createWorkoutSessionSchema = workoutSessionFieldsSchema;
export const updateWorkoutSessionSchema = workoutSessionFieldsSchema;
