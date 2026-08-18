export interface QueryUnderstandingResult {
  semanticQuery: string;

  filters: Record<string, string>;

  keywords: string[];

  readyForSearch: boolean;

  nextQuestion: string | null;

  reasoning: string;
}