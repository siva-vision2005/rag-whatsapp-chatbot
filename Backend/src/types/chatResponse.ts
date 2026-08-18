export type ChatResponseType =
    | "text"
    | "products"
    | "product_image"
    | "comparison_image";

export interface ChatProduct {
  payload: Record<string, any>;
}

export interface ChatResponse {

    type: ChatResponseType;

    message?: string;

    products?: {
        payload: any;
    }[];

    product?: any;

    bestProduct?: Record<string, any>;

    comparisonImageBuffer?: Buffer;
}