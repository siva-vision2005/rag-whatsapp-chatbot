import { gemini } from "../config/gemini";

export interface GeminiGenerateOptions {
  model: string;
  prompt: string;
  responseMimeType?: string;
  maxRetries?: number;
}

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function generateWithRetry(
  options: GeminiGenerateOptions
) {
  const {
    model,
    prompt,
    responseMimeType,
    maxRetries = 3,
  } = options;

  let attempt = 0;
  let delay = 2000;

  while (attempt <= maxRetries) {
    try {
      const response = await gemini.models.generateContent({
        model,
        contents: prompt,
        config: responseMimeType
          ? {
              responseMimeType,
            }
          : undefined,
      });

      return response;

    } catch (error: any) {

      const status =
        error?.status ??
        error?.response?.status;

     console.error(
  `Gemini Error (Attempt ${attempt + 1}):`,
  status
);

console.error(
  `Gemini request failed (status: ${status ?? "unknown"})`
);

if (error?.message) {
  console.error("Message:", error.message);
}

if (error?.error) {
  console.error("API Error:", JSON.stringify(error.error, null, 2));
}

      // Retry only temporary server errors

      if (
        [500, 502, 503, 504].includes(status) &&
        attempt < maxRetries
      ) {

        console.log(
          `Retrying in ${delay / 1000} seconds...`
        );

        await sleep(delay);

        delay *= 2;
        attempt++;

        continue;
      }

      // IMPORTANT:
      // Never create a new Error().
      // Throw the original error so ProviderManager
      // can detect the HTTP status.

      throw error;
    }
  }

  throw new Error(
    "Gemini service is temporarily unavailable."
  );
}