export function formatCompanyResponse(
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
    "Let me know if you need more company information.",
  ].join("\n");

}