import type { CreateHabitInput, Habit } from "@fit-tracker/types";
import { Modal } from "@/components/shared/Modal";
import { HabitForm } from "@/components/habitos/HabitForm";

interface HabitFormModalProps {
  title: string;
  submitLabel: string;
  initialHabit?: Habit;
  onSubmit: (input: CreateHabitInput) => Promise<void>;
  onClose: () => void;
}

export function HabitFormModal({ title, submitLabel, initialHabit, onSubmit, onClose }: HabitFormModalProps) {
  return (
    <Modal title={title} onClose={onClose}>
      <HabitForm submitLabel={submitLabel} initialHabit={initialHabit} onSubmit={onSubmit} />
    </Modal>
  );
}
