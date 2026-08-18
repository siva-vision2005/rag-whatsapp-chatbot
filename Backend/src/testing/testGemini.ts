import { aiService } from "../services/ai.service";

async function main() {
  try {
    console.log("Testing Gemini...");

    const text = await aiService.generateText(
      "Reply with only: Hello"
    );

    console.log("SUCCESS:");
    console.log(text);

  } catch (error) {
    console.error("FAILED:");
    console.error(error);
  }
}

main();