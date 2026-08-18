import { Request, Response } from "express";
import { getProducts } from "../services/googleSheets.service";

export async function getAllProducts(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
}