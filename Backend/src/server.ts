import * as dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectWhatsApp } from "./whatsapp/whatsapp.service";
import { initializeCatalog } from "./catalog/catalog.service";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {

    await initializeCatalog();

    app.listen(PORT, () => {
      console.log("🚀 RAG Chatbot Server Started");
      console.log(`🌐 Server: http://localhost:${PORT}`);
    });

    if (process.env.ENABLE_WHATSAPP === "true") {
      console.log("📱 Connecting to WhatsApp...");
      await connectWhatsApp();
    } else {
      console.log("📱 WhatsApp integration disabled (set ENABLE_WHATSAPP=true to enable).");
    }

  } catch (error) {
    console.error("Failed to start server.");
    console.error(error);
  }
}

startServer();