import { prisma, Prisma } from "@fit-tracker/database";
import type { CreateHabitInput, UpdateHabitInput } from "@fit-tracker/types";

const habitInclude = {
  logs: { orderBy: { date: "asc" as const }, select: { id: true, date: true } },
} satisfies Prisma.HabitInclude;

type HabitWithLogs = Prisma.HabitGetPayload<{ include: typeof habitInclude }>;

function toDto(habit: HabitWithLogs) {
  return {
    id: habit.id,
    userId: habit.userId,
    name: habit.name,
    description: habit.description,
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
    logs: habit.logs.map((log) => ({ id: log.id, date: log.date.toISOString() })),
  };
}

export const habitRepository = {
  async findManyByUser(userId: string) {
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: habitInclude,
      orderBy: { createdAt: "asc" },
    });
    return habits.map(toDto);
  },

  async findById(id: string, userId: string) {
    const habit = await prisma.habit.findFirst({ where: { id, userId }, include: habitInclude });
    return habit ? toDto(habit) : null;
  },

  async create(userId: string, input: CreateHabitInput) {
    const habit = await prisma.habit.create({
      data: { userId, name: input.name, description: input.description ?? null },
      include: habitInclude,
    });
    return toDto(habit);
  },

  async update(id: string, userId: string, input: UpdateHabitInput) {
    const existing = await prisma.habit.findFirst({ where: { id, userId } });
    if (!existing) return null;

    const habit = await prisma.habit.update({
      where: { id },
      data: { name: input.name, description: input.description ?? null },
      include: habitInclude,
    });
    return toDto(habit);
  },

  async delete(id: string, userId: string) {
    const existing = await prisma.habit.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.habit.delete({ where: { id } });
    return true;
  },

  // Ya se validó que `habitId` pertenece al usuario en el service antes de llegar aquí.
  async addLog(habitId: string, date: Date) {
    const log = await prisma.habitLog.upsert({
      where: { habitId_date: { habitId, date } },
      create: { habitId, date },
      update: {},
    });
    return { id: log.id, date: log.date.toISOString() };
  },

  async removeLog(habitId: string, date: Date) {
    const deleted = await prisma.habitLog.deleteMany({ where: { habitId, date } });
    return deleted.count > 0;
  },
};
