import { getProducts } from "../services/googleSheets.service";

export async function findProductByName(
  productName: string
): Promise<Record<string, any> | null> {

  const products = await getProducts();

  const search = productName.toLowerCase().trim();

  const product = products.find((p) => {

    const name =
      (
        p["Product Name"] ??
        p.name ??
        ""
      ).toLowerCase();

    return name.includes(search);
  });

  return product ?? null;
}