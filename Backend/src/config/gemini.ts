import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

export const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});