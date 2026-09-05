import { prisma, Prisma } from "@fit-tracker/database";
import type { CreateWorkoutSessionInput, UpdateWorkoutSessionInput } from "@fit-tracker/types";

const sessionInclude = {
  routine: { select: { id: true, name: true } },
  sets: {
    orderBy: { setNumber: "asc" as const },
    include: {
      exercise: {
        select: {
          id: true,
          name: true,
          nameEn: true,
          imageUrl: true,
          category: { select: { id: true, name: true } },
        },
      },
    },
  },
} satisfies Prisma.WorkoutSessionInclude;

type WorkoutSessionWithSets = Prisma.WorkoutSessionGetPayload<{ include: typeof sessionInclude }>;

function toDto(session: WorkoutSessionWithSets) {
  return {
    id: session.id,
    userId: session.userId,
    routineId: session.routineId,
    routine: session.routine,
    date: session.date.toISOString(),
    notes: session.notes,
    createdAt: session.createdAt.toISOString(),
    sets: session.sets.map((set) => ({
      id: set.id,
      exerciseId: set.exerciseId,
      setNumber: set.setNumber,
      weightKg: set.weightKg?.toNumber() ?? null,
      reps: set.reps,
      exercise: set.exercise,
    })),
  };
}

function toSetCreateInput(sets: CreateWorkoutSessionInput["sets"]) {
  return (sets ?? []).map((set) => ({
    exerciseId: set.exerciseId,
    setNumber: set.setNumber,
    weightKg: set.weightKg ?? null,
    reps: set.reps ?? null,
  }));
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

export const workoutSessionRepository = {
  async findManyByUser(userId: string, range?: DateRange) {
    const sessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        date: range?.from || range?.to ? { gte: range.from, lte: range.to } : undefined,
      },
      include: sessionInclude,
      orderBy: { date: "desc" },
    });
    return sessions.map(toDto);
  },

  async findManyByUserAndDate(userId: string, date: Date) {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId, date },
      include: sessionInclude,
    });
    return sessions.map(toDto);
  },

  async findById(id: string, userId: string) {
    const session = await prisma.workoutSession.findFirst({
      where: { id, userId },
      include: sessionInclude,
    });
    return session ? toDto(session) : null;
  },

  async create(userId: string, input: CreateWorkoutSessionInput) {
    const session = await prisma.workoutSession.create({
      data: {
        userId,
        routineId: input.routineId ?? null,
        date: new Date(input.date),
        notes: input.notes ?? null,
        sets: { create: toSetCreateInput(input.sets) },
      },
      include: sessionInclude,
    });
    return toDto(session);
  },

  async update(id: string, userId: string, input: UpdateWorkoutSessionInput) {
    const existing = await prisma.workoutSession.findFirst({ where: { id, userId } });
    if (!existing) return null;

    const session = await prisma.$transaction(async (tx) => {
      await tx.workoutSetLog.deleteMany({ where: { sessionId: id } });
      return tx.workoutSession.update({
        where: { id },
        data: {
          routineId: input.routineId ?? null,
          date: new Date(input.date),
          notes: input.notes ?? null,
          sets: { create: toSetCreateInput(input.sets) },
        },
        include: sessionInclude,
      });
    });
    return toDto(session);
  },

  async delete(id: string, userId: string) {
    const existing = await prisma.workoutSession.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.workoutSession.delete({ where: { id } });
    return true;
  },
};
