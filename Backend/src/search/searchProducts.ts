import { searchService } from "../services/search.service";

export interface SearchProduct {
  score: number;
  payload: Record<string, any>;
}

export async function searchProducts(
  query: string,
  limit: number = 20
): Promise<SearchProduct[]> {
  return await searchService.search(query, limit);
}