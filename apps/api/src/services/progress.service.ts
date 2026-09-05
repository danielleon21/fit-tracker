import type { CreateProgressEntryInput, UpdateProgressEntryInput } from "@fit-tracker/types";
import { progressRepository } from "@/repositories/progress.repository";
import { NotFoundError } from "@/errors/domain-errors";

export const progressService = {
  listForUser(userId: string) {
    return progressRepository.findManyByUser(userId);
  },

  addEntry(userId: string, input: CreateProgressEntryInput) {
    return progressRepository.create(userId, input);
  },

  async updateEntry(id: string, userId: string, input: UpdateProgressEntryInput) {
    const entry = await progressRepository.update(id, userId, input);
    if (!entry) throw new NotFoundError("Progress entry not found");
    return entry;
  },
};
