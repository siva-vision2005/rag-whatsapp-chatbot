export function formatAIResponse(text: string): string {

  return text

    // Remove markdown bold
    .replace(/\*\*(.*?)\*\*/g, "$1")

    // Convert markdown bullets
    .replace(/^\*\s+/gm, "• ")

    // Remove remaining *
    .replace(/\*/g, "")

    // Remove markdown headings
    .replace(/^#{1,6}\s+/gm, "")

    // Remove inline code
    .replace(/`/g, "")

    // Remove triple code blocks
    .replace(/```[\s\S]*?```/g, "")

    // Horizontal rules
    .replace(/^---$/gm, "────────────────────")

    // Collapse many blank lines
    .replace(/\n{3,}/g, "\n\n")

    // Remove trailing spaces
    .replace(/[ \t]+$/gm, "")

    .trim();

}