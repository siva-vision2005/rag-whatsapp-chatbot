import { ChatMessage, Product, RAGMetadata } from "../types/message";

export interface MockRAGResponse {
  message: string;
  type?: string;
  products?: Product[];
  ragMetadata: RAGMetadata;
}

export function getMockRAGResponse(chatId: string, query: string): MockRAGResponse {
  const normQuery = query.toLowerCase().trim();
  const timestamp = new Date();

  if (chatId === "ai-product-assistant") {
    // Greetings check
    const greetings = ["hi", "hello", "hey", "hii", "helo", "good morning", "good afternoon", "good evening", "good night", "welcome"];
    if (greetings.includes(normQuery)) {
      return {
        message: "👋 Hello! Welcome to our AI Assistant.\n\nHow can I help you today?",
        ragMetadata: {
          query,
          tokensUsed: 120,
          latencyMs: 80,
          modelName: "Mock RAG Model",
          retrievedChunks: []
        }
      };
    }

    // ASUS / Battery Life
    if (normQuery.includes("battery") || normQuery.includes("long") || normQuery.includes("asus") || normQuery.includes("zenbook")) {
      const bestProduct: Product = {
        payload: {
          Product_ID: "P-101",
          name: "ASUS Zenbook 14 OLED",
          price: "84,990",
          link: "https://www.asus.com/laptops/for-home/zenbook/zenbook-14-oled-ux3405/",
          image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80",
          processor: "Intel Core Ultra 7 155H",
          ram: "16GB LPDDR5X",
          storage: "1TB PCIe 4.0 SSD",
          graphics: "Intel Arc Graphics"
        }
      };

      const macbook: Product = {
        payload: {
          Product_ID: "P-102",
          name: "Apple MacBook Air M3",
          price: "1,14,900",
          link: "https://www.apple.com/macbook-air/",
          image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80",
          processor: "Apple M3 Chip (8-core CPU)",
          ram: "8GB Unified Memory",
          storage: "256GB SSD",
          graphics: "8-core GPU"
        }
      };

      return {
        message: "Based on our product database, the ASUS Zenbook 14 OLED offers the best battery life among our Windows recommendations, delivering up to 15-18 hours of typical office work. Alternatively, the Apple MacBook Air M3 is the overall efficiency leader, achieving 18+ hours of usage.\n\nHere are the top matches retrieved from our product specs repository:",
        type: "products",
        products: [bestProduct, macbook],
        ragMetadata: {
          query,
          tokensUsed: 890,
          latencyMs: 420,
          modelName: "Gemini 1.5 Flash",
          retrievedChunks: [
            {
              rank: 1,
              source: "catalog/specs/asus_zenbook_14_ux3405.json",
              score: 0.9124,
              content: "ASUS Zenbook 14 OLED (UX3405) - Power & Battery: 75Wh lithium-polymer battery. Up to 15 hours battery life in video playback test. Intel Evo edition with Core Ultra processors optimizing background tasks and active cores."
            },
            {
              rank: 2,
              source: "reviews/benchmarks/battery_shootout_2026.csv",
              score: 0.8541,
              content: "Battery Life Benchmarks (Web Browsing at 150 nits): 1. MacBook Air M3: 16h 22m. 2. ASUS Zenbook 14 OLED: 15h 08m. 3. Lenovo Yoga Slim 7: 13h 45m. 4. HP Envy x360: 11h 12m."
            },
            {
              rank: 3,
              source: "catalog/specs/macbook_air_m3.json",
              score: 0.7812,
              content: "Apple MacBook Air 13-inch (M3): Built-in 52.6-watt-hour lithium-polymer battery. Up to 18 hours Apple TV app movie playback, up to 15 hours wireless web."
            }
          ],
          promptTemplate: `You are a helpful AI Product Finder assistant. Answer the user's question about laptop battery life using only the retrieved specifications. Cite your sources.

=== RETRIEVED PRODUCT SPECS ===
[Source: catalog/specs/asus_zenbook_14_ux3405.json]
ASUS Zenbook 14 OLED (UX3405) - Power & Battery: 75Wh lithium-polymer battery. Up to 15 hours battery life in video playback test. Intel Evo edition with Core Ultra processors optimizing background tasks and active cores.

[Source: reviews/benchmarks/battery_shootout_2026.csv]
Battery Life Benchmarks (Web Browsing at 150 nits): 1. MacBook Air M3: 16h 22m. 2. ASUS Zenbook 14 OLED: 15h 08m. 3. Lenovo Yoga Slim 7: 13h 45m. 4. HP Envy x360: 11h 12m.

[Source: catalog/specs/macbook_air_m3.json]
Apple MacBook Air 13-inch (M3): Built-in 52.6-watt-hour lithium-polymer battery. Up to 18 hours Apple TV app movie playback, up to 15 hours wireless web.

=== USER QUERY ===
"${query}"

=== INSTRUCTIONS ===
List the top recommendations, mention exact battery capacity and average duration in hours, and format as a WhatsApp message.`
        }
      };
    }

    // Gaming Laptop Under 80,000
    if (normQuery.includes("gaming") || normQuery.includes("gpu") || normQuery.includes("rtx") || normQuery.includes("graphics") || normQuery.includes("80") || normQuery.includes("budget")) {
      const victus: Product = {
        payload: {
          Product_ID: "P-201",
          name: "HP Victus 16 (2025)",
          price: "76,990",
          link: "https://www.hp.com/in-en/shop/laptops/victus.html",
          image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
          processor: "AMD Ryzen 5 7640HS",
          ram: "16GB DDR5",
          storage: "512GB NVMe SSD",
          graphics: "NVIDIA RTX 4050 (6GB VRAM)"
        }
      };

      const tuf: Product = {
        payload: {
          Product_ID: "P-202",
          name: "ASUS TUF Gaming A15",
          price: "73,490",
          link: "https://www.asus.com/laptops/for-creators/tuf-gaming/",
          image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
          processor: "AMD Ryzen 5 7535HS",
          ram: "16GB DDR5",
          storage: "512GB SSD",
          graphics: "NVIDIA RTX 3050 (4GB VRAM)"
        }
      };

      return {
        message: "For a gaming laptop under ₹80,000, your best value choice is the **HP Victus 16** which features a powerful NVIDIA RTX 4050 GPU. Another option is the **ASUS TUF Gaming A15** which fits under budget and has a highly durable chassis. \n\nHere are the top matches retrieved from our database:",
        type: "products",
        products: [victus, tuf],
        ragMetadata: {
          query,
          tokensUsed: 940,
          latencyMs: 510,
          modelName: "Gemini 1.5 Flash",
          retrievedChunks: [
            {
              rank: 1,
              source: "catalog/specs/hp_victus_16.json",
              score: 0.8876,
              content: "HP Victus 16-s0093AX: AMD Ryzen 5 7640HS, 16GB DDR5 RAM, 512GB SSD, NVIDIA GeForce RTX 4050 Laptop GPU (6 GB GDDR6 dedicated), Price: ₹76,990."
            },
            {
              rank: 2,
              source: "catalog/specs/asus_tuf_a15.json",
              score: 0.8250,
              content: "ASUS TUF Gaming A15 (2024): Ryzen 5 7535HS, 16GB DDR5, 512GB SSD, NVIDIA RTX 3050 (4GB VRAM), military-grade certification, Price: ₹73,490."
            },
            {
              rank: 3,
              source: "pricing/offers/gaming_sale_july.json",
              score: 0.6954,
              content: "Gaming Laptop Discount Codes: HP Victus models get flat 5% instant cashback with HDFC cards. ASUS TUF models include free 1-year extended warranty."
            }
          ],
          promptTemplate: `You are a helpful AI Product Finder assistant. Recommend gaming laptops under the specified budget limit using only the retrieved database entries.

=== RETRIEVED PRODUCT SPECS ===
[Source: catalog/specs/hp_victus_16.json]
HP Victus 16-s0093AX: AMD Ryzen 5 7640HS, 16GB DDR5 RAM, 512GB SSD, NVIDIA GeForce RTX 4050 Laptop GPU (6 GB GDDR6 dedicated), Price: ₹76,990.

[Source: catalog/specs/asus_tuf_a15.json]
ASUS TUF Gaming A15 (2024): Ryzen 5 7535HS, 16GB DDR5, 512GB SSD, NVIDIA RTX 3050 (4GB VRAM), military-grade certification, Price: ₹73,490.

[Source: pricing/offers/gaming_sale_july.json]
Gaming Laptop Discount Codes: HP Victus models get flat 5% instant cashback with HDFC cards. ASUS TUF models include free 1-year extended warranty.

=== USER QUERY ===
"${query}"

=== INSTRUCTIONS ===
Filter items below ₹80,000, highlight graphics processing power, and format output text.`
        }
      };
    }

    // Default Laptop Query
    const defaultProduct: Product = {
      payload: {
        Product_ID: "P-999",
        name: "Lenovo IdeaPad Slim 3",
        price: "43,990",
        link: "https://www.lenovo.com/in/en/p/laptops/ideapad/ideapad-s-series/",
        image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
        processor: "Intel Core i5 12th Gen",
        ram: "16GB DDR4",
        storage: "512GB SSD",
        graphics: "Intel Integrated UHD"
      }
    };

    return {
      message: "Here is our general recommendation for a versatile, everyday laptop: the **Lenovo IdeaPad Slim 3**. It offers 16GB RAM and a solid i5 processor for smooth multitasking at a budget-friendly price. Let me know if you are looking for specific specs like battery, gaming power, or higher performance!",
      type: "products",
      products: [defaultProduct],
      ragMetadata: {
        query,
        tokensUsed: 620,
        latencyMs: 380,
        modelName: "Gemini 1.5 Flash",
        retrievedChunks: [
          {
            rank: 1,
            source: "catalog/specs/lenovo_ideapad_slim3.json",
            score: 0.7412,
            content: "Lenovo IdeaPad Slim 3 15IAH8: Intel Core i5-12450H, 16GB Soldered LPDDR5, 512GB SSD. Perfect for students and light office usage. Price: ₹43,990."
          }
        ],
        promptTemplate: `You are an AI Product assistant. Answer the user query using retrieved details:

=== RETRIEVED PRODUCT SPECS ===
[Source: catalog/specs/lenovo_ideapad_slim3.json]
Lenovo IdeaPad Slim 3 15IAH8: Intel Core i5-12450H, 16GB Soldered LPDDR5, 512GB SSD. Price: ₹43,990.

=== USER QUERY ===
"${query}"`
      }
    };
  }

  if (chatId === "hr-assistant") {
    // Holidays / annual leave
    if (normQuery.includes("holiday") || normQuery.includes("leave") || normQuery.includes("vacation") || normQuery.includes("annual")) {
      return {
        message: "Under our company's active HR guidelines, full-time employees are allocated **25 days of Paid Time Off (PTO)** annually, plus **8 public holidays**. Unused leave (up to a maximum of 5 days) can be rolled over to the next calendar year, but must be utilized before March 31st.",
        ragMetadata: {
          query,
          tokensUsed: 710,
          latencyMs: 310,
          modelName: "Gemini 1.5 Pro",
          retrievedChunks: [
            {
              rank: 1,
              source: "hr/policies/employee_handbook_2026.pdf",
              score: 0.9452,
              content: "Section 4.1: Annual Leave Allocation. Full-time permanent staff receive 25 standard working days of paid leave per calendar year. This is separate from medical or bereavement leave. Staff members can request a carry-over of up to 5 unused annual leave days to the following year, which must expire if unused by March 31 of that next year."
            },
            {
              rank: 2,
              source: "hr/policies/gazetted_holidays_2026.xlsx",
              score: 0.8124,
              content: "Corporate Holiday Schedule 2026: 8 official holiday closures observed: New Year's Day, Good Friday, Memorial Day, Independence Day, Labor Day, Thanksgiving, Day after Thanksgiving, Christmas Day."
            }
          ],
          promptTemplate: `You are an HR Policy Assistant chatbot. Answer the employee's policy query using the handbook excerpts below:

=== HANDBOOK EXCERPTS ===
[Source: hr/policies/employee_handbook_2026.pdf]
Section 4.1: Annual Leave Allocation. Full-time permanent staff receive 25 standard working days of paid leave per calendar year. This is separate from medical or bereavement leave. Staff members can request a carry-over of up to 5 unused annual leave days to the following year, which must expire if unused by March 31 of that next year.

[Source: hr/policies/gazetted_holidays_2026.xlsx]
Corporate Holiday Schedule 2026: 8 official holiday closures observed: New Year's Day, Good Friday, Memorial Day, Independence Day, Labor Day, Thanksgiving, Day after Thanksgiving, Christmas Day.

=== EMPLOYEE QUERY ===
"${query}"`
        }
      };
    }

    // Parental leave
    if (normQuery.includes("parental") || normQuery.includes("maternity") || normQuery.includes("paternity") || normQuery.includes("child")) {
      return {
        message: "Yes, we support parent employees with a progressive Parental Leave policy:\n• **Primary Caregivers**: 16 weeks of 100% paid leave.\n• **Secondary Caregivers**: 4 weeks of 100% paid leave.\n\nThis benefit applies to births or adoptions, provided you have been with the company for at least 1 year.",
        ragMetadata: {
          query,
          tokensUsed: 680,
          latencyMs: 290,
          modelName: "Gemini 1.5 Pro",
          retrievedChunks: [
            {
              rank: 1,
              source: "hr/benefits/parental_benefits_summary.docx",
              score: 0.9520,
              content: "Parental & Family Bonding Policy: permanent staff members with 12 months or more of continuous tenure are eligible for paid bonding leave. Primary caregivers (regardless of gender) receive up to 16 consecutive weeks of fully paid leave. Secondary caregivers are allocated up to 4 consecutive weeks of paid leave."
            },
            {
              rank: 2,
              source: "hr/policies/leave_of_absence_faq.pdf",
              score: 0.7410,
              content: "FAQ Section: Parental leave runs concurrently with FMLA benefits. Adoptive and foster parents are fully eligible for caregiver leaves under the same tenure criteria (1 year/12 months)."
            }
          ],
          promptTemplate: `Answer the parental leave question using only the HR document chunks:

=== RETRIEVED POLICY CHUNKS ===
[Source: hr/benefits/parental_benefits_summary.docx]
Parental & Family Bonding Policy: permanent staff members with 12 months or more of continuous tenure are eligible for paid bonding leave. Primary caregivers (regardless of gender) receive up to 16 consecutive weeks of fully paid leave. Secondary caregivers are allocated up to 4 consecutive weeks of paid leave.

[Source: hr/policies/leave_of_absence_faq.pdf]
FAQ Section: Parental leave runs concurrently with FMLA benefits. Adoptive and foster parents are fully eligible for caregiver leaves under the same tenure criteria (1 year/12 months).

=== EMPLOYEE QUERY ===
"${query}"`
        }
      };
    }

    // General HR Policy Query
    return {
      message: "I couldn't find a specific section for your query in the Employee Handbook. For general queries, please contact HR Partners at `hr@company.com` or submit a support ticket via the employee portal.",
      ragMetadata: {
        query,
        tokensUsed: 490,
        latencyMs: 190,
        modelName: "Gemini 1.5 Pro",
        retrievedChunks: [],
        promptTemplate: `You are an HR chatbot. Answer the employee's query. Return a fallback message if no matching handbook segments are found in the vector DB.

=== EMPLOYEE QUERY ===
"${query}"`
      }
    };
  }

  if (chatId === "smart-tech") {
    // Reset smart plug
    if (normQuery.includes("reset") || normQuery.includes("factory") || normQuery.includes("flash") || normQuery.includes("button")) {
      return {
        message: "To factory reset your **Smart Plug V2**:\n1. Press and hold the physical power button on the side of the plug.\n2. Keep it held for exactly **10 seconds**.\n3. Release the button when the LED ring flashes **amber and blue** rapidly. \n\nThe plug will enter Bluetooth pairing mode, and you can re-add it in the SmartHome app.",
        ragMetadata: {
          query,
          tokensUsed: 590,
          latencyMs: 250,
          modelName: "Gemini 1.5 Flash",
          retrievedChunks: [
            {
              rank: 1,
              source: "manuals/smartplug_v2_instructions.pdf",
              score: 0.9680,
              content: "Section 3: Factory Reset procedure. If the plug is unresponsive, locate the power button on the right-hand side. Press and hold it down for 10 seconds. The LED ring will transition from red to flashing blue/amber, indicating the factory settings have been restored."
            },
            {
              rank: 2,
              source: "support/kb/iot_reset_codes.md",
              score: 0.7250,
              content: "LED Status Codes for Smart Plugs: Solid Red - No Wi-Fi; Flashing Amber - Ready for setup; Flashing Amber/Blue - Factory Reset succeeded and device is in pairing broadcast mode."
            }
          ],
          promptTemplate: `Use the user manuals to explain how to factory reset the smart plug.

=== MANUAL EXCERPTS ===
[Source: manuals/smartplug_v2_instructions.pdf]
Section 3: Factory Reset procedure. If the plug is unresponsive, locate the power button on the right-hand side. Press and hold it down for 10 seconds. The LED ring will transition from red to flashing blue/amber, indicating the factory settings have been restored.

[Source: support/kb/iot_reset_codes.md]
LED Status Codes for Smart Plugs: Solid Red - No Wi-Fi; Flashing Amber - Ready for setup; Flashing Amber/Blue - Factory Reset succeeded and device is in pairing broadcast mode.

=== USER QUERY ===
"${query}"`
        }
      };
    }

    // Default Tech support
    return {
      message: "If your smart device is offline, first try power cycling it by unplugging it from the outlet for 10 seconds and plugging it back in. If that fails, let me know which model you are using, or check the status of your 2.4GHz home Wi-Fi network connection.",
      ragMetadata: {
        query,
        tokensUsed: 420,
        latencyMs: 180,
        modelName: "Gemini 1.5 Flash",
        retrievedChunks: [
          {
            rank: 1,
            source: "support/kb/general_offline_issues.md",
            score: 0.6540,
            content: "Smart Devices General Troubleshooting: 90% of connectivity failures are solved by power-cycling the device (10s offline) or confirming that the wireless router is broadcasting on the 2.4 GHz frequency band as 5 GHz is not supported."
          }
        ],
        promptTemplate: `Help the user troubleshoot their IoT device.

=== SEARCH RESULTS ===
[Source: support/kb/general_offline_issues.md]
Smart Devices General Troubleshooting: 90% of connectivity failures are solved by power-cycling the device (10s offline) or confirming that the wireless router is broadcasting on the 2.4 GHz frequency band as 5 GHz is not supported.

=== USER QUERY ===
"${query}"`
      }
    };
  }

  // General fallback
  return {
    message: `Received: "${query}". (Demo Mode placeholder response for general chat). You can inspect this mock RAG sequence using the button below.`,
    ragMetadata: {
      query,
      tokensUsed: 250,
      latencyMs: 150,
      modelName: "Mock RAG Model",
      retrievedChunks: [
        {
          rank: 1,
          source: "internal/documents/default.txt",
          score: 0.6000,
          content: "General baseline matching document retrieved for placeholder purposes. Mock RAG response is active because Live mode is disabled."
        }
      ]
    }
  };
}
