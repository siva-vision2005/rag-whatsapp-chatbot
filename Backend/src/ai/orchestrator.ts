import { aiService } from "../services/ai.service";
import { buildOrchestratorPrompt } from "../prompts/orchestrator.prompt";

export interface OrchestratorResult {
  action:
    | "greeting"
    | "goodbye"
    | "thanks"
    | "general_ai"
    | "product_search"
    | "product_details"
    | "compare_products"
    | "recommend_products"
    | "company_knowledge"
    | "support"
    | "unknown";

  confidence: number;
  reason: string;
}

export async function orchestrator(
  customerMessage: string,
  conversationHistory: string
): Promise<OrchestratorResult> {
  try {
    const prompt = buildOrchestratorPrompt(
      customerMessage,
      conversationHistory
    );

    const result =
      await aiService.generateJson<OrchestratorResult>(
        prompt,
        "gemini-2.5-flash"
      );

    const response: OrchestratorResult = {
      action: result.action ?? "unknown",
      confidence:
        typeof result.confidence === "number" ? result.confidence : 0,
      reason: result.reason ?? "",
    };

    console.log("\n========== AI ORCHESTRATOR ==========");
    console.dir(response, { depth: null });
    console.log("=====================================\n");

    return response;
  } catch (error) {
    console.error("Orchestrator Error");
    console.error(error);

    return {
      action: "unknown",
      confidence: 0,
      reason: "Failed to classify request.",
    };
  }
}