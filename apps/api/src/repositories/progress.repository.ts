import { prisma } from "@fit-tracker/database";
import type { ProgressEntry as PrismaProgressEntry } from "@fit-tracker/database";
import type { CreateProgressEntryInput, UpdateProgressEntryInput } from "@fit-tracker/types";

// Prisma serializa los campos Decimal como string en JSON (via Decimal#toJSON).
// Los convertimos a number aqui para que la respuesta cumpla el contrato real de
// ProgressEntry (weightKg: number, etc.) en vez de dejar que el consumidor lo descubra.
function toDto(entry: PrismaProgressEntry) {
  return {
    ...entry,
    date: entry.date.toISOString(),
    weightKg: entry.weightKg.toNumber(),
    idealWeightKg: entry.idealWeightKg?.toNumber() ?? null,
    heightCm: entry.heightCm?.toNumber() ?? null,
    bodyFatPct: entry.bodyFatPct?.toNumber() ?? null,
    muscleMassPct: entry.muscleMassPct?.toNumber() ?? null,
    createdAt: entry.createdAt.toISOString(),
  };
}

export const progressRepository = {
  async findManyByUser(userId: string) {
    const entries = await prisma.progressEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
    return entries.map(toDto);
  },

  async create(userId: string, input: CreateProgressEntryInput) {
    const entry = await prisma.progressEntry.create({
      data: { userId, ...input, date: new Date(input.date) },
    });
    return toDto(entry);
  },

  async update(id: string, userId: string, input: UpdateProgressEntryInput) {
    const existing = await prisma.progressEntry.findFirst({ where: { id, userId } });
    if (!existing) return null;

    const entry = await prisma.progressEntry.update({ where: { id }, data: input });
    return toDto(entry);
  },
};
