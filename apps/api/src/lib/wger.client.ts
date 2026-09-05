const WGER_BASE_URL = "https://wger.de/api/v2";

// wger (CC-BY-SA 3.0): se importa una vez a la BD propia via script,
// no se consulta en vivo desde los Route Handlers. Ver CLAUDE.md.
export const wgerClient = {
  baseUrl: WGER_BASE_URL,

  async fetchExercises(params: { limit?: number; offset?: number } = {}) {
    const url = new URL(`${WGER_BASE_URL}/exercise/`);
    if (params.limit) url.searchParams.set("limit", String(params.limit));
    if (params.offset) url.searchParams.set("offset", String(params.offset));

    const res = await fetch(url, {
      headers: { Authorization: `Token ${process.env.WGER_API_KEY ?? ""}` },
    });
    if (!res.ok) throw new Error(`wger API error: ${res.status}`);
    return res.json();
  },
};
