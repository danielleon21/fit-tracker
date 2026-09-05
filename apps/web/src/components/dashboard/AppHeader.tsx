"use client";

import { useEffect, useRef, useState } from "react";

interface AppHeaderProps {
  userInitial: string;
  userLabel: string;
  onLogout: () => void;
}

export function AppHeader({ userInitial, userLabel, onLogout }: AppHeaderProps) {
  const [todayLabel, setTodayLabel] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTodayLabel(new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-0.5">
        <div className="font-serif text-sm italic text-accent">Fit Tracker</div>
        <div className="font-serif text-2xl font-semibold text-ink">Tu progreso hoy</div>
      </div>
      <div className="flex items-center justify-between gap-3.5 sm:justify-end">
        <div className="text-sm capitalize text-muted">{todayLabel}</div>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-accent text-[15px] font-bold text-accent-ink"
          >
            {userInitial}
          </button>
          {isMenuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-[46px] z-10 w-52 rounded-xl border border-border bg-surface p-2 shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
            >
              <div className="truncate px-2.5 py-1.5 text-xs text-muted">{userLabel}</div>
              <button
                type="button"
                role="menuitem"
                onClick={onLogout}
                className="w-full rounded-lg px-2.5 py-2 text-left text-sm font-semibold text-ink hover:bg-surface-2"
              >
                Cerrar sesión
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
