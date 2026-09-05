import { EmptyState } from "@/components/dashboard/EmptyState";

export function CaloriesCard() {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-label">Calorías de hoy</div>
      <EmptyState
        title="Sin registro de comidas"
        description="Cuando conectemos Nutrition Tracker vas a ver aquí lo consumido y lo restante del día."
      />
    </div>
  );
}
