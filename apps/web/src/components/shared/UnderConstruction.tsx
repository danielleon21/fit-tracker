import Link from "next/link";

interface UnderConstructionProps {
  /** Nombre del módulo en pausa, ej. "Nutrición". */
  moduleName: string;
}

export function UnderConstruction({ moduleName }: UnderConstructionProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
          <svg
            aria-hidden
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <div className="font-serif text-sm italic text-accent">Fit Tracker · {moduleName}</div>
        <h1 className="font-serif text-2xl font-semibold text-ink">En construcción</h1>
        <p className="max-w-xs text-sm text-muted">
          Estamos ajustando esta sección para que funcione mejor. Vuelve pronto.
        </p>
        <Link
          href="/"
          className="mt-2 text-sm font-semibold text-accent hover:text-accent-hover hover:underline"
        >
          ← Volver al dashboard
        </Link>
      </div>
    </div>
  );
}
