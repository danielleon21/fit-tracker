"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ExerciseProgressEntry } from "@fit-tracker/types";
import { bestWeightForEntry } from "@/lib/exercise-progress";

const ACCENT = "oklch(0.72 0.15 255)";
const GRID = "oklch(0.34 0.03 288 / 40%)";
const MUTED = "oklch(0.65 0.02 288)";

interface ChartPoint {
  label: string;
  bestWeight: number | null;
}

// `iso` es una fecha sin hora (medianoche UTC) — se fija timeZone: "UTC" para
// que no se recorra un día al formatear en zonas horarias detrás de UTC.
function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  const point = payload?.[0]?.payload;
  if (!active || !point || point.bestWeight == null) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      <div className="font-semibold text-ink">{point.bestWeight} kg</div>
      <div className="text-muted">{point.label}</div>
    </div>
  );
}

interface ExerciseProgressChartProps {
  entries: ExerciseProgressEntry[];
}

export function ExerciseProgressChart({ entries }: ExerciseProgressChartProps) {
  const points: ChartPoint[] = entries.map((entry) => ({
    label: formatShortDate(entry.date),
    bestWeight: bestWeightForEntry(entry),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="label" stroke={MUTED} tick={{ fontSize: 12, fill: MUTED }} tickLine={false} axisLine={false} />
          <YAxis stroke={MUTED} tick={{ fontSize: 12, fill: MUTED }} tickLine={false} axisLine={false} width={40} />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="bestWeight"
            stroke={ACCENT}
            strokeWidth={2.5}
            dot={{ r: 4, fill: ACCENT, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
