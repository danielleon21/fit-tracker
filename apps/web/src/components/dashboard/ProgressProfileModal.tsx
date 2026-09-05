import type { ProgressEntry } from "@fit-tracker/types";
import { Modal } from "@/components/shared/Modal";
import { ProgressEntryForm, type ProgressFormValues } from "@/components/dashboard/ProgressEntryForm";

interface ProgressProfileModalProps {
  latestEntry: ProgressEntry;
  onSubmit: (values: ProgressFormValues) => Promise<void>;
  onClose: () => void;
}

export function ProgressProfileModal({ latestEntry, onSubmit, onClose }: ProgressProfileModalProps) {
  return (
    <Modal title="Editar mi perfil" onClose={onClose}>
      <ProgressEntryForm
        initialValues={{
          weightKg: latestEntry.weightKg,
          idealWeightKg: latestEntry.idealWeightKg,
          bodyFatPct: latestEntry.bodyFatPct,
          muscleMassPct: latestEntry.muscleMassPct,
          heightCm: latestEntry.heightCm,
        }}
        submitLabel="Guardar cambios"
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
