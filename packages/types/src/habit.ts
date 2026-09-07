export interface HabitLog {
  id: string;
  date: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  logs: HabitLog[];
}

export interface CreateHabitInput {
  name: string;
  description?: string | null;
}

export type UpdateHabitInput = CreateHabitInput;
