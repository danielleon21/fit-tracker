import { prisma } from "@fit-tracker/database";

const SEARCH_LIMIT = 50;

const summarySelect = {
  id: true,
  name: true,
  nameEn: true,
  imageUrl: true,
  category: { select: { id: true, name: true } },
} as const;

// Postgres ILIKE/`contains` no ignora acentos ("Extension" no encuentra
// "Extensión") sin la extension `unaccent`. En vez de agregar esa extension,
// normalizamos en JS: el catalogo entero (~870 filas, importado una vez desde
// wger) cabe comodo en memoria, asi que no hace falta filtrar en la base.
function normalizeForSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export const exerciseRepository = {
  async findMany(search?: string) {
    if (!search) {
      return prisma.exercise.findMany({ select: summarySelect, orderBy: { name: "asc" }, take: SEARCH_LIMIT });
    }

    const normalizedQuery = normalizeForSearch(search);
    const allExercises = await prisma.exercise.findMany({ select: summarySelect, orderBy: { name: "asc" } });
    return allExercises
      .filter((exercise) => normalizeForSearch(exercise.name).includes(normalizedQuery))
      .slice(0, SEARCH_LIMIT);
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
