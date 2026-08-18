export type SortOrder = "asc" | "desc";

/**
 * Sort products by price.
 * Works with prices like:
 * ₹32,999
 * Rs. 32,999
 * 32999
 * 32,999
 */
export function sortByPrice<T extends Record<string, any>>(
  products: T[],
  order: SortOrder = "asc"
): T[] {

  return [...products].sort((a, b) => {

    const priceA = extractPrice(a);
    const priceB = extractPrice(b);

    // Put products without price at the end
    if (priceA === null && priceB === null) return 0;
    if (priceA === null) return 1;
    if (priceB === null) return -1;

    return order === "asc"
      ? priceA - priceB
      : priceB - priceA;
  });

}

function extractPrice(
  product: Record<string, any>
): number | null {

  const possibleFields = [
    "price",
    "Price",
    "selling price",
    "Selling Price",
    "sale price",
    "Sale Price",
    "mrp",
    "MRP",
    "cost",
    "Cost"
  ];

  let value: any;

  for (const field of possibleFields) {

    if (product[field] !== undefined) {
      value = product[field];
      break;
    }

    if (
      product.payload &&
      product.payload[field] !== undefined
    ) {
      value = product.payload[field];
      break;
    }

  }

  if (value === undefined || value === null) {
    return null;
  }

  const number = Number(
    String(value).replace(/[^\d.]/g, "")
  );

  return isNaN(number)
    ? null
    : number;

}