import { PlannerService } from "../ai/planner/planner.service";

const planner = new PlannerService();

export type ConversationIntent =
  | "product_discovery"
  | "product_information"
  | "product_action"
  | "product_comparison"
  | "recommendation"
  | "general_knowledge"
  | "company_information"
  | "support"
  | "greeting"
  | "feedback"
  | "complaint"
  | "unknown";

export interface ConversationManagerResult {
  intent: ConversationIntent;
  entities: Record<string, any>;
  plan?: any;
}

function mapPlannerIntent(intent: string): ConversationIntent {
  switch (intent) {
    case "product_search":
      return "product_discovery";

    case "recommendation":
      return "recommendation";

    case "product_information":
      return "product_information";

    case "product_action":
      return "product_action";

    case "product_comparison":
      return "product_comparison";

    case "general_knowledge":
      return "general_knowledge";

    case "company_information":
      return "company_information";

    case "support":
      return "support";

    case "greeting":
      return "greeting";

    case "feedback":
      return "feedback";

    case "complaint":
      return "complaint";

    default:
      return "unknown";
  }
}

export async function conversationManager(
  customerMessage: string,
  conversationHistory: string,
  conversationState: Record<string, any>
): Promise<ConversationManagerResult> {
  try {
    const plan = await planner.plan(
      customerMessage,
      conversationState,
      conversationHistory
    );

    // Prevent acting on very low-confidence plans
    if (typeof plan.confidence === "number" && plan.confidence < 0.5) {
      plan.intent = "unknown";
    }

    console.log("\n========== Planner ==========");
    console.dir(plan, { depth: null });
    console.log("=============================\n");

    if (
      Array.isArray(plan.missingInformation) &&
      plan.missingInformation.length > 0
    ) {
      console.log(
        "Planner requires clarification:",
        plan.missingInformation
      );
    }

    let intent = mapPlannerIntent(plan.intent);

    // Remap search to information if the user is referring to a product in memory
    if (
      intent === "product_discovery" &&
      plan.useMemory &&
      (plan.entities.productNumber !== undefined ||
        plan.entities.productName)
    ) {
      intent = "product_information";
    }

    // Remap to recommendation if the user asks for the best option / opinion / price of recommended product
    const lowerMessage = customerMessage.toLowerCase();
    const isRecommendationQuery =
      plan.needRecommendation ||
      plan.intent === "recommendation" ||
      lowerMessage.includes("recommended product") ||
      lowerMessage.includes("best laptop") ||
      lowerMessage.includes("best option") ||
      lowerMessage.includes("your opinion") ||
      lowerMessage.includes("which one is best");

    if (intent === "product_discovery" && plan.useMemory && isRecommendationQuery) {
      intent = "recommendation";
    }

    return {
      intent: intent,
      entities: plan.entities ?? {},
      plan,
    };
  } catch (error) {
    console.error("Conversation Manager Error");
    console.error(error);

    return {
      intent: "unknown",
      entities: {},
      plan: undefined,
    };
  }
}