"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthModuleIcons } from "@/components/auth/AuthModuleIcons";
import { FormField } from "@/components/shared/FormField";

export default function LoginPage() {
  const router = useRouter();
  const { login, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await login({ email, password });
      router.push("/");
    } catch {
      // el error ya queda expuesto por useAuth()
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="flex flex-col gap-4">
        <AuthModuleIcons />
        <div className="flex flex-col gap-1.5">
          <div className="font-serif text-sm italic text-accent">Fit Tracker</div>
          <h1 className="font-serif text-[32px] font-semibold text-ink">Bienvenido de nuevo</h1>
          <p className="text-sm leading-relaxed text-muted">
            Tu espacio privado para seguir tu progreso.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <FormField
          id="password"
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-accent px-4 py-3.5 text-[15px] font-bold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {isSubmitting ? "Ingresando…" : "Iniciar sesión"}
        </button>
      </form>

      <div className="flex flex-col items-center gap-3">
        <div className="text-center text-sm text-muted">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="font-semibold text-accent hover:text-accent-hover hover:underline">
            Regístrate
          </Link>
        </div>
        <div className="text-center text-xs text-placeholder">Acceso privado, solo para el equipo.</div>
      </div>
    </AuthShell>
  );
}
