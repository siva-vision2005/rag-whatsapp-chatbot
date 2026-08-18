import { Router } from "express";
import { handleConversation } from "../conversation/conversation.service";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await handleConversation(
      "web-user",
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

export default router;