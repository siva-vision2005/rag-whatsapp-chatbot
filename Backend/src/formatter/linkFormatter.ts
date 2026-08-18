export function formatProductLink(link?: string): string {

  if (!link) {
    return "";
  }

  return [
    "",
    "View Product",
    link
  ].join("\n");

}