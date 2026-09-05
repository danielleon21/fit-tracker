"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthUser, LoginInput, RegisterInput } from "@fit-tracker/types";
import { apiFetch } from "@/lib/api-client";
import { toAuthErrorMessage } from "@/lib/auth-error-messages";

interface SessionResponse {
  user?: AuthUser;
  expires?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = await apiFetch<SessionResponse>("/api/auth/session");
      setUser(session.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    setError(null);
    try {
      const { data } = await apiFetch<{ data: AuthUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setUser(data);
      return data;
    } catch (err) {
      setError(toAuthErrorMessage(err));
      throw err;
    }
  }, []);

  const register = useCallback(
    async (input: RegisterInput) => {
      setError(null);
      try {
        await apiFetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(input),
        });
        return login({ email: input.email, password: input.password });
      } catch (err) {
        setError(toAuthErrorMessage(err));
        throw err;
      }
    },
    [login],
  );

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, isLoading, error, login, register, logout, refresh };
}
