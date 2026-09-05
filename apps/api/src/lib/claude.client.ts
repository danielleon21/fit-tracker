const ANTHROPIC_BASE_URL = "https://api.anthropic.com/v1";

// Extraccion de PDFs de la nutriologa (texto plano -> JSON estructurado) via Claude API.
export const claudeClient = {
  async extractStructuredData(prompt: string) {
    const res = await fetch(`${ANTHROPIC_BASE_URL}/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
    return res.json();
  },
};
