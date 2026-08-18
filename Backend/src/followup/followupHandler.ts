import { sortByPrice } from "./resultSorter";

export interface FollowupResponse {
  handled: boolean;
  products?: any[];
}

export function handleFollowup(
  intent: string,
  products: any[]
): FollowupResponse {

  switch (intent) {

    case "SHOW_CHEAPER":

      return {

        handled: true,

        products: sortByPrice(products, "asc"),

      };

    case "SHOW_EXPENSIVE":

      return {

        handled: true,

        products: sortByPrice(products, "desc"),

      };

    default:

      return {

        handled: false,

      };

  }

}