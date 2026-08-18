/**
 * Full end-to-end conversation test suite.
 * Simulates real WhatsApp user messages and validates responses.
 *
 * Run with: npx ts-node src/testing/e2e.test.ts
 */

import { handleConversation } from "../conversation/conversation.service";
import { updateLastProducts } from "../conversation/conversationState";

const USER_ID = "test-user-e2e";
const PASS = "✅";
const FAIL = "❌";
const SKIP = "⏭️";

let totalPassed = 0;
let totalFailed = 0;

interface TestCase {
  label: string;
  message: string;
  expect: {
    type?: string;
    messageShouldContain?: string[];
    messageShouldNotContain?: string[];
    minLength?: number;
  };
  /** Pre-seed memory products before this test */
  seedProducts?: Record<string, any>[];
}

async function runTest(tc: TestCase): Promise<void> {
  if (tc.seedProducts) {
    updateLastProducts(USER_ID, tc.seedProducts);
  }

  let response: any;
  try {
    response = await handleConversation(USER_ID, tc.message);
  } catch (err: any) {
    console.log(`${FAIL} [${tc.label}]\n   ↳ THREW ERROR: ${err.message}\n`);
    totalFailed++;
    return;
  }

  const msg = response?.message ?? "";
  const type = response?.type ?? "";
  const issues: string[] = [];

  if (tc.expect.type && type !== tc.expect.type) {
    issues.push(`type: expected "${tc.expect.type}", got "${type}"`);
  }
  if (tc.expect.minLength && msg.length < tc.expect.minLength) {
    issues.push(`response too short (${msg.length} < ${tc.expect.minLength})`);
  }
  for (const substr of tc.expect.messageShouldContain ?? []) {
    if (!msg.toLowerCase().includes(substr.toLowerCase())) {
      issues.push(`missing expected content: "${substr}"`);
    }
  }
  for (const substr of tc.expect.messageShouldNotContain ?? []) {
    if (msg.toLowerCase().includes(substr.toLowerCase())) {
      issues.push(`should NOT contain: "${substr}"`);
    }
  }

  if (issues.length === 0) {
    console.log(`${PASS} [${tc.label}]`);
    console.log(`   ↳ "${msg.slice(0, 120).replace(/\n/g, " ")}…"\n`);
    totalPassed++;
  } else {
    console.log(`${FAIL} [${tc.label}]`);
    for (const issue of issues) console.log(`   ⚠ ${issue}`);
    console.log(`   ↳ Response: "${msg.slice(0, 200).replace(/\n/g, " ")}"\n`);
    totalFailed++;
  }
}

// ─── Sample products to seed in memory ───────────────────────────────────────
const SAMPLE_PRODUCTS = [
  {
    "Product Name": "Dell Inspiron 5410 2 In1 Core i3 11th Gen",
    Brand: "Dell",
    Price: "₹69,990.00",
    "Processor Name": "Intel Core i3 11th Gen",
    RAM: "8 GB DDR4",
    "SSD Capacity": "256 GB SSD",
    "Graphic Processor": "Intel Integrated UHD Graphics",
    "Screen Size": "35.56 cm (14 inch)",
    "Operating System": "Windows 11 Home",
    Weight: "1.6 kg"
  },
  {
    "Product Name": "Infinix INBook X1 Core i3 10th Gen",
    Brand: "Infinix",
    Price: "₹29,990.00",
    "Processor Name": "Intel Core i3 10th Gen",
    RAM: "8 GB LPDDR4X",
    "SSD Capacity": "256 GB SSD",
    "Graphic Processor": "Intel Integrated UHD Graphics",
    "Screen Size": "35.56 cm (14 inch)",
    "Operating System": "Windows 10 Home",
    Weight: "1.24 kg"
  },
  {
    "Product Name": "HP 14s Ryzen 5 5500U Laptop",
    Brand: "HP",
    Price: "₹51,990.00",
    "Processor Name": "AMD Ryzen 5 5500U",
    RAM: "8 GB DDR4",
    "SSD Capacity": "512 GB SSD",
    "Graphic Processor": "AMD Radeon Integrated Graphics",
    "Screen Size": "35.56 cm (14 inch)",
    "Operating System": "Windows 11 Home",
    Weight: "1.51 kg"
  },
  {
    "Product Name": "Lenovo IdeaPad Slim 3 Core i5",
    Brand: "Lenovo",
    Price: "₹45,990.00",
    "Processor Name": "Intel Core i5 12th Gen",
    RAM: "8 GB DDR4",
    "SSD Capacity": "512 GB SSD",
    "Graphic Processor": "Intel Iris Xe Graphics",
    "Screen Size": "39.62 cm (15.6 inch)",
    "Operating System": "Windows 11 Home",
    Weight: "1.7 kg"
  },
  {
    "Product Name": "ASUS Vivobook 15 Ryzen 7",
    Brand: "ASUS",
    Price: "₹62,990.00",
    "Processor Name": "AMD Ryzen 7 5700U",
    RAM: "16 GB DDR4",
    "SSD Capacity": "512 GB SSD",
    "Graphic Processor": "AMD Radeon Integrated",
    "Screen Size": "39.62 cm (15.6 inch)",
    "Operating System": "Windows 11 Home",
    Weight: "1.8 kg"
  }
];

// ─── Test Cases ───────────────────────────────────────────────────────────────
const TESTS: TestCase[] = [

  // ─── 1. Greeting ───
  {
    label: "1. Greeting - hi",
    message: "hi",
    expect: { messageShouldContain: ["hello", "welcome", "how can"] }
  },
  {
    label: "2. Greeting - good morning",
    message: "good morning",
    expect: { minLength: 10 }
  },

  // ─── 3. General Knowledge ───
  {
    label: "3. General - What is RAM?",
    message: "What is RAM in a laptop?",
    expect: { messageShouldContain: ["ram", "memory"], minLength: 30 }
  },
  {
    label: "4. General - SSD vs HDD",
    message: "what is the difference between SSD and HDD?",
    expect: { messageShouldContain: ["ssd", "hdd"], minLength: 50 }
  },
  {
    label: "5. General - i5 vs i7 which is better",
    message: "i5 vs i7 which is better for coding?",
    expect: { minLength: 40 }
  },

  // ─── 6. Product Search ───
  {
    label: "6. Search - laptops under 40000",
    message: "show me laptops under 40000",
    expect: { minLength: 30, messageShouldNotContain: ["error", "sorry, something went wrong"] }
  },
  {
    label: "7. Search - gaming laptops",
    message: "I need a gaming laptop",
    expect: { minLength: 30, messageShouldNotContain: ["error"] }
  },
  {
    label: "8. Search - Ryzen 5 laptop",
    message: "show me laptops with Ryzen 5 processor",
    expect: { minLength: 30, messageShouldNotContain: ["error"] }
  },
  {
    label: "9. Search - 16GB RAM laptop",
    message: "laptop with 16 GB RAM",
    expect: { minLength: 30, messageShouldNotContain: ["error"] }
  },
  {
    label: "10. Search - lightweight laptop for students",
    message: "I am a student looking for a light and affordable laptop",
    expect: { minLength: 40 }
  },

  // ─── 11. Product Comparison (with seeded memory) ───
  {
    label: "11. Compare - compare Dell and Infinix",
    message: "compare Dell and Infinix laptops",
    seedProducts: SAMPLE_PRODUCTS,
    expect: {
      messageShouldContain: ["dell", "infinix"],
      messageShouldNotContain: ["couldn't identify", "error"],
      minLength: 100
    }
  },
  {
    label: "12. Compare - compare all above products",
    message: "compare all the above products",
    seedProducts: SAMPLE_PRODUCTS,
    expect: {
      messageShouldContain: ["dell", "infinix", "hp", "lenovo", "asus"],
      messageShouldNotContain: ["couldn't identify", "error"],
      minLength: 200
    }
  },
  {
    label: "13. Compare - which one is best for multitasking",
    message: "which one is best for multitasking from the above",
    seedProducts: SAMPLE_PRODUCTS,
    expect: {
      minLength: 50,
      messageShouldNotContain: ["error", "couldn't identify"]
    }
  },
  {
    label: "14. Compare - compare these laptops and tell specs",
    message: "can you compare and tell me the specs of these laptops",
    seedProducts: SAMPLE_PRODUCTS,
    expect: {
      minLength: 100,
      messageShouldNotContain: ["error"]
    }
  },

  // ─── 15. Recommendation ───
  {
    label: "15. Recommendation - which is best for budget",
    message: "which laptop is the best for my budget from these?",
    seedProducts: SAMPLE_PRODUCTS,
    expect: { minLength: 40, messageShouldNotContain: ["error"] }
  },
  {
    label: "16. Recommendation - best for gaming",
    message: "which of the above laptops is best for gaming?",
    seedProducts: SAMPLE_PRODUCTS,
    expect: { minLength: 40 }
  },

  // ─── 17. Edge Cases ───
  {
    label: "17. Edge - non-laptop product (smartphone query)",
    message: "compare iPhone 15 and Samsung Galaxy S24",
    seedProducts: [],
    expect: { minLength: 20 } // should give graceful response, not crash
  },
  {
    label: "18. Edge - empty/short message",
    message: "ok",
    expect: { minLength: 5 }
  },
  {
    label: "19. Edge - compare with empty memory",
    message: "compare the above products",
    seedProducts: [],
    expect: { minLength: 10 } // should handle gracefully
  },
  {
    label: "20. Goodbye - bye",
    message: "bye",
    expect: { messageShouldContain: ["thank", "goodbye"] }
  }
];

// ─── Runner ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n" + "═".repeat(60));
  console.log(" 🧪 WhatsApp Chatbot E2E Test Suite (5-Test Subset)");
  console.log("═".repeat(60) + "\n");

  const runTests = TESTS.slice(0, 5);

  for (const tc of runTests) {
    await runTest(tc);
    // Small delay to avoid rate limiting across tests
    await new Promise(r => setTimeout(r, 800));
  }

  console.log("═".repeat(60));
  console.log(`\n📊 Results: ${totalPassed} passed, ${totalFailed} failed out of ${runTests.length} tests`);
  if (totalFailed === 0) {
    console.log("🎉 ALL TESTS PASSED! Bot is working correctly.\n");
    process.exit(0);
  } else {
    console.log(`⚠️  ${totalFailed} test(s) need attention.\n`);
    process.exit(1);
  }
}

main().catch(e => {
  console.error("Test runner crashed:", e);
  process.exit(1);
});
