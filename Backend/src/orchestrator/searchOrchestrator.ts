export type OrchestratorAction =
  | "SEARCH"
  | "ASK_QUESTION"
  | "GENERAL_KNOWLEDGE"
  | "PRODUCT_COMPARISON"
  | "COMPANY_INFORMATION"
  | "SUPPORT"
  | "GREETING"
  | "FEEDBACK"
  | "COMPLAINT"
  | "UNKNOWN";

export interface SearchOrchestratorResult {
  action: OrchestratorAction;
  entities: Record<string, any>;
  question?: string;
}

interface ConversationResult {
  intent: string;
  entities: Record<string, any>;
}

export function searchOrchestrator(
  conversation: ConversationResult,
  conversationState: Record<string, any>,
  catalogMetadata: any
): SearchOrchestratorResult {

  //----------------------------------------
  // Merge Previous + Current Entities
  //----------------------------------------

  const entities = {
    ...conversationState,
    ...(conversation.entities ?? {}),
  };

  //----------------------------------------
  // Route by Intent
  //----------------------------------------

  switch (conversation.intent) {

    case "greeting":
      return {
        action: "GREETING",
        entities,
      };

    case "general_knowledge":
      return {
        action: "GENERAL_KNOWLEDGE",
        entities,
      };

    case "product_comparison":
      return {
        action: "PRODUCT_COMPARISON",
        entities,
      };

    case "company_information":
      return {
        action: "COMPANY_INFORMATION",
        entities,
      };

    case "support":
      return {
        action: "SUPPORT",
        entities,
      };

    case "feedback":
      return {
        action: "FEEDBACK",
        entities,
      };

    case "complaint":
      return {
        action: "COMPLAINT",
        entities,
      };

    case "product_search":
      return decideSearch(
        entities,
        catalogMetadata
      );

    default:
      return {
        action: "UNKNOWN",
        entities,
      };
  }
}

function decideSearch(
  entities: Record<string, any>,
  catalogMetadata: any
): SearchOrchestratorResult {

  const questions =
    catalogMetadata?.recommendedQuestions ?? [];

  if (!Array.isArray(questions)) {
    return {
      action: "SEARCH",
      entities,
    };
  }

  //----------------------------------------
  // Ask Missing Recommended Question
  //----------------------------------------

  for (const item of questions) {

    if (!item) continue;

    const field = item.field;
    const question = item.question;

    if (
      typeof field !== "string" ||
      typeof question !== "string"
    ) {
      continue;
    }

    if (
      entities[field] === undefined ||
      entities[field] === null ||
      entities[field] === ""
    ) {
      return {
        action: "ASK_QUESTION",
        entities,
        question,
      };
    }

  }

  //----------------------------------------
  // Enough Information
  //----------------------------------------

  return {
    action: "SEARCH",
    entities,
  };
}