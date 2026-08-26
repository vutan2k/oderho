# BRIEFING — 2026-08-26T01:13:00Z

## Mission
Investigate the data layer, Firestore configuration/schemas, order workflows, step mappings, phone/ID normalization, and query edge cases in the Tavy codebase.

## 🔒 My Identity
- Archetype: explorer
- Roles: Data Layer & Firestore Explorer
- Working directory: /Users/tan/Downloads/tavy/.agents/explorer_survey_2
- Original parent: f7c223dd-7c77-4fd9-8d1a-a866c5f90f91
- Milestone: Explorer Survey 2

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify source code
- Produce structured 5-component handoff report in `.agents/explorer_survey_2/handoff.md`
- Maintain heartbeat in `progress.md`

## Current Parent
- Conversation ID: f7c223dd-7c77-4fd9-8d1a-a866c5f90f91
- Updated: 2026-08-26T01:13:00Z

## Investigation State
- **Explored paths**:
  - `src/firebase.js`: Firebase config, Firestore init, persistence, auth
  - `src/services/dbService.js`: Firestore `orders` CRUD & realtime snapshot listener
  - `src/context/AppContext.js` & `src/context/AppProvider.jsx`: State management, `orders`, `rates`, `currentUser`, offline local fallback
  - `src/data/orderStatuses.js`: Exact 8-step workflow definition, colors, step indices, descriptions, backward-compat aliases
  - `src/pages/OrdersPage.jsx`: Full 8-step timeline rendering, proof hub buttons, product details, tracking cards
  - `src/components/ChatWidget/OrderTrackerLookup.jsx`: Existing search matching logic
  - `src/components/AdminOrderManager.jsx`: Admin order management, manual order creation, proof updates
  - `src/pages/KROrderHomePage.jsx`: Existing search input placement and catalog layout
  - `firestore.rules`: Security rules for `orders` collection (`allow read, write: if true`)
  - `tests/tier1/f06_order_tracking.test.js` & `tests/tier2/f06_order_tracking_boundary.test.js`: Verified test expectations
- **Key findings**:
  - Complete schema for `orders` collection documented (IDs, customer info, proof hub URLs, items array vs legacy single product, quote objects, tracking numbers).
  - 8-step status sequence mapped with stepIndex 0..7, colors, labels, and badges.
  - Robust phone normalization (`+84`/`84` -> `0`, non-digit stripping) & case-insensitive Order ID matching rules established.
  - Multi-order per phone strategy designed (sort active first, display tabs/chips).
  - Build (`npm run build`) and test suite (188/188 passed) verified.
- **Unexplored areas**: None. All data layer exploration requirements completed.

## Key Decisions Made
- Established standard normalization regex for Vietnamese phone numbers and Order IDs.
- Defined fallback handling for legacy single-item vs multi-item orders.
- Outlined component architecture for Guest Order Tracking Bar and 8-Step Timeline Card.

## Artifact Index
- `/Users/tan/Downloads/tavy/.agents/explorer_survey_2/DISPATCH.md` — Inbound message log
- `/Users/tan/Downloads/tavy/.agents/explorer_survey_2/BRIEFING.md` — Situational awareness
- `/Users/tan/Downloads/tavy/.agents/explorer_survey_2/progress.md` — Heartbeat and step log
- `/Users/tan/Downloads/tavy/.agents/explorer_survey_2/handoff.md` — Final handoff report
