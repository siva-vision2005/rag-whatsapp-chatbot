export type ConversationStatus =
  | "IDLE"
  | "COLLECTING_INFO"
  | "READY_TO_SEARCH"
  | "SEARCHING"
  | "SEARCH_COMPLETED";

export type ConversationMode =
  | "NONE"
  | "PRODUCT_SEARCH"
  | "PRODUCT_COMPARISON"
  | "GENERAL_KNOWLEDGE"
  | "COMPANY_INFORMATION"
  | "SUPPORT";

export interface ConversationState {
  status: ConversationStatus;
  mode: ConversationMode;

  // Extracted entities collected during conversation
  fields: Record<string, any>;

  // Original search query built from conversation
  searchQuery: string;

  // Retrieved products from previous search
  lastProducts: Record<string, any>[];

  // Currently selected / active product
  selectedProduct?: Record<string, any> | null;

  // User's explicitly preferred / favorite product
  preferredProduct?: Record<string, any> | null;

  // Active filter constraints
  activeFilters?: Record<string, any>;

  // Last activity timestamp
  updatedAt: number;
}

const conversations = new Map<string, ConversationState>();

function createDefaultState(): ConversationState {
  return {
    status: "IDLE",
    mode: "NONE",
    fields: {},
    searchQuery: "",
    lastProducts: [],
    selectedProduct: null,
    preferredProduct: null,
    activeFilters: {},
    updatedAt: Date.now(),
  };
}

export function getConversationState(userId: string): ConversationState {
  return conversations.get(userId) ?? createDefaultState();
}

export function updateConversationState(
  userId: string,
  updates: Record<string, any>
): void {
  const current = getConversationState(userId);

  conversations.set(userId, {
    ...current,
    fields: {
      ...current.fields,
      ...updates,
    },
    updatedAt: Date.now(),
  });
}

export function updateConversationStatus(
  userId: string,
  status: ConversationStatus
): void {
  const current = getConversationState(userId);

  conversations.set(userId, {
    ...current,
    status,
    updatedAt: Date.now(),
  });
}

export function updateConversationMode(
  userId: string,
  mode: ConversationMode
): void {
  const current = getConversationState(userId);

  conversations.set(userId, {
    ...current,
    mode,
    updatedAt: Date.now(),
  });
}

export function updateSearchQuery(userId: string, query: string): void {
  const current = getConversationState(userId);

  conversations.set(userId, {
    ...current,
    searchQuery: query,
    updatedAt: Date.now(),
  });
}

export function updateLastProducts(
  userId: string,
  products: Record<string, any>[]
): void {
  const current = getConversationState(userId);

  conversations.set(userId, {
    ...current,
    lastProducts: products,
    updatedAt: Date.now(),
  });
}

export function setSelectedProduct(
  userId: string,
  product: Record<string, any> | null
): void {
  const current = getConversationState(userId);

  conversations.set(userId, {
    ...current,
    selectedProduct: product,
    updatedAt: Date.now(),
  });
}

export function setPreferredProduct(
  userId: string,
  product: Record<string, any> | null
): void {
  const current = getConversationState(userId);

  conversations.set(userId, {
    ...current,
    preferredProduct: product,
    selectedProduct: product,
    updatedAt: Date.now(),
  });
}

export function setActiveFilters(
  userId: string,
  filters: Record<string, any>
): void {
  const current = getConversationState(userId);

  conversations.set(userId, {
    ...current,
    activeFilters: filters,
    updatedAt: Date.now(),
  });
}

export function clearConversationState(userId: string): void {
  conversations.delete(userId);
}