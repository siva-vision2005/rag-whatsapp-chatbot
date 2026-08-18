import { aiService } from "../services/ai.service";
import { buildIntentClassifierPrompt } from "../prompts/intentClassifier.prompt";

export type IntentType =
  | "greeting"
  | "small_talk"
  | "company_information"
  | "product_search"
  | "product_comparison"
  | "recommendation"
  | "general_knowledge"
  | "support"
  | "order_status"
  | "feedback"
  | "complaint"
  | "contact_human"
  | "unknown";

export interface IntentClassifierResult {
  intent: IntentType;
}

export async function intentClassifier(
  message: string
): Promise<IntentClassifierResult> {
  try {
    const prompt = buildIntentClassifierPrompt(message);

    const result =
      await aiService.generateJson<IntentClassifierResult>(prompt);

    console.log("\n========== Intent Classifier ==========");
    console.log("Message :", message);
    console.log("Intent  :", result.intent);
    console.log("=======================================\n");

    return {
      intent: result.intent ?? "unknown",
    };
  } catch (error) {
    console.error("Intent Classifier Error");
    console.error(error);

    return {
      intent: "unknown",
    };
  }
}