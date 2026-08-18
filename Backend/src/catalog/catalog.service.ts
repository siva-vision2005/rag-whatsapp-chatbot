import { CatalogAnalysis } from "./catalogAnalyzer";
import {
  getHeaders,
  getProducts,
} from "../services/googleSheets.service";

let catalogMetadata: CatalogAnalysis | null = null;

export async function initializeCatalog(): Promise<void> {
  try {
    console.log("\n==============================");
    console.log("Loading Product Catalog...");
    console.log("==============================");

    const headers = await getHeaders();
    const products = await getProducts();

    if (products.length === 0) {
      throw new Error("No products found in Google Sheet.");
    }

    const normalizedHeaders = headers
      .map(h => h.trim())
      .filter(Boolean);

    let highestPrice = 0;
    let highestPriceLaptopName = "";
    let lowestPrice = Infinity;
    let lowestPriceLaptopName = "";
    const brandsSet = new Set<string>();

    for (const p of products) {
      const priceStr = String(p.Price || p.price || "0");
      const price = Number(priceStr.replace(/[^0-9.]/g, ""));
      const name = p["Product Name"] || p.name || p.title || p.Name || "Unknown Laptop";
      
      if (price > highestPrice) {
        highestPrice = price;
        highestPriceLaptopName = name;
      }
      if (price > 0 && price < lowestPrice) {
        lowestPrice = price;
        lowestPriceLaptopName = name;
      }
      
      const brand = String(p.Brand || p.brand || name.split(" ")[0]).trim();
      if (brand) brandsSet.add(brand.toUpperCase());
    }

    if (lowestPrice === Infinity) lowestPrice = 0;

    // Instant initialization using Google Sheet headers — Zero LLM API calls on startup
    catalogMetadata = {
      catalogType: "Laptops",
      importantFields: normalizedHeaders,
      searchFields: normalizedHeaders,
      comparisonFields: normalizedHeaders,
      recommendedQuestions: [],
      catalogStats: {
        totalProducts: products.length,
        highestPrice,
        highestPriceLaptopName,
        lowestPrice,
        lowestPriceLaptopName,
        brands: Array.from(brandsSet)
      }
    };

    console.log("\n========== CATALOG INITIALIZED ==========");
    console.log(`Loaded ${products.length} products with ${normalizedHeaders.length} attributes.`);
    console.log("=========================================\n");

  } catch (error) {
    console.error("Failed to initialize catalog.");
    console.error(error);
    throw error;
  }
}

export function getCatalogMetadata(): CatalogAnalysis {
  if (!catalogMetadata) {
    throw new Error(
      "Catalog has not been initialized."
    );
  }
  return catalogMetadata;
}

export function isCatalogLoaded(): boolean {
  return catalogMetadata !== null;
}