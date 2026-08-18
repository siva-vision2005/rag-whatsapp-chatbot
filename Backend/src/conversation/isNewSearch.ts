const NEW_SEARCH_KEYWORDS = [
  "need",
  "want",
  "looking",
  "show",
  "find",
  "search",
  "buy",
  "recommend",
  "suggest",
  "give me"
];

export function isNewSearch(message: string): boolean {

  const text = message.toLowerCase();

  return NEW_SEARCH_KEYWORDS.some(keyword =>
    text.includes(keyword)
  );

}