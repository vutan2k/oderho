# Handoff Report: Guest Order Status & Tracking Bar Specification

**Agent**: Spec Miner 1 (`.agents/spec_miner_survey_1`)  
**Mission**: Extract exhaustive specifications, requirements (R1-R4), edge cases, and 4-tier test harness integration for the Guest Order Tracking Bar on TAVY Korea Home Page.  
**Date**: 2026-08-26T01:13:00Z  
**Type**: Hard Handoff (Complete)

---

## 1. Observation

Direct observations from the codebase, configuration, and test suites:

1. **Original Request Analysis (`ORIGINAL_REQUEST.md`)**:
   - Transform legacy product search bar in `KROrderHomePage.jsx` into a prominent Guest Order Status & Tracking Bar ("Tra Cứu Tiến Độ Đơn Hàng Không Cần Đăng Nhập").
   - Enable lookup via **Phone Number** or **Order ID** without requiring user authentication.
   - Display real-time 8-step visual timeline, quote/item summary, proof media (POV video, bill store, packing video, package weight), and domestic shipping codes.
   - Support multi-order switching for phones associated with multiple orders.
   - Maintain zero errors in `npm run build` and 100% pass rate in `node tests/run_all_tests.js`.

2. **Existing Build & Test Infrastructure**:
   - **`package.json`**:
     - `vite`: `^8.2.0`, `react`: `^19.2.8`, `react-dom`: `^19.2.8`, `lucide-react`: `^1.31.0`, `firebase`: `^12.17.1`, `oxlint`: `^1.75.0`.
     - Scripts: `npm run build` (`vite build`), `npm test` (`node tests/run_all_tests.js`), `npm run self-check` (`oxlint && vite build`).
   - **Test Runner (`tests/framework/runner.js`)**:
     - Lightweight zero-dependency test runner executing across 4 tiers.
     - Execution result verified: **188/188 tests passed** in **19.50s** with Exit Code 0.
   - **Build Execution**:
     - `npm run build` completed successfully with 0 errors in 749ms.

3. **Current Order Tracking Architecture**:
   - **`src/data/orderStatuses.js`**:
     - Authoritative 8-step sequence:
       1. `pending` (Step 1: "Chọn hàng & Chờ cọc", color: `#D97706`, bg: `#FEF3C7`, border: `#F59E0B`)
       2. `deposit_paid` (Step 2: "Đã cọc 100%", color: `#4F46E5`, bg: `#EEF2FF`, border: `#6366F1`)
       3. `confirmed` (Step 3: "TAVY Xác nhận đơn", color: `#0284C7`, bg: `#E0F2FE`, border: `#38BDF8`)
       4. `purchased` (Step 4: "Mua hàng (Video POV)", color: `#7C3AED`, bg: `#F3E8FF`, border: `#8B5CF6`, `hasPovVideo: true`)
       5. `packed_kr` (Step 5: "Đóng hàng (Video Đóng Kiện)", color: `#DB2777`, bg: `#FCE7F3`, border: `#EC4899`, `hasPackingVideo: true`)
       6. `in_transit_air` (Step 6: "Vận chuyển bay Hàn - Việt", color: `#0891B2`, bg: `#CFFAFE`, border: `#06B6D4`)
       7. `customs_cleared` (Step 7: "Thông quan & Kho VN", color: `#0D9488`, bg: `#CCFBF1`, border: `#14B8A6`)
       8. `completed` (Step 8: "Giao hàng & Tất toán", color: `#059669`, bg: `#D1FAE5`, border: `#10B981`)
       - Special/Terminal state: `cancelled` (Step: -1, color: `#DC2626`, bg: `#FEE2E2`, border: `#EF4444`)
     - Helper utilities: `getStatusConfig(statusKey)`, `getOrderStepIndex(orderObj)`, `ORDER_STEPS` array.
   - **`src/context/AppContext.js` & `src/context/AppProvider.jsx`**:
     - Exposes `orders`, `rates`, `oliveYoungCatalog`, `currentUser`.
     - Subscribes in real-time to Firestore `orders` collection via `subscribeToOrders()` with automatic sorting (newest first).
     - LocalStorage fallback: `beauty_orders`.
   - **`src/pages/KROrderHomePage.jsx`**:
     - Currently has legacy product search bar at lines 189-222 (`#search-input-main`).
     - Needs transformation to incorporate the Guest Order Status & Tracking Bar.
   - **`src/components/ChatWidget/OrderTrackerLookup.jsx` & `src/pages/OrdersPage.jsx`**:
     - Reference implementations of tracking search logic and proof hub media viewer (video/image modal).

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | R1: UI Tracking Bar | Guest Tracking Input Form | Prominent search bar on Home Page replacing legacy product search | Phone number or Order ID string (`searchTerm`) | Triggers lookup state, renders tracking card or error | Trims input; prevents empty submission; displays friendly not-found banner | `KROrderHomePage.jsx`, `ORIGINAL_REQUEST.md` |
| 2 | R1: UI Tracking Bar | Input Clear & Reset Action | One-click button to clear input and collapse tracking card | Click on clear 'X' button or 'Đóng' | Empties query, clears searched order state, returns catalog to normal | No-op when already empty | `KROrderHomePage.jsx`, `OrderTrackerLookup.jsx` |
| 3 | R2: Visual Status Card | Order Header & Status Badge | Displays Order ID, customer name, date, and colored status pill | `order` object (`id`, `customerName`, `createdAt`, `status`) | Rendered badge with tokenized color, bgColor, borderColor | Falls back to default status config for unknown status keys | `orderStatuses.js`, `OrdersPage.jsx` |
| 4 | R2: Visual Status Card | 8-Step Visual Timeline | Horizontal/responsive stepper rendering steps 1 to 8 with completed/active/pending states | `order.status`, `getOrderStepIndex(order)` | Rendered stepper with progress bar (`${((currentStep+1)/8)*100}%`) | If status is `cancelled`, displays canceled badge with stepIndex -1 | `orderStatuses.js`, `OrdersPage.jsx` |
| 5 | R2: Visual Status Card | Transparent Proof Hub | Displays interactive links/buttons for POV Store Video, Bill, Packing Video, Weight, Air AWB, Domestic VN Code | `povVideoUrl`, `receiptImageUrl`, `packingVideoUrl`, `packageWeightKg`, `trackingCode`, `domesticTrackingCode` | Actionable buttons/badges; opens media modal or copies code | Hides section or specific badges if fields are missing | `OrdersPage.jsx`, `OrderTrackerLookup.jsx` |
| 6 | R2: Visual Status Card | Order Items & Price Summary | Lists items in order with thumbnail, options, quantity, prices in VND | `order.items` or `order.productName`, `order.totalVnd`, `rates` | Formatted Vietnamese currency (`XXX.XXX VNĐ`) and item rows | Recalculates from `foreignPrice * krwRate * serviceFee` if `totalVnd` missing | `OrdersPage.jsx`, `AppProvider.jsx` |
| 7 | R2: Visual Status Card | Unpaid Order Payment CTA | Direct link/button to `/payment/:orderId` for orders in `pending` / unpaid status | `order.status === 'pending'`, `order.paymentStatus !== 'paid'` | "Thanh toán cọc ngay" CTA button leading to VietQR / Bank payment | Hidden when status is `deposit_paid` or higher | `OrdersPage.jsx`, `CLAUDE.md` |
| 8 | R3: Data & Lookup | Phone Number Normalization | Normalizes phone formats (+84, 84, spaces, dashes, leading 0) | Raw string (e.g. `+84 912-345-678`) | Clean 10-digit phone (e.g. `0912345678`) | Strips non-digits, converts +84/84 prefix to 0; handles edge lengths | `dbService.js`, `AppContext.js` |
| 9 | R3: Data & Lookup | Case-Insensitive Order ID Lookup | Matches Order ID case-insensitively with or without `ORD-` prefix | Raw string (e.g. `ord-827192`, `827192`, `ORD-827192`) | Matched `order` record from `orders` array / Firestore | Returns `null` when no matching record found | `OrderTrackerLookup.jsx`, `f06_order_tracking.test.js` |
| 10 | R3: Data & Lookup | Multi-Order Tab Switcher | Handles multiple orders placed by the same phone number | List of matching orders (`matchedOrders[]`) | Tab list allowing switching between orders; newest selected by default | Shows singular view if only 1 order matches | `ORIGINAL_REQUEST.md`, `OrdersPage.jsx` |
| 11 | R3: Data & Lookup | Realtime Firestore Sync | Subscribes to live Firestore updates so guest sees status change in real time | Firestore `orders` snapshot listener | Immediate UI update without page reload | Falls back to local memory/localStorage on network error | `dbService.js`, `AppProvider.jsx` |
| 12 | R4: Non-Functional | Responsive Mobile Stepper | Touch-friendly layout with horizontal overflow scrolling on small screens (<768px) | Viewport width | Compact stepper, tap targets >= 44px | Automatically wraps/scrolls smoothly without breaking page width | `CLAUDE.md`, `index.css` |
| 13 | R4: Non-Functional | Accessibility & ARIA Support | Semantic markup and ARIA attributes for screen readers and keyboard users | Keyboard events (Enter, Esc), ARIA attributes | `role="search"`, `aria-live="polite"`, `aria-label`, full keyboard navigability | Error messages announced cleanly to assistive tech | `a11y-debugging`, `CLAUDE.md` |

---

## 3. Edge Cases

| # | Feature | Input | Observed Behavior & Expected Handling |
|---|---------|-------|----------------------------------------|
| 1 | Phone Normalization | `+84912345678` or `84912345678` | Strips prefix and converts to `0912345678`, matching `customerPhone`. |
| 2 | Phone Normalization | `0912 345 678` or `0912-345-678` | Removes spaces and hyphens to yield `0912345678`. |
| 3 | Phone Normalization | `912345678` (9 digits, omitted 0) | Prepend `0` to match standard `0912345678`. |
| 4 | Order ID Matching | `ord-827192` (lowercase) | Upper-cased to `ORD-827192` and matched against `order.id`. |
| 5 | Order ID Matching | `827192` (numeric only, no prefix) | Matches `ORD-827192` via substring or prefix expansion. |
| 6 | Order ID Matching | `  ORD-827192  ` (leading/trailing whitespace) | Trimmed cleanly before lookup. |
| 7 | Multi-Order Phone | Phone with 3 orders (2 completed, 1 pending) | Displays tab bar with 3 items sorted by `createdAt` desc; active tab defaults to newest order; lets user toggle between all 3. |
| 8 | Non-Existent Query | `0999999999` or `ORD-999999` | Displays friendly red/amber banner: "Không tìm thấy đơn hàng nào với thông tin vừa nhập. Vui lòng kiểm tra lại...". |
| 9 | Empty Query | `""` or `"   "` on submit | Rejects submission, shows placeholder hint, does not alter catalog display. |
| 10 | Cancelled Order | `status: 'cancelled'` | Timeline shows canceled state (`stepIndex: -1`), badge in red (`#DC2626`), displays `cancelReason` if present. |
| 11 | Order with Legacy Single Item | Order missing `items[]` array but has `productName`, `foreignPrice`, `productImage` | Gracefully extracts single product data and renders order card without throwing `TypeError`. |
| 12 | Corrupted LocalStorage | `beauty_orders` contains invalid JSON | `AppProvider` safely catches `SyntaxError` and falls back to `initialMockOrders` without crashing app. |
| 13 | Extreme Rate Conversion | `rates.KRW.rate` is missing or undefined | Falls back to default `19.5` and `serviceFeeMultiplier = 1.05` to prevent `NaN VNĐ`. |
| 14 | Domestic Tracking Copy | User clicks "Sao chép" button | Copies `domesticTrackingCode` to `navigator.clipboard`, shows "Đã chép" with green checkmark for 2.5s. |

---

## 4. Detailed Specification by Requirement

### R1: Guest Order Tracking Bar on Customer Home Page
- **Component**: Integrated in `src/pages/KROrderHomePage.jsx` (or modular subcomponent `src/components/GuestOrderTrackingBar.jsx`).
- **Placement**: Prominent position at top of `#products` section or dedicated tracking section.
- **Visual Design**:
  - Container: Max width 680px, centered, padding 6px 12px, border-radius 30px, white background with subtle shadow `0 2px 12px rgba(122, 75, 158, 0.08)`, border `1.5px solid var(--purple-primary)` or `#E5E7EB`.
  - Icon: `Package` or `Search` icon in purple (`var(--purple-primary)`).
  - Input: `<input id="guest-tracking-input" type="text" placeholder="Nhập Số điện thoại hoặc Mã đơn (VD: 0912345678, ORD-827192)..." />`.
  - Action Buttons:
    - Clear button (`X` icon): Rendered when `query.length > 0`.
    - Submit button ("Tra cứu"): Purple button with white text and `Search` icon.

### R2: Visual 8-Step Timeline & Order Status Card Component
- **Component**: `src/components/GuestOrderStatusCard.jsx` (or embedded in `KROrderHomePage.jsx`).
- **Card Structure**:
  1. **Header**:
     - Order ID: `ORD-XXXXXX` in bold purple.
     - Customer name: `Nguyễn Thị Lan` (or masked name).
     - Order Date: `toLocaleDateString('vi-VN')`.
     - Status Badge: `getStatusConfig(order.status).label` with dedicated color tokens.
     - Close Button: `X` icon to collapse card.
  2. **8-Step Stepper**:
     - Sequential steps: `pending` -> `deposit_paid` -> `confirmed` -> `purchased` -> `packed_kr` -> `in_transit_air` -> `customs_cleared` -> `completed`.
     - Visual states: Completed (purple circle with checkmark `Check`), Active (purple pulse/glow with step number), Upcoming (gray circle `#E5E7EB`).
     - Progress bar fill: `${((currentStepIdx + 1) / 8) * 100}%`.
  3. **Proof Hub (Transparent Overseas Fulfillment)**:
     - POV Video button (`Video` icon) -> triggers media modal.
     - Bill Store button (`FileText` icon) -> triggers receipt image modal.
     - Packing Video button (`PackageCheck` icon) -> triggers packing video modal.
     - Package Weight badge (`Scale` icon) -> `Cân nặng: X.X kg`.
     - Air AWB badge (`Plane` icon) -> `AWB: XXXXXX`.
     - Domestic VN Tracking badge (`Truck` icon) -> `Mã VĐ: XXXXXX` with 1-click Copy button.
  4. **Order Summary**:
     - List of items: image thumbnail, product title, options, quantity, unit price, item total in VND.
     - Total Order Amount: formatted in VND.
     - Admin note: highlighted amber callout if present.
     - Payment CTA: "Thanh toán cọc ngay" button linking to `/payment/${order.id}` if unpaid.

### R3: Full-Stack Data & Firestore Lookup Integration
- **Lookup Function (`findGuestOrders(query, ordersList)`)**:
  ```javascript
  export function normalizePhone(rawPhone) {
    if (!rawPhone) return '';
    let digits = String(rawPhone).replace(/\D/g, '');
    if (digits.startsWith('84') && digits.length >= 11) {
      digits = '0' + digits.slice(2);
    } else if (!digits.startsWith('0') && (digits.length === 9 || digits.length === 10)) {
      digits = '0' + digits;
    }
    return digits;
  }

  export function findGuestOrders(searchTerm, orders = []) {
    if (!searchTerm || !searchTerm.trim()) return [];
    const cleanQuery = searchTerm.trim().toLowerCase();
    const cleanPhone = normalizePhone(searchTerm);

    return orders.filter(o => {
      const matchId = (o.id || '').toLowerCase() === cleanQuery ||
                      (o.id || '').toLowerCase().replace(/^ord-?/, '') === cleanQuery.replace(/^ord-?/, '');
      const oPhoneClean = normalizePhone(o.customerPhone || o.phone || '');
      const matchPhone = cleanPhone && oPhoneClean && (oPhoneClean === cleanPhone || oPhoneClean.includes(cleanPhone) || cleanPhone.includes(oPhoneClean));
      const matchTracking = (o.trackingCode || '').toLowerCase() === cleanQuery ||
                            (o.domesticTrackingCode || '').toLowerCase() === cleanQuery;
      return matchId || matchPhone || matchTracking;
    }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }
  ```
- **Multi-Order Support**:
  - If `matchedOrders.length > 1`: Render multi-order tab switcher bar (`[Đơn 1 (Mới nhất)]`, `[Đơn 2]`, `[Đơn 3]`).

### R4: Cross-Cutting Non-Functional Requirements
- **Responsive Design**: Mobile-first styling; timeline horizontally scrollable on mobile; buttons touch-friendly (>= 44px).
- **Accessibility**: ARIA labels on all interactive controls (`role="search"`, `aria-label="Tra cứu đơn hàng"`, `aria-live="polite"`).
- **Zero-Defect Pipeline**: Zero build errors (`npm run build`), 100% test pass rate (`node tests/run_all_tests.js`).

---

## 5. 4-Tier Test Suite Specification

### Tier 1: Feature Coverage (Unit & Interface Tests)
1. **`[F6-1]` 8-Step Workflow Definition**: Asserts `ORDER_STEPS` has exactly 8 steps and `ORDER_STATUSES` has all step indices from 0 to 7.
2. **`[F6-2]` Order Lookup by Order ID**: Asserts lookup matches exact ID (`ORD-100002`), lowercase (`ord-100002`), and stripped prefix (`100002`).
3. **`[F6-3]` Order Lookup by Phone**: Asserts lookup matches standard 10-digit Vietnamese phone numbers (`0912345678`).
4. **`[F6-4]` Phone Normalization Engine**: Asserts normalization of `+84912345678`, `84912345678`, `0912 345 678`, `0912-345-678` into `0912345678`.
5. **`[F6-5]` Order Status Badge Visual Tokens**: Asserts color, bgColor, and label mapping for each of the 8 steps and `cancelled`.
6. **`[F6-6]` Multi-Order Query Filtering & Sorting**: Asserts matching multiple orders returns array sorted by `createdAt` descending.
7. **`[F6-7]` Stepper Progress Calculation**: Asserts progress percentage calculation `${((stepIndex + 1) / 8) * 100}%` across all 8 steps.
8. **`[F6-8]` Proof Hub Data Extraction**: Asserts extraction of POV video, bill image, packing video, weight, and tracking codes.

### Tier 2: Boundary & Corner Cases
1. **`[F6-B1]` Empty / Whitespace-Only Query**: Asserts empty search returns empty array / null without throwing.
2. **`[F6-B2]` Non-Existent Query**: Asserts searching `ORD-999999` or `0900000000` returns empty array triggering friendly not-found UI.
3. **`[F6-B3]` Malformed Phone Numbers**: Asserts inputs like `0912abc345`, `++84-000`, `123` are handled gracefully.
4. **`[F6-B4]` Legacy Single-Item Order Fallback**: Asserts order objects without `items[]` array extract single item properties safely.
5. **`[F6-B5]` Missing Order Total Recalculation**: Asserts fallback price calculation using `rates.KRW.rate` and `serviceFeeMultiplier`.
6. **`[F6-B6]` Cancelled Status Handling**: Asserts cancelled order produces `stepIndex: -1` and does not highlight normal progression steps.
7. **`[F6-B7]` Special Regex Characters in Search**: Asserts searching strings like `.*`, `[a-z]+`, `ORD-(.*)` does not trigger RegExp syntax errors.
8. **`[F6-B8]` Copy Tracking Code Clipboard Fallback**: Asserts copy action executes safely.

### Tier 3: Pairwise Integration Tests
1. **`[T3-PAIR-16]` F1+F6: Guest Tracking Bar Search on Home Page -> State Switcher & Catalog View**: Asserts tracking bar activation retains catalog visibility or allows toggling back to catalog.
2. **`[T3-PAIR-17]` F6+F3: Guest Tracking Unpaid Order -> Direct Navigation to Payment Page**: Asserts clicking "Thanh toán cọc" redirects to `/payment/:orderId`.
3. **`[T3-PAIR-18]` F6+F13: Realtime Firestore Order Subscription Sync**: Asserts changes in Firestore `orders` immediately update active tracking card status.
4. **`[T3-PAIR-19]` F6+F2: Order Item Click in Tracking Card -> Opens Product Detail Modal**: Asserts clicking an item inside tracking summary opens `ProductDetailModal`.

### Tier 4: Real-World Scenarios
1. **`[SCENARIO-9]` Guest Phone Lookup Multi-Order Journey**: Guest enters `0912345678`, sees 2 matching orders, toggles between tabs, views 8-step progress, opens POV video modal, and copies domestic tracking code.
2. **`[SCENARIO-10]` Guest Direct Order ID Lookup & Deposit Payment Flow**: Guest enters `ORD-827192`, sees status `pending`, reviews quote details, clicks payment CTA, and navigates to payment screen.

---

## 6. Logic Chain

1. **User Objective**: Guest customers need to check order status without logging in, directly on the customer Home Page.
2. **Component Reuse & Synergy**: The 8-step sequence is already established in `src/data/orderStatuses.js` and tested in Tier 1 (`f06_order_tracking.test.js`). Reusing these authoritative definitions ensures 100% consistency across `OrdersPage.jsx`, `OrderTrackerLookup.jsx`, and `KROrderHomePage.jsx`.
3. **Robust Lookup**: By supporting phone normalization (handling `+84`, spaces, dashes) and case-insensitive Order ID matching (with/without `ORD-`), guest customers experience frictionless lookup.
4. **Zero-Defect Enforcement**: Integrating test cases across all 4 tiers guarantees that neither existing catalog browsing nor checkout/payment flows are broken when the search bar is transformed.

---

## 7. Caveats

- **No Source Code Modified**: As Spec Miner 1, no application source files were altered during this survey.
- **Existing Tests Verified**: All 188 tests currently pass. New tests for the Guest Order Tracking Bar can be added to `tests/tier1/f06_order_tracking.test.js`, `tests/tier2/f06_order_tracking_boundary.test.js`, `tests/tier3/pairwise_integration_test.js`, and `tests/tier4/application_scenarios_test.js`.

---

## 8. Conclusion

The specification for the Guest Order Status & Tracking Bar on TAVY Korea Home Page is fully mined and documented. The requirements (R1-R4), edge cases, visual tokens, normalization algorithms, and 4-tier test specifications are ready for implementation by the Developer and verification by the QA/QC Gatekeeper.

---

## 9. Verification Method

To independently verify the baseline and test harness:

1. **Run Full Test Suite**:
   ```bash
   node tests/run_all_tests.js
   ```
   *Expected*: 188/188 tests PASS (Exit code 0).

2. **Run Production Build**:
   ```bash
   npm run build
   ```
   *Expected*: Clean build with Vite in < 1000ms.

3. **Inspect Specification Artifacts**:
   - `/Users/tan/Downloads/tavy/.agents/spec_miner_survey_1/handoff.md` (this report)
   - `/Users/tan/Downloads/tavy/src/data/orderStatuses.js`
   - `/Users/tan/Downloads/tavy/src/pages/KROrderHomePage.jsx`
