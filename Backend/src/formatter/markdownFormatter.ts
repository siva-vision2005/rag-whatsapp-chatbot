export function cleanMarkdown(text: string): string {

  return text

    // Bold
    .replace(/\*\*(.*?)\*\*/g, "$1")

    // Italic/Bullets
    .replace(/^\*\s+/gm, "• ")

    // Remaining *
    .replace(/\*/g, "")

    // Markdown headings
    .replace(/^#{1,6}\s+/gm, "")

    // Code blocks
    .replace(/```[\s\S]*?```/g, "")

    // Inline code
    .replace(/`/g, "")

    // Horizontal rules
    .replace(/^---$/gm, "────────────────────")

    // Extra blank lines
    .replace(/\n{3,}/g, "\n\n")

    .trim();

}