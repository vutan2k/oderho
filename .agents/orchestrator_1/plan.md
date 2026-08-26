# Grounded Strategic Execution Plan

## 1. Core Objectives & Acceptance Criteria
- **Objective**: Transform legacy product search in `KROrderHomePage.jsx` into a prominent, intuitive Guest Order Status & Tracking Bar with 8-step visual timeline and Firestore data lookup.
- **Acceptance Criteria**:
  1. Entering a valid Phone Number or Order ID immediately displays the 8-step progress and order card.
  2. Multiple orders for the same phone number are displayed with a responsive tab switcher (defaulting to the most recent active order).
  3. Non-existent or invalid searches show a friendly, clear error message.
  4. Fully responsive, touch-friendly UI (touch targets >= 44px, horizontal scrollable stepper on mobile).
  5. 100% test pass rate on `node tests/run_all_tests.js`.
  6. Clean production build on `npm run build` with 0 errors.

---

## 2. Phase-by-Phase Execution Plan

### Phase 1: Milestone M1 — Search & Lookup Data Service (`src/services/guestTrackingService.js`)
- **Worker Task**:
  - Implement `normalizePhone(rawPhone)` supporting `+84`, `84`, spaces, dashes, leading 0.
  - Implement `findGuestOrders(query, ordersList)` with case-insensitive Order ID matching (`ORD-XXXXXX` and numeric only), phone matching, and tracking code matching.
  - Unit tests for normalization and lookup logic.
- **Verification**: Reviewer + Challenger + Auditor gate.

### Phase 2: Milestone M2 — Visual 8-Step Timeline & Card Component (`src/components/GuestOrderTracking/`)
- **Worker Task**:
  - Implement `GuestOrderStatusCard.jsx`, `ProofMediaModal.jsx`.
  - Header: Order ID, customer name, order date, status badge.
  - Stepper: 8 sequential steps with active/completed/pending styling, progress bar.
  - Proof Hub: POV Video, Bill Store, Packing Video, Weight, Air AWB, Domestic tracking with 1-click copy.
  - Order Summary: Products, quantities, options, total VNĐ, deposit payment CTA for unpaid orders, close/collapse button.
- **Verification**: Reviewer + Challenger + Auditor gate.

### Phase 3: Milestone M3 — KROrderHomePage Integration (`src/pages/KROrderHomePage.jsx`)
- **Worker Task**:
  - Implement `GuestOrderTrackingBar.jsx`.
  - Integrate into `KROrderHomePage.jsx` at the top of `#products` section.
  - Wire up search state, query submit/clear, multi-order tabs, friendly not-found banner, and real-time Firestore sync.
  - Ensure catalog browsing and category filters remain intact.
- **Verification**: Reviewer + Challenger + Auditor gate.

### Phase 4: Milestone M4 — E2E Test Suite & Adversarial Verification
- **Worker / Test Writer Task**:
  - Add Tier 1, Tier 2, Tier 3, and Tier 4 test cases into `tests/`.
  - Verify all tests pass with `node tests/run_all_tests.js`.
  - Verify `npm run build` passes with 0 errors.
- **Verification**: 2 Reviewers + 2 Challengers + Forensic Auditor -> Final Gate.

---

## 3. Risk Matrix & Fallback Strategies
| Risk | Severity | Mitigation / Fallback |
|---|---|---|
| Phone normalization edge cases (e.g. international format, invalid chars) | Medium | Robust regex stripping non-digits, converting +84/84 prefix, fallback to raw substring search |
| Missing order fields (e.g. legacy single-item vs multi-item cart) | Low | Graceful fallback checking `order.items` or `order.productName`, `foreignPrice`, `totalVnd` |
| Mobile stepper horizontal overflow | Medium | Horizontal scrolling container with `scrollbar-none` and flex-shrink-0 step items |
| Realtime sync race condition | Low | Reactive binding to `AppContext.orders` ensuring automatic re-render on Firestore snapshot |
