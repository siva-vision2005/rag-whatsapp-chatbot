import { getProducts } from "../services/googleSheets.service";
import { embedProduct } from "./embedProduct";
import { qdrant } from "../config/qdrant";

const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME!;
const BATCH_SIZE = 20;
const RETRY_DELAY = 60000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function indexProducts(): Promise<void> {
  try {
    const products = await getProducts();

    console.log(`Found ${products.length} products.`);

    for (let start = 0; start < products.length; start += BATCH_SIZE) {
      const batch = products.slice(start, start + BATCH_SIZE);

      console.log(
        `Processing products ${start + 1} - ${Math.min(
          start + BATCH_SIZE,
          products.length
        )}`
      );

      const points = [];

      for (let i = 0; i < batch.length; i++) {
        const product = batch[i];

        let vector: number[];

        while (true) {
          try {
            vector = await embedProduct(product);
            break;
          } catch (error: any) {
            if (error?.status === 429) {
              console.log("Gemini quota reached. Waiting 60 seconds...");
              await sleep(RETRY_DELAY);
              continue;
            }

            throw error;
          }
        }

        points.push({
          id: start + i + 1,
          vector,
          payload: {
    ...product,
    indexedAt: new Date().toISOString()
},
        });
      }

      await qdrant.upsert(COLLECTION_NAME, {
        wait: true,
        points,
      });

      console.log(`Indexed ${start + batch.length} of ${products.length} products.`);
    }

    console.log("Product indexing completed successfully.");
  } catch (error) {
    console.error("Failed to index products:", error);
  }
}

indexProducts();