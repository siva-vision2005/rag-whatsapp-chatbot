import { aiService } from "./ai.service";
import { qdrant } from "../config/qdrant";

const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME!;

export interface SearchProduct {
  score: number;
  payload: Record<string, any>;
}

export class SearchService {

  async search(
    query: string,
    limit: number = 20
  ): Promise<SearchProduct[]> {

    try {

      console.log("Search Query:", query);

      const queryVector = await aiService.embed(query);

      console.log("Vector length:", queryVector.length);

      const result = await qdrant.query(COLLECTION_NAME, {
        query: queryVector,
        limit,
        with_payload: true,
      });

      console.log("Qdrant returned:", result.points.length);

      return result.points
        .filter(point => point.payload)
        .map(point => ({
          score: point.score,
          payload: point.payload as Record<string, any>,
        }));

    } catch (error) {

      console.warn("⚠️ Vector Search failed (embedding/API error). Falling back to Qdrant scroll...");
      console.error(error);

      try {
        const scrollResult = await qdrant.scroll(COLLECTION_NAME, {
          limit: 100,
          with_payload: true,
        });

        console.log("Qdrant fallback scroll returned:", scrollResult.points.length);

        return scrollResult.points
          .filter(point => point.payload)
          .map(point => ({
            score: 1.0,
            payload: point.payload as Record<string, any>,
          }));
      } catch (scrollError) {
        console.error("❌ Qdrant scroll fallback also failed. Falling back to Google Sheets local search...");
        try {
          const { getProducts } = require("./googleSheets.service");
          const catalog = await getProducts();
          console.log(`Fallback Google Sheets loaded ${catalog.length} products.`);

          const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1 && !["laptop", "laptops", "under", "show", "need", "prefer"].includes(w));
          const results = catalog.map((p: any) => {
            const text = `${p.Brand ?? ""} ${p["Product Name"] ?? ""} ${p.name ?? ""} ${p["Model Name"] ?? ""} ${p.Processor ?? ""} ${p["Processor Name"] ?? ""} ${p["Graphic Processor"] ?? ""}`.toLowerCase();
            let matchCount = 0;
            if (keywords.length > 0) {
              keywords.forEach(kw => {
                if (text.includes(kw)) matchCount++;
              });
            }
            const score = keywords.length > 0 ? matchCount / keywords.length : 1.0;
            return { score, payload: p };
          });

          const matched = results.filter(r => keywords.length === 0 || r.score > 0);
          matched.sort((a, b) => b.score - a.score);
          return matched.slice(0, limit);
        } catch (sheetError) {
          console.error("❌ Google Sheets fallback search also failed:", sheetError);
          return [];
        }
      }

    }
  }

}

export const searchService = new SearchService();