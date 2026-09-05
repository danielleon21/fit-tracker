interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  children?: React.ReactNode;
}

export function StatCard({ label, value, unit, children }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-label">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <div className="font-serif text-3xl font-semibold text-ink">{value}</div>
        <div className="text-sm font-medium text-muted">{unit}</div>
      </div>
      {children}
    </div>
  );
}
