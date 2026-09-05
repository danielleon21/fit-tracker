"use client";

import { useEffect, useState } from "react";

export function AppHeader({ userInitial }: { userInitial: string }) {
  const [todayLabel, setTodayLabel] = useState("");

  useEffect(() => {
    setTodayLabel(new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-0.5">
        <div className="font-serif text-sm italic text-accent">Fit Tracker</div>
        <div className="font-serif text-2xl font-semibold text-ink">Tu progreso hoy</div>
      </div>
      <div className="flex items-center justify-between gap-3.5 sm:justify-end">
        <div className="text-sm capitalize text-muted">{todayLabel}</div>
        <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-accent text-[15px] font-bold text-accent-ink">
          {userInitial}
        </div>
      </div>
    </div>
  );
}
