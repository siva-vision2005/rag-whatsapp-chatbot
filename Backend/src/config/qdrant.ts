import { QdrantClient } from "@qdrant/js-client-rest";
import * as dotenv from "dotenv";

dotenv.config();

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
  port: 443,
  https: true,
});