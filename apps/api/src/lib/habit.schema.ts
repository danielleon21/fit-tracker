import { z } from "zod";

const habitFieldsSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
});

export const createHabitSchema = habitFieldsSchema;
export const updateHabitSchema = habitFieldsSchema;

export const habitLogDateParamSchema = z.string().date();
