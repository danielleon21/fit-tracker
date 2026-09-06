import type { WorkoutSession, WorkoutSetLog } from "@fit-tracker/types";

function formatSessionDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

interface ExerciseGroup {
  exerciseId: string;
  name: string;
  sets: WorkoutSetLog[];
}

function groupSetsByExercise(sets: WorkoutSetLog[]): ExerciseGroup[] {
  const groups = new Map<string, ExerciseGroup>();
  for (const set of sets) {
    const group = groups.get(set.exerciseId);
    if (group) {
      group.sets.push(set);
    } else {
      groups.set(set.exerciseId, { exerciseId: set.exerciseId, name: set.exercise.name, sets: [set] });
    }
  }
  return Array.from(groups.values());
}

interface WorkoutHistoryListProps {
  sessions: WorkoutSession[];
}

export function WorkoutHistoryList({ sessions }: WorkoutHistoryListProps) {
  const mostRecentFirst = [...sessions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <div className="flex flex-col gap-3">
      {mostRecentFirst.map((session) => {
        const exerciseGroups = groupSetsByExercise(session.sets);
        return (
          <div key={session.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-serif text-base font-semibold capitalize text-ink">
                {formatSessionDate(session.date)}
              </span>
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted">
                {session.routine?.name ?? "Sin rutina"}
              </span>
            </div>

            {exerciseGroups.length === 0 ? (
              <p className="text-xs text-placeholder">Sin series registradas.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {exerciseGroups.map((group) => (
                  <div key={group.exerciseId} className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-label">{group.name}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {group.sets.map((set) => (
                        <span
                          key={set.id}
                          className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted"
                        >
                          {set.weightKg != null ? `${set.weightKg} kg` : "—"} × {set.reps ?? "—"}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
