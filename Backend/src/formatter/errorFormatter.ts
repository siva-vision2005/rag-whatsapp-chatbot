export function formatErrorResponse(
  message: string
): string {

  return [
    "⚠️ *Unable to Complete Your Request*",
    "",
    message,
    "",
    "Please try again or change your search.",
  ].join("\n");

}