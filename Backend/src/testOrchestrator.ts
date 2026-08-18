import "dotenv/config";

import { orchestrator } from "./ai/orchestrator";

async function run() {
  const tests = [
    "Hi",

    "I need a laptop",

    "I need a stainless steel valve",

    "Show me office chairs",

    "Which battery is better silicon-carbon or lithium ion?",

    "Compare Dell and HP",

    "Tell me about Dell XPS",

    "Which laptop do you recommend?",

    "What is your return policy?",

    "I need customer support",

    "Thank you",

    "Bye"
  ];

  let history = "";

  for (const message of tests) {
    console.log("\n================================");
    console.log("Customer:");
    console.log(message);
    console.log("================================");

    const result = await orchestrator(
      message,
      history
    );

    console.log(result);

    history += `Customer: ${message}\n`;
  }
}

run();