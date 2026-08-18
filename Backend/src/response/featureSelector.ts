const HIDDEN_FIELDS = new Set([
  "id",
  "_id",
  "vector",
  "embedding",
  "payload",
  "metadata",
  "score",
  "internal_id",
  "internalid",
  "image",
  "imageurl",
  "image_url",
  "productimage",
  "link",
  "url",
  "product_url",
  "sales package",
  "salespackage",
  "part number",
  "partnumber",
  "model number",
  "modelnumber",
]);

export function selectFeatures(
  payload: Record<string, any>,
  maxFeatures = 5
): string[] {

  const features: string[] = [];

  for (const [key, value] of Object.entries(payload)) {

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      continue;
    }

    const normalized = key
      .toLowerCase()
      .trim();

    if (HIDDEN_FIELDS.has(normalized)) {
      continue;
    }

    features.push(`${key}: ${value}`);

    if (features.length >= maxFeatures) {
      break;
    }

  }

  return features;
}