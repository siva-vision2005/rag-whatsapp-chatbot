import { numericScore } from "./numericScorer";
import { textScore } from "./textScorer";

export function fieldScore(
  actual: any,
  expected: any
): number {

  const numeric = numericScore(
    actual,
    expected
  );

  if (numeric > 0) {
    return numeric;
  }

  return textScore(
    actual,
    expected
  );

}