import { filterProducts } from "../filters/productFilter";
import { formatSearchResponse } from "../formatter/responseFormatter";
import * as ProductRanker from "../ranking/productRanker";
import { buildSearchQuery } from "../search/searchQueryBuilder";
import { searchProducts } from "../search/searchProducts";
import { getProducts } from "../services/googleSheets.service";
import { aiService } from "../services/ai.service";
import { buildGenerateResponsePrompt } from "../prompts/generateResponse.prompt";
import { PlannerPlan } from "../ai/planner/planner.types";

export interface ProductSearchResult {
  reply: string;
  products: Record<string, any>[];
}

const NON_FILTER_FIELDS = new Set([
  "name",
  "title",
  "product",
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
  "productnumber",
  "quantity"
]);

export async function handleProductSearch(
  customerMessage: string,
  conversationState: Record<string, any>,
  plan: PlannerPlan
): Promise<ProductSearchResult> {

  //----------------------------------------
  // Build Semantic Search Query
  //----------------------------------------
  const searchQuery = buildSearchQuery(customerMessage, plan.entities);
  console.log("\n========== PRODUCT SEARCH ==========");
  console.log("Search Query:", searchQuery);
  console.log("====================================\n");

  //----------------------------------------
  // Semantic Search from Qdrant
  //----------------------------------------
  const retrievedProducts = await searchProducts(searchQuery);

  console.log(`Products Retrieved from Vector DB: ${retrievedProducts.length}`);

  //----------------------------------------
  // Build Safe Filters
  //----------------------------------------
  const safeFilters = buildSafeFilters(plan.entities);
  console.log("Safe Filters:", JSON.stringify(safeFilters, null, 2));

  //----------------------------------------
  // Application Filtering (Strict Validation)
  //----------------------------------------
  let filteredProducts = filterProducts(retrievedProducts, safeFilters);
  let fallbackHeader = "";
  let isNoResult = false;

  if (filteredProducts.length === 0) {
    console.log("⚠️ Strict filter returned 0 products. Finding closest alternatives from catalog...");
    isNoResult = true;

    // Describe the requested constraints
    const constraintDesc = describeConstraints(safeFilters);

    // Relax GPU/processor to find closest catalog alternatives
    const relaxedFilters = { ...safeFilters };
    delete relaxedFilters.gpu;
    delete relaxedFilters.processor;

    let alternativeProducts = filterProducts(retrievedProducts, relaxedFilters);

    if (alternativeProducts.length === 0) {
      alternativeProducts = retrievedProducts;
    }

    filteredProducts = alternativeProducts;

    if (constraintDesc) {
      fallbackHeader = `Notice: We couldn't find a laptop in our catalog that satisfies all your exact requirements (${constraintDesc}). Here are the closest available options in our store catalog:\n\n`;
    } else {
      fallbackHeader = `Notice: We couldn't find an exact match for all your requested specifications. Here are the top available options in our store catalog:\n\n`;
    }
  }

  //----------------------------------------
  // Ranking
  //----------------------------------------
  const rankedProducts = ProductRanker.rankProducts(filteredProducts, safeFilters);

  // Deduplicate products by name and link
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

  const finalPayloads = topProducts.map((item) => item.payload);

  if (finalPayloads.length === 0) {
    return {
      reply: `Sorry, we could not find any products matching your requirements in our store catalog.`,
      products: []
    };
  }

  //----------------------------------------
  // Dynamic AI Response Generation
  //----------------------------------------
  let reply = "";

  try {
    const prompt = buildGenerateResponsePrompt({
      customerMessage,
      products: finalPayloads,
      fallbackHeader,
      isNoResult
    });
    reply = await aiService.generateText(prompt);
  } catch (err) {
    console.error("Failed to generate AI response, using fallback:", err);
    reply = (fallbackHeader || "") + formatSearchResponse(finalPayloads);
  }

  // Ensure no emojis in final reply
  reply = reply.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

  return {
    reply: reply.trim(),
    products: finalPayloads,
  };
}

function describeConstraints(filters: Record<string, any>): string {
  const parts: string[] = [];
  if (filters.maxbudget || filters.budget) parts.push(`under ₹${Number(filters.maxbudget || filters.budget).toLocaleString('en-IN')}`);
  if (filters.ram) parts.push(`${filters.ram} RAM`);
  if (filters.processor) parts.push(`${filters.processor} processor`);
  if (filters.gpu) parts.push(`${filters.gpu} GPU`);
  if (filters.storage) parts.push(`${filters.storage} storage`);
  if (filters.brand) parts.push(`${filters.brand} brand`);
  return parts.join(", ");
}

function buildSafeFilters(
  conversationState: Record<string, any>
): Record<string, any> {
  const filters: Record<string, any> = {};

  for (const [key, value] of Object.entries(conversationState)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    const normalizedKey = key.toLowerCase().trim();

    if (NON_FILTER_FIELDS.has(normalizedKey)) {
      continue;
    }

    if (["gpu", "processor", "ram", "storage"].includes(normalizedKey)) {
      if (!/\d/.test(String(value))) {
        continue;
      }
    }

    filters[key] = value;
  }

  return filters;
}