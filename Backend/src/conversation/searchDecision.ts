export interface SearchDecision {
  shouldSearch: boolean;
  reason: string;
}

export function decideSearch(
  fields: Record<string, any>
): SearchDecision {

  //---------------------------------------
  // No information collected
  //---------------------------------------

  if (Object.keys(fields).length === 0) {
    return {
      shouldSearch: false,
      reason: "No product information found."
    };
  }

  //---------------------------------------
  // Any meaningful field is enough
  //---------------------------------------

  const meaningfulFields = Object.entries(fields).filter(
    ([_, value]) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
  );

  if (meaningfulFields.length > 0) {

    return {
      shouldSearch: true,
      reason: "Product search can begin."
    };

  }

  //---------------------------------------
  // Otherwise ask for more details
  //---------------------------------------

  return {
    shouldSearch: false,
    reason: "Need more information."
  };

}