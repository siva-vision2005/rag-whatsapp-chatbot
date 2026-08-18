export interface ProductCard {
  name: string;
  brand?: string;
  price?: string;
  image?: string;
  link?: string;

  features: string[];

  recommendation?: string;

  payload: Record<string, any>;
}

export interface CompanyResponse {
  title: string;
  message: string;
}

export interface KnowledgeResponse {
  title: string;
  content: string;
}

export interface ComparisonResponse {
  title: string;
  content: string;
}