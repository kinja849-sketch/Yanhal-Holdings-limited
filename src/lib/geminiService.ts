/**
 * Yanhal Holdings Ltd — Gemini AI Backup Service
 * Automatically handles conversational completions when OpenAI is unavailable, rate-limited, or out of quota.
 */

export async function generateGeminiBackupResponse(
  systemInstruction: string,
  userMessage: string,
  history: Array<{ role: string; content: string }> = []
): Promise<string | null> {
  let geminiKey = process.env.GEMINI_API_KEY || "";
  try {
    if (!geminiKey && (import.meta as any).env?.VITE_GEMINI_API_KEY) {
      geminiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
    }
  } catch (_) {}

  if (!geminiKey || geminiKey === "MY_GEMINI_API_KEY") {
    return null;
  }

  try {
    const contents: any[] = [];

    // Prior dialogue history for continuous context
    if (history && history.length > 0) {
      for (const h of history.slice(-6)) {
        if (!h.content) continue;
        contents.push({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        });
      }
    }

    // Current user turn
    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey)}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 600,
        },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } else {
      console.warn("[Gemini Backup] Response status:", res.status);
    }
  } catch (err) {
    console.warn("[Gemini Backup] Request notice:", err);
  }

  return null;
}
