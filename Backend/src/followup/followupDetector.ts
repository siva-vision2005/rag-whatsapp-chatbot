export type FollowupIntent =
  | "SHOW_MORE"
  | "SHOW_CHEAPER"
  | "SHOW_EXPENSIVE"
  | "COMPARE_LAST"
  | "REPLACE_FILTER"
  | "NONE";

export interface FollowupResult {
  intent: FollowupIntent;
  value?: string;
}

export function detectFollowup(
  message: string
): FollowupResult {

  const text = message
    .toLowerCase()
    .trim();

  if (
    text.includes("show more") ||
    text.includes("another") ||
    text.includes("next")
  ) {
    return {
      intent: "SHOW_MORE",
    };
  }

  if (
    text.includes("cheaper") ||
    text.includes("lower price") ||
    text.includes("budget")
  ) {
    return {
      intent: "SHOW_CHEAPER",
    };
  }

  if (
    text.includes("expensive") ||
    text.includes("premium")
  ) {
    return {
      intent: "SHOW_EXPENSIVE",
    };
  }

  if (
    text.includes("compare first") ||
    text.includes("compare 1st") ||
    text.includes("compare second") ||
    text.includes("compare 2nd")
  ) {
    return {
      intent: "COMPARE_LAST",
    };
  }

  if (
    text.includes("instead")
  ) {

    const words = text.split(" ");

    return {

      intent: "REPLACE_FILTER",

      value: words[0]

    };

  }

  return {

    intent: "NONE"

  };

}