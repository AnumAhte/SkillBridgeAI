import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from "@google/generative-ai";

/**
 * Gemini adapter. Features call ONLY this module — never the SDK directly —
 * so the model/provider is swappable. Falls back gracefully so a live demo
 * never breaks if the key is missing or the API errors.
 */

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const geminiAvailable = Boolean(API_KEY);

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export { SchemaType };

/**
 * Generate strictly-typed JSON using a responseSchema.
 * @returns parsed object of type T, or null if Gemini is unavailable/failed
 *          (caller is expected to supply a mock fallback).
 */
export async function generateJSON<T>(
  prompt: string,
  responseSchema: ResponseSchema,
): Promise<{ data: T | null; latencyMs: number }> {
  const start = Date.now();
  if (!genAI) return { data: null, latencyMs: 0 };
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.4,
      },
    });
    const res = await model.generateContent(prompt);
    const text = res.response.text();
    return { data: JSON.parse(text) as T, latencyMs: Date.now() - start };
  } catch (err) {
    console.error("[gemini] generateJSON failed, using fallback:", err);
    return { data: null, latencyMs: Date.now() - start };
  }
}

/** Streaming generation for the tutor. Returns null if unavailable. */
export async function generateStream(
  systemInstruction: string,
  history: { role: "user" | "assistant"; content: string }[],
): Promise<AsyncGenerator<string> | null> {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: MODEL, systemInstruction });
    const contents = history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const result = await model.generateContentStream({ contents });
    async function* stream() {
      for await (const chunk of result.stream) {
        const t = chunk.text();
        if (t) yield t;
      }
    }
    return stream();
  } catch (err) {
    console.error("[gemini] generateStream failed:", err);
    return null;
  }
}
