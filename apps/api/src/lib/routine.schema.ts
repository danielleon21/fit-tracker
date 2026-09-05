import { z } from "zod";

const routineExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  position: z.number().int().min(0),
  targetSets: z.number().int().positive().nullable().optional(),
  targetReps: z.number().int().positive().nullable().optional(),
  targetWeightKg: z.number().positive().nullable().optional(),
});

const routineFieldsSchema = z.object({
  name: z.string().min(1).max(100),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).max(7),
  exercises: z.array(routineExerciseSchema).min(1, "A routine needs at least one exercise"),
});

export const createRoutineSchema = routineFieldsSchema;
export const updateRoutineSchema = routineFieldsSchema;
