export type Intent =
  | "greeting"
  | "thanks"
  | "goodbye"
  | "product_query";

export function detectIntent(message: string): Intent {
  const text = message.toLowerCase().trim();

  // Greetings
  const greetings = [
    "hi",
    "hello",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
    "hola",
  ];

  if (greetings.some(word => text === word || text.startsWith(word))) {
    return "greeting";
  }

  // Thanks
  const thanks = [
    "thanks",
    "thank you",
    "thankyou",
    "thank u",
    "thanks a lot",
    "many thanks",
    "thx",
    "ty",
    "tq",
  ];

  if (thanks.some(word => text.includes(word))) {
    return "thanks";
  }

  // Goodbye
  const goodbye = [
    "bye",
    "goodbye",
    "see you",
    "good night",
    "take care",
  ];

  if (goodbye.some(word => text.includes(word))) {
    return "goodbye";
  }

  // Everything else is treated as a product conversation
  return "product_query";
}