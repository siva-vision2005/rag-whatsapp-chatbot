import { getProducts } from "./googleSheets.service";
import { resolveProduct } from "./productResolver";
import { formatProductInformation } from "../formatter/productInformationFormatter";
import { ChatResponse } from "../types/chatResponse";

export async function handleProductInformation(
  reference: string | number,
  lastProducts: Record<string, any>[] = []
): Promise<ChatResponse> {
  const refStr = String(reference ?? "").trim();
  
  if (!refStr) {
    return {
      type: "text",
      message: "Please specify which laptop or product details you would like to view."
    };
  }

  // 1. If reference is a index or ordinal (e.g. 1, 2, "first", "second"), try memory resolution first
  if (typeof reference === "number" || /\b(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th|this|that|previous)\b/i.test(refStr)) {
    const singleProduct = await resolveProduct(reference, lastProducts);
    if (singleProduct) {
      return {
        type: "text",
        message: formatProductInformation(singleProduct)
      };
    }
  }

  // 2. Search full catalog for matching products
  const catalog = await getProducts();
  const lowerRef = refStr.toLowerCase();
  const keywords = lowerRef.split(/\s+/).filter(w => w.length > 1 && !["laptop", "details", "specs", "show", "tell", "about"].includes(w));

  const matchingProducts = catalog.filter((product) => {
    const text = `${product.Brand ?? ""} ${product["Product Name"] ?? ""} ${product.name ?? ""} ${product.Series ?? ""} ${product["Model Name"] ?? ""} ${product["Model Number"] ?? ""}`.toLowerCase();
    return keywords.length > 0 ? keywords.every(kw => text.includes(kw)) : text.includes(lowerRef);
  });

  // EXACTLY 1 MATCH: Return exact specifications for that single product
  if (matchingProducts.length === 1) {
    return {
      type: "text",
      message: formatProductInformation(matchingProducts[0])
    };
  }

  // MULTIPLE MATCHES: Show all matching variants so user can choose or compare them
  if (matchingProducts.length > 1) {
    const topMatches = matchingProducts.slice(0, 5);
    return {
      type: "products",
      message: `We found ${matchingProducts.length} matching products for "${refStr}" in our catalog. Here are the available models:`,
      products: topMatches.map(p => ({ payload: p }))
    };
  }

  // NO MATCHES in catalog memory or DB: Never invent a product
  return {
    type: "text",
    message: `Sorry, we could not find any matching products for "${refStr}" in our product catalog.`
  };
}