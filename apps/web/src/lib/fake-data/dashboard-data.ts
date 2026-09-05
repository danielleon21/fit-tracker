import { createFakeStore } from "./store";
import type { ProgressSummary, TodayNutrition, TodayRoutine } from "./types";

// Datos de muestra. "Peso ideal" quedara fijo hasta que se importen los PDFs
// de InBody (extraccion via LLM) y alimenten el modulo Progreso real.
const initialProgressSummary: ProgressSummary = {
  currentWeightKg: 78.4,
  weightDeltaKg: -0.6,
  bodyFatPct: 18.2,
  bodyFatDeltaPct: -0.4,
  musclePct: 41.5,
  muscleDeltaPct: 0.2,
  idealWeightKg: 75,
};

// TODO(backend Gym Tracker): reemplazar por Routine + WorkoutLog(userId, date, completed)
// para que "hoy" y "completada" se calculen por fecha real en vez de un booleano fijo.
const initialTodayRoutine: TodayRoutine = {
  name: "Empuje — pecho, hombro y tríceps",
  exercises: [
    "Press banca",
    "Press militar",
    "Fondos",
    "Elevaciones laterales",
    "Extensión de tríceps",
    "Press inclinado",
  ],
  durationMinutes: 55,
  completed: false,
};

// TODO(backend Nutrition Tracker): reemplazar por NutritionGoal + DailyNutritionLog(userId, date).
const initialTodayNutrition: TodayNutrition = {
  calorieGoal: 2200,
  caloriesConsumed: 1540,
  macros: {
    protein: { consumedG: 92, goalG: 140 },
    carbs: { consumedG: 145, goalG: 220 },
    fat: { consumedG: 48, goalG: 70 },
  },
};

export const progressSummaryStore = createFakeStore(
  "fit-tracker:progress-summary",
  initialProgressSummary,
);
export const todayRoutineStore = createFakeStore("fit-tracker:today-routine", initialTodayRoutine);
export const todayNutritionStore = createFakeStore(
  "fit-tracker:today-nutrition",
  initialTodayNutrition,
);
