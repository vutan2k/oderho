# Test Readiness & Comprehensive Test Coverage Report (Milestone M4)

## Executive Summary
- **Project**: TAVY KOREA — Guest Order Status & Tracking Bar on Customer Home Page (Tra Cứu Đơn Hàng Không Cần Đăng Nhập)
- **Milestone**: M4 — E2E Test Suite & Comprehensive Test Coverage
- **Status**: **READY (100% PASS)**
- **Test Runner Command**: `node tests/run_all_tests.js`
- **Build Verification**: `npm run build` (0 errors, exit code 0)
- **Lint Check**: `npm run lint` / `npm run self-check` (0 errors)

---

## Test Execution Statistics by Tier

| Tier | Name | Total Tests | Passed | Failed | Pass Rate | Duration |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Tier 1** | Feature Coverage (F1–F15 & Guest Tracking) | 96 | 96 | 0 | 100% | ~1.25s |
| **Tier 2** | Boundary & Corner Cases | 91 | 91 | 0 | 100% | ~16.42s |
| **Tier 3** | Cross-Feature Pairwise Integration | 20 | 20 | 0 | 100% | ~1.09s |
| **Tier 4** | Real-World Application Scenarios | 11 | 11 | 0 | 100% | ~0.78s |
| **TOTAL** | **All 4 Tiers Comprehensive Suite** | **218** | **218** | **0** | **100%** | **~19.68s** |

---

## Requirement Coverage Mapping

### Requirement 1 (R1): Prominent Guest Order Tracking Bar on Customer Home Page
- **Implementation**: `src/components/GuestOrderTracking/GuestOrderTrackingBar.jsx`, `src/pages/KROrderHomePage.jsx`
- **Tested in**:
  - `tests/tier1/f06_order_tracking.test.js` (`[F6-2]`, `[F6-7]`, `[F6-16]`)
  - `tests/tier2/f06_order_tracking_boundary.test.js` (`[F6-B6]`, `[F6-B7]`, `[F6-B9]`, `[F6-B10]`, `[F6-B11]`)
  - `tests/tier3/pairwise_integration_test.js` (`[T16-PAIR-16]`)
  - `tests/tier4/application_scenarios_test.js` (`[SCENARIO-9]`, `[SCENARIO-10]`)
- **Key Verified Behaviors**:
  - Prominent search input with search icon, clear button, and submit action.
  - Suggestion chips with dynamic samples (Order ID, phone number).
  - Search dismiss/reset preserving product category tabs and catalog state.
  - Friendly not-found banner with CSKH hotline/Zalo link when no records match.

### Requirement 2 (R2): Visual 8-Step Timeline & Order Status Card Component
- **Implementation**: `src/components/GuestOrderTracking/GuestOrderStatusCard.jsx`, `src/components/GuestOrderTracking/ProofMediaModal.jsx`, `src/data/orderStatuses.js`
- **Tested in**:
  - `tests/tier1/f06_order_tracking.test.js` (`[F6-1]`, `[F6-5]`, `[F6-8]`, `[F6-9]`, `[F6-11]`, `[F6-12]`, `[F6-13]`, `[F6-14]`, `[F6-17]`, `[F6-18]`)
  - `tests/tier2/f06_order_tracking_boundary.test.js` (`[F6-B1]`, `[F6-B8]`, `[F6-B13]`, `[F6-B14]`, `[F6-B15]`)
  - `tests/tier3/pairwise_integration_test.js` (`[T4-PAIR-04]`, `[T6-PAIR-06]`, `[T17-PAIR-17]`, `[T19-PAIR-19]`)
  - `tests/tier4/application_scenarios_test.js` (`[SCENARIO-1]`, `[SCENARIO-9]`, `[SCENARIO-10]`)
- **Key Verified Behaviors**:
  - 8-Step progression sequence (`pending` -> `deposit_paid` -> `confirmed` -> `purchased` -> `packed_kr` -> `in_transit_air` -> `customs_cleared` -> `completed`).
  - Active step highlight, completed checkmarks, and percentage bar calculation (12.5% to 100%).
  - Transparent proof hub buttons for POV Store Video, Receipt Bill, Packing Video, Weight, Flight, Air AWB, Domestic Tracking Code.
  - One-click copy for domestic tracking codes (`ViettelPost`, custom carriers).
  - Unpaid deposit payment CTA (`/payment/:orderId`) for pending orders.
  - Cancelled order state (stepIndex -1, 0%, warning banner, disabled payment CTA).
  - Proof media modal supporting direct video/image rendering and embedded links.

### Requirement 3 (R3): Full-Stack Data, Phone Normalization & Firestore Integration
- **Implementation**: `src/services/guestTrackingService.js`, `src/context/AppContext.jsx`, `src/services/dbService.js`
- **Tested in**:
  - `tests/tier1/f06_order_tracking.test.js` (`[F6-6]`, `[F6-7]`, `[F6-10]`, `[F6-15]`, `[F6-19]`)
  - `tests/tier2/f06_order_tracking_boundary.test.js` (`[F6-B2]`, `[F6-B6]`, `[F6-B7]`, `[F6-B10]`, `[F6-B11]`, `[F6-B12]`)
  - `tests/tier3/pairwise_integration_test.js` (`[T12-PAIR-12]`, `[T13-PAIR-13]`, `[T18-PAIR-18]`)
  - `tests/tier4/application_scenarios_test.js` (`[SCENARIO-5]`, `[SCENARIO-9]`)
- **Key Verified Behaviors**:
  - Normalization of Vietnamese phone numbers with prefixes (`+84`, `84`, `840`, leading zero omissions, spaces, hyphens, parentheses).
  - Case-insensitive Order ID matching (`ORD-XXXXX`, `ord-xxxxx`, prefix-free number `XXXXX`).
  - Multi-order lookup returning all orders for a phone number, sorted with newest `createdAt` first.
  - Multi-order tab switcher in `GuestOrderStatusCard` allowing interactive order selection.
  - Real-time order sync with offline fallback support.

---

## Adversarial Verification & Boundary Matrix

| Edge Condition | Test ID | Verified Behavior | Status |
| :--- | :--- | :--- | :---: |
| Empty / whitespace-only query | `[F6-B9]` | Returns empty array safely without exceptions | PASS |
| Regex meta-characters (`.*`, `\`, `^$`) | `[F6-B7]`, `[F6-B11]` | Safely sanitized, zero SyntaxErrors | PASS |
| SQL / XSS Script injection payloads | `[F6-B11]` | Returns empty array without execution | PASS |
| Single-digit phone mismatch isolation | `[F6-B10]` | Distinguishes distinct phone numbers | PASS |
| Partial prefix phone lookup | `[F6-B10]` | Substring prefix (>=4 digits) finds target | PASS |
| Corrupted / null orders in dataset | `[F6-B12]` | Filters corrupted entries, returns valid orders | PASS |
| Cancelled order progression | `[F6-B13]` | stepIndex = -1, progress = 0%, no payment CTA | PASS |
| Missing `items` array fallback | `[F6-B14]` | Gracefully synthesizes single item summary | PASS |
| Missing / custom domestic carrier | `[F6-B15]` | Defaults to ViettelPost or uses custom carrier | PASS |

---

## How to Run the Test Suite

```bash
# Run the complete 4-tier test suite (218 test cases)
node tests/run_all_tests.js

# Or via npm script
npm test

# Run build & lint verification
npm run self-check
```
