import { prisma } from "@fit-tracker/database";
import type { MealEntry as PrismaMealEntry } from "@fit-tracker/database";

// Igual que ProgressEntry: Prisma serializa Decimal como string en JSON,
// los convertimos a number aquí para cumplir el contrato real de MealEntry.
function toDto(entry: PrismaMealEntry) {
  return {
    id: entry.id,
    date: entry.date.toISOString().slice(0, 10),
    mealType: entry.mealType,
    description: entry.description,
    quantityG: entry.quantityG.toNumber(),
    unitCount: entry.unitCount?.toNumber() ?? null,
    unitLabel: entry.unitLabel,
    caloriesKcal: entry.caloriesKcal?.toNumber() ?? null,
    proteinG: entry.proteinG?.toNumber() ?? null,
    fatG: entry.fatG?.toNumber() ?? null,
    carbsG: entry.carbsG?.toNumber() ?? null,
    fdcId: entry.fdcId,
  };
}

export const mealEntryRepository = {
  async findManyByUserAndDate(userId: string, date: Date) {
    const entries = await prisma.mealEntry.findMany({
      where: { userId, date },
      orderBy: { createdAt: "asc" },
    });
    return entries.map(toDto);
  },

  async create(
    userId: string,
    input: {
      date: Date;
      mealType: PrismaMealEntry["mealType"];
      description: string;
      quantityG: number;
      unitCount: number | null;
      unitLabel: string | null;
      caloriesKcal: number | null;
      proteinG: number | null;
      fatG: number | null;
      carbsG: number | null;
      fdcId: number | null;
    },
  ) {
    const entry = await prisma.mealEntry.create({ data: { userId, ...input } });
    return toDto(entry);
  },

  async delete(id: string, userId: string) {
    const deleted = await prisma.mealEntry.deleteMany({ where: { id, userId } });
    return deleted.count > 0;
  },
};
