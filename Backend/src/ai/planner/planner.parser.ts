import { PlannerPlan, PlannerEntities } from "./planner.types";

export class PlannerParser {
  static parse(raw: Partial<PlannerPlan> = {}): PlannerPlan {
    let minB = raw.entities?.minBudget ?? undefined;
    let maxB = raw.entities?.maxBudget ?? undefined;

    // FIX: If minBudget >= maxBudget (e.g. minBudget=45000, maxBudget=45000 from "under 45000"),
    // clear minBudget so it acts as upper bound "under 45000" rather than exact equality.
    if (minB !== undefined && maxB !== undefined && Number(minB) >= Number(maxB)) {
      minB = undefined;
    }

    const entities: PlannerEntities = {
      preferredBrands: raw.entities?.preferredBrands ?? [],
      excludedBrands: raw.entities?.excludedBrands ?? [],

      category: raw.entities?.category ?? "",

      productName: raw.entities?.productName ?? "",
      productNumber: raw.entities?.productNumber ?? undefined,

      budget: raw.entities?.budget ?? undefined,
      minBudget: minB,
      maxBudget: maxB,

      processor: raw.entities?.processor ?? "",
      ram: raw.entities?.ram ?? "",
      storage: raw.entities?.storage ?? "",
      gpu: raw.entities?.gpu ?? "",

      // Backward compatibility
      softPreferences:
        (raw.entities as any)?.softPreferences ??
        (raw.entities as any)?.purpose ??
        [],

      battery: raw.entities?.battery ?? "",
      display: raw.entities?.display ?? "",
      weight: raw.entities?.weight ?? "",
      os: raw.entities?.os ?? "",
      color: raw.entities?.color ?? "",

      compareProducts: raw.entities?.compareProducts ?? [],

      quantity: raw.entities?.quantity ?? undefined,
    };

    return {
      intent: raw.intent ?? "unknown",

      goal: raw.goal ?? "",

      tools: Array.isArray(raw.tools) ? [...new Set(raw.tools)] : [],

      entities,

      useCatalog: raw.useCatalog ?? false,

      useMemory: raw.useMemory ?? false,

      useGeneralKnowledge: raw.useGeneralKnowledge ?? false,

      needComparison: raw.needComparison ?? false,

      needRecommendation: raw.needRecommendation ?? false,

      missingInformation: Array.isArray(raw.missingInformation)
        ? raw.missingInformation
        : [],

      nextQuestion: raw.nextQuestion ?? "",

      confidence:
        typeof raw.confidence === "number"
          ? Math.min(1, Math.max(0, raw.confidence))
          : 0,
    };
  }
}