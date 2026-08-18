export function buildSearchQuery(
  customerMessage: string,
  entities: Record<string, any>
): string {

  const parts: string[] = [];

  // Keep the original customer message for semantic context
  if (customerMessage.trim()) {
    parts.push(customerMessage.trim());
  }

  // Append extracted entities
  for (const value of Object.values(entities)) {

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      continue;
    }

    const text = String(value).trim();

    if (!text) {
      continue;
    }

    if (!parts.includes(text)) {
      parts.push(text);
    }
  }

  return parts.join(" ");
}