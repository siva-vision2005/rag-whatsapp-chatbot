export type Tool =
  | "catalog_search"
  | "catalog_filter"
  | "memory"
  | "comparison"
  | "recommendation"
  | "general_knowledge"
  | "clarification"
  | "response_generator";

export type Intent =
  | "greeting"
  | "product_search"
  | "product_comparison"
  | "product_information"
  | "product_action"
  | "recommendation"
  | "general_knowledge"
  | "help"
  | "goodbye"
  | "unknown";

export interface PlannerEntities {
  // Brand
  preferredBrands?: string[];
  excludedBrands?: string[];

  // Category
  category?: string;

  // Product
  productName?: string;
  productNumber?: number;

  // Budget
  budget?: number;
  minBudget?: number;
  maxBudget?: number;

  // Hardware
  processor?: string;
  ram?: string;
  storage?: string;
  gpu?: string;

  // Usage
  softPreferences?: string[];

  // Preferences
  battery?: string;
  display?: string;
  weight?: string;
  os?: string;
  color?: string;

  // Comparison
  compareProducts?: string[];

  quantity?: number;
}

export interface PlannerPlan {
  intent: Intent;

  goal: string;

  tools: Tool[];

  entities: PlannerEntities;

  useCatalog: boolean;

  useMemory: boolean;

  useGeneralKnowledge: boolean;

  needComparison: boolean;

  needRecommendation: boolean;

  missingInformation: string[];

  nextQuestion: string;

  confidence: number;
}