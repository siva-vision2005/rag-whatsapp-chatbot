import { qdrant } from "../config/qdrant";

const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME!;

async function createCollection(): Promise<void> {
  try {
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 3072,
        distance: "Cosine",
      },
    });

    console.log(`Collection "${COLLECTION_NAME}" created successfully.`);
  } catch (error: any) {
    if (error?.status === 409) {
      console.log(`Collection "${COLLECTION_NAME}" already exists.`);
    } else {
      console.error("Failed to create collection:", error);
    }
  }
}

createCollection();