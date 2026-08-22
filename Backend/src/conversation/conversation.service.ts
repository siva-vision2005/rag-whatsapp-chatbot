import { conversationManager, ConversationManagerResult } from "../ai/conversationManager";
import { getConversationState, clearConversationState, updateConversationState, updateLastProducts } from "./conversationState";
import { getConversation, clearConversation, addMessage } from "../memory/conversationMemory";
import { knowledgeIndexer } from "../knowledge/knowledgeIndexer";
import { handleGeneralKnowledge } from "../handlers/generalKnowledge.handler";
import { handleProductSearch } from "../handlers/productSearch.handler";
import { handleProductComparison } from "../handlers/productComparison.handler";
import { handleRecommendation } from "../handlers/recommendation.handler";
import { handleProductInformation } from "../services/handleProductInformation";
import { ChatResponse } from "../types/chatResponse";
import { getCatalogMetadata } from "../catalog/catalog.service";
import { generateResponse } from "../ai/generateResponse";

function isNonLaptopQuery(message: string, entities: any = {}): boolean {
  const msg = message.toLowerCase().trim();
  
  // Non-laptop standalone product categories (NOT components)
  const nonLaptopKeywords = [
    "iphone", "samsung galaxy", "galaxy s2", "galaxy s3", "galaxy s4", "galaxy note",
    "smartphone", "smartphones", "mobile phone", "mobile phones", "cellphone", "cellphones",
    "smart tv", "television", "smarttv", "refrigerator", "fridge", "washing machine",
    "tablet", "ipad", "android tablet"
  ];
  
  // Check if any standalone non-laptop product keyword matches
  const hasKeyword = nonLaptopKeywords.some(kw => msg.includes(kw));
  
  // Check extracted category (standalone non-laptop categories only)
  const category = String(entities?.category ?? "").toLowerCase().trim();
  const nonLaptopCategories = [
    "phone", "smartphone", "tv", "television", "mobile", "fridge", "appliance", "tablet"
  ];
  const hasNonLaptopCategory = nonLaptopCategories.some(cat => category.includes(cat));

  return hasKeyword || hasNonLaptopCategory;
}

function isProductQuery(message: string): boolean {
  const msg = message.toLowerCase();
  // Only match explicit requests for laptops/products or price filters
  return /\b(need a laptop|show laptops|find laptops|recommend a laptop|suggest laptops|laptops under|laptop under|laptops below|laptops above|laptops with|dell laptop|hp laptop|acer laptop|lenovo laptop|asus laptop|msi laptop|apple laptop|macbook|buy laptop|show options|show products|catalogue|catalog)\b/i.test(msg) ||
         /\b(under|below)\s*₹?\s*\d+/i.test(msg);
}

export async function handleConversation(
  userId: string,
  message: string
): Promise<ChatResponse> {

  // Save user's message to conversation history memory
  addMessage(userId, `User: ${message}`);

  // ---------------------------------------
  // Knowledge Base & FAQ Check
  // ---------------------------------------

  const knowledge = knowledgeIndexer(message);

  if (knowledge) {
    switch (knowledge.intent) {
      case "greeting":
      case "thanks":
      case "goodbye":
        if (knowledge.intent === "goodbye") {
          clearConversation(userId);
          clearConversationState(userId);
        }
        const greetReply: ChatResponse = {
          type: "text",
          message: knowledge.response!
        };
        addMessage(userId, `Bot: ${greetReply.message}`);
        return greetReply;
    }
  }

  // ---------------------------------------
  // Conversation Manager
  // ---------------------------------------

  const conversationHistory = getConversation(userId);
  const currentConversation = getConversationState(userId);
  const currentState = currentConversation.fields;

  // Pass rich context to conversationManager/planner (specifically including lastProducts, intent, and status)
  const richState = {
    ...currentState,
    lastProducts: currentConversation.lastProducts,
    intent: currentConversation.mode,
    status: currentConversation.status
  };

  const conversationResult: ConversationManagerResult =
    await conversationManager(
      message,
      conversationHistory,
      richState
    );

  console.log("\n========== AI INTENT ==========");
  console.log("Intent:", conversationResult.intent);
  console.log("Entities:");
  console.log(conversationResult.entities);
  console.log("===============================\n");

  // Check if the query refers to smartphones/non-laptop products and gracefully reject
  if (isNonLaptopQuery(message, conversationResult.entities)) {
    const rejectResponse: ChatResponse = {
      type: "text",
      message: "😔 I specialize in laptops and computer hardware. I don't have details about smartphones, TVs, or other electronics in my catalog."
    };
    addMessage(userId, `Bot: ${rejectResponse.message}`);
    return rejectResponse;
  }

  // ---------------------------------------
  // Intent Routing
  // ---------------------------------------

  let result: ChatResponse;

  switch (conversationResult.intent) {

    case "general_knowledge": {
      // Respect general knowledge intent for conceptual/educational queries
      result = {
        type: "text",
        message: await handleGeneralKnowledge(message, getCatalogMetadata())
      };
      break;
    }

    case "product_comparison": {
      const currentConversation = getConversationState(userId);
      console.log("\n========== COMPARISON ==========");
      console.log(
        "Products in memory:",
        currentConversation.lastProducts.length
      );
      console.log(
        currentConversation.lastProducts.map(
          (p) => p["Product Name"] ?? p.name ?? p.title
        )
      );
      console.log("================================\n");

      result = await handleProductComparison(
        conversationResult.entities,
        currentConversation.lastProducts,
        message
      );
      break;
    }

    case "recommendation": {
      const currentConversation = getConversationState(userId);
      console.log("\n========== RECOMMENDATION ==========");
      console.log(
        "Products in memory:",
        currentConversation.lastProducts.length
      );
      console.log("===================================\n");

      if (!currentConversation.lastProducts || currentConversation.lastProducts.length === 0) {
        console.log("Empty memory during recommendation intent. Falling back to product search.");
        const searchResult = await handleProductSearch(
          message,
          currentState,
          conversationResult.plan
        );
        const topProduct = searchResult.products && searchResult.products.length > 0 ? searchResult.products[0] : undefined;
        
        // Save search results & entities to session state
        if (searchResult.products && searchResult.products.length > 0) {
          updateLastProducts(userId, searchResult.products);
        }
        if (conversationResult.entities && Object.keys(conversationResult.entities).length > 0) {
          updateConversationState(userId, conversationResult.entities);
        }
        
        result = {
          type: "products",
          message: searchResult.reply,
          products: searchResult.products ? searchResult.products.map(p => ({ payload: p })) : [],
          bestProduct: topProduct
        };
      } else {
        result = {
          type: "text",
          message: await handleRecommendation(
            message,
            currentConversation.lastProducts
          )
        };
      }
      break;
    }

    case "product_information": {
      const reference =
        conversationResult.entities.productNumber ??
        conversationResult.entities.productName ??
        message;

      const currentConversation = getConversationState(userId);

      result = {
        type: "text",
        message: await handleProductInformation(
          String(reference),
          currentConversation.lastProducts
        )
      };
      break;
    }

    case "product_discovery": {
      const currentConversation = getConversationState(userId);
      const isMemoryReference = conversationResult.plan?.useMemory || 
        /\b(above|these|those|this|that|which of|among|these laptops|above laptops|that model|those products)\b/i.test(message);

      if (isMemoryReference && currentConversation.lastProducts && currentConversation.lastProducts.length > 0) {
        console.log("Answering user query based on products in memory:", currentConversation.lastProducts.length);
        const reply = await generateResponse(message, currentConversation.lastProducts);
        result = {
          type: "products",
          message: reply,
          products: currentConversation.lastProducts.map(p => ({ payload: p }))
        };
        break;
      }

      const searchResult = await handleProductSearch(
        message,
        currentState,
        conversationResult.plan
      );

      const topProduct = searchResult.products && searchResult.products.length > 0 ? searchResult.products[0] : undefined;

      // Save search results & entities to session state
      if (searchResult.products && searchResult.products.length > 0) {
        updateLastProducts(userId, searchResult.products);
      }
      if (conversationResult.entities && Object.keys(conversationResult.entities).length > 0) {
        updateConversationState(userId, conversationResult.entities);
      }

      result = {
        type: "products",
        message: searchResult.reply,
        products: searchResult.products ? searchResult.products.map(p => ({ payload: p })) : [],
        bestProduct: topProduct
      };
      break;
    }

    default: {
      if (isProductQuery(message)) {
        console.log("Rerouting default/unknown query to product_discovery search.");
        const searchResult = await handleProductSearch(
          message,
          currentState,
          conversationResult.plan || { entities: {} }
        );
        const topProduct = searchResult.products && searchResult.products.length > 0 ? searchResult.products[0] : undefined;

        if (searchResult.products && searchResult.products.length > 0) {
          updateLastProducts(userId, searchResult.products);
        }
        if (conversationResult.entities && Object.keys(conversationResult.entities).length > 0) {
          updateConversationState(userId, conversationResult.entities);
        }

        result = {
          type: "products",
          message: searchResult.reply,
          products: searchResult.products ? searchResult.products.map(p => ({ payload: p })) : [],
          bestProduct: topProduct
        };
      } else {
        result = {
          type: "text",
          message: await handleGeneralKnowledge(message)
        };
      }
      break;
    }
  }

  // Save bot's reply message to conversation history memory
  if (result && result.message) {
    addMessage(userId, `Bot: ${result.message}`);
  }

  return result;
}