import { resolveAttribute } from "../catalog/attributeResolver";
import { resolveFieldValue } from "../search/smartFieldResolver";

export interface SearchProduct {
  score: number;
  payload: Record<string, any>;
}

const FALLBACK_SEARCH_FIELDS = [
  "name",
  "title",
  "product",
  "product name",
  "model",
  "series",
  "description",
];

const EXACT_MATCH_FIELDS = [
  "part number",
  "sku",
];

export function filterProducts(
  products: SearchProduct[],
  filters: Record<string, unknown>
): SearchProduct[] {

  if (products.length === 0) {
    return [];
  }

  const cleanedFilters = { ...filters };

  // FIX: If minBudget and maxBudget are identical or min >= max, remove minBudget
  if (
    cleanedFilters.minBudget !== undefined &&
    cleanedFilters.maxBudget !== undefined &&
    Number(cleanedFilters.minBudget) >= Number(cleanedFilters.maxBudget)
  ) {
    console.log(`⚠️ Cleaning invalid filter range (minBudget: ${cleanedFilters.minBudget}, maxBudget: ${cleanedFilters.maxBudget}). Removing minBudget.`);
    delete cleanedFilters.minBudget;
  }

  return products.filter((product) => {

    const payload = product.payload;

    for (const [field, rawFilterValue] of Object.entries(cleanedFilters)) {

      if (
        rawFilterValue === undefined ||
        rawFilterValue === null ||
        rawFilterValue === "" ||
        (Array.isArray(rawFilterValue) && rawFilterValue.length === 0)
      ) {
        continue;
      }

      const normalizedField = normalize(field);
      const filterValue = String(rawFilterValue);
      let payloadValue = resolveAttribute(payload, field);

      //------------------------------------
      // Excluded Brands Filter
      //------------------------------------
      if (normalizedField === "excludedbrands" || normalizedField === "excludedbrand") {
        const brandVal = String(resolveAttribute(payload, "brand") ?? payload["name"] ?? "").toLowerCase();
        const excludedList = Array.isArray(rawFilterValue) ? rawFilterValue : [rawFilterValue];
        const isExcluded = excludedList.some(b => brandVal.includes(String(b).toLowerCase()));
        if (isExcluded) return false;
        continue;
      }

      //------------------------------------
      // Processor Filter
      //------------------------------------
      if (normalizedField === "processor" || normalizedField === "processorname") {
        const fullProcText = `${payload["Processor"] ?? ""} ${payload["Processor Name"] ?? ""} ${payload["Processor Generation"] ?? ""} ${payload["Processor Variant"] ?? ""} ${payload["name"] ?? ""}`;
        if (!matchProcessor(fullProcText, filterValue)) {
          return false;
        }
        continue;
      }

      //------------------------------------
      // GPU Filter
      //------------------------------------
      if (normalizedField === "gpu" || normalizedField === "graphicprocessor" || normalizedField === "graphics") {
        const fullGpuText = `${payload["Graphic Processor"] ?? ""} ${payload["Dedicated Graphic Memory Type"] ?? ""} ${payload["name"] ?? ""}`;
        if (!matchGpu(fullGpuText, filterValue)) {
          return false;
        }
        continue;
      }

      // Handle array filters
      if (Array.isArray(rawFilterValue)) {
        const matched = rawFilterValue.some(value =>
          compareValue(payloadValue, String(value))
        );

        if (!matched) {
          return false;
        }

        continue;
      }

      //------------------------------------
      // Exact Match Fields
      //------------------------------------
      if (EXACT_MATCH_FIELDS.includes(normalizedField)) {
        if (payloadValue === undefined || payloadValue === null) {
          return false;
        }

        if (normalize(String(payloadValue)) !== normalize(filterValue)) {
          return false;
        }

        continue;
      }

      //------------------------------------
      // Fallback Search
      //------------------------------------
      if (payloadValue === undefined || payloadValue === null) {
        const matched = searchFallbackFields(payload, filterValue);
        if (!matched) {
          return false;
        }
        continue;
      }

      //------------------------------------
      // Normal Comparison
      //------------------------------------
      let expectedValue = filterValue;

      if (normalizedField === "maxbudget" || normalizedField === "budget") {
        expectedValue = `<=${filterValue}`;
      }

      if (normalizedField === "minbudget") {
        expectedValue = `>=${filterValue}`;
      }

      const matched = compareValue(payloadValue, expectedValue);

      if (!matched) {
        return false;
      }

    }

    return true;

  });

}

function matchProcessor(productProcText: string, filterVal: string): boolean {
  const normProduct = productProcText.toLowerCase();
  const normFilter = filterVal.toLowerCase();

  // "i7" / "core i7" / "intel core i7"
  if (normFilter.includes("i7")) {
    return normProduct.includes("i7");
  }
  // "i5" / "core i5" / "intel core i5"
  if (normFilter.includes("i5")) {
    return normProduct.includes("i5");
  }
  // "i3" / "core i3" / "intel core i3"
  if (normFilter.includes("i3")) {
    return normProduct.includes("i3");
  }
  // "i9" / "core i9"
  if (normFilter.includes("i9")) {
    return normProduct.includes("i9");
  }
  // "ryzen 7"
  if (normFilter.includes("ryzen 7")) {
    return normProduct.includes("ryzen 7") || (normProduct.includes("ryzen") && normProduct.includes("7"));
  }
  // "ryzen 5"
  if (normFilter.includes("ryzen 5")) {
    return normProduct.includes("ryzen 5") || (normProduct.includes("ryzen") && normProduct.includes("5"));
  }
  // "ryzen 3"
  if (normFilter.includes("ryzen 3")) {
    return normProduct.includes("ryzen 3") || (normProduct.includes("ryzen") && normProduct.includes("3"));
  }

  // Fallback: all non-empty words in filterVal must exist in productProcText
  const words = normFilter.split(/\s+/).filter(w => w.length > 1);
  return words.every(w => normProduct.includes(w));
}

function matchGpu(productGpuText: string, filterVal: string): boolean {
  const normProduct = productGpuText.toLowerCase();
  const normFilter = filterVal.toLowerCase();

  const rtxMatch = normFilter.match(/rtx\s*(\d{4})/i);
  if (rtxMatch) {
    const cardNum = rtxMatch[1];
    return normProduct.includes(cardNum);
  }

  const gtxMatch = normFilter.match(/gtx\s*(\d{4})/i);
  if (gtxMatch) {
    const cardNum = gtxMatch[1];
    return normProduct.includes(cardNum);
  }

  if (normFilter.includes("rtx")) {
    return normProduct.includes("rtx");
  }

  if (normFilter.includes("gtx")) {
    return normProduct.includes("gtx");
  }

  if (normFilter.includes("nvidia") || normFilter.includes("geforce")) {
    return normProduct.includes("nvidia") || normProduct.includes("geforce");
  }

  const words = normFilter.split(/\s+/).filter(w => w.length > 1);
  return words.every(w => normProduct.includes(w));
}

function searchFallbackFields(
  payload: Record<string, any>,
  searchValue: string
): boolean {

  const keyword = normalize(searchValue);

  for (const field of FALLBACK_SEARCH_FIELDS) {

    const value = resolveFieldValue(payload, field);

    if (
      value !== undefined &&
      normalize(String(value)).includes(keyword)
    ) {
      return true;
    }

  }

  return false;

}

function compareValue(
  payloadValue: any,
  filterValue: string
): boolean {

  const payloadString = String(payloadValue ?? "");
  const payloadNumber = Number(
    payloadString.replace(/[^\d.]/g, "")
  );

  //------------------------------------
  // <= (Max Budget with 5% margin)
  //------------------------------------
  if (filterValue.startsWith("<=")) {
    const limit = Number(filterValue.substring(2));

    if (!isNaN(limit)) {
      // Allow up to 5% buffer over limit (e.g. ₹47,250 for 45,000)
      return payloadNumber <= limit * 1.05;
    }
  }

  //------------------------------------
  // >= (Min Budget)
  //------------------------------------
  if (filterValue.startsWith(">=")) {
    const limit = Number(filterValue.substring(2));

    if (!isNaN(limit)) {
      return payloadNumber >= limit;
    }
  }

  //------------------------------------
  // Text Match
  //------------------------------------
  return normalize(String(payloadValue)).includes(normalize(filterValue));

}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .trim();
}