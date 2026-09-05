"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function GimnasioPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-muted">Cargando…</div>;
  }

  return (
    <div className="min-h-screen bg-bg p-6 sm:p-12">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="font-serif text-sm italic text-accent">Fit Tracker</div>
            <div className="font-serif text-2xl font-semibold text-ink">Gimnasio</div>
          </div>
          <Link href="/" className="text-sm font-semibold text-accent hover:text-accent-hover hover:underline">
            ← Volver al dashboard
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <EmptyState
            title="Gym Tracker en construcción"
            description="Pronto vas a poder crear tus rutinas, ver tu progreso por ejercicio y tu historial de entrenamientos aquí."
          />
        </div>
      </div>
    </div>
  );
}
