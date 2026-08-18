export interface ProductRenderData {
  name: string;
  brand?: string;
  price?: string;
  image?: string;
  link?: string;
  features: string[];
  payload: Record<string, any>;
}