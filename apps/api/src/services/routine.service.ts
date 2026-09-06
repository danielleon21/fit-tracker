import type { CreateRoutineInput, UpdateRoutineInput } from "@fit-tracker/types";
import { routineRepository } from "@/repositories/routine.repository";
import { workoutSessionRepository } from "@/repositories/workout-session.repository";
import { exerciseService } from "@/services/exercise.service";
import { NotFoundError } from "@/errors/domain-errors";

function today(dateOverride?: string) {
  // El servidor no conoce la zona horaria del usuario, asi que "hoy" segun
  // su UTC casi siempre coincide con el dia local... excepto justo en las
  // horas cercanas a la medianoche en husos detras de UTC (todo el
  // continente americano), donde ya seria "manana" en UTC. Por eso el
  // cliente manda su propia fecha local (`dateOverride`, "YYYY-MM-DD") y
  // solo se cae al UTC del servidor como respaldo si no la mandó.
  const isoDate = dateOverride ?? new Date().toISOString().slice(0, 10);
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

  async getTodayStatus(userId: string, dateOverride?: string) {
    const todayDate = today(dateOverride);
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
