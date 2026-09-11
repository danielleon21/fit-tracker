import { z } from "zod";

export const mealTypeSchema = z.enum(["DESAYUNO", "COMIDA", "CENA", "SNACK"]);

export const createMealEntrySchema = z.object({
  date: z.string().date(),
  mealType: mealTypeSchema,
  description: z.string().min(1).max(200),
  quantityG: z.number().positive().max(5000),
  unitCount: z.number().positive().max(1000).nullable().optional(),
  // La etiqueta de la porción elegida ("grande", "rebanada regular"...). Las que
  // no tienen traducción llegan en inglés y pueden ser más largas.
  unitLabel: z.string().max(100).nullable().optional(),
  fdcId: z.number().int().positive().nullable().optional(),
  caloriesPer100g: z.number().nonnegative().nullable().optional(),
  proteinPer100g: z.number().nonnegative().nullable().optional(),
  fatPer100g: z.number().nonnegative().nullable().optional(),
  carbsPer100g: z.number().nonnegative().nullable().optional(),
});

export const mealEntriesQuerySchema = z.object({
  date: z.string().date(),
});
