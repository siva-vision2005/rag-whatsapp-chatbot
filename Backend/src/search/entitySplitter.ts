export interface SplitEntities {
  hardFilters: Record<string, any>;
  softPreferences: string[];
}

const SOFT_PREFERENCE_FIELDS = [
  "purpose",
  "useCase",
  "usage",
  "preferences",
  "intent",
];

export function splitEntities(
  entities: Record<string, any>
): SplitEntities {

  const hardFilters: Record<string, any> = {};
  const softPreferences: string[] = [];

  for (const [key, value] of Object.entries(entities)) {

    if (SOFT_PREFERENCE_FIELDS.includes(key)) {

      if (Array.isArray(value)) {
        softPreferences.push(...value.map(String));
      } else if (value) {
        softPreferences.push(String(value));
      }

      continue;
    }

    hardFilters[key] = value;

  }

  return {
    hardFilters,
    softPreferences,
  };

}