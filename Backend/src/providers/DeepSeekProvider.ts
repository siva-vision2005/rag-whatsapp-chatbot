import OpenAI from "openai";
import { AIProvider } from "./AIProvider";

// DeepSeek is OpenAI-compatible — we just point the baseURL at their API
const DEFAULT_DEEPSEEK_MODEL = "deepseek-chat";

export class DeepSeekProvider implements AIProvider {

  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com/v1",
    });
  }

  async generateText(
    prompt: string,
    model = DEFAULT_DEEPSEEK_MODEL
  ): Promise<string> {

    const response = await this.client.chat.completions.create({
      model,
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
    model = DEFAULT_DEEPSEEK_MODEL
  ): Promise<T> {

    const response = await this.client.chat.completions.create({
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
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    return JSON.parse(text) as T;
  }

  async embed(_text: string): Promise<number[]> {
    throw new Error(
      "DeepSeek does not support embeddings. Use Gemini for embeddings."
    );
  }
}
