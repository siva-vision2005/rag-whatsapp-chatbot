import { getProducts } from "./googleSheets.service";
import { searchProducts } from "../search/searchProducts";

export async function resolveProduct(
  reference: any,
  lastProducts: Record<string, any>[] = [],
  state?: Record<string, any>
): Promise<Record<string, any> | null> {

  if (reference === undefined || reference === null) {
    return state?.selectedProduct ?? state?.preferredProduct ?? (lastProducts.length > 0 ? lastProducts[0] : null);
  }

  // Handle number index (1-based index)
  if (typeof reference === "number") {
    if (reference >= 1 && reference <= lastProducts.length) {
      return lastProducts[reference - 1];
    }
    return null;
  }

  let searchRaw = "";
  if (typeof reference === "object") {
    searchRaw = [
      reference.brand,
      reference.name,
      reference.model,
      reference.category,
      reference.budget ? `${reference.budget}` : ""
    ]
      .filter(Boolean)
      .join(" ");
  } else {
    searchRaw = String(reference);
  }

  const search = searchRaw.trim().toLowerCase();
  if (!search) {
    return state?.selectedProduct ?? state?.preferredProduct ?? (lastProducts.length > 0 ? lastProducts[0] : null);
  }

  // ----------------------------
  // Preferred Product Check
  // ----------------------------
  if (/\b(preferred|favorite|favourite|liked)\b/i.test(search)) {
    if (state?.preferredProduct) return state.preferredProduct;
    if (lastProducts.length >= 2) return lastProducts[1]; // default 2nd item as fallback preferred if set
  }

  // ----------------------------
  // Selected / Pronoun Check ("it", "its", "this", "that", "selected", "current")
  // ----------------------------
  if (/\b(it|its|this|that|current|selected|this laptop|that model|this product)\b/i.test(search) && !/\b(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th)\b/i.test(search)) {
    if (state?.selectedProduct) return state.selectedProduct;
    if (state?.preferredProduct) return state.preferredProduct;
    if (lastProducts.length > 0) return lastProducts[0];
  }

  // ----------------------------
  // Ordinal references (first laptop, 2nd product, etc.)
  // ----------------------------
  const ordinalMatch = search.match(
    /\b(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th|last|previous)\b/
  );
  const ordinalReference = ordinalMatch?.[1];

  const ordinalMap: Record<string, number> = {
    "first": 0, "1st": 0,
    "second": 1, "2nd": 1,
    "third": 2, "3rd": 2,
    "fourth": 3, "4th": 3,
    "fifth": 4, "5th": 4,
    "last": lastProducts.length > 0 ? lastProducts.length - 1 : 0,
    "previous": 0
  };

  if (ordinalReference && ordinalReference in ordinalMap) {
    const index = ordinalMap[ordinalReference];
    if (lastProducts && index < lastProducts.length) {
      return lastProducts[index];
    }
  }

  // ----------------------------
  // 1. Search in lastProducts memory first
  // ----------------------------
  if (lastProducts && lastProducts.length > 0) {
    const recentMatch = lastProducts.find((p) => {
      const text = `${p.Brand ?? ""} ${p["Product Name"] ?? ""} ${p.name ?? ""} ${p["Model Name"] ?? ""}`.toLowerCase();
      return text.includes(search);
    });
    if (recentMatch) {
      return recentMatch;
    }
  }

  // Normalize common typos (e.g. acre -> acer, vicus -> victus, lenvo -> lenovo)
  const normalizedSearch = search
    .replace(/\bacre\b/g, "acer")
    .replace(/\blenvo\b/g, "lenovo")
    .replace(/\bdel\b/g, "dell")
    .replace(/\bvicus\b/g, "victus");

  const products = await getProducts();

  // ----------------------------
  // 2. Exact substring match in full catalog
  // ----------------------------
  let catalogProduct = products.find((product) => {
    const name = (product["Product Name"] ?? product.name ?? "").toLowerCase();
    const model = (product["Model Number"] ?? product["Model Name"] ?? "").toLowerCase();
    return name.includes(normalizedSearch) || model.includes(normalizedSearch);
  });

  if (catalogProduct) {
    return catalogProduct;
  }

  // ----------------------------
  // 3. Multi-keyword matching across catalog fields
  // ----------------------------
  const keywords = normalizedSearch.split(/\s+/).filter((w) => w.length > 1);

  if (keywords.length > 0) {
    catalogProduct = products.find((product) => {
      const text = `${product.Brand ?? ""} ${product["Product Name"] ?? ""} ${product.name ?? ""} ${product.Series ?? ""} ${product["Model Name"] ?? ""}`.toLowerCase();
      return keywords.every((kw) => text.includes(kw));
    });
  }

  if (catalogProduct) {
    return catalogProduct;
  }

  // ----------------------------
  // 4. Vector / SearchService fallback with relevance validation
  // ----------------------------
  try {
    const searchResults = await searchProducts(normalizedSearch, 5);
    if (searchResults && searchResults.length > 0) {
      const topResult = searchResults[0];
      const payload = topResult.payload ?? {};
      const fullText = `${payload.Brand ?? ""} ${payload["Product Name"] ?? ""} ${payload.name ?? ""} ${payload.Series ?? ""} ${payload["Model Name"] ?? ""}`.toLowerCase();

      const searchKeywords = normalizedSearch.split(/\s+/).filter((w) => w.length > 2 && !["laptop", "specs", "tell", "about", "show", "need"].includes(w));
      const hasKeywordMatch = searchKeywords.some((kw) => {
        const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        return new RegExp("\\b" + escaped + "\\b", "i").test(fullText);
      });

      if (hasKeywordMatch || topResult.score >= 0.65) {
        return payload;
      }
    }
  } catch (err) {
    console.error("Vector search fallback in resolveProduct failed:", err);
  }

  return state?.selectedProduct ?? state?.preferredProduct ?? null;
}