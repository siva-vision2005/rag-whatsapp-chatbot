import { AIProvider } from "./AIProvider";
import { ProviderFactory } from "./ProviderFactory";

/**
 * All supported providers in default priority order.
 * Primary provider will be placed at the head of the chain.
 */
const ALL_PROVIDERS = [
  "groq",
  "gemini",
  "claude",
  "openai",
  "deepseek",
];

function getStatusCode(error: any): number | string {
  return (
    error?.status ??
    error?.response?.status ??
    error?.code ??
    "unknown"
  );
}

export class ProviderManager {

  private primaryProviderName: string;

  constructor() {
    this.primaryProviderName = (
      process.env.AI_PROVIDER ?? "groq"
    ).toLowerCase();
  }

  /**
   * Returns the ordered fallback list starting from the primary provider,
   * followed by all other providers.
   */
  private getFallbackChain(): string[] {
    const primary = this.primaryProviderName;
    const rest = ALL_PROVIDERS.filter((p) => p !== primary);
    return [primary, ...rest];
  }

  async generateText(
    prompt: string,
    model?: string
  ): Promise<string> {

    const chain = this.getFallbackChain();

    for (let i = 0; i < chain.length; i++) {
      const providerName = chain[i];
      const provider: AIProvider = ProviderFactory.getProvider(providerName);

      try {
        const result = await provider.generateText(prompt, model);
        if (i > 0) {
          console.log(`✅ [${providerName.toUpperCase()}] generateText succeeded after fallback.`);
        }
        return result;
      } catch (error: any) {
        const status = getStatusCode(error);
        const isLast = i === chain.length - 1;

        console.warn(
          `⚠️  [${providerName.toUpperCase()}] generateText failed (status: ${status}, msg: ${error?.message ?? error}).`
        );

        if (isLast) {
          console.error(`❌ All providers exhausted. Throwing.`);
          throw error;
        }

        console.log(`🔄 Falling back to ${chain[i + 1].toUpperCase()}...`);
      }
    }

    throw new Error("All AI providers failed.");
  }

  async generateJson<T>(
    prompt: string,
    model?: string
  ): Promise<T> {

    const chain = this.getFallbackChain();

    for (let i = 0; i < chain.length; i++) {
      const providerName = chain[i];
      const provider: AIProvider = ProviderFactory.getProvider(providerName);

      try {
        const result = await provider.generateJson<T>(prompt, model);
        if (i > 0) {
          console.log(`✅ [${providerName.toUpperCase()}] generateJson succeeded after fallback.`);
        }
        return result;
      } catch (error: any) {
        const status = getStatusCode(error);
        const isLast = i === chain.length - 1;

        console.warn(
          `⚠️  [${providerName.toUpperCase()}] generateJson failed (status: ${status}, msg: ${error?.message ?? error}).`
        );

        if (isLast) {
          console.error(`❌ All providers exhausted. Throwing.`);
          throw error;
        }

        console.log(`🔄 Falling back to ${chain[i + 1].toUpperCase()}...`);
      }
    }

    throw new Error("All AI providers failed.");
  }

  // Embeddings always use Gemini — other providers don't support it
  async embed(text: string): Promise<number[]> {
    const gemini = ProviderFactory.getProvider("gemini");
    return gemini.embed(text);
  }
}