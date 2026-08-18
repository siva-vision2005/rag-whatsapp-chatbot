export interface ProductCard {
  name: string;
  price?: string;
  image?: string;
  description?: string;
  reason?: string;
  features?: string[];
}

export function formatProductResponse(
  title: string,
  products: ProductCard[]
): string {

  if (products.length === 0) {
    return [
      "*No Matching Products Found*",
      "",
      "Try:",
      "• Different budget",
      "• Different brand",
      "• Fewer filters",
    ].join("\n");
  }

  const lines: string[] = [];

  lines.push(`*${title}*`);
  lines.push("");
  lines.push(`Found *${products.length}* matching product(s).`);
  lines.push("");

  products.forEach((product, index) => {

    lines.push("━━━━━━━━━━━━━━━━━━");
    lines.push(`*${index + 1}. ${product.name}*`);

    if (product.price) {
      lines.push(`Price : ${product.price}`);
    }

    if (
      product.features &&
      product.features.length > 0
    ) {
      lines.push("");
      lines.push("Key Features");

      product.features.forEach(feature => {
        lines.push(`• ${feature}`);
      });
    }

    if (product.reason) {
      lines.push("");
      lines.push(`${product.reason}`);
    }

    if (product.image) {
      lines.push("");
      lines.push(`Image: ${product.image}`);
    }

    lines.push("");

  });

  lines.push("━━━━━━━━━━━━━━━━━━");
  lines.push("");
  lines.push("Reply with:");
  lines.push("• Compare products");
  lines.push("• Show more");
  lines.push("• Apply another filter");

  return lines.join("\n");

}