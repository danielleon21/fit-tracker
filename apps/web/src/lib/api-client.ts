// En dev sin NEXT_PUBLIC_API_URL definido, cae a localhost:3001 (el server de
// apps/api en local). En producción sin dominio propio, cae a "" (rutas
// relativas — mismo origen que apps/web) para que el rewrite de
// next.config.mjs las reenvíe a apps/api; nunca debería intentar localhost.
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "production" ? "" : "http://localhost:3001");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error ?? res.statusText, res.status, body?.code);
  }

  return res.json() as Promise<T>;
}
