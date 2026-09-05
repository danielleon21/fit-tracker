import type { CreateRoutineInput, UpdateRoutineInput } from "@fit-tracker/types";
import { routineRepository } from "@/repositories/routine.repository";
import { workoutSessionRepository } from "@/repositories/workout-session.repository";
import { exerciseService } from "@/services/exercise.service";
import { NotFoundError } from "@/errors/domain-errors";

function today() {
  // Mismo formato "YYYY-MM-DD" en UTC que usan los formularios de progreso y
  // entrenamiento al mandar `date`, para que la comparacion contra la columna
  // @db.Date coincida sin importar la zona horaria del servidor.
  const isoDate = new Date().toISOString().slice(0, 10);
  return new Date(isoDate);
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

  async getTodayStatus(userId: string) {
    const todayDate = today();
    const weekday = todayDate.getUTCDay(); // 0=domingo ... 6=sabado, igual que Routine.daysOfWeek

    const [routines, sessions] = await Promise.all([
      routineRepository.findScheduledForWeekday(userId, weekday),
      workoutSessionRepository.findManyByUserAndDate(userId, todayDate),
    ]);

    return routines.map((routine) => ({
      routine,
      session: sessions.find((session) => session.routineId === routine.id) ?? null,
    }));
  },
};
