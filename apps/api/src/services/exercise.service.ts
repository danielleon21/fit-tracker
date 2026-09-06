import { exerciseRepository } from "@/repositories/exercise.repository";
import { NotFoundError, ValidationError } from "@/errors/domain-errors";

export const exerciseService = {
  search(query?: string) {
    return exerciseRepository.findMany(query);
  },

  async getById(id: string) {
    const exercise = await exerciseRepository.findById(id);
    if (!exercise) throw new NotFoundError("Exercise not found");
    return exercise;
  },

  listTrained(userId: string) {
    return exerciseRepository.findTrained(userId);
  },

  async getProgress(id: string, userId: string) {
    await this.getById(id);
    return exerciseRepository.findProgress(id, userId);
  },

  async assertAllExist(exerciseIds: string[]) {
    const uniqueIds = [...new Set(exerciseIds)];
    if (uniqueIds.length === 0) return;

    const foundCount = await exerciseRepository.countByIds(uniqueIds);
    if (foundCount !== uniqueIds.length) {
      throw new ValidationError("One or more exercises don't exist in the catalog");
    }
  },
};
