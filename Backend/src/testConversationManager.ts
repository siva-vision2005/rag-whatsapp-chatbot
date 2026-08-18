import {
  initializeCatalog,
  getCatalogMetadata,
} from "./catalog/catalog.service";

import { conversationManager } from "./ai/conversationManager";

async function main() {
  console.clear();

  console.log("====================================");
  console.log(" Conversation Manager Test");
  console.log("====================================\n");

  await initializeCatalog();

  const catalogMetadata = getCatalogMetadata();

  const testConversations = [
    {
      title: "Conversation 1",
      messages: [
        "Hi",
        "I need a product",
        "Under 50000",
        "Black color",
      ],
    },

    {
      title: "Conversation 2",
      messages: [
        "I'm looking for something for gaming",
        "Dell",
        "16GB RAM",
        "RTX 4050",
      ],
    },

    {
      title: "Conversation 3",
      messages: [
        "I need software",
        "Hospital management",
        "Cloud based",
        "100 users",
      ],
    },

    {
      title: "Conversation 4",
      messages: [
        "Need industrial valve",
        "PVC",
        "6 inch",
        "High pressure",
      ],
    },

    {
      title: "Conversation 5",
      messages: [
        "Looking for office furniture",
        "Wooden",
        "Brown",
        "Budget 15000",
      ],
    },
  ];

  for (const test of testConversations) {
    console.log("\n==================================================");
    console.log(test.title);
    console.log("==================================================");

    let history = "";
    let state: Record<string, any> = {};

    for (const message of test.messages) {
      console.log("\nCustomer:");
      console.log(message);

      const result = await conversationManager(
    message,
    history,
    state
);

      console.log("\nConversation Manager Output");
      console.log(JSON.stringify(result, null, 2));

      // Merge extracted entities into conversation state
      state = {
        ...state,
        ...result.entities,
      };

      // Update conversation history
      history += `Customer: ${message}\n`;

      console.log("\nConversation State");
      console.log(JSON.stringify(state, null, 2));

      // Stop when at least one entity has been extracted
      if (Object.keys(result.entities).length > 0) {
        console.log("\n✅ Entities Extracted");
        break;
      }
    }

    console.log("\n----------------------------------------------");
    console.log("Final State");
    console.log(JSON.stringify(state, null, 2));
    console.log("----------------------------------------------");
  }

  console.log("\n====================================");
  console.log(" All Tests Completed");
  console.log("====================================");
}

main().catch(console.error);