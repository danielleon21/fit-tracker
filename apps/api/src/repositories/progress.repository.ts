import { prisma } from "@fit-tracker/database";
import type { CreateProgressEntryInput } from "@fit-tracker/types";

export const progressRepository = {
  findManyByUser(userId: string) {
    return prisma.progressEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
  },

  create(userId: string, input: CreateProgressEntryInput) {
    return prisma.progressEntry.create({
      data: { userId, ...input },
    });
  },
};
