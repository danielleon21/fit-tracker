"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CreateHabitInput, Habit } from "@fit-tracker/types";
import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { todayIsoLocal } from "@/lib/date";
import { isDoneOn } from "@/lib/habit-progress";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { HabitListItem } from "@/components/habitos/HabitListItem";
import { HabitFormModal } from "@/components/habitos/HabitFormModal";

export default function HabitosPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { habits, isLoading: isHabitsLoading, addHabit, updateHabit, removeHabit, logDay, unlogDay } = useHabits();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-muted">Cargando…</div>;
  }

  async function handleCreate(input: CreateHabitInput) {
    await addHabit(input);
    setIsCreateOpen(false);
  }

  async function handleEditSubmit(input: CreateHabitInput) {
    if (!editingHabit) return;
    await updateHabit(editingHabit.id, input);
    setEditingHabit(null);
  }

  async function handleToggleToday(habit: Habit) {
    const today = todayIsoLocal();
    if (isDoneOn(habit, today)) {
      await unlogDay(habit.id, today);
    } else {
      await logDay(habit.id, today);
    }
  }

  return (
    <div className="min-h-screen bg-bg p-6 sm:p-12">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="font-serif text-sm italic text-accent">Fit Tracker</div>
            <div className="font-serif text-2xl font-semibold text-ink">Hábitos</div>
          </div>
          <Link href="/" className="text-sm font-semibold text-accent hover:text-accent-hover hover:underline">
            ← Volver al dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div className="font-serif text-lg font-semibold text-ink">Tus hábitos</div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink hover:bg-accent-hover"
          >
            + Crear hábito
          </button>
        </div>

        {isHabitsLoading ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
            Cargando tus hábitos…
          </div>
        ) : habits.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <EmptyState
              title="Aún no tienes hábitos"
              description="Crea el primero para empezar a llevar un seguimiento diario."
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {habits.map((habit) => (
              <HabitListItem
                key={habit.id}
                habit={habit}
                onToggleToday={handleToggleToday}
                onEdit={setEditingHabit}
                onDelete={removeHabit}
              />
            ))}
          </div>
        )}
      </div>

      {isCreateOpen ? (
        <HabitFormModal
          title="Nuevo hábito"
          submitLabel="Crear hábito"
          onSubmit={handleCreate}
          onClose={() => setIsCreateOpen(false)}
        />
      ) : null}

      {editingHabit ? (
        <HabitFormModal
          title="Editar hábito"
          submitLabel="Guardar cambios"
          initialHabit={editingHabit}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingHabit(null)}
        />
      ) : null}
    </div>
  );
}
