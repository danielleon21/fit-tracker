import { EmptyState } from "@/components/dashboard/EmptyState";

export function MacrosCard() {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-label">Macronutrientes</div>
      <EmptyState
        title="Aún no hay macros registrados"
        description="Proteína, carbohidratos y grasas del día van a aparecer aquí."
      />
    </div>
  );
}
