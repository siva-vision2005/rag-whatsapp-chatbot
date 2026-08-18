export type Sender = "user" | "assistant";

export interface Product {
  payload: {
    Product_ID: string;
    name: string;
    price: number | string;
    link: string;
    image?: string;
    processor?: string;
    ram?: string;
    storage?: string;
    graphics?: string;
    [key: string]: any;
  };
}

export interface RAGChunk {
  content: string;
  source: string;
  score: number;
  rank: number;
}

export interface RAGMetadata {
  query: string;
  tokensUsed?: number;
  latencyMs?: number;
  retrievedChunks: RAGChunk[];
  promptTemplate?: string;
  modelName?: string;
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  content: string;
  timestamp: Date;

  type?: string;
  products?: Product[];
  bestProduct?: Product;
  ragMetadata?: RAGMetadata;
}