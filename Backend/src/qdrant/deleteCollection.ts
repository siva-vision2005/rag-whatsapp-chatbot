import { qdrant } from "../config/qdrant";

const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME!;

async function deleteCollection(): Promise<void> {
  try {
    await qdrant.deleteCollection(COLLECTION_NAME);
    console.log(`Collection "${COLLECTION_NAME}" deleted successfully.`);
  } catch (error) {
    console.error("Failed to delete collection:", error);
  }
}

deleteCollection();