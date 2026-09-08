import type { CreateMealEntryInput } from "@fit-tracker/types";
import { mealEntryRepository } from "@/repositories/meal-entry.repository";
import { NotFoundError } from "@/errors/domain-errors";

// Escala un macro de "por 100g" a la cantidad real, redondeado a 2 decimales.
function scale(per100g: number | null | undefined, quantityG: number): number | null {
  if (per100g === null || per100g === undefined) return null;
  return Math.round(per100g * (quantityG / 100) * 100) / 100;
}

export const mealEntryService = {
  listForUserOnDate(userId: string, date: string) {
    return mealEntryRepository.findManyByUserAndDate(userId, new Date(date));
  },

  create(userId: string, input: CreateMealEntryInput) {
    return mealEntryRepository.create(userId, {
      date: new Date(input.date),
      mealType: input.mealType,
      description: input.description,
      quantityG: input.quantityG,
      fdcId: input.fdcId ?? null,
      caloriesKcal: scale(input.caloriesPer100g, input.quantityG),
      proteinG: scale(input.proteinPer100g, input.quantityG),
      fatG: scale(input.fatPer100g, input.quantityG),
      carbsG: scale(input.carbsPer100g, input.quantityG),
    });
  },

  async remove(id: string, userId: string) {
    const deleted = await mealEntryRepository.delete(id, userId);
    if (!deleted) throw new NotFoundError("Registro de comida no encontrado.");
  },
};
