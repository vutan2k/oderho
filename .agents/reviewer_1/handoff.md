# Frontend & UI Review Report: Guest Order Status & Tracking Bar

**Reviewer**: Reviewer 1 (Frontend & UI Reviewer & Adversarial Critic)  
**Date**: 2026-08-26  
**Scope**: Guest Order Tracking & Fulfillment Timeline (`GuestOrderTrackingBar.jsx`, `GuestOrderStatusCard.jsx`, `ProofMediaModal.jsx`, `KROrderHomePage.jsx`)  
**Verdict**: **APPROVE**

---

## 1. Observation

### 1.1 Direct Source Code Observations
- **`src/components/GuestOrderTracking/GuestOrderTrackingBar.jsx`**:
  - Replaces legacy search with a prominent pill-shaped search bar (`maxWidth: '720px'`, `borderRadius: '36px'`, `border: '2px solid var(--purple-primary, #7A4B9E)'`).
  - Search input has accessible attributes: `id="search-input-main"`, `aria-label="Tra cứu tiến độ đơn hàng"`, placeholder `"Nhập Số điện thoại hoặc Mã đơn (VD: 0912345678, ORD-827192)..."`.
  - Conditional clear button with `<X size={18} />` (`aria-label="Xóa tìm kiếm"`).
  - Submit button with disabled state when `!query.trim() || isLoading`, showing `<Loader2 className="animate-spin" />` when searching.
  - Interactive suggestion chips (`sampleSuggestions.map(...)`) and value proposition banner (`<ShieldCheck size={14} /> Minh bạch 100% Bill & Video POV`).
  - Implements prop-synchronization state pattern without triggering `useEffect` cascades (lines 20–27).

- **`src/components/GuestOrderTracking/GuestOrderStatusCard.jsx`**:
  - Header: Displays Order ID (`#${order.id}`), status badge pill with dynamic colors from `getStatusConfig(order.status)`, customer name (`<User />`), and formatted Vietnamese timestamp (`<Calendar />`).
  - Multi-order tab switcher (lines 226–287): Appears when `matchedOrders.length > 1`, horizontal scrollable tab bar with active order highlighting and order index selection (`onSelectOrder(idx)`).
  - 8-Step Visual Stepper (lines 350–454): 8 steps mapped to `ORDER_STEPS` with dynamic progress track (`stepProgress.progressPercent`), completed checkmarks (`<Check size={18} strokeWidth={3} />`), active step glow ring (`boxShadow: '0 0 0 4px rgba(122, 75, 158, 0.2)'`), and step labels.
  - Cancelled order handling (lines 327–347): Displays warning card with `<AlertCircle />` and CSKH hotline notice when `isCancelled === true`, with `progressPercent = '0%'` and `stepIndex = -1`.
  - Transparent Proof Hub (lines 507–781): Interactive buttons for POV Video (`<Video />`), Receipt Bill (`<FileText />`), Packing Video (`<PackageCheck />`), Weight (`<Scale />`), Flight Code (`<Plane />`), Air AWB (`<Plane />` + copy button), and Domestic Carrier Tracking (`<Truck />` + 1-click copy with feedback state).
  - Order Summary (lines 784–860): List of item cards with thumbnail (`onError` fallback to `/tavy-logo.png`), product name, brand tag, option label, quantity, and line price formatted via `Intl.NumberFormat('vi-VN')`.
  - Payment CTA (lines 889–911): Golden button (`var(--gold-primary, #C5A059)`) linking to `/payment/${order.id}` with `<CreditCard />` icon for unpaid orders (`pending` / `unpaid`).

- **`src/components/GuestOrderTracking/ProofMediaModal.jsx`**:
  - Modal with `role="dialog"`, `aria-modal="true"`, `aria-labelledby="proof-media-modal-title"`.
  - Backdrop blur overlay (`backgroundColor: 'rgba(0, 0, 0, 0.75)'`, `backdropFilter: 'blur(4px)'`).
  - Dismissal on Escape key listener and backdrop click (with `e.stopPropagation()` on content box).
  - Locks `document.body.style.overflow = 'hidden'` while open and restores on unmount.
  - Renders direct `<video>` (with `controls`, `autoPlay`, `playsInline`), `<iframe>` for embedded URLs (YouTube, Google Drive, Vimeo), and `<img>` for bills.

- **`src/pages/KROrderHomePage.jsx`**:
  - Imports and mounts `<GuestOrderTrackingBar />` and `<GuestOrderStatusCard />` inside section `#order-tracker`.
  - Wires search logic to `findGuestOrders` from `guestTrackingService.js`.
  - Dynamic sample suggestions derived from live `orders` state.
  - Smooth scrolling to `#order-tracker` on mobile upon search.
  - Friendly not-found banner (lines 268–318) with `<AlertCircle />`, guidance text, dismiss button, and direct link to CSKH Zalo (`https://zalo.me/0935861690`).
  - Preserves category navigation (`categories.map(...)`), product grid (`<ProductGrid />`), Hero section, Cart fly animation, and sticky header.

### 1.2 Independent Verification Tool Runs
1. **Automated Test Suite (`node tests/run_all_tests.js`)**:
   - Total test cases: 218
   - Passed: 218 (100% Pass Rate)
   - Failed: 0
   - Execution duration: ~19.65s
   - Exit code: 0
   - Feature coverage: Tier 1 (96/96), Tier 2 Boundary (91/91), Tier 3 Pairwise (20/20), Tier 4 Real-World Scenarios (11/11).

2. **Production Build (`npm run build`)**:
   - `vite build` transformed 1878 modules cleanly.
   - Generated production bundle in `dist/` with 0 errors.
   - Exit code: 0.

3. **Linter & Static Analysis (`npm run self-check`)**:
   - 0 errors in guest tracking files and components.

---

## 2. Logic Chain

1. **Requirement 1 (R1 - Guest Order Tracking Bar)**:
   - *Observation*: `GuestOrderTrackingBar.jsx` is positioned prominently in `KROrderHomePage.jsx` above the product catalog. It accepts phone numbers or order IDs, displays suggestions, supports instant clearing, and validates input before submission.
   - *Inference*: R1 is fully satisfied with modern visual aesthetics and clear accessibility labels.

2. **Requirement 2 (R2 - Visual 8-Step Timeline & Status Card)**:
   - *Observation*: `GuestOrderStatusCard.jsx` visualizes the 8 progression steps (`pending` through `completed`) with exact percentage increments (12.5% to 100%). Proof hub buttons allow inspection of store POV videos, receipt bills, packing videos, package weights, and domestic tracking codes. An unpaid deposit button routes directly to `/payment/:orderId`. Cancelled orders display an alert banner with progress 0%.
   - *Inference*: R2 is fully satisfied, providing a transparent, trust-building customer experience.

3. **Requirement 3 (R3 - Multi-Order Switching & Friendly Not-Found UI)**:
   - *Observation*: `findGuestOrders` normalizes phone numbers and supports case-insensitive Order IDs. When multiple orders are found, a horizontal scrollable tab bar allows switching between orders seamlessly. When no orders match, a red alert banner renders with clear guidance and a direct CSKH Zalo hotline link.
   - *Inference*: R3 is fully satisfied with robust error handling and multi-order support.

4. **Requirement 4 (R4 - Mobile Responsiveness & Code Quality)**:
   - *Observation*: Touch targets exceed 44px, steppers and tab bars have horizontal scroll with smooth touch momentum (`-webkit-overflow-scrolling: touch`), modal handles overflow locking and Escape key dismissals, images handle error fallbacks. All 218 test cases pass and `npm run build` succeeds with 0 errors.
   - *Inference*: Production quality and mobile usability standards are fully met.

5. **Adversarial & Integrity Verification**:
   - *Observation*: Checked for hardcoded test results, facade implementations, test bypasses, or fabricated logs. All logic functions (`normalizePhone`, `findGuestOrders`, `calculateStepProgress`, `getProofBadges`) execute dynamic algorithmic processing on real data structures.
   - *Inference*: No integrity violations or bypasses exist.

---

## 3. Caveats

- **No caveats**. All frontend components, services, and integration touchpoints were directly inspected and independently verified with automated test suites and production build tools.

---

## 4. Conclusion

The Guest Order Status & Tracking Bar and 8-Step Visual Timeline implementation (`GuestOrderTrackingBar.jsx`, `GuestOrderStatusCard.jsx`, `ProofMediaModal.jsx`, `KROrderHomePage.jsx`) meets all acceptance criteria, UI/UX requirements, and robustness standards outlined in `ORIGINAL_REQUEST.md` and `PROJECT.md`.

**Verdict**: **APPROVE**

---

## 5. Verification Method

To independently reproduce this verification:
```bash
# 1. Run complete 4-tier automated test suite (218 tests)
node tests/run_all_tests.js

# 2. Run Vite production build verification
npm run build

# 3. Inspect component files
# - src/components/GuestOrderTracking/GuestOrderTrackingBar.jsx
# - src/components/GuestOrderTracking/GuestOrderStatusCard.jsx
# - src/components/GuestOrderTracking/ProofMediaModal.jsx
# - src/pages/KROrderHomePage.jsx
```
