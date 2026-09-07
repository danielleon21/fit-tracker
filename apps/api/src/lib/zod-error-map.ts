import { z, ZodIssueCode } from "zod";

// Traduce los mensajes por default de Zod al español. Se registra una sola
// vez (ver el `z.setErrorMap` al importar este módulo) y aplica a todos los
// schemas de la app — así cualquier validación, presente o futura, sale en
// español sin tener que tocar cada `.min()`/`.positive()` por separado.
//
// Un mensaje explícito en el propio schema (ej. `.min(1, "mensaje")`) sigue
// ganándole a este mapa — Zod solo lo usa cuando no hay uno más específico.
const TYPE_LABELS: Record<string, string> = {
  string: "texto",
  number: "número",
  boolean: "booleano",
  array: "lista",
  date: "fecha",
  object: "objeto",
  undefined: "nada",
  null: "nulo",
};

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export const spanishErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === "undefined") {
        return { message: "Este campo es obligatorio." };
      }
      return { message: `Se esperaba ${typeLabel(issue.expected)}, se recibió ${typeLabel(issue.received)}.` };

    case ZodIssueCode.too_small: {
      const { type, minimum, inclusive } = issue;
      if (type === "string") {
        return minimum === 1
          ? { message: "Este campo es obligatorio." }
          : { message: `Debe tener ${inclusive ? "al menos" : "más de"} ${minimum} caracteres.` };
      }
      if (type === "number") {
        return { message: `Debe ser ${inclusive ? "mayor o igual a" : "mayor que"} ${minimum}.` };
      }
      if (type === "array") {
        return { message: `Debe tener ${inclusive ? "al menos" : "más de"} ${minimum} elemento(s).` };
      }
      return { message: ctx.defaultError };
    }

    case ZodIssueCode.too_big: {
      const { type, maximum, inclusive } = issue;
      if (type === "string") {
        return { message: `Debe tener ${inclusive ? "como máximo" : "menos de"} ${maximum} caracteres.` };
      }
      if (type === "number") {
        return { message: `Debe ser ${inclusive ? "menor o igual a" : "menor que"} ${maximum}.` };
      }
      if (type === "array") {
        return { message: `Debe tener ${inclusive ? "como máximo" : "menos de"} ${maximum} elemento(s).` };
      }
      return { message: ctx.defaultError };
    }

    case ZodIssueCode.invalid_string: {
      const { validation } = issue;
      if (validation === "email") return { message: "Debe ser un email válido." };
      if (validation === "url") return { message: "Debe ser una URL válida." };
      if (validation === "date") return { message: "Debe ser una fecha válida (YYYY-MM-DD)." };
      return { message: "Formato inválido." };
    }

    default:
      return { message: ctx.defaultError };
  }
};

z.setErrorMap(spanishErrorMap);
