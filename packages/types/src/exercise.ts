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
