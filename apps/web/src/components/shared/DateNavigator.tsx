"use client";

import { useRef } from "react";
import { addDaysIso, formatDayLabel, formatLongDate, todayIsoLocal } from "@/lib/date";

interface DateNavigatorProps {
  /** Día seleccionado, YYYY-MM-DD. */
  date: string;
  onChange: (date: string) => void;
  /** Último día navegable, YYYY-MM-DD. Por defecto hoy. */
  maxDate?: string;
}

const arrowClass =
  "flex h-9 w-9 flex-none items-center justify-center rounded-xl text-lg text-muted hover:bg-surface-2 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted";

export function DateNavigator({ date, onChange, maxDate = todayIsoLocal() }: DateNavigatorProps) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const today = todayIsoLocal();
  const label = formatDayLabel(date);
  // Con "Hoy"/"Ayer" la fecha exacta queda de subtítulo; en los demás días el
  // label ya es la fecha larga y repetirla sobraría.
  const subtitle = date === today || date === addDaysIso(today, -1) ? formatLongDate(date) : null;

  function openPicker() {
    const input = pickerRef.current;
    if (!input) return;
    try {
      input.showPicker();
    } catch {
      // Navegadores sin showPicker(): al menos enfocar el input nativo.
      input.focus();
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-2">
      <button type="button" onClick={() => onChange(addDaysIso(date, -1))} aria-label="Día anterior" className={arrowClass}>
        ‹
      </button>

      <button
        type="button"
        onClick={openPicker}
        className="relative flex flex-1 flex-col items-center rounded-xl px-2 py-1 hover:bg-surface-2"
      >
        <span className="font-serif text-base font-semibold text-ink first-letter:uppercase">{label}</span>
        {subtitle ? <span className="text-[11px] text-muted">{subtitle}</span> : null}
        <input
          ref={pickerRef}
          type="date"
          value={date}
          max={maxDate}
          tabIndex={-1}
          aria-hidden
          onChange={(event) => {
            if (event.target.value) onChange(event.target.value);
          }}
          className="pointer-events-none absolute inset-0 opacity-0"
        />
      </button>

      {date !== today ? (
        <button
          type="button"
          onClick={() => onChange(today)}
          className="rounded-full border border-border-2 px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink"
        >
          Hoy
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => onChange(addDaysIso(date, 1))}
        disabled={date >= maxDate}
        aria-label="Día siguiente"
        className={arrowClass}
      >
        ›
      </button>
    </div>
  );
}
