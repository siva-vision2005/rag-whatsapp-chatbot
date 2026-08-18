const FEATURE_PRIORITY = [
  "Processor Name",
  "Processor",
  "RAM",
  "RAM Type",
  "Storage",
  "SSD Capacity",
  "SSD",
  "Graphic Processor",
  "Screen Size",
  "Screen Resolution",
  "Operating System",
  "Battery Backup",
  "User Rating",
  "Warranty Summary",
  "Color"
];

export function extractImportantFeatures(
  payload: Record<string, any>,
  limit = 6
): string[] {

  const features: string[] = [];

  for (const field of FEATURE_PRIORITY) {

    const value = payload[field];

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      continue;
    }

    switch (field) {

      case "Processor Name":
      case "Processor":
        features.push(`Processor: ${value}`);
        break;

      case "RAM":
        features.push(`RAM: ${value}`);
        break;

      case "RAM Type":
        features.push(`RAM Type: ${value}`);
        break;

      case "Storage":
      case "SSD Capacity":
          features.push(`Storage: ${value}`);
          break;

      case "SSD":
          if (
              String(value).toLowerCase() !== "yes" &&
              String(value).toLowerCase() !== "true"
          ) {
              features.push(`SSD: ${value}`);
          }
          break;

      case "Graphic Processor":
        features.push(`Graphics: ${value}`);
        break;

      case "Screen Size":
        features.push(`Display: ${value}`);
        break;

      case "Screen Resolution":
        features.push(`Resolution: ${value}`);
        break;

      case "Operating System":
        features.push(`OS: ${value}`);
        break;

      case "Battery Backup":
        features.push(`Battery: ${value}`);
        break;

      case "Warranty Summary":
        features.push(`Warranty: ${value}`);
        break;

      case "Color":
        features.push(`Color: ${value}`);
        break;

    }

    if (features.length >= limit) {
      break;
    }

  }

  return features;

}