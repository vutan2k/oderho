# ARCHITECTURAL SURVEY & FRONTEND EXPLORATION REPORT
**Guest Order Status & Tracking Bar (Tra Cứu Tiến Độ Đơn Hàng Không Cần Đăng Nhập)**
*Explorer 1 — Codebase & Home Page Explorer*

---

## 1. Observation

### 1.1 Original Request & Core Requirements
From `/Users/tan/Downloads/tavy/.agents/ORIGINAL_REQUEST.md`:
- **R1: Guest Order Tracking Bar on Customer Home Page**: Replace legacy product search input (`#search-input-main`) in `KROrderHomePage.jsx` with a prominent "Tra Cứu Đơn Hàng" bar supporting lookup by Phone Number or Order ID, clear placeholder, submit and clear buttons.
- **R2: Visual 8-Step Timeline & Order Status Card Component**: Order header with ID, customer name, date, status badge; 8-step visual timeline with active/completed/pending styling; Order summary with product thumbnails, pricing, domestic tracking code with 1-click copy; and collapse/close action.
- **R3: Full-Stack Data & Firestore Lookup Integration**: Connect with `AppContext` (`orders` array subscribed via `dbService.subscribeToOrders`), normalize phone numbers (e.g., `+84`, spaces, dashes), case-insensitive ID/phone search, handle non-existent orders and multiple orders gracefully.
- **Acceptance Criteria**: Immediate 8-step display upon search, multi-order toggle for same phone, friendly error messages, responsive & thumb-friendly UI, `npm run build` with 0 errors, and automated test suite (`node tests/run_all_tests.js`) passing 100%.

---

### 1.2 Current Home Page Structure (`src/pages/KROrderHomePage.jsx`)
Direct inspection of `src/pages/KROrderHomePage.jsx` reveals:
- **Context Dependencies (Lines 13-14)**:
  ```jsx
  const { oliveYoungCatalog, rates, currentUser, logoutUser, cart, addToCart } = useContext(AppContext);
  ```
  *(Note: `orders` is available in `AppContext` via `AppProvider.jsx` but currently not destructured in `KROrderHomePage.jsx`)*.
- **Legacy Search State (Line 17)**:
  ```jsx
  const [searchQuery, setSearchQuery] = useState('');
  ```
- **Category Filter Tabs (Lines 23-28, 40-48)**:
  Categories: `'all'` (Tất cả sản phẩm), `'cosmetics'` (Mỹ phẩm), `'ginseng'` (Sâm nấm), `'supplements'` (Thực phẩm chức năng).
- **Header Navigation (Lines 105-108)**:
  ```jsx
  <a href="#products" className="icon-btn" aria-label="Tìm kiếm" title="Tìm kiếm" style={{ color: 'var(--text-dark)' }}>
    <Search size={26} />
  </a>
  ```
- **Legacy Search Bar UI (Lines 189-222)**:
  ```jsx
  {/* Search Input Bar */}
  <div style={{ maxWidth: '580px', margin: '0 auto 24px auto', position: 'relative' }}>
    <input
      id="search-input-main"
      type="text"
      placeholder="Tìm kiếm mỹ phẩm, sâm nấm, thương hiệu..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={{
        width: '100%',
        padding: '13px 44px 13px 44px',
        borderRadius: '30px',
        border: '1px solid var(--border-color)',
        fontSize: '0.92rem',
        outline: 'none',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        backgroundColor: '#FFFFFF',
        color: 'var(--text-dark)'
      }}
    />
    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
    {searchQuery && (
      <button onClick={() => setSearchQuery('')} aria-label="Xóa tìm kiếm" ...>
        <X size={18} />
      </button>
    )}
  </div>
  ```

---

### 1.3 Existing Order Status & Tracking Implementations
1. **Canonical 8-Step Definitions (`src/data/orderStatuses.js`)**:
   - `ORDER_STATUSES` defines 8 steps:
     1. `pending`: 'Bước 1: Chọn hàng & Chờ cọc' (Color: `#D97706`, Bg: `#FEF3C7`, Border: `#F59E0B`, StepIndex: 0)
     2. `deposit_paid`: 'Bước 2: Đã cọc 100%' (Color: `#4F46E5`, Bg: `#EEF2FF`, Border: `#6366F1`, StepIndex: 1)
     3. `confirmed`: 'Bước 3: TAVY Xác nhận đơn' (Color: `#0284C7`, Bg: `#E0F2FE`, Border: `#38BDF8`, StepIndex: 2)
     4. `purchased`: 'Bước 4: Mua hàng (Video POV)' (Color: `#7C3AED`, Bg: `#F3E8FF`, Border: `#8B5CF6`, StepIndex: 3, `hasPovVideo: true`)
     5. `packed_kr`: 'Bước 5: Đóng hàng (Video Đóng Kiện)' (Color: `#DB2777`, Bg: `#FCE7F3`, Border: `#EC4899`, StepIndex: 4, `hasPackingVideo: true`)
     6. `in_transit_air`: 'Bước 6: Vận chuyển bay Hàn - Việt' (Color: `#0891B2`, Bg: `#CFFAFE`, Border: `#06B6D4`, StepIndex: 5)
     7. `customs_cleared`: 'Bước 7: Thông quan & Kho VN' (Color: `#0D9488`, Bg: `#CCFBF1`, Border: `#14B8A6`, StepIndex: 6)
     8. `completed`: 'Bước 8: Giao hàng & Tất toán' (Color: `#059669`, Bg: `#D1FAE5`, Border: `#10B981`, StepIndex: 7)
     - Cancelled status: `cancelled` (Color: `#DC2626`, StepIndex: -1).
   - Exported Helper Functions: `getStatusConfig(statusKey)`, `ORDER_STEPS`, `getOrderStepIndex(orderObj)`.

2. **Customer Order Page (`src/pages/OrdersPage.jsx`)**:
   - Features rich UI elements:
     - 8-step visual timeline component using `.order-timeline` and `.timeline-item`.
     - Proof Hub displaying buttons for POV Video (`order.povVideoUrl`), Bill Store (`order.receiptImageUrl`), Packing Video (`order.packingVideoUrl`), Package Weight (`order.packageWeightKg`), AWB Air (`order.trackingCode`), and Domestic Carrier (`order.domesticTrackingCode`).
     - Product detail mapping & click-to-view modal.
     - Media viewer modal for videos and receipt images.
     - 1-click copy button for tracking codes.

3. **ChatWidget Tracker (`src/components/ChatWidget/OrderTrackerLookup.jsx`)**:
   - Contains previous compact lookup logic matching `id`, `customerPhone`, `userEmail`, `flightCode`, `trackingCode`, `domesticTrackingCode`.
   - Formats total VND and displays progress bar `((stepIndex + 1) / 8) * 100%`.

4. **Realtime Database Layer (`src/services/dbService.js` & `src/context/AppProvider.jsx`)**:
   - `subscribeToOrders` provides real-time Firestore synchronization on the `orders` collection.
   - Orders in state are sorted newest first (`new Date(b.createdAt) - new Date(a.createdAt)`).

---

### 1.4 Design System & Styling Tokens (`src/index.css`)
- **Color Variables**:
  - Ivory Background: `var(--bg-ivory)` (`#FAF8F5`)
  - Subtle Purple Background: `var(--bg-subtle-purple)` (`#F3EFF6`)
  - Purple Primary: `var(--purple-primary)` (`#7A4B9E`)
  - Purple Dark: `var(--purple-dark)` (`#583377`)
  - Purple Light: `var(--purple-light)` (`#F0E8F5`)
  - Gold Primary: `var(--gold-primary)` (`#C5A059`)
  - Text Colors: `var(--text-dark)` (`#1F2937`), `var(--text-muted)` (`#4B5563`), `var(--text-light)` (`#6B7280`)
  - Border: `var(--border-color)` (`#E5E7EB`)
  - Shadows: `var(--shadow-sm)` (`0 2px 8px rgba(0,0,0,0.04)`), `var(--shadow-md)` (`0 8px 24px rgba(0,0,0,0.07)`), `var(--shadow-lg)` (`0 16px 32px rgba(0,0,0,0.1)`)
- **Timeline CSS Rules (Lines 887-970)**:
  - Mobile (<768px): Vertical timeline (`.order-timeline` with flex-column, vertical connecting line `::before` at left 26px).
  - Desktop (>=768px): Grid timeline (`grid-template-columns: repeat(auto-fit, minmax(110px, 1fr))`, vertical line hidden, card styling with `data-completed` and `data-current`).

---

### 1.5 Baseline Test & Build Status
- `npm test` runs 188 automated test cases across Tier 1 (82), Tier 2 (81), Tier 3 (16), Tier 4 (9): **188 / 188 PASS (0 failures, exit code 0)**.
- `npm run build` runs Vite 8 production bundle: **PASS (1873 modules transformed, 0 errors, 552ms)**.
- `npm run lint` runs Oxlint: **PASS (0 errors, 160 warnings)**.

---

## 2. Logic Chain

1. **User Experience Continuity & Problem Identification**:
   - Guests currently placing orders via Cart (`/cart`) receive an order ID (e.g. `ORD-827192`) or order via phone number. If they do not log into an account, they currently have no direct way on the Home Page to check real-time 8-step progress, POV video, bill receipts, and domestic tracking.
   - The Home Page search bar was previously a simple product filter. Replacing this with a dedicated, dual-purpose or dedicated Guest Tracking component immediately satisfies Requirement R1.

2. **Component Architecture Separation of Concerns**:
   - Creating a modular component `GuestOrderTrackingBar.jsx` (or `GuestOrderTracker.jsx`) located in `src/components/` keeps `KROrderHomePage.jsx` clean, maintainable, and easily testable.
   - The component receives or accesses:
     - `orders`: from `AppContext` (or Firestore live query fallback)
     - `rates`: from `AppContext` (for accurate KRW -> VND conversions)
     - Media viewer modal handler (for POV video & bill store viewing)

3. **Lookup & Phone Normalization Algorithm**:
   - Input normalization:
     ```javascript
     const normalizePhone = (input) => {
       if (!input) return '';
       let clean = input.replace(/\D/g, ''); // strip non-digits
       if (clean.startsWith('84') && clean.length >= 10) {
         clean = '0' + clean.slice(2);
       }
       return clean;
     };
     ```
   - Matching query:
     - Check exact/substring match on `order.id` (case-insensitive, e.g., `query.toUpperCase() === order.id.toUpperCase()` or `order.id.toLowerCase().includes(q)`).
     - Check normalized phone match (`normalizePhone(order.customerPhone) === cleanPhone` or phone substring).
     - Check tracking code matches (`order.trackingCode` or `order.domesticTrackingCode`).

4. **Multi-Order Selection Logic**:
   - When a guest searches by phone number, multiple orders may exist.
   - The component collects all matching orders (`const matchingOrders = orders.filter(...)`).
   - If `matchingOrders.length > 1`:
     - Render an order selector chip bar: `[Đơn #ORD-827192 (Đang bay) - 25/08] [Đơn #ORD-826105 (Đã giao) - 15/08]`.
     - Automatically select the latest active order (or latest by `createdAt`).
     - Allow user to toggle between orders with a single click.

5. **Visual 8-Step Timeline Component (R2)**:
   - Utilizes `ORDER_STEPS` and `getStatusConfig(order.status)` from `src/data/orderStatuses.js`.
   - Step statuses:
     - `isCompleted = idx <= currentStepIdx` -> Highlighted purple circle with `<Check size={16} />`.
     - `isCurrent = idx === currentStepIdx` -> Active card with border, purple badge, and step description.
     - `isPending = idx > currentStepIdx` -> Gray circle with step number `idx + 1`.
   - Proof Hub section renders dynamic action buttons for POV video, bill image, packing video, package weight, air AWB, and domestic tracking with copy-to-clipboard feedback (`handleCopyCode`).
   - Product items breakdown displays product thumbnail, title, options, quantity, unit price, and total VND.
   - Direct button for unpaid/pending orders linking to `/payment/${order.id}`.

6. **Home Page Section Placement & Responsive Behavior**:
   - Place the Tracking Bar directly below `HeroSection` and above the Category Filter Tabs (`Mỹ phẩm`, `Sâm nấm`, `Thực phẩm chức năng`).
   - Add section anchor `<section id="order-tracker">` and update header search icon link (`href="#order-tracker"`) for smooth scroll navigation.
   - Mobile layout (<640px): Thumb-friendly touch targets (min 44px), vertical timeline with connecting line, horizontal scroll chips for multi-order selector, 100% full width inputs.
   - Desktop layout (>=768px): Centered search bar with max-width 680px, grid timeline layout, and responsive side-by-side product summary and shipping info.

---

## 3. Caveats

- **No Caveats** on architecture or data availability. `AppContext` already maintains the realtime `orders` subscription synced directly from Firestore.
- **Privacy Design Note**: Guest order tracking displays order status, shipping progress, items, and tracking numbers for matching Phone or Order ID. Sensitive internal credentials remain protected.

---

## 4. Conclusion & Recommended Component Blueprint

### 4.1 File Modification Map
1. **NEW COMPONENT**: `src/components/GuestOrderTrackingBar.jsx`
   - Handles guest search input, normalization, multi-order selection, 8-step visual timeline, Proof Hub buttons, product item list, domestic tracking copy button, and media preview modal.
2. **PAGE UPDATE**: `src/pages/KROrderHomePage.jsx`
   - Import and render `<GuestOrderTrackingBar />` in the main content area.
   - Connect header search icon anchor to `#order-tracker`.
   - Retain category tabs and `ProductGrid` below the tracking bar for browsing.
3. **STYLE ENHANCEMENTS**: Ensure all timeline classes in `src/index.css` apply seamlessly to the new home page tracking card.

### 4.2 Proposed Component Specification (`GuestOrderTrackingBar.jsx`)
```jsx
// Key Interfaces & State
const [searchTerm, setSearchTerm] = useState('');
const [matchingOrders, setMatchingOrders] = useState([]);
const [selectedOrderId, setSelectedOrderId] = useState(null);
const [hasSearched, setHasSearched] = useState(false);
const [copiedCode, setCopiedCode] = useState('');
const [activeMediaModal, setActiveMediaModal] = useState(null);
const [isCollapsed, setIsCollapsed] = useState(false);
```

### 4.3 UI States:
1. **Initial / Idle State**:
   - Clean, elegant search bar with placeholder: `"Tra cứu tiến độ 8 bước: Nhập SĐT (VD: 0912345678) hoặc Mã đơn (VD: ORD-827192)..."`
   - Purple action button `"Tra Cứu"` with `<Search size={18} />`.
   - Feature chips: `🛡️ 8 bước minh bạch`, `📹 Video POV Store`, `🧾 Bill thật 100%`, `⚡ Không cần đăng nhập`.
2. **Success Result State**:
   - Header with Order ID, customer name, date placed, status badge (`getStatusConfig`).
   - If multiple orders found: tab buttons to switch between orders.
   - 8-step visual timeline with completed checkmarks, current step indicator, and progress bar.
   - Proof Hub showing POV video, bill image, packing video, weight, and tracking codes.
   - Order items list with thumbnails and VND pricing.
   - Close/collapse button `[Đóng tra cứu]` to collapse result.
3. **Not Found State**:
   - Friendly red/amber alert box with helpline Zalo `0935 861 690` and clear tips.

---

## 5. Verification Method

To verify the implementation independently:

1. **Automated Test Suite**:
   ```bash
   node tests/run_all_tests.js
   ```
   *Expected*: All 188 test cases across Tiers 1-4 pass with 0 failures.

2. **Production Build & Type/Bundle Check**:
   ```bash
   npm run build
   ```
   *Expected*: Vite builds cleanly in `< 1000ms` with 0 errors.

3. **Linter & Syntax Check**:
   ```bash
   npm run lint
   ```
   *Expected*: Oxlint reports 0 errors.

4. **Functional Scenarios to Validate**:
   - Lookup with Order ID: e.g. `'ORD-827192'` -> displays 8-step progress and order details immediately.
   - Lookup with Phone: e.g. `'0912345678'`, `'+84 912 345 678'`, `'0912-345-678'` -> normalizes and finds matching orders.
   - Multi-order switching: Phone with multiple orders presents tab toggles to switch active view.
   - Non-existent query: e.g. `'ORD-999999'` -> shows friendly not-found banner.
   - 1-click tracking copy: clicking Copy copies tracking code to clipboard and shows "Đã chép".
   - Media modal: clicking POV Video or Bill Store opens popup viewer cleanly.
