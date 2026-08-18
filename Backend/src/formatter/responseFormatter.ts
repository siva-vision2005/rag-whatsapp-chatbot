import { formatProductCard } from "./productCardFormatter";

export function formatSearchResponse(
  products: Record<string, any>[]
): string {

  //----------------------------------------
  // No Products
  //----------------------------------------

  if (products.length === 0) {

    return [
      "😔 Sorry, I couldn't find any products matching your requirements.",
      "",
      "You can try:",
      "• Increase your budget",
      "• Choose another brand",
      "• Change the product specifications",
    ].join("\n");

  }

  const lines: string[] = [];

  //----------------------------------------
  // Header
  //----------------------------------------

  lines.push(`Found ${products.length} matching product${products.length > 1 ? "s" : ""}.`);
  lines.push("");

  if (products.length === 1) {
    lines.push("Best Match:");
  } else {
    lines.push("Best Matches:");
  }

  lines.push("");

  //----------------------------------------
  // Product Cards
  //----------------------------------------

  products.forEach((product, index) => {

    lines.push(
      formatProductCard(
        product,
        index + 1
      )
    );

    if (index !== products.length - 1) {

      lines.push("");
      lines.push("────────────────────────────");
      lines.push("");

    }

  });

  //----------------------------------------
  // Footer
  //----------------------------------------

  lines.push("");
  lines.push("What would you like to do next?");
  lines.push("");
  lines.push("• Compare products");
  lines.push("• Show more options");
  lines.push("• Change budget");
  lines.push("• Change brand");
  lines.push("• Change specifications");

  return lines.join("\n");

}