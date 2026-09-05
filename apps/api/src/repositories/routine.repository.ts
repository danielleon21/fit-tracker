import { prisma, Prisma } from "@fit-tracker/database";
import type { CreateRoutineInput, UpdateRoutineInput } from "@fit-tracker/types";

const routineInclude = {
  exercises: {
    orderBy: { position: "asc" as const },
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
} satisfies Prisma.RoutineInclude;

type RoutineWithExercises = Prisma.RoutineGetPayload<{ include: typeof routineInclude }>;

function toDto(routine: RoutineWithExercises) {
  return {
    id: routine.id,
    userId: routine.userId,
    name: routine.name,
    daysOfWeek: routine.daysOfWeek,
    createdAt: routine.createdAt.toISOString(),
    updatedAt: routine.updatedAt.toISOString(),
    exercises: routine.exercises.map((re) => ({
      id: re.id,
      position: re.position,
      targetSets: re.targetSets,
      targetReps: re.targetReps,
      targetWeightKg: re.targetWeightKg?.toNumber() ?? null,
      notes: re.notes,
      exercise: re.exercise,
    })),
  };
}

function toExerciseCreateInput(exercises: CreateRoutineInput["exercises"]) {
  return exercises.map((ex) => ({
    exerciseId: ex.exerciseId,
    position: ex.position,
    targetSets: ex.targetSets ?? null,
    targetReps: ex.targetReps ?? null,
    targetWeightKg: ex.targetWeightKg ?? null,
    notes: ex.notes ?? null,
  }));
}

export const routineRepository = {
  async findManyByUser(userId: string) {
    const routines = await prisma.routine.findMany({
      where: { userId },
      include: routineInclude,
      orderBy: { createdAt: "asc" },
    });
    return routines.map(toDto);
  },

  async findById(id: string, userId: string) {
    const routine = await prisma.routine.findFirst({
      where: { id, userId },
      include: routineInclude,
    });
    return routine ? toDto(routine) : null;
  },

  async create(userId: string, input: CreateRoutineInput) {
    const routine = await prisma.routine.create({
      data: {
        userId,
        name: input.name,
        daysOfWeek: [...new Set(input.daysOfWeek)],
        exercises: { create: toExerciseCreateInput(input.exercises) },
      },
      include: routineInclude,
    });
    return toDto(routine);
  },

  async update(id: string, userId: string, input: UpdateRoutineInput) {
    const existing = await prisma.routine.findFirst({ where: { id, userId } });
    if (!existing) return null;

    const routine = await prisma.$transaction(async (tx) => {
      await tx.routineExercise.deleteMany({ where: { routineId: id } });
      return tx.routine.update({
        where: { id },
        data: {
          name: input.name,
          daysOfWeek: [...new Set(input.daysOfWeek)],
          exercises: { create: toExerciseCreateInput(input.exercises) },
        },
        include: routineInclude,
      });
    });
    return toDto(routine);
  },

  async delete(id: string, userId: string) {
    const existing = await prisma.routine.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.routine.delete({ where: { id } });
    return true;
  },

  async findScheduledForWeekday(userId: string, weekday: number) {
    const routines = await prisma.routine.findMany({
      where: { userId, daysOfWeek: { has: weekday } },
      include: routineInclude,
      orderBy: { createdAt: "asc" },
    });
    return routines.map(toDto);
  },
};
