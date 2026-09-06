export interface ExerciseCategorySummary {
  id: string;
  name: string;
}

export interface ExerciseSummary {
  id: string;
  name: string;
  nameEn: string | null;
  imageUrl: string | null;
  category: ExerciseCategorySummary | null;
}

export interface MuscleSummary {
  id: string;
  name: string;
  nameEn: string | null;
}

export interface EquipmentSummary {
  id: string;
  name: string;
}

export interface Exercise extends ExerciseSummary {
  description: string | null;
  descriptionEn: string | null;
  primaryMuscles: MuscleSummary[];
  secondaryMuscles: MuscleSummary[];
  equipment: EquipmentSummary[];
}

export interface ExerciseProgressSet {
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
}

export interface ExerciseProgressEntry {
  sessionId: string;
  date: string;
  routineId: string | null;
  routineName: string | null;
  sets: ExerciseProgressSet[];
}
