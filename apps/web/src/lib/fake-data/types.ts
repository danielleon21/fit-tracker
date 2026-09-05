// Formas de datos temporales mientras no existen los modulos reales de
// Gym Tracker y Nutrition Tracker (roadmap: Progreso -> Gym Tracker -> Nutrition Tracker).
// Cuando esos backends existan, estos tipos se reemplazan por los de @fit-tracker/types
// y los hooks que los consumen (useProgressSummary, useTodayRoutine, useTodayNutrition)
// cambian de leer un fake-store a hacer fetch real, sin tocar los componentes.

export interface ProgressSummary {
  currentWeightKg: number;
  weightDeltaKg: number;
  bodyFatPct: number;
  bodyFatDeltaPct: number;
  musclePct: number;
  muscleDeltaPct: number;
  idealWeightKg: number;
}

export interface TodayRoutine {
  name: string;
  exercises: string[];
  durationMinutes: number;
  completed: boolean;
}

export interface MacroTarget {
  consumedG: number;
  goalG: number;
}

export interface TodayNutrition {
  calorieGoal: number;
  caloriesConsumed: number;
  macros: {
    protein: MacroTarget;
    carbs: MacroTarget;
    fat: MacroTarget;
  };
}
