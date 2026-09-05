import type { CreateRoutineInput, UpdateRoutineInput } from "@fit-tracker/types";
import { routineRepository } from "@/repositories/routine.repository";
import { exerciseService } from "@/services/exercise.service";
import { NotFoundError } from "@/errors/domain-errors";

export const routineService = {
  listForUser(userId: string) {
    return routineRepository.findManyByUser(userId);
  },

  async getById(id: string, userId: string) {
    const routine = await routineRepository.findById(id, userId);
    if (!routine) throw new NotFoundError("Routine not found");
    return routine;
  },

  async create(userId: string, input: CreateRoutineInput) {
    await exerciseService.assertAllExist(input.exercises.map((ex) => ex.exerciseId));
    return routineRepository.create(userId, input);
  },

  async update(id: string, userId: string, input: UpdateRoutineInput) {
    await exerciseService.assertAllExist(input.exercises.map((ex) => ex.exerciseId));
    const routine = await routineRepository.update(id, userId, input);
    if (!routine) throw new NotFoundError("Routine not found");
    return routine;
  },

  async remove(id: string, userId: string) {
    const deleted = await routineRepository.delete(id, userId);
    if (!deleted) throw new NotFoundError("Routine not found");
  },
};
