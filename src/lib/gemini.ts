import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function validateIsFace(imageBase64: string): Promise<{ isFace: boolean; reason?: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
          {
            text: "Is this a clear, single human face photo? JSON: { \"isFace\": boolean, \"reason\": \"str\" }",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "{ \"isFace\": false, \"reason\": \"error\" }");
    return result;
  } catch (error) {
    console.error("Gemini Validation Error:", error);
    return { isFace: false, reason: "Service unavailable" };
  }
}
