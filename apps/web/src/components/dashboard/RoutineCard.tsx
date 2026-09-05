import { EmptyState } from "@/components/dashboard/EmptyState";

export function RoutineCard() {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="oklch(0.72 0.15 255)"
          strokeWidth="2"
          strokeLinecap="round"
          className="flex-none"
        >
          <path d="M6 7v10M2 9v6M22 9v6M18 7v10M6 12h12" />
        </svg>
        <div className="text-xs font-semibold uppercase tracking-wide text-label">Rutina de hoy</div>
      </div>
      <EmptyState
        title="No hay una rutina programada"
        description="Cuando conectemos Gym Tracker vas a ver aquí la rutina del día y si ya la completaste."
      />
    </div>
  );
}
