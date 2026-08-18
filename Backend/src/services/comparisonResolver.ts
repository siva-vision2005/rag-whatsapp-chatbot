import { resolveProduct } from "./productResolver";
import { getProducts } from "./googleSheets.service";

export async function resolveComparisonProducts(
  entities: Record<string, any>,
  lastProducts: Record<string, any>[] = []
): Promise<Record<string, any>[]> {

  const references =
    entities.compareProducts ??
    entities.comparison_products ??
    [];

  // Detect "compare all / above / these / every" — return ALL products in memory, no limit
  const rawMsg = String(entities.rawMessage ?? "").toLowerCase();
  const isCompareAll = /\b(all|above|these|each|everything|entire|every)\b/.test(rawMsg);

  if (isCompareAll && lastProducts && lastProducts.length >= 2) {
    console.log(`Customer requested to compare ALL ${lastProducts.length} products in memory (no limit).`);
    return lastProducts; // NO .slice() — return every product
  }

  if (Array.isArray(references) && references.length > 0 && !isCompareAll) {

    console.log("Comparison References:", references);

    const products = await Promise.all(
      references.map(async (reference: any) => {
        const product = await resolveProduct(reference, lastProducts);
        console.log("Searching:", reference);
        console.log("Found:", product?.["Product Name"] ?? product?.name ?? null);
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

  // Fallback 1: Return ALL products in memory (no cap)
  if (lastProducts && lastProducts.length >= 2) {
    console.log(`No specific products resolved. Falling back to ALL ${lastProducts.length} products in memory.`);
    return lastProducts;
  }

  // Fallback 2: If only 1 product in memory, pair it with catalog alternative
  if (lastProducts && lastProducts.length === 1) {
    const p1 = lastProducts[0];
    const catalog = await getProducts();
    const alt = catalog.find((p) => p["Product_ID"] !== p1["Product_ID"] && p.Price) ?? catalog[0];
    if (alt) return [p1, alt];
  }

  // If there are no products in memory to compare, return an empty array (the caller will request specific products)
  console.log("No products in memory to compare.");
  return [];
}