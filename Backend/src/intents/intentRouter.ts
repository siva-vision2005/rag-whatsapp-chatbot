// src/intents/intentRouter.ts

export type IntentType =
  | "greeting"
  | "small_talk"
  | "company_faq"
  | "product_search"
  | "product_compare"
  | "general_knowledge"
  | "human_support"
  | "order_status";

export function routeIntent(message: string): IntentType {
  const text = message.toLowerCase().trim();

  // Greeting
  if (
    ["hi", "hello", "hey", "good morning", "good evening"].includes(text)
  ) {
    return "greeting";
  }

  // Small talk
  if (
    ["thanks", "thank you", "bye", "goodbye", "ok", "okay"].includes(text)
  ) {
    return "small_talk";
  }

  // Company FAQ
  if (
    /(working hours|office|contact|email|phone|address|website|warranty|return|shipping)/i.test(
      text
    )
  ) {
    return "company_faq";
  }

  // Product comparison
  if (
    /(compare|vs|versus|better than|which is better)/i.test(text)
  ) {
    return "product_compare";
  }

  // Product search
  if (
    /(laptop|computer|notebook|gaming|ram|ssd|processor|i5|i7|i9|ryzen|dell|hp|asus|lenovo)/i.test(
      text
    )
  ) {
    return "product_search";
  }

  return "general_knowledge";
}