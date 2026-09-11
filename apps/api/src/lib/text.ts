/** Quita acentos y diéresis, y la tilde de la ñ: "jalapeño" → "jalapeno", "maíz" → "maiz". */
export function stripAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
