export function buildRecommendationPrompt(
  customerMessage: string,
  products: any[]
): string {

  const productSummaries = products.map((p, i) => {
    const name = p["Product Name"] ?? p.name ?? `Product ${i + 1}`;
    const price = String(p.Price ?? "N/A").replace(".00", "");
    const cpu = p["Processor Name"] ?? p.Processor ?? "N/A";
    const ram = p.RAM ?? "N/A";
    const ssd = p["SSD Capacity"] ?? p.SSD ?? "N/A";
    const gpu = p["Graphic Processor"] ?? p.gpu ?? "N/A";
    return `${i + 1}. ${name} | Price: ${price} | CPU: ${cpu} | RAM: ${ram} | Storage: ${ssd} | GPU: ${gpu}`;
  }).join("\n");

  return `
You are a professional laptop sales advisor.

The customer asked: "${customerMessage}"

Here are the products being compared:
${productSummaries}

Your task:
- Write ONLY the "Which is Best?" recommendation section.
- Do NOT write a table.
- Keep the recommendation concise (3-5 lines maximum).
- Recommend the best product based strictly on the retrieved specifications for the customer's use case.
- ZERO EMOJIS: Do NOT use any emojis.
- Use single asterisks (*text*) for bold.
- Never mention internal codes or IDs.
- State facts only from the retrieved data.
- End with: "Would you like more details on any of these laptops?"

Start your output with: *Which is Best?*
`;
}

export function buildProductComparisonPrompt(
  customerMessage: string,
  products: any[]
): string {
  return buildRecommendationPrompt(customerMessage, products);
}