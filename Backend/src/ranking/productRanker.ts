import { resolveFieldValue } from "../search/smartFieldResolver";

import { semanticScore } from "./scorers/semanticScorer";
import { fieldScore } from "./scorers/fieldScorer";
import { conversationScore } from "./scorers/conversationScorer";

export interface SearchProduct {
  score: number;
  payload: Record<string, any>;
}

export interface RankedProduct {
  score: number;
  reasons: string[];
  product: SearchProduct;
}

export function rankProducts(
  products: SearchProduct[],
  entities: Record<string, any>
): RankedProduct[] {

  const ranked: RankedProduct[] = [];

  const ignoredFields = new Set([
    "preferredBrands",
    "excludedBrands",
    "compareProducts"
  ]);

  for (const product of products) {

    let totalScore = semanticScore(product.score);

    const reasons: string[] = [];

    //----------------------------------
    // Entity Matching
    //----------------------------------

    for (const [field, expected] of Object.entries(entities)) {

      if (
        expected === undefined ||
        expected === null ||
        expected === "" ||
        (Array.isArray(expected) && expected.length === 0) ||
        ignoredFields.has(field)
      ) {
        continue;
      }

      const actual = resolveFieldValue(
        product.payload,
        field
      );

      if (actual === undefined) {
        continue;
      }

      const score = fieldScore(
        actual,
        expected
      );

      if (score > 0) {

        totalScore += score;

        reasons.push(
          `${field} matched (+${score})`
        );

      }

    }

    //----------------------------------
    // Conversation Score
    //----------------------------------

    totalScore += conversationScore();

    ranked.push({
      score: totalScore,
      reasons,
      product,
    });

  }

  //----------------------------------
  // Sort
  //----------------------------------

  ranked.sort(
    (a, b) => b.score - a.score
  );

  return ranked;

}