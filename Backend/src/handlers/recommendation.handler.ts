import { aiService } from "../services/ai.service";
import { formatComparisonResponse } from "../formatter/comparisonFormatter";

export async function handleRecommendation(
  customerMessage: string,
  lastProducts: Record<string, any>[]
): Promise<string> {

  if (!lastProducts || lastProducts.length === 0) {
    return "I don't have any products in memory to recommend from yet. Please search for laptops first!";
  }

  const topProduct = lastProducts[0];
  const name = topProduct["Product Name"] ?? topProduct.name ?? topProduct["Model Name"] ?? "Laptop";
  const price = topProduct.Price ?? topProduct.price ?? "N/A";
  const processor = topProduct["Processor Name"] ?? topProduct.Processor ?? topProduct.processor ?? "N/A";
  const ram = topProduct.RAM ?? topProduct.ram ?? "N/A";
  const storage = topProduct["SSD Capacity"] ?? topProduct.SSD ?? topProduct.storage ?? "N/A";
  const graphics = topProduct["Graphic Processor"] ?? topProduct.gpu ?? "N/A";

  const prompt = `
You are an expert AI Product Assistant on WhatsApp.

The customer is asking: "${customerMessage}"

You previously showed them options. Now they are asking for your SINGLE top recommendation or asking for the price/details of your top recommendation.

TOP RECOMMENDED PRODUCT:
- Name: ${name}
- Price: ${price}
- Processor: ${processor}
- RAM: ${ram}
- Storage: ${storage}
- Graphics: ${graphics}
- Full Specs: ${JSON.stringify(topProduct, null, 2)}

INSTRUCTIONS:
1. Clearly state your SINGLE top recommended laptop at the top.
2. Mention the exact Price in bold (e.g. *Price:* ${price}).
3. Provide 3-4 short bullet points explaining WHY this product is the best overall choice out of all options.
4. Keep the tone friendly, professional, and easy to read on WhatsApp using single-asterisk bolding (*Text*).
5. DO NOT list all products again. Focus ONLY on recommending this #1 top pick.
6. IMPORTANT DEMANDING GAMES/TASKS RULE: If the customer specifically asks about running highly demanding tasks or modern games (like GTA 6, Cyberpunk 2077, RDR 2, etc.), and the top recommended product has an outdated/low-end GPU (like GTX 1650, GTX 1650 Ti, or integrated graphics), you MUST explicitly warn them that it is not suitable or below requirements for that specific game. Advise them to look for a modern RTX series laptop (such as the MSI GF65 Thin with RTX 3060) and suggest increasing their budget slightly (e.g. to ₹83,000+) to get a proper gaming experience.
`;

  try {
    const response = await aiService.generateText(prompt);
    return formatComparisonResponse(response);
  } catch (error) {
    return `⭐ *My Top Recommendation*

*${name}*
💰 *Price:* ${price}
🧠 *Processor:* ${processor}
💾 *RAM & Storage:* ${ram} | ${storage}
🎮 *Graphics:* ${graphics}

Out of all options, this is the best overall choice for performance, build quality, and value for money!`;
  }
}
