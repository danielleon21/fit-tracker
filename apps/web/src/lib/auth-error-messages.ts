import { ApiError } from "@/lib/api-client";

const MESSAGES_BY_CODE: Record<string, string> = {
  CONFLICT: "Ya existe una cuenta con ese email.",
  UNAUTHORIZED: "Email o contraseña incorrectos.",
  VALIDATION_ERROR: "Revisa los datos ingresados.",
};

export function toAuthErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return (error.code && MESSAGES_BY_CODE[error.code]) ?? "No se pudo completar la operación.";
  }
  return error instanceof Error ? error.message : "Error desconocido";
}
