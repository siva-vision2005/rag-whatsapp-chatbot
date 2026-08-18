import { google } from "googleapis";
import "dotenv/config";
const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME!;
console.log("SHEET_ID =", SHEET_ID);
console.log("SHEET_NAME =", SHEET_NAME);
let auth;
if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    console.log("🔓 Google Sheets Auth initialized using environment variable.");
  } catch (err: any) {
    console.error("❌ Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON env variable:", err.message);
    throw err;
  }
} else {
  auth = new google.auth.GoogleAuth({
    keyFile: "./src/config/service-account.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  console.log("🔓 Google Sheets Auth initialized using keyFile.");
}

const sheets = google.sheets({
  version: "v4",
  auth,
});

export async function getHeaders(): Promise<string[]> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!1:1`,
  });

  const rows = response.data.values;

  if (!rows || rows.length === 0) {
    return [];
  }

  return rows[0];
}

export async function getProducts(): Promise<Record<string, any>[]> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: SHEET_NAME,
  });

  const rows = response.data.values;

  if (!rows || rows.length < 2) {
    return [];
  }

  const headers = rows[0];

  return rows.slice(1).map((row) => {
    const product: Record<string, any> = {};

    headers.forEach((header, index) => {
      product[header] = row[index] ?? "";
    });

    return product;
  });
}