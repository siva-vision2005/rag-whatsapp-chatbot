export function numericScore(
  actual: any,
  expected: any
): number {

  const actualNumber = Number(
    String(actual).replace(/[^\d.]/g, "")
  );

  const expectedText = String(expected).trim();

  const expectedNumber = Number(
    expectedText.replace(/[^\d.]/g, "")
  );

  if (
    isNaN(actualNumber) ||
    isNaN(expectedNumber)
  ) {
    return 0;
  }

  if (expectedText.startsWith("<=")) {
    return actualNumber <= expectedNumber ? 20 : 0;
  }

  if (expectedText.startsWith(">=")) {
    return actualNumber >= expectedNumber ? 20 : 0;
  }

  if (expectedText.startsWith("<")) {
    return actualNumber < expectedNumber ? 20 : 0;
  }

  if (expectedText.startsWith(">")) {
    return actualNumber > expectedNumber ? 20 : 0;
  }

  if (actualNumber === expectedNumber) {
    return 20;
  }

  const difference = Math.abs(
    actualNumber - expectedNumber
  );

  if (
    difference <= actualNumber * 0.10
  ) {
    return 10;
  }

  return 0;

}