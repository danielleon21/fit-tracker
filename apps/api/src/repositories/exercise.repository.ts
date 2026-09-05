import { prisma } from "@fit-tracker/database";

const SEARCH_LIMIT = 50;

const summarySelect = {
  id: true,
  name: true,
  nameEn: true,
  imageUrl: true,
  category: { select: { id: true, name: true } },
} as const;

export const exerciseRepository = {
  findMany(search?: string) {
    return prisma.exercise.findMany({
      where: search ? { name: { contains: search, mode: "insensitive" as const } } : undefined,
      select: summarySelect,
      orderBy: { name: "asc" },
      take: SEARCH_LIMIT,
    });
  },

  findById(id: string) {
    return prisma.exercise.findUnique({
      where: { id },
      select: {
        ...summarySelect,
        description: true,
        descriptionEn: true,
        primaryMuscles: { select: { id: true, name: true, nameEn: true } },
        secondaryMuscles: { select: { id: true, name: true, nameEn: true } },
        equipment: { select: { id: true, name: true } },
      },
    });
  },

  async countByIds(ids: string[]) {
    if (ids.length === 0) return 0;
    return prisma.exercise.count({ where: { id: { in: ids } } });
  },
};
