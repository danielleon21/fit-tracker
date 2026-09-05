import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DomainError } from "@/errors/domain-errors";

export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof DomainError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.httpStatus });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid input", code: "VALIDATION_ERROR", issues: error.flatten() },
      { status: 400 },
    );
  }

  console.error(error);
  return NextResponse.json(
    { error: "Internal server error", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}
