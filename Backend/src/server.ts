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
      console.log("🚀 RAG WhatsApp Chatbot Started");
      console.log(`🌐 Server: http://localhost:${PORT}`);
    });

    await connectWhatsApp();

  } catch (error) {
    console.error("Failed to start server.");
    console.error(error);
  }
}

startServer();