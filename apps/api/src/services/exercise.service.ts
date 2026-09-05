import { exerciseRepository } from "@/repositories/exercise.repository";
import { NotFoundError } from "@/errors/domain-errors";

export const exerciseService = {
  search(query?: string) {
    return exerciseRepository.findMany(query);
  },

  async getById(id: string) {
    const exercise = await exerciseRepository.findById(id);
    if (!exercise) throw new NotFoundError("Exercise not found");
    return exercise;
  },
};
