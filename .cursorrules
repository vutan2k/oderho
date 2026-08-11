# ANTIGRAVITY IDE - GLOBAL AGENT EXECUTION RULES

## 1. CORE OPERATIONAL PRINCIPLES
- **No Hypotheses, Only Verification:** NEVER assume UI/CSS or Database queries work without testing. Always run code, inspect outputs, or check terminal logs.
- **Autonomous Execution:** Take full responsibility for end-to-end implementation. Create files, update configurations, run build/dev servers, and verify results proactively.
- **Modular Architecture:** Write clean, modular code. Avoid single files exceeding 300 lines. Split UI components into `src/components/` and backend logic into `src/lib/` or `src/services/`.

---

## 2. VISUAL FEEDBACK & UI DEVELOPMENT (ANTI-BLINDNESS PROTOCOL)
- **Browser Agent Trigger:** After any UI modification or component creation, you MUST trigger the Browser Agent (or MCP Browser) to open `http://localhost:[PORT]`.
- **Screenshot Inspection Protocol:**
  1. Capture a screenshot of the rendered page across standard viewports (Mobile 375px, Desktop 1440px).
  2. Inspect alignment, responsive wrapping, padding, contrast, and font rendering.
  3. Read browser Console Logs to detect undetected runtime errors or CSS missing dependencies.
- **Self-Correction Loop:** If layout misalignment or broken UI is detected from the screenshot/logs, perform CSS/code adjustments and re-capture until visually perfect before marking the task complete.
- **Styling Standard:** Default to Tailwind CSS or Material UI (MUI). Never use absolute pixel hardcoding for primary structural layouts. Always use CSS Flexbox or Grid.

---

## 3. GOOGLE DATA ECOSYSTEM & DATABASE MANAGEMENT

### A. General Database Safety
- **Destructive Action Block:** NEVER execute destructive SQL/NoSQL commands (`DROP TABLE`, `TRUNCATE`, `DELETE WITHOUT WHERE`, `db.collection().drop()`) without explicit user written confirmation.
- **Parameterization:** All queries MUST be parameterized or abstracted via ORM (Prisma, Drizzle) / SDK to prevent SQL/NoSQL Injection.
- **Audit Columns:** Relational schemas must include `id`, `created_at`, and `updated_at` fields.

### B. Firebase (Firestore / Realtime DB)
- **Security Rules First:** Whenever creating collections, update `firestore.rules` alongside to prevent public read/write exposure.
- **Indexing:** Maintain `firestore.indexes.json` for complex queries involving multiple filters/sorts.
- **SDK Usage:** Use Firebase v10+ Modular SDK (`firebase/firestore`, `firebase/auth`) to allow proper tree-shaking.

### C. Google Cloud SQL & BigQuery
- **Cloud SQL:** Secure connections using Cloud SQL Auth Proxy or SSL certificates. Store connection strings strictly in `.env.local`.
- **BigQuery:** Always write optimized, explicit `SELECT` queries (AVOID `SELECT *`). Utilize partitioning and clustering fields to minimize scan costs.

### D. Google Sheets API (as Lightweight DB/Admin Interface)
- **Service Account Usage:** Always authenticate using Service Account Key credentials via environment variables (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`).
- **Batch Operations:** Use `append`, `batchUpdate`, or `get` range methods to avoid hitting Google API Rate Limits (Quota Exceeded).

---

## 4. ENVIRONMENT & CREDENTIAL SECURITY
- **Zero Exposure:** NEVER hardcode secrets, API keys, Google Service Account JSON keys, or tokens in source files.
- **Environment Schema:** Always maintain a `.env.example` file documenting all required environment variables without actual secret values.
- **File Exclusions:** Ensure `.env*`, `node_modules/`, `dist/`, and service account keys are explicitly listed in `.gitignore`.

---

## 5. TERMINAL & BUILD VERIFICATION
- **Pre-flight Checks:** Before completing a feature, execute type-checking (`tsc --noEmit` or equivalent) and lint checks (`npm run lint`).
- **Build Verification:** Run `npm run build` or project build script locally in terminal to confirm no production build breakage.
