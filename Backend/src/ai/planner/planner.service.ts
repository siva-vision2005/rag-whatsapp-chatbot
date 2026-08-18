import { ProviderManager } from "../../providers/ProviderManager";
import { PLANNER_PROMPT } from "./planner.prompt";
import { PlannerParser } from "./planner.parser";
import { PlannerPlan } from "./planner.types";

export class PlannerService {
  private provider = new ProviderManager();

  async plan(
    userMessage: string,
    conversationState: Record<string, any> = {},
    conversationHistory: string = ""
  ): Promise<PlannerPlan> {

    const lastProducts = conversationState?.lastProducts ?? [];
    const currentIntent = conversationState?.intent ?? "";
    const currentCategory = conversationState?.category ?? "";
    const rememberedPreferences = conversationState?.preferences ?? {};

    const prompt = `
${PLANNER_PROMPT}

==================================================
CURRENT CONVERSATION STATE
==================================================

Current Intent:
${currentIntent || "None"}

Current Category:
${currentCategory || "Unknown"}

Remembered Preferences:
${JSON.stringify(rememberedPreferences, null, 2)}

==================================================
CURRENT PRODUCT CONTEXT
==================================================

These are the products currently being discussed.
Use them when the customer says:

- first
- second
- third
- previous
- this
- that
- compare them
- show image
- tell me more

Products:

${JSON.stringify(lastProducts, null, 2)}

==================================================
RECENT CONVERSATION
==================================================

${conversationHistory || "No previous conversation"}

==================================================
CURRENT USER MESSAGE
==================================================

${userMessage}

==================================================
IMPORTANT
==================================================

Think carefully before creating the execution plan.

Understand the user's complete objective before selecting tools.

Use the entire conversation context, not only the latest message.

If the request is ambiguous, use clarification.

Return ONLY valid JSON.
`;

    const rawPlan =
      await this.provider.generateJson<Partial<PlannerPlan>>(prompt);

    return PlannerParser.parse(rawPlan);
  }
}