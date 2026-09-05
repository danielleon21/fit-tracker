import type { CreateWorkoutSessionInput, UpdateWorkoutSessionInput } from "@fit-tracker/types";
import { workoutSessionRepository, type DateRange } from "@/repositories/workout-session.repository";
import { routineRepository } from "@/repositories/routine.repository";
import { exerciseService } from "@/services/exercise.service";
import { NotFoundError, ValidationError } from "@/errors/domain-errors";

async function assertRoutineOwnership(routineId: string | null | undefined, userId: string) {
  if (!routineId) return;
  const routine = await routineRepository.findById(routineId, userId);
  if (!routine) throw new ValidationError("Routine not found");
}

export const workoutSessionService = {
  listForUser(userId: string, range?: DateRange) {
    return workoutSessionRepository.findManyByUser(userId, range);
  },

  async getById(id: string, userId: string) {
    const session = await workoutSessionRepository.findById(id, userId);
    if (!session) throw new NotFoundError("Workout session not found");
    return session;
  },

  async create(userId: string, input: CreateWorkoutSessionInput) {
    await assertRoutineOwnership(input.routineId, userId);
    await exerciseService.assertAllExist((input.sets ?? []).map((set) => set.exerciseId));
    return workoutSessionRepository.create(userId, input);
  },

  async update(id: string, userId: string, input: UpdateWorkoutSessionInput) {
    await assertRoutineOwnership(input.routineId, userId);
    await exerciseService.assertAllExist((input.sets ?? []).map((set) => set.exerciseId));
    const session = await workoutSessionRepository.update(id, userId, input);
    if (!session) throw new NotFoundError("Workout session not found");
    return session;
  },

  async remove(id: string, userId: string) {
    const deleted = await workoutSessionRepository.delete(id, userId);
    if (!deleted) throw new NotFoundError("Workout session not found");
  },
};
