import { handleConversation } from "../conversation/conversation.service";
import axios from "axios";
import fs from "fs";
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";

import { Boom } from "@hapi/boom";
import * as QRCode from "qrcode-terminal";
import pino from "pino";

export async function connectWhatsApp(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState(
    "./auth_info_baileys"
  );

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: false,
    logger: pino({
      level: "silent",
    }),
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.clear();

      console.log("========================================");
      console.log("📱 Scan QR Code using WhatsApp");
      console.log("========================================");

      QRCode.generate(qr, {
        small: true,
      });
    }

    if (connection === "connecting") {
      console.log("🟡 Connecting to WhatsApp...");
    }

    if (connection === "open") {
      console.log("✅ WhatsApp Connected Successfully");
    }

    if (connection === "close") {
      const statusCode =
        (lastDisconnect?.error as Boom)?.output?.statusCode;

      console.log("❌ WhatsApp Disconnected");
      console.log("Status Code:", statusCode);

      const shouldReconnect =
        statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log("🔄 Connection lost. Reconnecting to WhatsApp...");
        connectWhatsApp();
      } else {
        console.log("🚪 Logged Out");
        console.log(
          "Delete auth_info_baileys folder and scan QR again."
        );
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const msg = messages[0];

      if (!msg.message) return;
      if (msg.key.fromMe) return;

      const sender = msg.key.remoteJid!;

      // Ignore group messages
      if (sender.endsWith("@g.us")) return;

      // Ignore WhatsApp status updates
      if (sender === "status@broadcast") return;

      let text = "";

      if (msg.message.conversation) {
        text = msg.message.conversation;
      } else if (msg.message.extendedTextMessage?.text) {
        text = msg.message.extendedTextMessage.text;
      }

      text = text.trim();

      if (!text) return;

      console.log("\n========================================");
      console.log("📩 New Customer Message");
      console.log("========================================");
      console.log("Sender :", sender);
      console.log("Message:", text);

      await sock.sendPresenceUpdate("composing", sender);

      const response = await handleConversation(sender, text);
      console.log("\n========== WHATSAPP RESPONSE ==========");
      console.log("Type:", response.type);
      console.log(response);
      console.log("=======================================\n");

      //----------------------------------------
      // Send Single Product Card Image
      //----------------------------------------
      if (response.type === "product_image") {
        const payload = response.product;
        const caption =
`Product: *${payload["Product Name"] ?? payload.name}*

Price: ${payload.Price}
Brand: ${payload.Brand}
Processor: ${payload["Processor Name"] ?? "N/A"}
RAM: ${payload.RAM ?? "N/A"}
SSD: ${payload["SSD Capacity"] ?? "N/A"}

Reply with:
• details
• compare
• buy`;

        try {
          let image = payload.Image;
          image = image.replace(
            "/upload/",
            "/upload/f_jpg,q_auto/"
          );

          console.log("Image URL:", image);
          const imageResponse = await axios.get(image, {
            responseType: "arraybuffer",
          });

          console.log("Sending product image...");
          await sock.sendMessage(sender, {
            image: Buffer.from(imageResponse.data),
            caption,
          });
          console.log("Product image sent successfully.");
        } catch (err) {
          console.error("IMAGE SEND ERROR", err);
          await sock.sendMessage(sender, {
            text: caption,
          });
        }

        return;
      }

      //----------------------------------------
      // Send AI Text Reply
      //----------------------------------------
      await sock.sendMessage(sender, {
        text: response.message ?? "",
      });

      //----------------------------------------
      // Send Best Product Image for Search
      //----------------------------------------
      if (response.type === "products" && response.bestProduct) {
        try {
          const payload = response.bestProduct;
          let image = payload.Image;
          image = image.replace(
            "/upload/",
            "/upload/f_jpg,q_auto/"
          );

          console.log("Image URL:", image);
          const imageResponse = await axios.get(image, {
            responseType: "arraybuffer",
          });

          await sock.sendMessage(sender, {
            image: Buffer.from(imageResponse.data),
            caption: `Recommended Product\n\nName: ${payload["Product Name"] ?? payload.name}`
          });
        } catch (err) {
          console.error("Failed to send best product image:", err);
        }
      }

      await sock.sendPresenceUpdate("paused", sender);
      console.log("✅ Reply sent successfully.");
    } catch (error) {
      console.error("\n❌ Error Processing Message", error);

      try {
        const sender = messages[0].key.remoteJid!;
        await sock.sendMessage(sender, {
          text: "Sorry, something went wrong while processing your request.",
        });
      } catch (err) {
        console.error("Failed to send error message:", err);
      }
    }
  });
}