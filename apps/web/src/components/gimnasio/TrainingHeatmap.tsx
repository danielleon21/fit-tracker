import type { WorkoutSession } from "@fit-tracker/types";
import { toIsoDateLocal } from "@/lib/date";

const WEEKS = 53;

// El nivel 0 (sin actividad) usa el mismo tono que "border" — el contenedor
// de la heatmap es bg-surface, así que un color igual o más oscuro se
// fundiría con el fondo y dejaría "flotando" solo las celdas con actividad.
const LEVEL_COLORS = [
  "oklch(0.34 0.03 288)",
  "oklch(0.72 0.15 255 / 30%)",
  "oklch(0.72 0.15 255 / 55%)",
  "oklch(0.72 0.15 255 / 78%)",
  "oklch(0.72 0.15 255 / 100%)",
];

const MONTH_LABELS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

interface HeatmapDay {
  date: string;
  count: number;
  level: number;
}

function levelForCount(count: number): number {
  if (count <= 0) return 0;
  if (count <= 8) return 1;
  if (count <= 16) return 2;
  if (count <= 24) return 3;
  return 4;
}

// Extrae el mes directamente del string "YYYY-MM-DD" en vez de reconstruir un
// `Date` (que interpretaría la fecha sin hora como UTC y podría correrse un
// día en husos horarios detrás de UTC).
function monthOf(iso: string): number {
  return Number(iso.slice(5, 7)) - 1;
}

function buildWeeks(countsByDate: Map<string, number>): (HeatmapDay | null)[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const gridEnd = new Date(today);
  gridEnd.setDate(today.getDate() + (6 - today.getDay())); // sábado de la semana actual

  const gridStart = new Date(gridEnd);
  gridStart.setDate(gridEnd.getDate() - (WEEKS * 7 - 1)); // domingo, WEEKS semanas atrás

  const weeks: (HeatmapDay | null)[][] = [];
  const cursor = new Date(gridStart);
  for (let w = 0; w < WEEKS; w += 1) {
    const week: (HeatmapDay | null)[] = [];
    for (let d = 0; d < 7; d += 1) {
      if (cursor > today) {
        week.push(null);
      } else {
        const iso = toIsoDateLocal(cursor);
        const count = countsByDate.get(iso) ?? 0;
        week.push({ date: iso, count, level: levelForCount(count) });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function formatCellDate(iso: string) {
  // Sin "Z" al final: se interpreta como medianoche LOCAL, no UTC.
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

interface TrainingHeatmapProps {
  sessions: WorkoutSession[];
}

export function TrainingHeatmap({ sessions }: TrainingHeatmapProps) {
  const countsByDate = new Map<string, number>();
  for (const session of sessions) {
    const key = session.date.slice(0, 10);
    countsByDate.set(key, (countsByDate.get(key) ?? 0) + session.sets.length);
  }

  const weeks = buildWeeks(countsByDate);

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1.5">
        <div className="flex gap-[3px]">
          {weeks.map((week, weekIndex) => {
            const firstDay = week.find((day) => day !== null);
            const prevWeek = weekIndex > 0 ? weeks[weekIndex - 1] : undefined;
            const prevFirstDay = prevWeek?.find((day) => day !== null);
            const showLabel = firstDay && (!prevFirstDay || monthOf(firstDay.date) !== monthOf(prevFirstDay.date));
            return (
              <div key={weekIndex} className="w-[11px] flex-none text-[10px] text-placeholder">
                {showLabel && firstDay ? MONTH_LABELS[monthOf(firstDay.date)] : ""}
              </div>
            );
          })}
        </div>

        <div className="flex gap-[3px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day, dayIndex) =>
                day ? (
                  <div
                    key={day.date}
                    title={`${formatCellDate(day.date)} — ${day.count} ${day.count === 1 ? "serie" : "series"}`}
                    className="h-[11px] w-[11px] rounded-[2px]"
                    style={{ backgroundColor: LEVEL_COLORS[day.level] }}
                  />
                ) : (
                  <div key={dayIndex} className="h-[11px] w-[11px]" />
                ),
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-placeholder">
          <span>Menos</span>
          {LEVEL_COLORS.map((color) => (
            <div key={color} className="h-[11px] w-[11px] rounded-[2px]" style={{ backgroundColor: color }} />
          ))}
          <span>Más</span>
        </div>
      </div>
    </div>
  );
}
