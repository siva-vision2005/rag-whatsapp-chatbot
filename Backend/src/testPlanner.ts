import { PlannerService } from "./ai/planner/planner.service";

const planner = new PlannerService();

const testCases = [
  "Dell gaming laptop under 60000",

  "I need a laptop for AI and programming",

  "I'm a college student. My budget is around 80000. I prefer Dell or Lenovo. I need 16GB RAM, RTX graphics and good battery life.",

  "Compare the first two laptops",

  "Which one is better?",

  "Show details of product 2",

  "Buy this laptop",

  "What is RTX 5070?",

  "Suggest the best laptop under 70000",

  "I don't want HP. Show me Dell laptops with 1TB SSD."
];

async function run() {
  for (const input of testCases) {
    console.log("\n================================================");
    console.log("INPUT:");
    console.log(input);

    try {
      const plan = await planner.plan(input);

      console.log("\nPLANNER OUTPUT:");
      console.dir(plan, { depth: null });
    } catch (error) {
      console.error("Planner Error:");
      console.error(error);
    }

    console.log("================================================");
  }

  console.log("\n✅ All planner tests completed.");
}

run();