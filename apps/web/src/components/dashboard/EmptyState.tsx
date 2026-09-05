interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-6 text-center">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <div className="max-w-[260px] text-xs text-muted">{description}</div>
    </div>
  );
}
