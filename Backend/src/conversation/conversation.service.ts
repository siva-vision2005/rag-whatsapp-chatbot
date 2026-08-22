import { conversationManager, ConversationManagerResult } from "../ai/conversationManager";
import { getConversationState, clearConversationState, updateConversationState, updateLastProducts, setSelectedProduct, setPreferredProduct } from "./conversationState";
import { getConversation, clearConversation, addMessage } from "../memory/conversationMemory";
import { knowledgeIndexer } from "../knowledge/knowledgeIndexer";
import { handleGeneralKnowledge } from "../handlers/generalKnowledge.handler";
import { handleProductSearch } from "../handlers/productSearch.handler";
import { handleProductComparison } from "../handlers/productComparison.handler";
import { handleRecommendation } from "../handlers/recommendation.handler";
import { handleProductAction } from "../handlers/productAction.handler";
import { handleProductInformation } from "../services/handleProductInformation";
import { resolveProduct } from "../services/productResolver";
import { ChatResponse } from "../types/chatResponse";
import { getCatalogMetadata } from "../catalog/catalog.service";
import { generateResponse } from "../ai/generateResponse";

function isNonLaptopQuery(message: string, entities: any = {}): boolean {
  const msg = message.toLowerCase().trim();
  
  const nonLaptopKeywords = [
    "iphone", "samsung galaxy", "galaxy s2", "galaxy s3", "galaxy s4", "galaxy note",
    "smartphone", "smartphones", "mobile phone", "mobile phones", "cellphone", "cellphones",
    "smart tv", "television", "smarttv", "refrigerator", "fridge", "washing machine",
    "tablet", "ipad", "android tablet"
  ];
  
  const hasKeyword = nonLaptopKeywords.some(kw => msg.includes(kw));
  
  const category = String(entities?.category ?? "").toLowerCase().trim();
  const nonLaptopCategories = [
    "phone", "smartphone", "tv", "television", "mobile", "fridge", "appliance", "tablet"
  ];
  const hasNonLaptopCategory = nonLaptopCategories.some(cat => category.includes(cat));

  return hasKeyword || hasNonLaptopCategory;
}

function isProductQuery(message: string): boolean {
  const msg = message.toLowerCase();
  return /\b(need a laptop|show laptops|find laptops|recommend a laptop|suggest laptops|laptops under|laptop under|laptops below|laptops above|laptops with|dell laptop|hp laptop|acer laptop|lenovo laptop|asus laptop|msi laptop|apple laptop|macbook|buy laptop|show options|show products|catalogue|catalog)\b/i.test(msg) ||
         /\b(under|below)\s*₹?\s*\d+/i.test(msg);
}

export async function handleConversation(
  userId: string,
  message: string
): Promise<ChatResponse> {

  addMessage(userId, `User: ${message}`);

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

  const conversationHistory = getConversation(userId);
  let currentConversation = getConversationState(userId);
  const currentState = currentConversation.fields;

  // Track explicit user preference e.g. "I prefer the second one"
  const lowerMsg = message.toLowerCase();
  const preferMatch = lowerMsg.match(/\b(prefer|liked|like|want|choose|select|pick)\b.*?\b(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th|#?1|#?2|#?3|#?4|#?5)\b/i) ||
                    lowerMsg.match(/\b(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th|#?1|#?2|#?3|#?4|#?5)\b.*?\b(one|laptop|product)?\b.*?\b(prefer|liked|choice|selected)\b/i);

  if (preferMatch && currentConversation.lastProducts.length > 0) {
    const chosenProduct = await resolveProduct(message, currentConversation.lastProducts, currentConversation);
    if (chosenProduct) {
      setPreferredProduct(userId, chosenProduct);
      currentConversation = getConversationState(userId);
      console.log("Updated preferredProduct in state:", chosenProduct["Product Name"] ?? chosenProduct.name);
    }
  } else if (currentConversation.lastProducts.length > 0) {
    const selectedProduct = await resolveProduct(message, currentConversation.lastProducts, currentConversation);
    if (selectedProduct && selectedProduct !== currentConversation.selectedProduct) {
      setSelectedProduct(userId, selectedProduct);
      currentConversation = getConversationState(userId);
      console.log("Updated selectedProduct in state:", selectedProduct["Product Name"] ?? selectedProduct.name);
    }
  }

  const richState = {
    ...currentState,
    lastProducts: currentConversation.lastProducts,
    selectedProduct: currentConversation.selectedProduct,
    preferredProduct: currentConversation.preferredProduct,
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
  console.log("Entities:", conversationResult.entities);
  console.log("===============================\n");

  if (isNonLaptopQuery(message, conversationResult.entities)) {
    const rejectResponse: ChatResponse = {
      type: "text",
      message: "😔 I specialize in laptops and computer hardware. I don't have details about smartphones, TVs, or other electronics in my catalog."
    };
    addMessage(userId, `Bot: ${rejectResponse.message}`);
    return rejectResponse;
  }

  let result: ChatResponse;

  switch (conversationResult.intent) {

    case "general_knowledge": {
      result = {
        type: "text",
        message: await handleGeneralKnowledge(message, getCatalogMetadata())
      };
      break;
    }

    case "product_comparison": {
      result = await handleProductComparison(
        conversationResult.entities,
        currentConversation.lastProducts,
        message,
        currentConversation
      );
      break;
    }

    case "recommendation": {
      if (!currentConversation.lastProducts || currentConversation.lastProducts.length === 0) {
        const searchResult = await handleProductSearch(
          message,
          currentState,
          conversationResult.plan
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
          message: await handleRecommendation(
            message,
            currentConversation.lastProducts
          )
        };
      }
      break;
    }

    case "product_action": {
      const action = conversationResult.entities?.action || conversationResult.plan?.action || "image";
      result = await handleProductAction(
        String(action),
        conversationResult.entities || {},
        currentConversation.lastProducts,
        message
      );
      break;
    }

    case "product_information": {
      const reference =
        conversationResult.entities.productNumber ??
        conversationResult.entities.productName ??
        message;

      result = await handleProductInformation(
        String(reference),
        currentConversation.lastProducts
      );
      break;
    }

    case "product_discovery": {
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

  if (result && result.message) {
    addMessage(userId, `Bot: ${result.message}`);
  }

  return result;
}