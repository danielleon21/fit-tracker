import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DomainError } from "@/errors/domain-errors";

export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof DomainError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.httpStatus });
  }

  if (error instanceof ZodError) {
    // `.flatten()` pierde la ruta en campos anidados (ej. "exercises.2.targetWeightKg"
    // dentro de un array) — se arma el mensaje desde `issues` directamente para que
    // el frontend pueda mostrar algo específico en vez de un genérico "Invalid input".
    const message = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    return NextResponse.json(
      { error: message || "Invalid input", code: "VALIDATION_ERROR", issues: error.flatten() },
      { status: 400 },
    );
  }

  console.error(error);
  return NextResponse.json(
    { error: "Internal server error", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}
