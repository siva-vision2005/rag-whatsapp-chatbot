import { filterProducts } from "../filters/productFilter";
import { formatSearchResponse } from "../formatter/responseFormatter";
import * as ProductRanker from "../ranking/productRanker";
import { buildSearchQuery } from "../search/searchQueryBuilder";
import { searchProducts } from "../search/searchProducts";
import { getProducts } from "../services/googleSheets.service";

export interface ProductSearchResult {
  reply: string;
  products: Record<string, any>[];
}

const NON_FILTER_FIELDS = new Set([
  "name",
  "title",
  "product",
  "product name",
  "description",
  "usage",
  "requirements",
  "query",
  "search_term",
  "intent",
  "category",
  "excludedbrands",
  "softpreferences",
  "compareproducts",
  "productname",
  "productnumber",
  "quantity"
]);

import { PlannerPlan } from "../ai/planner/planner.types"; // or wherever your PlannerPlan is defined

export async function handleProductSearch(
  customerMessage: string,
  conversationState: Record<string, any>,
  plan: PlannerPlan
): Promise<ProductSearchResult> {


  //----------------------------------------
  // Build Semantic Search Query
  //----------------------------------------

  const searchQuery = buildSearchQuery(
    customerMessage,
    plan.entities
);
  console.log("\n========== PRODUCT SEARCH ==========");
  console.log("Search Query:");
  console.log(searchQuery);
  console.log("====================================\n");

  //----------------------------------------
  // Semantic Search
  //----------------------------------------

  //----------------------------------------
// Semantic Search
//----------------------------------------

const retrievedProducts = await searchProducts(
  searchQuery
);

// DEBUG: Print first payload
if (retrievedProducts.length > 0) {

  console.log("\n========== FIRST PAYLOAD ==========");

  const rtxLaptop = retrievedProducts.find(p =>
    (p.payload.name ?? "").toLowerCase().includes("rtx")
);

if (rtxLaptop) {

    console.log("\n========== RTX PAYLOAD ==========");
    console.log(
        JSON.stringify(rtxLaptop.payload, null, 2)
    );
    console.log("================================");

}console.log(
    JSON.stringify(
      retrievedProducts[0].payload,
      null,
      2
    )
  );

  console.log("===================================\n");

}

// Existing code
console.log("\n========== RETRIEVED PRODUCTS ==========");

retrievedProducts.forEach((p, index) => {

  console.log(
    index + 1,
    p.payload.Brand ??
    p.payload.brand ??
    p.payload.Manufacturer ??
    "Unknown",
    "-",
    p.payload.name ??
    p.payload.title
  );

});

console.log("========================================");
  console.log("\n========== RETRIEVED PRODUCTS ==========");

retrievedProducts.forEach((p, index) => {

    console.log(
        index + 1,
        p.payload.Brand ??
        p.payload.brand ??
        p.payload.Manufacturer ??
        "Unknown",
        "-",
        p.payload.name ??
        p.payload.title
    );

});

console.log("========================================");

  console.log(
    `Products Retrieved: ${retrievedProducts.length}`
  );

  //----------------------------------------
  // Build Safe Filters
  //----------------------------------------

  const safeFilters = buildSafeFilters(
    plan.entities
);
  console.log("\n========== CONVERSATION STATE ==========");
console.log(JSON.stringify(conversationState, null, 2));

console.log("\n========== SAFE FILTERS ==========");
console.log(JSON.stringify(safeFilters, null, 2));
console.log("========================================");

  console.log("\n========== SAFE FILTERS ==========");
  console.log(
    JSON.stringify(safeFilters, null, 2)
  );
  console.log("==================================\n");

  //----------------------------------------
  // Application Filtering
  //----------------------------------------

  let filteredProducts = filterProducts(
    retrievedProducts,
    safeFilters
  );

  let fallbackHeader = "";

  const isGamingQuery = /\b(gaming|game|gta|play|graphics|gpu|rtx)\b/i.test(customerMessage);
  const budgetVal = safeFilters.maxbudget ?? safeFilters.budget;

  if (isGamingQuery && budgetVal && Number(budgetVal) < 83000) {
    const catalog = await getProducts();
    const rtxLaptops = catalog.filter((p) => {
      const text = `${p["Product Name"]} ${p["Graphic Processor"]} ${p["name"]}`.toLowerCase();
      return text.includes("rtx");
    });

    if (rtxLaptops.length > 0) {
      // Find the cheapest RTX laptop
      rtxLaptops.sort((a, b) => {
        const priceA = parseFloat(String(a.Price).replace(/[^0-9.]/g, ""));
        const priceB = parseFloat(String(b.Price).replace(/[^0-9.]/g, ""));
        return priceA - priceB;
      });

      const cheapestRTX = rtxLaptops[0];
      const cheapestRTXPrice = parseFloat(String(cheapestRTX.Price).replace(/[^0-9.]/g, ""));
      const rtxName = cheapestRTX["Product Name"] ?? cheapestRTX.name ?? "RTX Laptop";

      fallbackHeader = `💡 *Tip:* We don't have laptops with modern *RTX* graphics strictly under ₹${Number(budgetVal).toLocaleString('en-IN')}. However, if you can stretch your budget slightly to *₹${cheapestRTXPrice.toLocaleString('en-IN')}*, you can get the *${rtxName}* with an *${cheapestRTX["Graphic Processor"] || "RTX"}* GPU, which is highly recommended for modern gaming. \n\nHere are the best available gaming options within your budget:\n\n`;
    }
  }

  if (filteredProducts.length === 0 && retrievedProducts.length > 0) {
    console.log("⚠️ Strict filter returned 0 products. Retrying with relaxed filters...");

    // Relax GPU, processor, and strict limits
    const relaxedFilters = { ...safeFilters };
    delete relaxedFilters.gpu;
    delete relaxedFilters.processor;

    filteredProducts = filterProducts(retrievedProducts, relaxedFilters);

    if (filteredProducts.length === 0) {
      filteredProducts = retrievedProducts;
    }

    if (!fallbackHeader) {
      if (safeFilters.gpu) {
        fallbackHeader = `💡 *Note:* We don't currently have laptops with *${safeFilters.gpu}* graphics in stock, but here are the top graphics laptops available in our store:\n\n`;
      } else if (safeFilters.maxbudget || safeFilters.budget) {
        fallbackHeader = `💡 *Note:* We couldn't find laptops strictly under ₹${Number(budgetVal).toLocaleString('en-IN')}, but here are the closest recommended options available:\n\n`;
      } else {
        fallbackHeader = `💡 *Note:* We couldn't find an exact match for all your specifications, but here are the top recommended laptops available:\n\n`;
      }
    }
  }

  console.log("\n========== FILTERED PRODUCTS ==========");

filteredProducts.forEach((p, index) => {

    console.log(
        index + 1,
        p.payload.Brand ??
        p.payload.brand ??
        p.payload.Manufacturer ??
        "Unknown",
        "-",
        p.payload.name ??
        p.payload.title
    );

});

console.log("=======================================");

  //----------------------------------------
  // Ranking
  //----------------------------------------

  const rankedProducts = ProductRanker.rankProducts(
    filteredProducts,
    safeFilters
);
  console.log("\n========== PRODUCT RANKING ==========");

  console.table(
    rankedProducts.map((item) => ({
      Score: item.score,
      Reasons: item.reasons.join(", "),
      Product:
        item.product.payload.name ??
        item.product.payload.title ??
        item.product.payload.product ??
        "Unknown",
    }))
  );

  console.log("=====================================\n");

  //----------------------------------------
  // Deduplicate products by name and link to prevent repeated products
  const uniqueRankedProducts: typeof rankedProducts = [];
  const seenNames = new Set<string>();
  const seenLinks = new Set<string>();

  for (const item of rankedProducts) {
    const name = String(item.product.payload.name ?? item.product.payload.title ?? "").trim().toLowerCase();
    const link = String(item.product.payload.link ?? "").trim().toLowerCase();

    if (name && seenNames.has(name)) continue;
    if (link && seenLinks.has(link)) continue;

    if (name) seenNames.add(name);
    if (link) seenLinks.add(link);
    uniqueRankedProducts.push(item);
  }

  const topProducts = uniqueRankedProducts
    .slice(0, 5)
    .map((item) => item.product);

  //----------------------------------------
  // Professional Formatter
  //----------------------------------------

  const formattedReply = formatSearchResponse(
    topProducts.map((item) => item.payload)
  );

  const reply = fallbackHeader ? fallbackHeader + formattedReply : formattedReply;

  return {
    reply,
    products: topProducts.map((item) => item.payload),
  };

}

function buildSafeFilters(
  conversationState: Record<string, any>
): Record<string, any> {

  const filters: Record<string, any> = {};

  for (const [key, value] of Object.entries(
    conversationState
  )) {

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      continue;
    }

    const normalizedKey = key
      .toLowerCase()
      .trim();

    if (
      NON_FILTER_FIELDS.has(normalizedKey)
    ) {
      continue;
    }

    // Defensive check: If a weaker model puts subjective terms ("high-end", "fast") 
    // into hardware fields, skip strict filtering if there are no numbers present.
    if (["gpu", "processor", "ram", "storage"].includes(normalizedKey)) {
      if (!/\d/.test(String(value))) {
        continue;
      }
    }

    filters[key] = value;

  }

  return filters;

}