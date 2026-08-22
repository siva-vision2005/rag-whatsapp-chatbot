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
You are an expert AI Product Assistant for an electronics store.

The customer is asking: "${customerMessage}"

You previously showed them options. Now they are asking for your SINGLE top recommendation or asking for the price/details of your top recommendation.

TOP RECOMMENDED PRODUCT DATA (GROUND TRUTH):
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
3. Provide 3-4 short bullet points explaining WHY this product is the best choice based ONLY on the retrieved specifications above.
4. ZERO EMOJIS: Do NOT use any emojis anywhere in the response.
5. Tone: Professional, concise, easy to read on mobile. Use single-asterisk bolding (*Text*).
6. DO NOT list all products again. Focus ONLY on recommending this #1 top pick.
`;

  try {
    const response = await aiService.generateText(prompt);
    const cleanResponse = formatComparisonResponse(response).replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    return cleanResponse;
  } catch (error) {
    return `*Top Recommendation*\n\n*${name}*\n*Price:* ${price}\n*Processor:* ${processor}\n*RAM & Storage:* ${ram} | ${storage}\n*Graphics:* ${graphics}\n\nOut of all options, this is the best overall choice for performance and value based on available catalog data.`;
  }
}
