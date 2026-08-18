import { resolveFieldValue } from "../search/smartFieldResolver";

const ATTRIBUTE_ALIASES: Record<string, string[]> = {
  brand: [
    "Brand",
    "Manufacturer",
    "Company",
    "Make"
  ],
  preferredbrands: [
    "Brand",
    "Manufacturer",
    "Company",
    "Make"
  ],

  price: [
    "Price",
    "Selling Price",
    "MRP",
    "Cost"
  ],

  maxbudget: [
    "Price",
    "Selling Price",
    "MRP",
    "Cost"
  ],

  minbudget: [
    "Price",
    "Selling Price",
    "MRP",
    "Cost"
  ],

  category: [
    "Type",
    "Product Type",
    "Category",
    "Product Category",
    "Suitable For"
  ],

  // ...
};

export function resolveAttribute(
  payload: Record<string, any>,
  attribute: string
): any {

  const aliases =
  ATTRIBUTE_ALIASES[attribute.toLowerCase()] ?? [attribute];

  for (const alias of aliases) {

    const value = resolveFieldValue(
      payload,
      alias
    );

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }

  }

  return undefined;

}