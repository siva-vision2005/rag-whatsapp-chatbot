import { normalizeFieldName } from "./schemaUtils";
import { CatalogSchema } from "./schemaTypes";

export function buildSchema(
  headers: string[]
): CatalogSchema {

  return {

    fields: headers.map(header => ({

      original: header,

      canonical: normalizeFieldName(header)

    }))

  };

}