import { renderProduct } from "./productRenderer";

export function renderProducts(
  products: Record<string, any>[]
): string {

  if (products.length === 0) {

    return [
      "No matching products found.",
      "",
      "Try changing your filters or budget."
    ].join("\n");

  }

  const lines: string[] = [];

  lines.push(
    `I found ${products.length} matching product(s).`
  );

  lines.push("");

  products.forEach((product, index) => {

    lines.push(
      renderProduct(
        product,
        index + 1
      )
    );

    if (index !== products.length - 1) {
      lines.push("\n");
    }

  });

  lines.push("");
  lines.push(
    "You can ask me to compare products, apply more filters, or show more results."
  );

  return lines.join("\n");

}