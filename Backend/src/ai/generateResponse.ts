import { aiService } from "../services/ai.service";
import { buildGenerateResponsePrompt } from "../prompts/generateResponse.prompt";

export async function generateResponse(
  customerMessage: string,
  products: any[]
): Promise<string> {
  try {
    if (!products || products.length === 0) {
      return "Sorry, I couldn't find any products that match your requirements. Please provide more details or try different specifications.";
    }

    const prompt = buildGenerateResponsePrompt(
      customerMessage,
      products
    );

    return await aiService.generateText(prompt);

  } catch (error) {
    console.error("Generate Response Error");
    console.error(error);

    return "Sorry, I'm unable to generate a response at the moment. Please try again later.";
  }
}