# Project: Guest Order Status & Tracking Bar on Customer Home Page (Tra Cứu Đơn Hàng Không Cần Đăng Nhập)

## Architecture
- **Overview**: Replaced legacy product search input on customer Home Page (`KROrderHomePage.jsx`) with a modern, intuitive Guest Order Status & Tracking Bar. Enables guest users to track their orders in real time using their Phone Number or Order ID without login, displaying a rich 8-step visual timeline, transparent proof hub (POV video, bill, packing video, weight, domestic tracking), and order summary.
- **Frontend Stack**: React 19, Vite, Lucide-React icons, Tailwind CSS / Custom CSS variables (`index.css`), responsive touch-friendly layout.
- **Data Layer**: React Context (`AppContext`), Firestore `orders` collection with real-time `onSnapshot` sync (`dbService.js`), LocalStorage offline fallback (`beauty_orders`).
- **Module Boundaries**:
  1. `src/services/guestTrackingService.js`: Phone normalization, case-insensitive ID lookup, multi-order filtering and sorting.
  2. `src/components/GuestOrderTracking/`:
     - `GuestOrderTrackingBar.jsx`: Prominent search bar with search/clear buttons, input validation, and quick search hints.
     - `GuestOrderStatusCard.jsx`: Order status header, status badge, multi-order tabs, 8-step stepper, proof hub, order summary, unpaid deposit CTA, and dismiss button.
     - `ProofMediaModal.jsx`: Lightbox modal to view POV video, store receipt bill, and packing video.
  3. `src/pages/KROrderHomePage.jsx`: Integrates `<GuestOrderTrackingBar />` and `<GuestOrderStatusCard />` at the top of the products section, preserving category tabs and product browsing.
  4. `tests/`: Tier 1 to Tier 4 comprehensive automated test suites integrated with `tests/run_all_tests.js`.

## Code Layout
- `src/services/guestTrackingService.js` (NEW): Core normalization & lookup business logic.
- `src/components/GuestOrderTracking/GuestOrderTrackingBar.jsx` (NEW): Search input bar component.
- `src/components/GuestOrderTracking/GuestOrderStatusCard.jsx` (NEW): Visual 8-step timeline & order status card.
- `src/components/GuestOrderTracking/ProofMediaModal.jsx` (NEW): Media lightbox modal for proof assets.
- `src/components/GuestOrderTracking/index.js` (NEW): Barrel re-export.
- `src/pages/KROrderHomePage.jsx` (MODIFIED): Replace legacy search with guest order tracking bar and status card.
- `tests/tier1/f06_order_tracking.test.js` (EXTENDED): Unit & Interface tests for 8-step stepper and guest lookup.
- `tests/tier2/f06_order_tracking_boundary.test.js` (EXTENDED): Boundary & edge cases for phone formats and Order IDs.
- `tests/tier3/pairwise_integration_test.js` (EXTENDED): Pairwise integration between Home Page, tracking bar, and payment flow.
- `tests/tier4/application_scenarios_test.js` (EXTENDED): Real-world guest tracking journeys.

## Feature Inventory
| # | Feature | Description | Milestone | Status |
|---|---------|-------------|-----------|--------|
| 1 | Guest Tracking Bar UI (R1) | Prominent search bar on Home Page with icon, placeholder, submit & clear buttons | M3 | DONE |
| 2 | Phone Normalization (R3) | Normalize +84/84/spaces/dashes/leading-0 to standard Vietnamese phone | M1 | DONE |
| 3 | Order ID Matching (R3) | Case-insensitive match for `ORD-XXXXXX` and numeric prefix-free IDs | M1 | DONE |
| 4 | Multi-Order Tab Switcher (R3) | Switch between multiple orders placed by the same phone number | M2 | DONE |
| 5 | Visual 8-Step Timeline (R2) | 8-step visual stepper with completed/active/pending states & progress bar | M2 | DONE |
| 6 | Order Header & Status Badge (R2) | Header displaying Order ID, customer name, date, and colored status badge | M2 | DONE |
| 7 | Transparent Proof Hub (R2) | Interactive buttons for POV Video, Bill, Packing Video, Weight, Air AWB, Domestic tracking | M2 | DONE |
| 8 | Order Items & Price Summary (R2) | Summary of items with thumbnails, options, quantities, and total VNĐ amount | M2 | DONE |
| 9 | Unpaid Order Payment CTA (R2) | Direct "Thanh toán cọc ngay" link to payment page for pending orders | M2 | DONE |
| 10 | Realtime Firestore Sync (R3) | Live status updates via AppContext and Firestore listener without page reload | M1, M3 | DONE |
| 11 | Error Handling & Not Found (R3) | Friendly banner when order/phone is not found or input is invalid | M3 | DONE |
| 12 | Responsive & Thumb-friendly (R4) | Mobile-first touch-friendly design (>=44px touch targets, horizontal scroll) | M2, M3 | DONE |
| 13 | 4-Tier Automated Test Suite (R4) | 100% pass across Tier 1 (Feature), Tier 2 (Boundary), Tier 3 (Pairwise), Tier 4 (Scenarios) | M4 | DONE |
| 14 | Production Build Verification (R4) | `npm run build` succeeds cleanly with 0 errors | M4 | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Search & Lookup Data Layer | Implement `src/services/guestTrackingService.js` with phone normalization, case-insensitive ID matching, multi-order sorting | none | DONE |
| M2 | Visual 8-Step Timeline & Card Component | Implement `GuestOrderStatusCard.jsx`, `ProofMediaModal.jsx` with 8 steps, badges, proof hub, order summary, payment CTA, collapse action | M1 | DONE |
| M3 | KROrderHomePage Integration | Replace legacy search in `KROrderHomePage.jsx` with `<GuestOrderTrackingBar />`, wire up state, multi-order tabs, not-found UI, responsive layout | M1, M2 | DONE |
| M4 | E2E Testing, Adversarial Verification & Build | Integrate comprehensive Tier 1-4 tests in `tests/`, run `node tests/run_all_tests.js`, verify `npm run build` | M1, M2, M3 | DONE |
