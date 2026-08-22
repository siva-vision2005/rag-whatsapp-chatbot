# RAG WhatsApp Chatbot - Backend Installation Guide

---

## 1. Overview

This document provides deployment instructions for the Node.js and TypeScript backend service. The application runs on a Linux Virtual Private Server (VPS) and connects to Qdrant Cloud and Google Sheets to serve product catalog queries via WhatsApp using Baileys.

> **Note:** This guide applies to the current backend version. The current laptop catalog is used only for testing. The production Google Sheet and product data will be configured separately before the final WhatsApp deployment.

### 1.1 Project Scope & Target Architecture

- **Backend Service:** Node.js + TypeScript application hosting the core API, RAG orchestration, and WhatsApp service integration.
- **WhatsApp Integration:** Built with Baileys (`@whiskeysockets/baileys`), enabling direct 1-to-1 customer communication over WhatsApp.
- **Vector Search:** Managed via Qdrant Cloud. Qdrant is accessed remotely over HTTPS (port 443) and is **not** installed on the VPS.
- **Product Catalog:** Managed in Google Sheets. Product rows are ingested and vector-indexed into Qdrant Cloud.
- **Temporary Testing Interface:** The Vercel frontend is a temporary development testing interface only and is **not** part of the final production deployment architecture.

### 1.2 Final Production Flow

```text
WhatsApp Customer
       │
       ▼
Baileys Service (VPS)
       │
       ▼
Node.js Backend (VPS)
       │
       ├──► Qdrant Cloud (Vector Search)
       ├──► LLM API (Inference & Embeddings)
       └──► Google Sheets (Product Catalog Source)
       │
       ▼
WhatsApp Response Sent to Customer
```

---

## 2. System Requirements

### 2.1 Recommended VPS Configuration

The following specification provides a reasonable starting point for running the backend and Baileys WhatsApp client:

- **OS:** Ubuntu 22.04 LTS (64-bit)
- **Memory:** 2 GB RAM recommended
- **CPU:** 1–2 vCPU recommended
- **Network:** Outbound internet access via TCP port 443 (HTTPS and WebSockets)

### 2.2 Software Dependencies

Install Node.js 20 LTS and PM2 process manager on the VPS:

```bash
# Install Node.js 20 via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Verify installation
node -v
npm -v

# Install PM2 globally
npm install -g pm2
```

---

## 3. Environment Variables

Create an `.env` file in the project root directory (`/path/to/Backend/.env`).

All production secrets must be set via environment variables. Do not commit `.env` or sensitive credential files to source control.

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# WhatsApp Integration
# Set to "true" to initialize WhatsApp connection on startup
ENABLE_WHATSAPP=true

# Qdrant Cloud Settings
QDRANT_URL=<QDRANT_CLUSTER_URL>
QDRANT_API_KEY=<QDRANT_API_KEY>
QDRANT_COLLECTION_NAME=products

# Google Sheets Configuration
GOOGLE_SHEET_ID=<GOOGLE_SHEET_ID>
GOOGLE_SHEET_NAME=<SHEET_TAB_NAME>

# Google Service Account Credentials (Optional inline JSON string alternative)
# If left unset, the backend falls back to src/config/service-account.json
GOOGLE_SERVICE_ACCOUNT_JSON=

# AI Provider Selection
# Supported options: gemini | openai | groq | claude | deepseek
AI_PROVIDER=gemini

# Provider API Keys (Set the API key matching your chosen AI_PROVIDER)
GEMINI_API_KEY=<GEMINI_API_KEY>
OPENAI_API_KEY=<OPENAI_API_KEY>
GROQ_API_KEY=<GROQ_API_KEY>
CLAUDE_API_KEY=<CLAUDE_API_KEY>
DEEPSEEK_API_KEY=<DEEPSEEK_API_KEY>
```

---

## 4. Qdrant Cloud Setup

The backend connects to Qdrant Cloud remotely over port 443 (HTTPS). No vector database software needs to be installed or maintained on the VPS.

### 4.1 Cluster Configuration

1. Create an account at [Qdrant Cloud](https://cloud.qdrant.io).
2. Create a cluster in your target region.
   > **Note:** The Free tier can be used for testing. A production plan should be selected based on the expected catalog size and usage.
3. Obtain the Qdrant cluster URL directly from the Qdrant Cloud dashboard and configure it as `QDRANT_URL`.
4. Generate an **API Key** from the Qdrant Cloud dashboard and configure it as `QDRANT_API_KEY`.
5. Populate `QDRANT_URL` and `QDRANT_API_KEY` in `.env`.

---

## 5. Google Sheets Integration

Product catalog data is retrieved using the Google Sheets API v4 via a Google Cloud Service Account.

### 5.1 Service Account Credentials

You can supply credentials using one of two methods:

- **Method A (File-based):** Place your service account JSON file at:
  ```text
  src/config/service-account.json
  ```
- **Method B (Environment Variable):** Paste the complete contents of the service account JSON file as a single-line string into `GOOGLE_SERVICE_ACCOUNT_JSON` in `.env`.

### 5.2 Permissions & Configuration

1. Open your catalog Google Sheet and grant **Viewer** permissions to the service account email address (e.g., `service-account@project.iam.gserviceaccount.com`).
2. Copy the Sheet ID from the URL (`https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`).
3. Set `GOOGLE_SHEET_ID` and `GOOGLE_SHEET_NAME` in `.env`.

> **Dataset Note:** The current catalog dataset contains laptop testing data. The company's actual product catalog will replace this dataset prior to production release.

---

## 6. Qdrant Collection & Product Data Indexing

All catalog management scripts are defined in `package.json`.

### 6.1 Create Collection

Run the collection creation script:

```bash
npm run create-collection
```

- **Script:** `src/qdrant/createCollection.ts`
- **Configuration:** Creates a collection named `products` (or the value of `QDRANT_COLLECTION_NAME`) with **3072-dimension Cosine distance** vectors matching `gemini-embedding-001`.
- If the collection already exists, the script safely catches HTTP 409 and exits without overwriting.

### 6.2 Create Payload Indexes

Run the payload indexing script:

```bash
npm run create-indexes
```

- **Script:** `src/qdrant/createPayloadIndexes.ts`
- **Fields Indexed:** Creates keyword payload indexes for `brand`, `category`, `ram`, `processor`, `gpu`, and `purpose`, as well as an integer index for `price`.

### 6.3 Index Product Catalog

Execute vector embedding and ingestion:

```bash
npm run index-products
```

- **Script:** `src/embeddings/indexProducts.ts`
- **Process:** Reads product records from Google Sheets, generates text embeddings using `gemini-embedding-001`, and upserts point payloads to Qdrant Cloud in batches of 20.
- Handles rate-limiting (HTTP 429) automatically by pausing 60 seconds before retrying.

---

## 7. Build and Deployment

### 7.1 Compilation

Compile TypeScript source files into JavaScript:

```bash
npm run build
```

This executes `tsc` and outputs JavaScript files into the `dist/` directory. The primary compiled application entry point is `dist/server.js`.

### 7.2 Manual Startup Test

Run the compiled application once to verify server launch:

```bash
npm start
```

This runs `node dist/server.js`. Check the console log to ensure catalog metadata loads successfully.

### 7.3 Process Management with PM2

To run the server continuously in production and automatically restart on crashes or VPS reboots:

```bash
# Start application under PM2
pm2 start dist/server.js --name rag-chatbot

# Save PM2 process list
pm2 save

# Enable PM2 startup hook on boot
pm2 startup
```

---

## 8. WhatsApp / Baileys Integration Setup

The backend integrates with WhatsApp via `@whiskeysockets/baileys` inside `src/whatsapp/whatsapp.service.ts`.

### 8.1 Setup and Initial QR Pairing

1. Ensure `ENABLE_WHATSAPP=true` is present in `.env`.
2. Start the backend process.
3. View the logs to display the terminal QR code:
   ```bash
   pm2 logs rag-chatbot
   ```
4. On your designated WhatsApp phone, navigate to **Linked Devices → Link a Device** and scan the printed QR code.

### 8.2 Session Persistence

- Authentication credentials and session keys are stored locally in the `./auth_info_baileys/` directory.
- Subsequent application restarts automatically reuse this session state without requiring a new QR scan.
- If the account logs out or credentials expire:
  1. Stop the application process (`pm2 stop rag-chatbot`).
  2. Remove the session folder (`rm -rf auth_info_baileys`).
  3. Restart the server (`pm2 start rag-chatbot`) and scan the newly generated QR code.

---

## 9. Verification & Health Checks

### 9.1 Service Health Verification

Check basic HTTP service responsiveness:

```bash
# Health status endpoint
curl http://localhost:3000/health
# Response: {"status":"ok","timestamp":"..."}

# Root endpoint
curl http://localhost:3000/
# Response: RAG WhatsApp Chatbot Running...
```

### 9.2 Chat API Endpoint Test

Test the RAG orchestration pipeline directly:

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What products are available?", "sessionId": "test-session"}'
```

### 9.3 End-to-End WhatsApp Test

Send a text query from an external WhatsApp account to the registered device number and verify that an automated catalog response is returned.

---

## 10. Production Product Catalog Transition

When transitioning from the testing dataset to the official company catalog, execute the following steps:

1. **Update Catalog Source:** Update the target Google Sheet with company product data and share the sheet with the Service Account email.
2. **Update Environment Settings:** Update `GOOGLE_SHEET_ID` and `GOOGLE_SHEET_NAME` in `.env`.
3. **Purge Test Vectors:** Delete the old Qdrant collection:
   ```bash
   npm run delete-collection
   ```
4. **Re-initialize Schema:** Recreate collection and indexes:
   ```bash
   npm run create-collection
   npm run create-indexes
   ```
5. **Re-index Catalog:** Ingest company product vectors:
   ```bash
   npm run index-products
   ```
6. **Restart Backend:** Restart the running PM2 instance:
   ```bash
   pm2 restart rag-chatbot
   ```

> **Note:** The current laptop catalog is used only for testing. The final production version will be provided after the company's product catalog has been integrated, re-indexed, and tested through WhatsApp.

---

## 11. Before Production Deployment

The current deployment uses the laptop catalog for testing purposes.

Before the final WhatsApp deployment:

1. Replace the testing Google Sheet with the company's product catalog.
2. Re-index the product catalog into Qdrant Cloud.
3. Verify product search and filtering.
4. Verify product images and purchase links.
5. Test conversation handling and multiple users.
6. Test the WhatsApp integration.
7. Deploy the final tested version.

---

## 12. Troubleshooting Guide

| Issue / Symptom | Probable Cause | Action |
|---|---|---|
| `No products found in Google Sheet` | Incorrect `GOOGLE_SHEET_ID`, tab name mismatch, or sheet unshared | Verify Google Sheet ID and tab name in `.env`. Ensure service account has Viewer access. |
| `Failed to create collection` / Network Error | Invalid Qdrant credentials or unreachable URL | Verify `QDRANT_URL` and `QDRANT_API_KEY` values in `.env`. Ensure port 443 outbound is open. |
| WhatsApp QR code does not render | `ENABLE_WHATSAPP` is unset or set to `false` | Ensure `ENABLE_WHATSAPP=true` is configured in `.env`. |
| Disconnected / `Logged Out` status in logs | Session revoked from mobile client | Remove `./auth_info_baileys/` folder, restart server, and re-scan the QR code. |
| `Cannot find module 'dist/server.js'` | TypeScript project uncompiled | Run `npm run build` to generate compiled JavaScript output in `dist/`. |

---

## 13. Security Guidelines

- **Environment File Security:** Keep `.env` out of version control. Ensure `.env` permissions are restricted on the VPS (`chmod 600 .env`).
- **Credential Storage:** Never commit `src/config/service-account.json` or paste private keys into repository files.
- **Session Privacy:** Treat the `./auth_info_baileys/` directory as sensitive data. It contains active authentication tokens for the connected WhatsApp account.
- **Network Access:** The Node.js backend does not require public inbound port exposure for WhatsApp operations, as Baileys connects via outbound WebSockets.
