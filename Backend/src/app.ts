import express from "express";
import cors from "cors";

import productRoutes from "./routes/product.routes";
import chatRoutes from "./routes/chat.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("RAG WhatsApp Chatbot Running...");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/products", productRoutes);
app.use("/chat", chatRoutes);

export default app;