import { prisma } from "@fit-tracker/database";
import type { ExerciseProgressEntry } from "@fit-tracker/types";

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

// Conectores que el usuario suele omitir al buscar ("Press banca" en vez de
// "Press de banca") - se ignoran del lado de la busqueda, no del nombre real.
const SEARCH_STOPWORDS = new Set(["de", "del", "la", "el", "los", "las", "y", "con", "en", "al"]);

function searchTokens(text: string): string[] {
  return normalizeForSearch(text)
    .split(/\s+/)
    .filter((token) => token.length > 0 && !SEARCH_STOPWORDS.has(token));
}

export const exerciseRepository = {
  async findMany(search?: string) {
    if (!search) {
      return prisma.exercise.findMany({ select: summarySelect, orderBy: { name: "asc" }, take: SEARCH_LIMIT });
    }

    const normalizedQuery = normalizeForSearch(search);
    const queryTokens = searchTokens(search);
    if (queryTokens.length === 0) return [];

    const allExercises = await prisma.exercise.findMany({ select: summarySelect, orderBy: { name: "asc" } });

    // Todas las palabras de la busqueda deben aparecer en el nombre, en
    // cualquier orden y sin necesitar ser contiguas ("Press banca" ->
    // "Press de banca" tambien cuenta). Las coincidencias que ademas
    // contienen la frase completa se muestran primero.
    return allExercises
      .filter((exercise) => {
        const normalizedName = normalizeForSearch(exercise.name);
        return queryTokens.every((token) => normalizedName.includes(token));
      })
      .sort((a, b) => {
        const aIsPhraseMatch = normalizeForSearch(a.name).includes(normalizedQuery) ? 0 : 1;
        const bIsPhraseMatch = normalizeForSearch(b.name).includes(normalizedQuery) ? 0 : 1;
        return aIsPhraseMatch - bIsPhraseMatch || a.name.localeCompare(b.name);
      })
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

  // Solo ejercicios con al menos un set registrado por el usuario — evita
  // mostrar los ~870 ejercicios del catálogo cuando la mayoría nunca se han entrenado.
  findTrained(userId: string) {
    return prisma.exercise.findMany({
      where: { workoutSetLogs: { some: { session: { userId } } } },
      select: summarySelect,
      orderBy: { name: "asc" },
    });
  },

  async findProgress(exerciseId: string, userId: string): Promise<ExerciseProgressEntry[]> {
    const logs = await prisma.workoutSetLog.findMany({
      where: { exerciseId, session: { userId } },
      select: {
        setNumber: true,
        weightKg: true,
        reps: true,
        session: {
          select: { id: true, date: true, routineId: true, routine: { select: { name: true } } },
        },
      },
      orderBy: [{ session: { date: "asc" } }, { setNumber: "asc" }],
    });

    const bySession = new Map<string, ExerciseProgressEntry>();
    for (const log of logs) {
      const { session } = log;
      let entry = bySession.get(session.id);
      if (!entry) {
        entry = {
          sessionId: session.id,
          date: session.date.toISOString(),
          routineId: session.routineId,
          routineName: session.routine?.name ?? null,
          sets: [],
        };
        bySession.set(session.id, entry);
      }
      entry.sets.push({
        setNumber: log.setNumber,
        weightKg: log.weightKg?.toNumber() ?? null,
        reps: log.reps,
      });
    }
    return Array.from(bySession.values());
  },
};
