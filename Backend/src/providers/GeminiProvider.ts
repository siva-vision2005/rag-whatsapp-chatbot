import { AIProvider } from "./AIProvider";
import { generateWithRetry } from "../utils/gemini.retry";
import { gemini } from "../config/gemini";

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

export class GeminiProvider implements AIProvider {

  async generateText(
    prompt: string,
    _model?: string
  ): Promise<string> {
    let lastError: any = null;

    for (const model of GEMINI_MODELS) {
      try {
        const response = await generateWithRetry({
          model,
          prompt,
        });

        return response.text ?? "";
      } catch (err: any) {
        lastError = err;
        console.warn(`⚠️ Gemini model ${model} failed (${err?.status ?? err?.code ?? err?.message}). Trying next Gemini model...`);
      }
    }

    throw lastError ?? new Error("All Gemini models failed");
  }

  async generateJson<T>(
    prompt: string,
    _model?: string
  ): Promise<T> {
    let lastError: any = null;

    for (const model of GEMINI_MODELS) {
      try {
        const response = await generateWithRetry({
          model,
          prompt,
          responseMimeType: "application/json",
        });

        const cleaned = (response.text ?? "{}")
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        return JSON.parse(cleaned) as T;
      } catch (err: any) {
        lastError = err;
        console.warn(`⚠️ Gemini model ${model} failed (${err?.status ?? err?.code ?? err?.message}). Trying next Gemini model...`);
      }
    }

    throw lastError ?? new Error("All Gemini models failed");
  }

  async embed(text: string): Promise<number[]> {
    const response = await gemini.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    const vector = response.embeddings?.[0]?.values;

    if (!vector) {
      throw new Error("Embedding generation failed.");
    }

    return vector;
  }
}