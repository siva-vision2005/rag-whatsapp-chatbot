import { FIELD_ALIASES } from "./fieldAliases";

export function normalizeFieldName(
  field: string
): string {

  const normalized = field
    .toLowerCase()
    .trim();

  for (const [canonical, aliases] of Object.entries(FIELD_ALIASES)) {

    if (aliases.includes(normalized)) {
      return canonical;
    }

  }

  return normalized;

}