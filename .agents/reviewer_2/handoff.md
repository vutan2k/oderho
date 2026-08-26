# Reviewer 2 (Data Layer & Logic Reviewer) — Handoff Report

**Verdict**: **APPROVE**  
**Role**: Reviewer 2 (Data Layer & Logic Reviewer) & Adversarial Critic  
**Date**: 2026-08-26  
**Working Directory**: `/Users/tan/Downloads/tavy/.agents/reviewer_2`  

---

## 1. Observation

Direct observations and evidence collected during source inspection, adversarial analysis, and test execution:

### A. Source Code & Data Logic Verification
1. **Phone Normalization (`src/services/guestTrackingService.js:19-38`)**:
   - `normalizePhone` parses numeric digits via `replace(/\D/g, '')`.
   - Strips country prefix `840` for length >= 12 (`digits = '0' + digits.slice(3)`), `84` for length >= 11 (`digits = '0' + digits.slice(2)`), and prepends leading `0` for 9-digit or 10-digit un-prefixed inputs.
   - Handles `null`, `undefined`, empty string, and formatted strings (`+84 (0) 912 345 678`, `0912-345-678`, `(091) 234-5678`, `912345678`) yielding uniform 10-digit format `0912345678`.
2. **Order ID & Cross-Field Lookup (`src/services/guestTrackingService.js:48-129`)**:
   - Case-insensitive search on Order ID (`queryLower === orderIdLower`, `orderIdLower.includes(queryLower)`).
   - Prefix stripping for `ORD-` (`replace(/^ord-?/i, '')`) and numeric-only digit matching (`queryDigits.length >= 4`).
   - Phone matching comparing normalized phone strings and raw digit substrings.
   - Air AWB (`trackingCode`), Domestic tracking code (`domesticTrackingCode`), and flight code (`flightCode`) matching.
   - Sorting invariant (line 124-128): Sorts matching orders by `createdAt` descending (`new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()`), placing newest order at index 0.
3. **8-Step Progress & Status Calculation (`src/services/guestTrackingService.js:138-193`, `src/data/orderStatuses.js:6-165`)**:
   - Progression mapping: `pending` (0, 12.5%), `deposit_paid` (1, 25%), `confirmed` (2, 37.5%), `purchased` (3, 50%), `packed_kr` (4, 62.5%), `in_transit_air` (5, 75%), `customs_cleared` (6, 87.5%), `completed` (7, 100%).
   - Cancelled order handling: `stepIndex: -1`, `progressPercentage: 0`, `progressPercent: '0%'`, `isCancelled: true`.
4. **Transparent Proof Hub Media Extraction (`src/services/guestTrackingService.js:201-334`)**:
   - Correctly formats badges for `povVideoUrl` (POV Video Store), `receiptImageUrl` (Bill Store), `packingVideoUrl` (Video Đóng Kiện), `packageWeightKg` (Cân nặng), `flightCode` (Chuyến bay), `trackingCode` (AWB Air), and `domesticTrackingCode` with carrier name (default `ViettelPost`).
5. **Pricing Hierarchy & Fallbacks (`src/components/GuestOrderStatusCard.jsx:55-80`)**:
   - Priority 1: `order.totalVnd`
   - Priority 2: `order.quote.totalVnd`
   - Priority 3: Calculated sum of `order.items` (`item.price` or `item.foreignPrice * krwRate * serviceFeeMultiplier`)
   - Priority 4: Direct foreign price conversion `order.foreignPrice * krwRate * serviceFeeMultiplier * quantity`
   - Fallback single-item synthesis when `order.items` is null or empty.
6. **Cancelled Order UI & Payment CTA Guard (`src/components/GuestOrderStatusCard.jsx:328-348, 889-911`)**:
   - Displays clear cancellation notice with hotline/Zalo contact (0935 861 690).
   - Suppresses Payment CTA for cancelled orders (`isUnpaid && !isCancelled`).
7. **AppContext & Firestore Integration (`src/pages/KROrderHomePage.jsx:16, 61-78`, `src/context/AppProvider.jsx:248-257`)**:
   - Real-time Firestore orders synchronization through `subscribeToOrders` into `AppContext.orders`.
   - `KROrderHomePage` queries live orders via `findGuestOrders(term, orders)` and updates `matchedOrders`.

### B. Integrity & Adversarial Checks
- **Integrity Check**: Examined `src/services/guestTrackingService.js`, `src/components/GuestOrderTracking/`, and test files.
  - Zero hardcoded test outputs or mock test cheats.
  - No dummy or facade methods.
  - All phone normalization, order ID lookup, step calculation, and sorting execute authentic algorithm logic.
- **Regex & Adversarial Input Safety**:
  - Tested search queries containing regex meta-characters (`.*`, `\`, `^$`, `ORD-(.*)`), SQL/XSS strings (`<script>`, `' OR '1'='1`).
  - No dynamic `RegExp` execution on unsanitized user inputs; strings are safely processed using `.includes()`, `===`, and `.replace(/\D/g, '')`.
- **Corrupted / Partial Data Safety**:
  - `findGuestOrders` gracefully ignores `null`, `undefined`, or non-object items in orders array.
  - Missing `items` array or missing carrier defaults safely.

### C. Build and Automated Test Verification
- **Automated Test Suite Execution**:
  - Command: `node tests/run_all_tests.js`
  - Output: 218 test cases executed across 4 tiers (Tier 1: 96, Tier 2: 91, Tier 3: 20, Tier 4: 11).
  - Result: **218 PASSED, 0 FAILED** (Duration: 19196.8ms, Exit Code 0).
- **Production Build Verification**:
  - Command: `npm run build`
  - Output: Vite v8.2.2 transformed 1878 modules into production bundle in `dist/`.
  - Result: **0 errors, Exit Code 0**.
- **Lint / Self-Check Verification**:
  - Command: `npm run self-check`
  - Result: **0 errors, Exit Code 0**.

---

## 2. Logic Chain

1. **Requirement Conformance (R1, R2, R3)**:
   - R1 is satisfied: `GuestOrderTrackingBar.jsx` integrates into `KROrderHomePage.jsx` replacing legacy product search with prominent order tracking, sample suggestions chips, and submit/clear buttons.
   - R2 is satisfied: `GuestOrderStatusCard.jsx` and `ProofMediaModal.jsx` render the 8-step visual timeline, status badges, multi-order tabs, transparent proof media hub (POV video, bill receipt, packing video, weights, AWB, domestic tracking), and payment CTA for pending orders.
   - R3 is satisfied: `guestTrackingService.js` implements comprehensive Vietnamese phone normalization, case-insensitive / prefix-free ID matching, newest-first multi-order sorting, and real-time Firestore sync via `AppContext`.
2. **Robustness & Edge-Case Resilience**:
   - Verified that all Vietnamese phone formats (+84, 84, 840, un-prefixed 9-digit, formatted with spaces/hyphens/parentheses) normalize to standard 10-digit phone strings.
   - Verified that Order IDs match regardless of case (`ord-`, `ORD-`, prefix-free numeric ID).
   - Verified that multi-order lookups reliably prioritize the most recent order (`createdAt` desc) and provide interactive tab switching.
   - Verified price fallback hierarchy calculates exact amounts under missing fields.
   - Verified that cancelled orders display cancellation alerts and hide payment buttons.
3. **Quality & System Health**:
   - Zero test failures across 218 unit, boundary, integration, and scenario tests.
   - Production bundle builds cleanly with zero compile errors.

---

## 3. Caveats

- In production deployment, real-time proof media assets (POV video and bill images) depend on store staff uploading files to Firebase Storage / CDN. The fallback placeholders and null guards in `getProofBadges` and `GuestOrderStatusCard` properly display informative messaging when media is not yet uploaded.
- Vite build emits chunk size warnings for large vendor bundles (>500 kB), which is an optimization recommendation for code-splitting but does not affect application functionality or correctness.

---

## 4. Conclusion

The Data Layer & Logic implementation in `guestTrackingService.js`, `KROrderHomePage.jsx`, `AppProvider.jsx`, and associated components fully satisfies all specifications in `ORIGINAL_REQUEST.md`, `PROJECT.md`, and `TEST_READY.md`. Integrity checks passed with zero violations.

**Verdict: APPROVE**

---

## 5. Verification Method

To independently reproduce and verify this review:

1. **Run Full 4-Tier Test Suite (218 Tests)**:
   ```bash
   node tests/run_all_tests.js
   ```
   *Expected*: 218 test cases pass, 0 failures, exit code 0.

2. **Run Production Build**:
   ```bash
   npm run build
   ```
   *Expected*: Vite builds bundle successfully with 0 errors, exit code 0.

3. **Run Self-Check / Lint**:
   ```bash
   npm run self-check
   ```
   *Expected*: 0 errors, exit code 0.

4. **Inspect Core Data Layer & Component Files**:
   - `src/services/guestTrackingService.js` (phone normalization, search, progress calculation, proof hub extraction)
   - `src/pages/KROrderHomePage.jsx` (guest tracking integration with AppContext)
   - `src/components/GuestOrderTracking/GuestOrderStatusCard.jsx` (visual timeline, proof hub, order summary)
   - `src/components/GuestOrderTracking/GuestOrderTrackingBar.jsx` (search bar & suggestions)
   - `src/components/GuestOrderTracking/ProofMediaModal.jsx` (proof lightbox)
