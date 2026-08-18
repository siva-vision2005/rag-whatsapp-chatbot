import OpenAI from "openai";
import { AIProvider } from "./AIProvider";

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

export class OpenAIProvider implements AIProvider {

  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private resolveModel(model?: string): string {
    if (
      !model ||
      model.startsWith("gemini") ||
      model.startsWith("llama") ||
      model.startsWith("claude") ||
      model.startsWith("deepseek") ||
      model.startsWith("gemma") ||
      model.startsWith("mixtral") ||
      model.startsWith("qwen")
    ) {
      return DEFAULT_OPENAI_MODEL;
    }
    return model;
  }

  async generateText(
    prompt: string,
    model?: string
  ): Promise<string> {
    const targetModel = this.resolveModel(model);

    const response = await this.client.chat.completions.create({
      model: targetModel,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.choices[0]?.message?.content ?? "";
  }

  async generateJson<T>(
    prompt: string,
    model?: string
  ): Promise<T> {
    const targetModel = this.resolveModel(model);

    const response = await this.client.chat.completions.create({
      model: targetModel,
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
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    return JSON.parse(text) as T;
  }

  async embed(_text: string): Promise<number[]> {
    throw new Error(
      "OpenAI embeddings are not configured. Use Gemini for embeddings."
    );
  }
}
