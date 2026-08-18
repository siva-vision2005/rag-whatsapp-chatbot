function normalize(text: string): string {

  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

}

export function textScore(
  actual: any,
  expected: any
): number {

  const a = normalize(String(actual));
  const e = normalize(String(expected));

  if (a === e) {
    return 20;
  }

  if (
    a.includes(e) ||
    e.includes(a)
  ) {
    return 10;
  }

  return 0;

}