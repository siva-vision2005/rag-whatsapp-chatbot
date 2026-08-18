import { ProviderManager } from "../providers/ProviderManager";

class AIService {

  private providerManager = new ProviderManager();

  async generateText(
    prompt: string,
    model?: string
  ): Promise<string> {
    return this.providerManager.generateText(
      prompt,
      model
    );
  }

  async generateJson<T>(
    prompt: string,
    model?: string
  ): Promise<T> {
    return this.providerManager.generateJson<T>(
      prompt,
      model
    );
  }

  async embed(text: string): Promise<number[]> {
    return this.providerManager.embed(text);
  }
}

export const aiService = new AIService();