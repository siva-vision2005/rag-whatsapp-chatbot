import { resolveProduct } from "./productResolver";
import { formatProductInformation } from "../formatter/productInformationFormatter";

export async function handleProductInformation(
  reference: string | number,
  lastProducts: Record<string, any>[]
): Promise<string> {

  const product = await resolveProduct(reference, lastProducts);

  if (!product) {
    const refStr = typeof reference === "string" ? reference : `item #${reference}`;
    return `😔 Sorry, I couldn't find *${refStr}* in our product catalog.

You can try:
• Search for available laptops (e.g., *HP*, *Dell*, *Lenovo*, *Asus*, *Acer*)
• Check the model name or number
• Ask for laptops within your budget`;
  }

  return formatProductInformation(product);
}