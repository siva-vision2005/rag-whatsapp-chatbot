export function resolveFieldValue(
  payload: Record<string, any>,
  field: string
): any {

  const normalizedField = normalize(field);

  //---------------------------------------
  // 1. Exact Column Match
  //---------------------------------------

  for (const [key, value] of Object.entries(payload)) {

    if (!key.trim()) {
        continue;
    }

    if (normalize(key) === normalizedField) {
      console.log(
    "Resolver:",
    field,
    "=>",
    key,
    "=>",
    value
);
        return value;
    }

}

  //---------------------------------------
  // 2. Partial Column Match
  //---------------------------------------

 //---------------------------------------
// 2. Synonym Match Only
//---------------------------------------

const FIELD_ALIASES: Record<string, string[]> = {
    brand: ["brand", "manufacturer", "make"],

    product_type: [
        "type",
        "product type",
        "category",
        "product category"
    ],

    price: ["price", "selling price", "cost"],
    ram: ["ram", "memory"],
    storage: ["storage", "ssd", "hdd"],
    processor: ["processor", "cpu"],
    gpu: ["graphics", "graphic", "gpu", "graphicprocessor", "graphicsprocessor", "graphiccard", "graphicscard"],
};

const aliases = FIELD_ALIASES[normalizedField];

if (aliases) {

    for (const alias of aliases) {

        for (const [key, value] of Object.entries(payload)) {

            if (!key.trim()) continue;

            if (normalize(key) === normalize(alias)) {
                return value;
            }

        }

    }

}

  //---------------------------------------
  // 3. Infer Brand from Product Name
  //---------------------------------------

  if (
    normalizedField === "brand" ||
    normalizedField === "manufacturer"
  ) {

    const name =
      payload["name"] ??
      payload["title"] ??
      payload["product"];

    if (name) {

      const firstWord = String(name)
        .trim()
        .split(/\s+/)[0];

      return firstWord;
    }
  }

 //---------------------------------------
// 4. Fallback ONLY for search fields
//---------------------------------------

const searchFields = [
  "name",
  "title",
  "product",
  "product name",
  "description",
  "summary",
];

if (
  normalizedField === "name" ||
  normalizedField === "title" ||
  normalizedField === "product" ||
  normalizedField === "description"
) {
  for (const fieldName of searchFields) {
    if (payload[fieldName]) {
      return payload[fieldName];
    }
  }
}

return undefined;

  //---------------------------------------

  return undefined;

}

function normalize(value: string) {

    if (!value) {
        return "";
    }

    return value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();

}