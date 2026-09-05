import { Modal } from "@/components/shared/Modal";
import { ProgressEntryForm, type ProgressFormValues } from "@/components/dashboard/ProgressEntryForm";

interface ProgressOnboardingModalProps {
  onSubmit: (values: ProgressFormValues) => Promise<void>;
}

export function ProgressOnboardingModal({ onSubmit }: ProgressOnboardingModalProps) {
  return (
    <Modal title="Cuéntanos tu punto de partida">
      <p className="-mt-2 text-sm text-muted">
        Registra tus datos actuales para empezar a ver tu progreso. Puedes editarlos después desde tu perfil.
      </p>
      <ProgressEntryForm submitLabel="Guardar y continuar" onSubmit={onSubmit} />
    </Modal>
  );
}
