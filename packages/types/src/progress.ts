export interface ProgressEntry {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
  heightCm: number | null;
  bodyFatPct: number | null;
  muscleMassPct: number | null;
  createdAt: string;
}

export type CreateProgressEntryInput = Omit<ProgressEntry, "id" | "userId" | "createdAt">;
