       import { handleConversation } from "../conversation/conversation.service";

interface TestStep {
  name: string;
  userId: string;
  message: string;
}

async function run() {
  console.log("════════════════════════════════════════════════════════════");
  console.log(" 🧪 Randomized & Interleaved 5-Question Chatbot Test Suite");
  console.log("════════════════════════════════════════════════════════════\n");

  // We will run the tests across three different users to test independent states and multi-turn flows
  const userA = "random-user-A"; // For general/search queries
  const userB = "random-user-B"; // For follow-up memory session 1
  const userC = "random-user-C"; // For follow-up memory session 2

  const allTestSteps: TestStep[] = [
    // 1. Basic search (User A)
    { name: "Search - Dell under 60k", userId: userA, message: "I need a Dell laptop under ₹60,000." },

    // 2. Recommendation (User A)
    { name: "Rec - College student", userId: userA, message: "I'm a college student. Which laptop would you recommend?" },

    // 3. Start Multi-turn Session 1 (User B)
    { name: "Session B1 - Programming under 80k", userId: userB, message: "Suggest laptops for programming under ₹80,000." },

    // 4. Product Info (User A)
    { name: "Info - Dell G15 upgradeable RAM", userId: userA, message: "Does the Dell G15 have an upgradeable RAM?" },

    // 5. Follow-up turn B2 (User B)
    { name: "Session B2 - Filter 1TB SSD", userId: userB, message: "Only show the ones with 1TB SSD." }
  ];

  // Run a subset of 5 questions as requested
  const testSteps = allTestSteps.slice(0, 5);

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < testSteps.length; i++) {
    const step = testSteps[i];
    console.log(`\n========================================`);
    console.log(`⏳ RUNNING [${i + 1}/5]: ${step.name}`);
    console.log(`💬 User (${step.userId}): "${step.message}"`);
    console.log(`========================================`);

    try {
      const response = await handleConversation(step.userId, step.message);

      console.log(`Response Type: ${response.type}`);
      const snippet = response.message.replace(/\s+/g, ' ').slice(0, 120);
      console.log(`Response Snippet: "${snippet}..."`);

      // Check if response is empty or contains standard error message indicating failure
      const isFailed = !response.message || response.message.includes("couldn't find any products matching your requirements") && !response.message.includes("We don't currently have");
      
      if (isFailed) {
        console.log(`❌ Failed - Empty response or dead-end search message.`);
        failed++;
      } else {
        console.log(`✅ Passed`);
        passed++;
      }
    } catch (err: any) {
      console.error(`❌ Error during test:`, err.message || err);
      failed++;
    }
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log(" 📊 Final Summary");
  console.log(` Passed: ${passed} / 5`);
  console.log(` Failed: ${failed} / 5`);
  console.log("════════════════════════════════════════════════════════════\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
