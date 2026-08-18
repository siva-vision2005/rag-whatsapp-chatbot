import Anthropic from "@anthropic-ai/sdk";
import { AIProvider } from "./AIProvider";

// Using active, non-deprecated Claude model
const DEFAULT_CLAUDE_MODEL = "claude-3-haiku-20240307";

export class ClaudeProvider implements AIProvider {

  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
  }

  async generateText(
    prompt: string,
    model = DEFAULT_CLAUDE_MODEL
  ): Promise<string> {

    const targetModel = model.includes("20241022") ? DEFAULT_CLAUDE_MODEL : model;

    const response = await this.client.messages.create({
      model: targetModel,
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const block = response.content[0];
    return block.type === "text" ? block.text : "";
  }

  async generateJson<T>(
    prompt: string,
    model = DEFAULT_CLAUDE_MODEL
  ): Promise<T> {

    const targetModel = model.includes("20241022") ? DEFAULT_CLAUDE_MODEL : model;
    const jsonPrompt = `${prompt}\n\nReturn ONLY valid JSON. No markdown, no backticks, no explanation.`;

    const text = await this.generateText(jsonPrompt, targetModel);

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned) as T;
  }

  async embed(_text: string): Promise<number[]> {
    throw new Error(
      "Claude does not support embeddings. Use Gemini for embeddings."
    );
  }
}
