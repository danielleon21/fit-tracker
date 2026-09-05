"use client";

import { useEffect } from "react";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  widthClassName?: string;
}

export function Modal({ title, children, onClose, widthClassName = "max-w-md" }: ModalProps) {
  useEffect(() => {
    if (!onClose) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex w-full ${widthClassName} max-h-[90vh] flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-[0_24px_64px_rgba(0,0,0,0.5)]`}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-ink">{title}</h2>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
