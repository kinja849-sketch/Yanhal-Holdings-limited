// Netlify serverless TTS endpoint (mirrors the Express route in server.ts)
type Handler = (event: any) => Promise<{
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
  isBase64Encoded?: boolean;
}>;

const json = (statusCode: number, obj: unknown) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(obj),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  let payload: any = {};
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const { text, voice } = payload;
  if (!text || typeof text !== "string") return json(400, { error: "Missing text for speech generation" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json(500, { error: "TTS key not configured" });

  const cleanText = text
    .replace(/[#*_~`]/g, "")
    .replace(/https?:\/\/\S+/g, "our website")
    .slice(0, 1000);

  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "tts-1", input: cleanText, voice: voice || "nova", speed: 1.0 }),
    });
    if (!res.ok) {
      console.error("[TTS API Error]:", res.status, await res.text());
      return json(res.status, { error: "TTS generation failed" });
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return {
      statusCode: 200,
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" },
      body: buf.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err: any) {
    return json(500, { error: err?.message || "Failed to generate speech" });
  }
};
