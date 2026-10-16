const ALLOWED_ORIGIN = "https://suyao664-cloud.github.io";
const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    const json = (data, status = 200) =>
      Response.json(data, {
        status,
        headers: { ...cors, "Cache-Control": "no-store" },
      });
    if (
      new URL(request.url).pathname !== "/chat" ||
      request.method !== "POST"
    ) {
      return json({ error: "Use POST /chat" }, 404);
    }
    if (request.headers.get("Origin") !== ALLOWED_ORIGIN) {
      return json({ error: "Origin not allowed" }, 403);
    }
    try {
      const payload = await request.json();
      const message = payload?.message;
      if (
        typeof message !== "string" ||
        !message.trim() ||
        message.length > 2000
      ) {
        return json({ error: "Message must be 1–2000 characters" }, 400);
      }
      if (!env.AI) return json({ error: "Workers AI binding missing" }, 500);
      const result = await env.AI.run(MODEL, {
        messages: [
          {
            role: "system",
            content:
              "你叫栖宴，是一位温柔、可靠、自然的中文聊天伙伴。回复简短亲切，通常一至三句话。不要声称自己是真人。",
          },
          { role: "user", content: message.trim() },
        ],
        max_tokens: 256,
      });
      return json({ reply: result?.response || "我在，慢慢说。" });
} catch (error) {
  console.error("AI ERROR:", error);
  return json({ error: "AI request failed" }, 500);
    }
},
};
