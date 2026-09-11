import { prisma } from "@fit-tracker/database";
import type { MealEntry as PrismaMealEntry } from "@fit-tracker/database";
import type { FoodPortion } from "@fit-tracker/types";

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

  /**
   * Por cada fdcId, la última porción con la que el usuario lo registró por
   * piezas. El peso de una pieza sale de los gramos totales ÷ las piezas.
   */
  async findLatestPortionsByFdcIds(userId: string, fdcIds: number[]) {
    const latest = new Map<number, FoodPortion>();
    if (fdcIds.length === 0) return latest;

    const entries = await prisma.mealEntry.findMany({
      where: { userId, fdcId: { in: fdcIds }, unitCount: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { fdcId: true, quantityG: true, unitCount: true, unitLabel: true },
    });

    for (const entry of entries) {
      if (entry.fdcId === null || entry.unitCount === null || latest.has(entry.fdcId)) continue;
      latest.set(entry.fdcId, {
        label: entry.unitLabel ?? "pieza",
        gramWeight: Math.round((entry.quantityG.toNumber() / entry.unitCount.toNumber()) * 100) / 100,
      });
    }

    return latest;
  },
};
