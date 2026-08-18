import { aiService } from "../services/ai.service";
import { buildQueryUnderstandingPrompt } from "./queryUnderstanding.prompt";
import { QueryUnderstandingResult } from "./types";

export async function queryUnderstanding(
  customerMessage: string,
  catalogMetadata: any,
  conversationState: Record<string, any>
): Promise<QueryUnderstandingResult> {
  try {
    const prompt = buildQueryUnderstandingPrompt(
      customerMessage,
      catalogMetadata,
      conversationState
    );

    const result =
      await aiService.generateJson<QueryUnderstandingResult>(
        prompt
      );

    console.log("\n========== QUERY UNDERSTANDING ==========");
    console.log(JSON.stringify(result, null, 2));
    console.log("=========================================\n");

    return {
      semanticQuery:
        typeof result.semanticQuery === "string"
          ? result.semanticQuery
          : customerMessage,

      filters:
        result.filters && typeof result.filters === "object"
          ? result.filters
          : {},

      keywords: Array.isArray(result.keywords)
        ? result.keywords
        : [],

      readyForSearch:
        typeof (result as any).readyForSearch === "boolean"
          ? (result as any).readyForSearch
          : true,

      nextQuestion:
        typeof (result as any).nextQuestion === "string"
          ? (result as any).nextQuestion
          : null,

      reasoning:
        typeof result.reasoning === "string"
          ? result.reasoning
          : "",
    } as QueryUnderstandingResult & {
      readyForSearch: boolean;
      nextQuestion: string | null;
    };
  } catch (error) {
    console.error("Query Understanding Error");
    console.error(error);

    return {
      semanticQuery: customerMessage,
      filters: {},
      keywords: [],
      reasoning: "Fallback",
      readyForSearch: true,
      nextQuestion: null,
    } as QueryUnderstandingResult & {
      readyForSearch: boolean;
      nextQuestion: string | null;
    };
  }
}