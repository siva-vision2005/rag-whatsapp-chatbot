import { resolveProduct } from "../services/productResolver";
export interface ProductActionResponse {
  type: "text" | "image";
  message?: string;
  product?: Record<string, any>;
}

export async function handleProductAction(
  entities: Record<string, any>,
  lastProducts: Record<string, any>[]
): Promise<ProductActionResponse> {


  const action = (entities.action ?? "").toLowerCase();
  console.log("========== PRODUCT ACTION ==========");
console.log(JSON.stringify(entities, null, 2));
console.log("====================================");
  const reference =
  entities.productName ??
  entities.model ??
  entities.productNumber;

const product = await resolveProduct(
  reference,
  lastProducts
);

if (!product) {
  return {
    type: "text",
    message: "❌ I couldn't find that product."
  };
}

  switch (action) {

    //----------------------------------------
    // Product Link
    //----------------------------------------

    case "link": {

      const link =
        product["Product URL"] ??
        product["Product Link"] ??
        product["Link"] ??
        product["URL"] ??
        product.link ??
        product.url;

      if (!link) {
        return {
          type: "text",
          message: "❌ This product doesn't have a purchase link."
        };
      }

      return {
        type: "text",
        message: [
          "🔗 Product Link",
          "",
          `💻 ${product["Product Name"] ?? product.name}`,
          "",
          link
        ].join("\n")
      };
    }

    //----------------------------------------
    // Product Details / Specifications
    //----------------------------------------

    case "details":
    case "specifications": {

      return {
        type: "text",
        message: JSON.stringify(product, null, 2)
      };
    }

    //----------------------------------------
    // Product Image
    //----------------------------------------

    case "image": {

      return {
        type: "image",
        product
      };
    }

    //----------------------------------------
    // Product Price
    //----------------------------------------

    case "price": {

      const price =
        product["Price"] ??
        product.price ??
        "Not Available";

      return {
        type: "text",
        message: `💰 ${product["Product Name"] ?? product.name}\n\nPrice: ${price}`
      };
    }

    //----------------------------------------
    // Buy
    //----------------------------------------

    case "buy": {

      const link =
        product["Product URL"] ??
        product["Product Link"] ??
        product["Link"] ??
        product["URL"] ??
        product.link ??
        product.url;

      if (!link) {
        return {
          type: "text",
          message: "❌ Purchase link is not available for this product."
        };
      }

      return {
        type: "text",
        message: [
          "🛒 Buy Product",
          "",
          `💻 ${product["Product Name"] ?? product.name}`,
          "",
          link
        ].join("\n")
      };
    }

    //----------------------------------------
    // Default
    //----------------------------------------

    default:

      return {
        type: "text",
        message: "Sorry, I couldn't understand that request."
      };
  }
}