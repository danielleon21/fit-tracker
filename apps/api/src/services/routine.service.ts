import type { CreateRoutineInput, UpdateRoutineInput } from "@fit-tracker/types";
import { routineRepository } from "@/repositories/routine.repository";
import { exerciseRepository } from "@/repositories/exercise.repository";
import { NotFoundError, ValidationError } from "@/errors/domain-errors";

async function assertExercisesExist(exerciseIds: string[]) {
  const uniqueIds = [...new Set(exerciseIds)];
  const foundCount = await exerciseRepository.countByIds(uniqueIds);
  if (foundCount !== uniqueIds.length) {
    throw new ValidationError("One or more exercises don't exist in the catalog");
  }
}

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
    await assertExercisesExist(input.exercises.map((ex) => ex.exerciseId));
    return routineRepository.create(userId, input);
  },

  async update(id: string, userId: string, input: UpdateRoutineInput) {
    await assertExercisesExist(input.exercises.map((ex) => ex.exerciseId));
    const routine = await routineRepository.update(id, userId, input);
    if (!routine) throw new NotFoundError("Routine not found");
    return routine;
  },

  async remove(id: string, userId: string) {
    const deleted = await routineRepository.delete(id, userId);
    if (!deleted) throw new NotFoundError("Routine not found");
  },
};
