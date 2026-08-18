import { extractImportantFeatures } from "./featureExtractor";

export function formatProductCard(
  payload: Record<string, any>,
  index: number
): string {

  const lines: string[] = [];

  //----------------------------------------
  // Product Name
  //----------------------------------------

  const name =
    payload["Product Name"] ??
    payload.Name ??
    payload.name ??
    "Unknown Product";

  //----------------------------------------
  // Brand
  //----------------------------------------

  const brand =
    payload.Brand ??
    payload.brand ??
    "";

  //----------------------------------------
  // Display Name
  //----------------------------------------

  let displayName = name;

  if (
    brand &&
    !name.toLowerCase().startsWith(brand.toLowerCase())
  ) {
    displayName = `${brand} ${name}`;
  }

  //----------------------------------------
  // Price
  //----------------------------------------

  const price =
    payload.Price ??
    payload.price ??
    "";

  //----------------------------------------
  // Rating
  //----------------------------------------

  const rating =
    payload["User Rating"] ??
    payload.Rating ??
    payload.rating;

  //----------------------------------------
  // Header
  //----------------------------------------

  lines.push(`Product ${index}`);
  lines.push("");
  lines.push(`Name: ${displayName}`);

  if (price) {
    lines.push(`Price: ${price}`);
  }

  if (rating) {
    lines.push(`Rating: ${rating} ⭐`);
  }

  //----------------------------------------
  // Specifications
  //----------------------------------------

  const features = extractImportantFeatures(payload);

  if (features.length > 0) {
    lines.push("");
    lines.push("Key Specifications:");
    lines.push("");

    for (const feature of features.slice(0, 6)) {
      lines.push(`• ${feature}`);
    }
  }

  return lines.join("\n");

}