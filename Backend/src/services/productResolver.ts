import { getProducts } from "./googleSheets.service";
import { searchProducts } from "../search/searchProducts";

export async function resolveProduct(
  reference: any,
  lastProducts: Record<string, any>[] = []
): Promise<Record<string, any> | null> {

  if (reference === undefined || reference === null) {
    return null;
  }

  // Handle number index
  if (typeof reference === "number") {
    if (reference >= 1 && reference <= lastProducts.length) {
      return lastProducts[reference - 1];
    }
    return null;
  }

  // Handle object reference e.g. { brand: "Acer", budget: 50000 }
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
    return null;
  }

  // ----------------------------
  // Ordinal references (first laptop, 2nd product, etc.)
  // ----------------------------
  const ordinalMatch = search.match(
    /\b(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th|this|that|previous|current)\b/
  );
  const ordinalReference = ordinalMatch?.[1];

  const ordinalMap: Record<string, number> = {
    "first": 0, "1st": 0,
    "second": 1, "2nd": 1,
    "third": 2, "3rd": 2,
    "fourth": 3, "4th": 3,
    "fifth": 4, "5th": 4,
    "this": 0, "that": 0, "previous": 0, "current": 0
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

      // Check if at least one non-generic keyword from search query matches the payload text (using word boundaries to prevent substring matches like "pro" matching inside "processor")
      const searchKeywords = normalizedSearch.split(/\s+/).filter((w) => w.length > 2 && !["laptop", "specs", "tell", "about", "show", "need"].includes(w));
      const hasKeywordMatch = searchKeywords.some((kw) => {
        const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        return new RegExp("\\b" + escaped + "\\b", "i").test(fullText);
      });

      // Accept only if score is reasonably high OR at least 1 key word matches
      if (hasKeywordMatch || topResult.score >= 0.65) {
        return payload;
      } else {
        console.log(`⚠️ Vector fallback rejected low-relevance match "${fullText.substring(0, 30)}..." for query "${normalizedSearch}" (score: ${topResult.score})`);
      }
    }
  } catch (err) {
    console.error("Vector search fallback in resolveProduct failed:", err);
  }

  return null;
}