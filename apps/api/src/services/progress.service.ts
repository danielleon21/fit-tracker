import type { CreateProgressEntryInput } from "@fit-tracker/types";
import { progressRepository } from "@/repositories/progress.repository";

export const progressService = {
  listForUser(userId: string) {
    return progressRepository.findManyByUser(userId);
  },

  addEntry(userId: string, input: CreateProgressEntryInput) {
    return progressRepository.create(userId, input);
  },
};
