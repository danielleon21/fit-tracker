import type { CreateHabitInput, UpdateHabitInput } from "@fit-tracker/types";
import { habitRepository } from "@/repositories/habit.repository";
import { NotFoundError } from "@/errors/domain-errors";

export const habitService = {
  listForUser(userId: string) {
    return habitRepository.findManyByUser(userId);
  },

  async getById(id: string, userId: string) {
    const habit = await habitRepository.findById(id, userId);
    if (!habit) throw new NotFoundError("Hábito no encontrado.");
    return habit;
  },

  create(userId: string, input: CreateHabitInput) {
    return habitRepository.create(userId, input);
  },

  async update(id: string, userId: string, input: UpdateHabitInput) {
    const habit = await habitRepository.update(id, userId, input);
    if (!habit) throw new NotFoundError("Hábito no encontrado.");
    return habit;
  },

  async remove(id: string, userId: string) {
    const deleted = await habitRepository.delete(id, userId);
    if (!deleted) throw new NotFoundError("Hábito no encontrado.");
  },

  async logDay(habitId: string, userId: string, date: string) {
    await this.getById(habitId, userId); // valida dueño + existencia
    return habitRepository.addLog(habitId, new Date(date));
  },

  async unlogDay(habitId: string, userId: string, date: string) {
    await this.getById(habitId, userId);
    const removed = await habitRepository.removeLog(habitId, new Date(date));
    if (!removed) throw new NotFoundError("No hay un registro para esa fecha.");
  },
};
