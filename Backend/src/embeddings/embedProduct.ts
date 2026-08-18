import { gemini } from "../config/gemini";

export async function embedProduct(
  product: Record<string, any>
): Promise<number[]> {

  const ignoredFields = new Set([
    "Product_ID",
    "Image",
    "Image_URL",
    "link",
    "Product URL",
    "URL",
  ]);

  const lines: string[] = [];

  for (const [key, value] of Object.entries(product)) {

    if (
      ignoredFields.has(key) ||
      value === undefined ||
      value === null ||
      String(value).trim() === ""
    ) {
      continue;
    }

    lines.push(`${key}: ${value}`);

  }

  const productText = lines.join("\n");

  console.log("\n========== EMBEDDING TEXT ==========");
  console.log(productText);
  console.log("====================================\n");

  const response = await gemini.models.embedContent({
    model: "gemini-embedding-001",
    contents: productText,
  });

  return response.embeddings?.[0]?.values ?? [];

}