import { AIProvider } from "./AIProvider";
import { groq } from "../config/groq";

const GROQ_MODELS = [
  "openai/gpt-oss-20b",
  "groq/compound-mini",
  "openai/gpt-oss-120b",
  "groq/compound",
  "qwen/qwen3.6-27b"
];

export class GroqProvider implements AIProvider {

  async generateText(
    prompt: string,
    _model?: string
  ): Promise<string> {
    let lastError: any = null;

    for (const model of GROQ_MODELS) {
      try {
        const response = await groq.chat.completions.create({
          model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        return response.choices[0]?.message?.content ?? "";
      } catch (err: any) {
        lastError = err;
        console.warn(`⚠️ Groq model ${model} failed (${err?.status ?? err?.code ?? err?.message}). Trying next Groq model...`);
      }
    }

    throw lastError ?? new Error("All Groq models failed");
  }

  async generateJson<T>(
    prompt: string,
    _model?: string
  ): Promise<T> {
    let lastError: any = null;

    for (const model of GROQ_MODELS) {
      try {
        const response = await groq.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content: "Always return ONLY valid JSON. Never use markdown or code blocks.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: {
            type: "json_object",
          },
        });

        const text = response.choices[0]?.message?.content ?? "{}";
        return JSON.parse(text) as T;
      } catch (err: any) {
        lastError = err;
        console.warn(`⚠️ Groq model ${model} failed (${err?.status ?? err?.code ?? err?.message}). Trying next Groq model...`);
      }
    }

    throw lastError ?? new Error("All Groq models failed");
  }

  async embed(_text: string): Promise<number[]> {
    throw new Error(
      "Groq does not support embeddings. Use Gemini for embeddings."
    );
  }
}