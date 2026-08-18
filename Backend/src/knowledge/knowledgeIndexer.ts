// src/knowledge/knowledgeIndexer.ts

import {
  GREETINGS,
  SMALL_TALKS,
  GREETING_RESPONSE,
  THANKS_RESPONSE,
  BYE_RESPONSE,
} from "../prompts/knowledge.prompt";

export type KnowledgeIntent =
  | "greeting"
  | "thanks"
  | "goodbye"
  | "company_faq"
  | "continue";

export interface KnowledgeResult {
  intent: KnowledgeIntent;
  response?: string;
}

export function knowledgeIndexer(message: string): KnowledgeResult {
  const text = message.trim().toLowerCase();

  if (GREETINGS.includes(text)) {
    return {
      intent: "greeting",
      response: GREETING_RESPONSE,
    };
  }

  if (text === "thanks" || text === "thank you") {
    return {
      intent: "thanks",
      response: THANKS_RESPONSE,
    };
  }

  if (text === "bye" || text === "goodbye" || text === "see you") {
    return {
      intent: "goodbye",
      response: BYE_RESPONSE,
    };
  }

  return {
    intent: "continue",
  };
}