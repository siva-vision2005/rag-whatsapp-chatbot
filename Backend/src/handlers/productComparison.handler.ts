import { aiService } from "../services/ai.service";
import { buildRecommendationPrompt } from "../prompts/productComparison.prompt";
import { formatComparisonResponse } from "../formatter/comparisonFormatter";
import { resolveComparisonProducts } from "../services/comparisonResolver";
import { ChatResponse } from "../types/chatResponse";

export async function handleProductComparison(
  entities: Record<string, any>,
  lastProducts: Record<string, any>[],
  customerMessage = ""
): Promise<ChatResponse> {

  let selectedProducts: Record<string, any>[] = [];

  try {
    const fullEntities = { ...entities, rawMessage: customerMessage };

    selectedProducts = await resolveComparisonProducts(
      fullEntities,
      lastProducts
    );

    if (selectedProducts.length < 2) {
      return {
        type: "text",
        message: "I couldn't identify two products to compare. Please specify two product names or search for products first."
      };
    }

    // Build mobile-optimised vertical card table
    const table = buildMobileComparisonCards(selectedProducts);

    // AI recommendation paragraph
    let recommendation = "";
    try {
      const prompt = buildRecommendationPrompt(customerMessage || "Compare these products", selectedProducts);
      const response = await aiService.generateText(prompt);
      recommendation = formatComparisonResponse(response);
    } catch {
      recommendation = buildFallbackRecommendation(selectedProducts);
    }

    const fullMessage = `📊 *LAPTOP COMPARISON*\n\n${table}\n\n────────────────────\n${recommendation}`;

    return {
      type: "text",
      message: fullMessage,
      products: selectedProducts.map(p => ({ payload: p }))
    };

  } catch (error) {
    console.error("Product Comparison Handler Error:", error);

    if (selectedProducts.length >= 2) {
      const table = buildMobileComparisonCards(selectedProducts);
      return {
        type: "text",
        message: `📊 *LAPTOP COMPARISON*\n\n${table}\n\n────────────────────\n${buildFallbackRecommendation(selectedProducts)}`,
        products: selectedProducts.map(p => ({ payload: p }))
      };
    }

    return {
      type: "text",
      message: "Sorry, I couldn't compare those products at the moment. Please try again."
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Mobile-first vertical spec list for each product
// ─────────────────────────────────────────────────────────────

function buildMobileComparisonCards(products: Record<string, any>[]): string {

  const getVal = (p: any, ...keys: string[]) => {
    for (const k of keys) {
      const v = p[k];
      if (v && String(v).trim() && String(v).toLowerCase().trim() !== "n/a") {
        return String(v).replace(/\.00$/, "").trim();
      }
    }
    return "N/A";
  };

  // Pre-shorten common verbose values to fit in VALUE_W = 13 chars
  const shortCpu = (v: string) =>
    v.replace(/Intel\s+Core\s*/i, "").replace(/AMD\s*/i, "").trim();

  const shortGpu = (v: string) =>
    v.replace(/Intel\s*Integrated\s*/i, "Intel ")
     .replace(/AMD Radeon\s*Integrated\s*/i, "Radeon ")
     .replace(/NVIDIA\s*GeForce\s*/i, "")
     .replace(/\s*Graphics\s*/i, "").trim();

  const shortScreen = (v: string) =>
    v.replace(/[\d.]+\s*cm\s*/i, "").replace(/[()]/g, "").trim();

  const shortOs = (v: string) =>
    v.replace(/Microsoft\s*/i, "")
     .replace(/Windows /i, "Win ")
     .trim();

  const badges = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];

  const cards = products.map((p, idx) => {
    const name = String(p["Product Name"] ?? p.name ?? `Laptop ${idx + 1}`);

    const specs = [
      ["Price",   getVal(p, "Price", "price")],
      ["CPU",     shortCpu(getVal(p, "Processor Name", "Processor"))],
      ["RAM",     getVal(p, "RAM", "ram")],
      ["Storage", getVal(p, "SSD Capacity", "SSD", "HDD Capacity")],
      ["GPU",     shortGpu(getVal(p, "Graphic Processor", "GPU"))],
      ["Screen",  shortScreen(getVal(p, "Screen Size", "Display Size"))],
      ["OS",      shortOs(getVal(p, "Operating System", "OS"))],
      ["Weight",  getVal(p, "Weight", "weight")],
    ].filter(([, v]) => v !== "N/A");

    const badge = badges[idx] ?? `${idx + 1}.`;
    const headerLine = `${badge} *${name}*`;

    const lines = specs.map(([spec, value]) => `• *${spec}:* ${value}`);

    return `${headerLine}\n${lines.join("\n")}`;
  });

  return cards.join("\n\n");
}

function buildFallbackRecommendation(products: Record<string, any>[]): string {
  const names = products.map((p, i) => `*${p["Product Name"] ?? p.name ?? `Product ${i + 1}`}*`);
  return `🏆 *Which is Best?*\n\n${names.join(", ")} – Review the specs above and choose the one that fits your budget and use case best.\n\nWould you like more details on any of these laptops?`;
}