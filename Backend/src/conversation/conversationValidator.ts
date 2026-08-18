export interface ConversationValidationResult {
  extractedFields: Record<string, any>;
  removedFields: string[];
}

/*
 * Canonical entities understood by the chatbot.
 * These NEVER depend on the spreadsheet columns.
 */

const CANONICAL_FIELDS = new Set([
  "brand",
  "category",
  "product_type",
  "product",
  "model",
  "series",

  "price",

  "processor",
  "gpu",
  "ram",
  "storage",
  "display",

  "operating_system",
  "color",
  "purpose",

  "features",

  "weight",
  "dimensions",
  "capacity",
  "variant"
]);

export function validateConversationFields(
  extractedFields: Record<string, any>,
  _catalogMetadata: any
): ConversationValidationResult {

  const validatedFields: Record<string, any> = {};
  const removedFields: string[] = [];

  for (const [key, value] of Object.entries(extractedFields)) {

    if (
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0)
) {
  continue;
}

    const normalizedKey = normalizeKey(key);

    if (!CANONICAL_FIELDS.has(normalizedKey)) {

      removedFields.push(key);
      continue;

    }

    validatedFields[normalizedKey] =
      normalizeValue(value);

  }

  return {
    extractedFields: validatedFields,
    removedFields,
  };

}

function normalizeKey(key: string): string {

  return key
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

}

function normalizeValue(value: any): any {

  if (typeof value !== "string") {
    return value;
  }

  let text = value.trim();

  text = text.replace(/\s+/g, " ");

  const lower = text.toLowerCase();

  if (lower.startsWith("under ")) {
    return "<" + text.substring(6).trim();
  }

  if (lower.startsWith("below ")) {
    return "<" + text.substring(6).trim();
  }

  if (lower.startsWith("less than ")) {
    return "<" + text.substring(10).trim();
  }

  if (lower.startsWith("above ")) {
    return ">" + text.substring(6).trim();
  }

  if (lower.startsWith("greater than ")) {
    return ">" + text.substring(13).trim();
  }

  return text;

}