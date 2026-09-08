import { z } from "zod";

export const mealTypeSchema = z.enum(["DESAYUNO", "COMIDA", "CENA", "SNACK"]);

export const createMealEntrySchema = z.object({
  date: z.string().date(),
  mealType: mealTypeSchema,
  description: z.string().min(1).max(200),
  quantityG: z.number().positive().max(5000),
  fdcId: z.number().int().positive().nullable().optional(),
  caloriesPer100g: z.number().nonnegative().nullable().optional(),
  proteinPer100g: z.number().nonnegative().nullable().optional(),
  fatPer100g: z.number().nonnegative().nullable().optional(),
  carbsPer100g: z.number().nonnegative().nullable().optional(),
});

export const mealEntriesQuerySchema = z.object({
  date: z.string().date(),
});
