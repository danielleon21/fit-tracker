interface DeltaPillProps {
  direction: "up" | "down" | "neutral";
  children: React.ReactNode;
}

const STYLES_BY_DIRECTION: Record<DeltaPillProps["direction"], string> = {
  up: "bg-success-bg text-success",
  down: "bg-danger-bg text-danger",
  neutral: "bg-muted-bg text-muted",
};

export function DeltaPill({ direction, children }: DeltaPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 self-start rounded-full px-2.5 py-1 text-xs font-bold ${STYLES_BY_DIRECTION[direction]}`}
    >
      {direction !== "neutral" ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {direction === "up" ? <path d="M12 19V5M5 12l7-7 7 7" /> : <path d="M12 5v14M5 12l7 7 7-7" />}
        </svg>
      ) : null}
      {children}
    </span>
  );
}
