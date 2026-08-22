import { resolveProduct } from "./productResolver";
import { getProducts } from "./googleSheets.service";

export async function resolveComparisonProducts(
  entities: Record<string, any>,
  lastProducts: Record<string, any>[] = [],
  state?: Record<string, any>
): Promise<Record<string, any>[]> {

  const references =
    entities.compareProducts ??
    entities.comparison_products ??
    [];

  const rawMsg = String(entities.rawMessage ?? "").toLowerCase();

  // Special check: "Compare it with the one I preferred"
  if (rawMsg.includes("preferred") || rawMsg.includes("favourite")) {
    const item1 = await resolveProduct("it", lastProducts, state);
    const item2 = await resolveProduct("preferred", lastProducts, state);

    if (item1 && item2 && (item1["Product_ID"] ?? item1["Product Name"]) !== (item2["Product_ID"] ?? item2["Product Name"])) {
      console.log(`Resolved comparison between current item (${item1["Product Name"]}) and preferred item (${item2["Product Name"]}).`);
      return [item1, item2];
    }
  }

  // Detect "compare all / above / these / five / laptops / them" — return ALL products in memory
  const isCompareAll = /\b(all|above|these|each|everything|entire|every|them|laptop|laptops|product|products|options|choices|5|five|4|four|3|three|2|two)\b/i.test(rawMsg);

  if ((isCompareAll || !references || references.length === 0) && lastProducts && lastProducts.length >= 2) {
    console.log(`Customer requested to compare products in memory (${lastProducts.length} items).`);
    return lastProducts;
  }

  if (Array.isArray(references) && references.length > 0 && !isCompareAll) {
    console.log("Comparison References:", references);

    const products = await Promise.all(
      references.map(async (reference: any) => {
        const product = await resolveProduct(reference, lastProducts, state);
        return product;
      })
    );

    const resolved = products.filter(Boolean);
    console.log("Resolved Products:", resolved.length);

    if (resolved.length >= 2) {
      return resolved;
    }
  }

  const numbers = entities.comparison_numbers ?? [];

  if (Array.isArray(numbers) && numbers.length > 0) {
    const numResolved = numbers
      .map((num: number) => lastProducts[num - 1])
      .filter(Boolean);

    if (numResolved.length >= 2) {
      return numResolved;
    }
  }

  // Fallback 1: Return ALL products in memory
  if (lastProducts && lastProducts.length >= 2) {
    return lastProducts;
  }

  // Fallback 2: If only 1 product in memory, pair it with catalog alternative
  if (lastProducts && lastProducts.length === 1) {
    const p1 = lastProducts[0];
    const catalog = await getProducts();
    const alt = catalog.find((p) => p["Product_ID"] !== p1["Product_ID"] && p.Price) ?? catalog[0];
    if (alt) return [p1, alt];
  }

  return [];
}