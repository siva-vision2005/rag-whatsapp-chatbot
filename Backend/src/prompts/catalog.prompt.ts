export function buildCatalogPrompt(
  headers: string[],
  sampleProducts: Record<string, any>[]
): string {

  return `
You are an expert AI Product Catalog Analyzer.

Your task is to analyze a company's product catalog.

You are given:

1. Product column names.
2. A few sample products.

Your job is to understand:

- What type of products this catalog contains.
- Which fields are important for customer search.
- Which fields customers are most likely to ask about.
- Which questions should be asked before searching.
- Which fields are useful for comparing products.

Return ONLY valid JSON.

JSON Schema:

{
  "catalogType": "",
  "importantFields": [],
  "searchFields": [],
  "comparisonFields": [],
  "recommendedQuestions": [
    {
      "field": "",
      "question": ""
    }
  ]
}

Rules:

- Do NOT explain anything.
- Do NOT return markdown.
- Do NOT return extra text.
- Only return valid JSON.
- Questions must be generic.
- Never assume the catalog is about laptops, mobiles, valves or anything else.
- Infer everything only from the provided data.

Headers:

${JSON.stringify(headers)}

Sample Products:

${JSON.stringify(sampleProducts, null, 2)}
`;
}