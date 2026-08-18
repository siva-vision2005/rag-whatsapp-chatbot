import {
  BRAND_FIELDS,
  IMAGE_FIELDS,
  LINK_FIELDS,
  PRICE_FIELDS,
  PRODUCT_NAME_FIELDS,
} from "./constants";

import { selectFeatures } from "./featureSelector";

function getValue(
  payload: Record<string, any>,
  fields: string[]
): string | undefined {

  for (const field of fields) {

    const value = payload[field];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return String(value);
    }

  }

  return undefined;

}

export function renderProduct(
  payload: Record<string, any>,
  index: number
): string {

  const lines: string[] = [];

  const image = getValue(payload, IMAGE_FIELDS);

  const name =
    getValue(payload, PRODUCT_NAME_FIELDS) ??
    "Unknown Product";

  const brand = getValue(payload, BRAND_FIELDS);

  const price = getValue(payload, PRICE_FIELDS);

  const link = getValue(payload, LINK_FIELDS);

  const features = selectFeatures(payload);

  if (image) {
    lines.push(image);
    lines.push("");
  }

  lines.push(`Product ${index}`);

  if (brand) {
    lines.push(`${brand} ${name}`);
  } else {
    lines.push(name);
  }

  if (price) {
    lines.push("");
    lines.push(`Price: ${price}`);
  }

  if (features.length > 0) {

    lines.push("");
    lines.push("Specifications");

    for (const feature of features) {
      lines.push(`• ${feature}`);
    }

  }

  if (link) {

    lines.push("");
    lines.push("View Product");
    lines.push(link);

  }

  return lines.join("\n");

}