export function updateConversationFields(
  currentState: Record<string, any>,
  newEntities: Record<string, any>
): Record<string, any> {

  const updatedState = {
    ...currentState,
  };

  // ----------------------------
  // Fields that replace old values
  // ----------------------------

  const replaceFields = [
    "brand",
    "manufacturer",
    "category",
    "type",
    "model",
    "series",
    "variant",
    "color",
    "processor",
    "processor name",
    "cpu",
    "gpu",
    "graphics",
    "ram",
    "memory",
    "storage",
    "price",
    "purpose",
    "usage"
  ];

  for (const [key, value] of Object.entries(newEntities)) {

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      continue;
    }

    const normalizedKey = key
      .toLowerCase()
      .trim();

    // Replace old value
    if (replaceFields.includes(normalizedKey)) {

      updatedState[key] = value;

      // Brand change removes model/series
      if (
        normalizedKey === "brand" ||
        normalizedKey === "manufacturer"
      ) {

        delete updatedState["Model"];
        delete updatedState["model"];

        delete updatedState["Series"];
        delete updatedState["series"];

        delete updatedState["Variant"];
        delete updatedState["variant"];
      }

      continue;
    }

    // Everything else gets merged
    updatedState[key] = value;

  }

  return updatedState;

}