import { aiService } from "../services/ai.service";
import { buildCatalogPrompt } from "../prompts/catalog.prompt";

export interface CatalogAnalysis {
  catalogType: string;
  importantFields: string[];
  searchFields: string[];
  comparisonFields: string[];
  recommendedQuestions: {
    field: string;
    question: string;
  }[];
  catalogStats?: {
    totalProducts: number;
    highestPrice: number;
    highestPriceLaptopName: string;
    lowestPrice: number;
    lowestPriceLaptopName: string;
    brands: string[];
  };
}

export async function analyzeCatalog(
  headers: string[],
  sampleProducts: Record<string, any>[]
): Promise<CatalogAnalysis> {
  try {
    const prompt = buildCatalogPrompt(
      headers,
      sampleProducts
    );

    const result =
      await aiService.generateJson<CatalogAnalysis>(
        prompt
      );

    if (result && Array.isArray(result.searchFields) && result.searchFields.length > 0) {
      return result;
    }
  } catch (error) {
    console.error("Catalog Analyzer Error — using fallback header mappings.");
    console.error(error);
  }

  return {
    catalogType: "Laptops",
    importantFields: headers,
    searchFields: headers,
    comparisonFields: headers,
    recommendedQuestions: [],
  };
}