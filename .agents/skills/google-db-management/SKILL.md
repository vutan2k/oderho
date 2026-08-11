---
name: google-db-management
description: Google Ecosystem Database Management & Migration Safety. Standards for Google Cloud SQL, Firebase Firestore, BigQuery, Google Sheets API, and database migration safety.
---

# SKILL 2: Google Ecosystem Database Management & Migration Safety

## 1. Google Cloud SQL (PostgreSQL / MySQL) & Migration Safety
- **Strict Migration Protocol:** NEVER execute raw structural DDL (`ALTER TABLE`, `DROP COLUMN`) directly on production. All schema changes MUST be executed through versioned migration scripts via ORM (Prisma, Drizzle) or tools like `db-mate`.
- **Destructive Guardrails:** Commands involving `DROP TABLE`, `TRUNCATE`, or `DELETE` without a strict `WHERE` clause are FORBIDDEN unless explicitly approved in writing by the user.
- **Connection Security:** Always connect to Cloud SQL using the Cloud SQL Auth Proxy or IAM Database Authentication. Database credentials must be read exclusively from `.env.local` or Secret Manager.
- **Data Integrity:** All relational tables MUST include an indexed primary key (`id` as UUID or auto-increment), `created_at` (TIMESTAMPTZ), and `updated_at` (TIMESTAMPTZ). Always define explicit foreign key constraints with safe `ON DELETE` rules (e.g., `RESTRICT` or `CASCADE` where intended).
- **Query Optimization:** ALWAYS use parameterized queries or ORM methods to prevent SQL Injection. Create indexes on columns frequently used in `WHERE`, `JOIN`, and `ORDER BY` clauses.

## 2. Firebase Firestore / Realtime Database Architecture
- **Schema & Rule Synchronization:** Whenever a new collection or document structure is introduced, immediately update and sync `firestore.rules` and `storage.rules` to enforce document-level validation and authorization.
- **Index Management:** Maintain and update `firestore.indexes.json` for all compound queries (queries using multiple `where` filters or `orderBy`). Never leave index creation to manual ad-hoc console clicks.
- **SDK & Batching Standards:** Use the Firebase v10+ Modular Web SDK (`firebase/firestore`). Wrap multi-document writes in `writeBatch()` or `runTransaction()` to maintain ACID compliance across document operations.
- **Read Cost Reduction:** Structure collections to minimize document reads. Denormalize data intentionally for read-heavy operations where appropriate.

## 3. Google BigQuery Data Warehouse Standards
- **Cost & Scan Optimization:** NEVER run `SELECT *` on production datasets. Always explicitly select required columns.
- **Partitioning & Clustering:** Ensure all time-series tables are partitioned by `DATE(_PARTITIONTIME)` or custom TIMESTAMP fields, and clustered by high-cardinality query keys (e.g., `user_id`, `event_type`).
- **Dry-Run Validation:** Before executing large analytical queries, validate the estimated bytes scanned using the BigQuery API dry-run option or query validator.

## 4. Google Sheets API (As Lightweight Database / Admin Interface)
- **Authentication Safety:** Authenticate exclusively using Google Service Account keys stored securely in environment variables (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`). NEVER hardcode private key JSON files into source code.
- **Quota & Rate Limiting:** Avoid firing individual cell updates in loops. ALWAYS use `spreadsheets.values.batchUpdate` or `append` to execute changes in single, batch network calls.
- **Data Sanitization:** Sanitize all incoming user input before writing to Google Sheets to avoid Formula Injection vulnerabilities (e.g., inputs starting with `=`, `+`, `-`, `@`).

## 5. Local Emulator & Test Environment
- **Firebase Emulator First:** For local feature development, trigger `firebase emulators:start` to test Firestore reads/writes and Security Rules locally before deploying to live Google Cloud environments.
- **Environment Parity:** Ensure `.env.example` includes mock configuration templates for local DB ports, emulator hosts, and Google Cloud Project IDs.
