export function formatKnowledgeResponse(
  title: string,
  content: string
): string {

  return [
    `*${title}*`,
    "",
    content.trim(),
    "",
    "━━━━━━━━━━━━━━━━━━",
    "",
    "Need more information?",
  ].join("\n");

}