import { google } from "googleapis";
import path from "path";

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "service-account.json"),
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
  ],
});

export const sheets = google.sheets({
  version: "v4",
  auth,
});