/**
 * Formatter for product comparison responses.
 * Preserves WhatsApp-native formatting:
 *  - Single-asterisk bold (*text*) is kept as-is
 *  - Monospace boxed table blocks are kept
 *  - Strips language tags (```sql -> ```) so WhatsApp doesn't render "sql"
 *  - Strips product IDs (LAP-0014) from text
 *  - Strips .00 from prices (₹69,990.00 -> ₹69,990) to save space
 */
export function formatComparisonResponse(text: string): string {
  return text
    // Strip language tags after ``` (e.g. ```sql or ```text -> ```)
    .replace(/```[a-zA-Z0-9_-]+\n/g, "```\n")

    // Remove internal Product IDs like LAP-0014, LAP-0006 from output
    .replace(/\bLAP-\d{4}\b:?\s*/gi, "")

    // Strip .00 from prices (e.g. ₹69,990.00 -> ₹69,990) to save width on mobile
    .replace(/(₹\s?[\d,]+)\.00/g, "$1")

    // Convert markdown bold (**text**) → WhatsApp bold (*text*)
    .replace(/\*\*(.*?)\*\*/g, "*$1*")

    // Remove markdown headings but keep text
    .replace(/^#{1,6}\s+/gm, "")

    // Collapse 3+ blank lines → 2 blank lines
    .replace(/\n{3,}/g, "\n\n")

    // Remove trailing spaces
    .replace(/[ \t]+$/gm, "")

    .trim();
}