import { FIELD_ALIASES } from "./fieldAliases";

export interface ClassifiedField {
  originalName: string;
  standardName: string;
}

export function classifyFields(
  headers: string[]
): ClassifiedField[] {

  return headers.map((header) => ({
    originalName: header,
    standardName: getStandardFieldName(header),
  }));

}

function getStandardFieldName(
  header: string
): string {

  const normalizedHeader = normalize(header);

  for (const [standardName, aliases] of Object.entries(FIELD_ALIASES)) {

    for (const alias of aliases) {

      if (normalizedHeader === normalize(alias)) {
        return standardName;
      }

    }

  }

  return header;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}