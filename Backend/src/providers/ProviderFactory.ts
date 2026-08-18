import { AIProvider } from "./AIProvider";
import { GeminiProvider } from "./GeminiProvider";
import { GroqProvider } from "./GroqProvider";
import { ClaudeProvider } from "./ClaudeProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { DeepSeekProvider } from "./DeepSeekProvider";

export class ProviderFactory {
  static getProvider(providerName?: string): AIProvider {
    const provider = (
      providerName ??
      process.env.AI_PROVIDER ??
      "gemini"
    ).toLowerCase();

    switch (provider) {
      case "gemini":
        console.log("✨ Using Gemini Provider");
        return new GeminiProvider();

      case "groq":
        console.log("🚀 Using Groq Provider");
        return new GroqProvider();

      case "claude":
        console.log("🤖 Using Claude Provider");
        return new ClaudeProvider();

      case "openai":
        console.log("🧠 Using OpenAI Provider");
        return new OpenAIProvider();

      case "deepseek":
        console.log("🌊 Using DeepSeek Provider");
        return new DeepSeekProvider();

      default:
        console.warn(
          `⚠ Unknown provider "${provider}". Falling back to Gemini.`
        );
        return new GeminiProvider();
    }
  }
}