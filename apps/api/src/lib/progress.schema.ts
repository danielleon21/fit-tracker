import { z } from "zod";

export const progressEntryFieldsSchema = z.object({
  weightKg: z.number().positive(),
  idealWeightKg: z.number().positive().nullable().optional(),
  heightCm: z.number().positive().nullable().optional(),
  bodyFatPct: z.number().min(0).max(100).nullable().optional(),
  muscleMassPct: z.number().min(0).max(100).nullable().optional(),
});

export const createProgressEntrySchema = progressEntryFieldsSchema.extend({
  date: z.string().date(),
});

export const updateProgressEntrySchema = progressEntryFieldsSchema;
