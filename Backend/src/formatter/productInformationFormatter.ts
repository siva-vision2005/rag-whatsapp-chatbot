export function formatProductInformation(
  product: Record<string, any>
): string {

  const lines: string[] = [];

  //----------------------------------------
  // Title
  //----------------------------------------

  lines.push(`Product: ${product.name}`);
  lines.push("");

  //----------------------------------------
  // Price
  //----------------------------------------

  lines.push("Price:");
  lines.push(product.Price ?? "N/A");
  lines.push("");

  //----------------------------------------
  // Performance
  //----------------------------------------

  lines.push("Performance:");

  lines.push(
    `• Processor: ${
      product["Processor Name"] ?? product.Processor ?? "N/A"
    } ${product["Processor Generation"] ?? ""}`
  );

  lines.push(
    `• Graphics: ${
      product["Graphic Processor"] ?? "N/A"
    }`
  );

  lines.push(
    `• RAM: ${
      product.RAM ?? "N/A"
    } ${product["RAM Type"] ?? ""}`
  );

  lines.push(
    `• Storage: ${
      product["SSD Capacity"] ??
      product["HDD Capacity"] ??
      "N/A"
    }`
  );

  lines.push("");

  //----------------------------------------
  // Display
  //----------------------------------------

  lines.push("Display:");

  lines.push(
    `• Size: ${
      product["Screen Size"] ?? "N/A"
    }`
  );

  lines.push(
    `• Resolution: ${
      product["Screen Resolution"] ?? "N/A"
    }`
  );

  lines.push("");

  //----------------------------------------
  // Operating System
  //----------------------------------------

  lines.push("Software:");

  lines.push(
    `• OS: ${
      product["Operating System"] ?? "N/A"
    }`
  );

  lines.push(
    `• MS Office: ${
      product["MS Office Provided"] ?? "No"
    }`
  );

  lines.push("");

  //----------------------------------------
  // Features
  //----------------------------------------

  lines.push("Features:");

  lines.push(
    `• Backlit Keyboard: ${
      product["Backlit Keyboard"] ?? "N/A"
    }`
  );

  lines.push(
    `• Wi-Fi: ${
      product["Wireless LAN"] ?? "N/A"
    }`
  );

  lines.push(
    `• Bluetooth: ${
      product["Bluetooth"] ?? "N/A"
    }`
  );

  lines.push("");

  //----------------------------------------
  // Warranty
  //----------------------------------------

  lines.push("Warranty:");

  lines.push(
    product["Warranty Summary"] ??
    "N/A"
  );

  return lines.join("\n");

}