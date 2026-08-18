const NEW_SEARCH_KEYWORDS = [
  "i need",
  "need",
  "looking for",
  "show me",
  "find",
  "recommend",
  "suggest",
  "search",
  "want",
];

export function shouldStartNewSearch(
  message: string,
  currentState: Record<string, any>,
  newEntities: Record<string, any>
): boolean {
  if (Object.keys(currentState).length === 0) {
    return false;
  }

  const text = message.toLowerCase().trim();

  // User explicitly starts a new search
  if (NEW_SEARCH_KEYWORDS.some(keyword => text.startsWith(keyword))) {
    return true;
  }

  // Brand changed
  if (
    newEntities.brand &&
    currentState.brand &&
    newEntities.brand !== currentState.brand
  ) {
    return true;
  }

  // Product type changed
  if (
    newEntities.product_type &&
    currentState.product_type &&
    newEntities.product_type !== currentState.product_type
  ) {
    return true;
  }

  return false;
}