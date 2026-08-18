export function semanticScore(
  vectorScore: number
): number {

  // Convert Qdrant similarity score
  // into a business score.

  return Math.round(vectorScore * 100);

}