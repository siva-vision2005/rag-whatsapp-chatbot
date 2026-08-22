import { Router } from "express";
import { handleConversation } from "../conversation/conversation.service";
import { clearConversation } from "../memory/conversationMemory";
import { clearConversationState } from "../conversation/conversationState";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { message, sessionId, userId, chatId } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Message is required." });
    }

    const sessionIdentifier = (sessionId || userId || chatId || "default_session").trim();

    const response = await handleConversation(
      sessionIdentifier,
      message
    );

    res.json(response);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Something went wrong."
    });
  }
});

router.post("/clear", async (req, res) => {
  try {
    const { sessionId, userId, chatId } = req.body;
    const sessionIdentifier = (sessionId || userId || chatId || "").trim();

    if (sessionIdentifier) {
      clearConversation(sessionIdentifier);
      clearConversationState(sessionIdentifier);
    }

    res.json({ success: true, message: "Session conversation memory cleared." });
  } catch (err) {
    console.error("Clear session error:", err);
    res.status(500).json({ message: "Failed to clear session memory." });
  }
});

export default router;