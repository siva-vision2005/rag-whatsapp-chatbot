import { resolveProduct } from "../services/productResolver";
import { ChatResponse } from "../types/chatResponse";
import { formatProductInformation } from "../formatter/productInformationFormatter";

export async function handleProductAction(
  action: string,
  entities: Record<string, any>,
  lastProducts: Record<string, any>[] = [],
  rawMessage: string = ""
): Promise<ChatResponse> {
  const reference =
    entities.productNumber ??
    entities.product_number ??
    entities.productName ??
    entities.product_name ??
    rawMessage;

  const product = await resolveProduct(reference, lastProducts);

  if (!product) {
    if (lastProducts && lastProducts.length > 0) {
      // Fallback to top product in memory if user says "show me the product image"
      const fallbackProduct = lastProducts[0];
      return executeActionForProduct(action, fallbackProduct);
    }
    return {
      type: "text",
      message: "Sorry, I couldn't identify which product you are referring to. Please specify the product name or number."
    };
  }

  return executeActionForProduct(action, product);
}

function executeActionForProduct(action: string, product: Record<string, any>): ChatResponse {
  const p = product;
  const name = p["Product Name"] ?? p.name ?? p.title ?? "Laptop";

  const rawImage = p.image || p.Image || p["Image URL"] || p["Image Url"] || p.image_url || p.Photo || p.photo;
  const hasImage = typeof rawImage === "string" && rawImage.trim().length > 0;

  const rawLink = p.link || p.url || p["Product Link"] || p["URL"] || p["Link"] || p["Product Url"];
  const hasLink = typeof rawLink === "string" && (rawLink.startsWith("http://") || rawLink.startsWith("https://"));

  const actionType = String(action || "").toLowerCase().trim();

  if (actionType === "image") {
    if (!hasImage) {
      return {
        type: "text",
        message: `An image is not available for *${name}* in our product catalog.`
      };
    }

    return {
      type: "products",
      message: `Here is the product image for *${name}*:`,
      products: [{ payload: p }]
    };
  }

  if (actionType === "buy" || actionType === "link") {
    if (!hasLink) {
      return {
        type: "text",
        message: `A direct purchase URL is not available for *${name}* in our product catalog.`
      };
    }

    return {
      type: "products",
      message: `You can view/purchase *${name}* directly using the link on the card below:`,
      products: [{ payload: p }]
    };
  }

  if (actionType === "price") {
    const price = p.Price ?? p.price ?? "N/A";
    return {
      type: "text",
      message: `The price for *${name}* is *₹${price}*.`
    };
  }

  // Fallback to product info
  return {
    type: "text",
    message: formatProductInformation(p)
  };
}