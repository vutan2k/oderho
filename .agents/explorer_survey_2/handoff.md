# Handoff Report: Data Layer & Firestore Deep Technical Exploration

**Explorer**: Explorer 2 (Data Layer & Firestore Explorer)  
**Working Directory**: `/Users/tan/Downloads/tavy/.agents/explorer_survey_2`  
**Target Request**: Guest Order Status & Tracking Bar on Customer Home Page (Tra Cứu Tiến Độ Đơn Hàng 8 Bước Không Cần Đăng Nhập)  
**Date**: 2026-08-26  

---

## 1. Observation

Direct observations from codebase inspection across the data layer, Firestore configuration, AppContext, component architecture, and test suite:

### 1.1. Firebase & Firestore Configuration
- **File**: `/Users/tan/Downloads/tavy/src/firebase.js`
  - Firebase initialized via `initializeApp(firebaseConfig)` with config from `import.meta.env.VITE_FIREBASE_*` (Lines 14–44).
  - Offline data persistence enabled via `enableIndexedDbPersistence(dbObj)` (Lines 52–64).
  - Firestore database instance exported as `db` (Line 47).
- **Security Rules**: `/Users/tan/Downloads/tavy/firestore.rules` (Lines 32–35):
  ```javascript
  // 2. Orders Collection
  match /orders/{orderId} {
    allow read, write: if true;
  }
  ```
  *Note*: The `orders` collection allows public read/write access, enabling unauthenticated guest order tracking directly via Firestore or AppContext.

### 1.2. Database Service (`src/services/dbService.js`)
- **Realtime Listener**: `subscribeToOrders(onUpdate, onError, userEmail)` (Lines 27–66):
  - Listens via `onSnapshot(q, ...)` on collection `'orders'`.
  - Normalizes `createdAt` timestamp: converts Firestore Timestamp objects (`data.createdAt.toDate().toISOString()`) or strings into standard ISO 8601 strings (Lines 42–47).
  - Sorts orders in descending order by `createdAt` (newest orders first at index 0) (Line 55).
- **Order Creation & Updates**:
  - `createOrderInDB(orderData)` (Lines 71–96): Generates document ID with format `ORD-XXXXXX` (e.g. `ORD-827192`). Sets initial `status: 'pending'`, `paymentStatus: 'unpaid'`, `paymentDue: +15 minutes`.
  - `updateOrderStatusInDB(orderId, updates)` (Lines 124–136): Updates status and proof fields, sets `updatedAt: serverTimestamp()`.
  - `updateOrderQuoteInDB(orderId, quoteData, totalCalculated)` (Lines 101–119).
  - `deleteOrderFromDB(orderId)` (Lines 141–150).

### 1.3. AppContext & State Flow (`src/context/AppProvider.jsx`)
- **Realtime Synchronization**: Lines 248–257:
  ```javascript
  useEffect(() => {
    const unsubscribe = subscribeToOrders(
      (updatedOrders) => {
        setOrders(updatedOrders);
        try { localStorage.setItem('beauty_orders', JSON.stringify(updatedOrders)); } catch {}
      },
      (err) => console.warn('Firestore orders sync:', err)
    );
    return () => unsubscribe();
  }, []);
  ```
  - `orders` state is globally provided to the entire application via `useContext(AppContext)`.
  - Persistent fallback: `localStorage.getItem('beauty_orders')` ensures offline availability and test resilience.
- **Context Values Provided**: `orders`, `rates`, `currentUser`, `updateOrderStatus`, `updateOrderQuote`, `updateOrderTracking`, `createOrder`, `createManualOrder`, `deleteOrder` (Lines 1031–1094).

---

### 1.4. Firestore `orders` Collection Schema Specification

The `orders` collection documents in Firestore contain the following structured fields:

| Field Name | Type | Description & Example Values |
|---|---|---|
| `id` / `_id` | `string` | Unique Order ID format: `ORD-XXXXXX` (e.g. `"ORD-827192"`, `"ORD-100001"`). |
| `customerName` | `string` | Customer full name (e.g. `"Nguyễn Thị Lan"`, `"Trần Văn A"`). |
| `customerPhone` | `string` | Customer contact phone (e.g. `"0912345678"`, `"+84912345678"`, `"091 234 5678"`). |
| `customerAddress` | `string` | Full shipping address (e.g. `"123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh"`). |
| `customerNote` | `string` (optional) | Special note from customer (e.g. `"Giao trong giờ hành chính"`). |
| `adminNote` | `string` (optional) | Note from admin (e.g. `"Hàng mua trực tiếp tại Olive Young Myeongdong"`). |
| `status` | `string` | Current 8-step status key (e.g. `'pending'`, `'deposit_paid'`, `'in_transit_air'`). |
| `paymentStatus` | `string` | `'unpaid'` \| `'paid'`. |
| `paymentMethod` | `string` (optional) | `'bank_kr'`, `'bank_vn'`, `'manual'`, `'qr'`. |
| `bankAccount` | `string` (optional) | Bank account number for deposit (e.g. `"1002959863658"`). |
| `bankName` | `string` (optional) | Bank name (e.g. `"Woori Bank"`, `"MBbank"`). |
| `paymentDue` | `string` (ISO) | Deadline for 100% deposit payment (+15 minutes after creation). |
| `paymentConfirmed` | `boolean` (optional) | `true` if deposit confirmed. |
| `amountPaid` / `paidAmountVnd` | `number` (optional) | Amount of VNĐ deposited/paid. |
| `createdAt` | `string` (ISO) | Order creation timestamp. |
| `updatedAt` | `string` (ISO) | Order last updated timestamp. |
| `userEmail` | `string` | Account email or guest email (`"guest@tavy.vn"`, `"tan123@tavykorea.vn"`). |
| `country` | `string` | Currency code: `'KRW'` or `'USD'` (Default `'KRW'`). |
| `foreignPrice` | `number` | Total amount in foreign currency (KRW Won or USD). |
| `totalAmountKrw` | `number` (optional) | Total KRW for multi-item orders. |
| `totalVnd` | `number` (optional) | Final total payment in VNĐ (with exchange rate + 5% service fee). |
| **`items`** | `Array<Object>` | **Multi-item cart order list** (see item schema below). |
| **Legacy Single Item** | `productName`, `productImage`, `brand`, `options`, `qty` | Fallback fields for single-item requests. |
| **8-Step Proof Hub** | Logistics & Transparency | Fields detailed in Section 1.6 below. |
| `quote` | `Object` (optional) | Detailed price breakdown object (Section 1.7). |

#### Schema of item in `items` array:
```javascript
{
  goodsNo: "A000000223414" | "SP-...",
  name: "Mặt nạ Mediheal Teatree Essential Mask 10+1",
  nameKr: "메디힐 티트리 에센셜 마스크",
  brand: "Mediheal",
  category: "cosmetics",
  foreignPrice: 10000,          // KRW
  price: 204750,               // VNĐ (after rate & fee)
  qty: 2,
  options: "Hộp 10+1 miếng",
  productImage: "https://image.oliveyoung.co.kr/...",
  productUrl: "https://www.oliveyoung.co.kr/..."
}
```

---

### 1.5. The Exact 8-Step Order Workflow

Defined in `/Users/tan/Downloads/tavy/src/data/orderStatuses.js`:

```javascript
export const ORDER_STATUSES = {
  pending: {
    id: 'pending',
    stepNumber: 1,
    stepIndex: 0,
    label: 'Bước 1: Chọn hàng & Chờ cọc',
    shortLabel: 'Chờ cọc',
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#F59E0B',
    desc: 'Quý khách chọn sản phẩm hoặc gửi link Olive Young / Musinsa.'
  },
  deposit_paid: {
    id: 'deposit_paid',
    stepNumber: 2,
    stepIndex: 1,
    label: 'Bước 2: Đã cọc 100%',
    shortLabel: 'Đã cọc 100%',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    borderColor: '#6366F1',
    desc: 'Khách hàng đã thanh toán cọc 100% tiền hàng thành công.'
  },
  confirmed: {
    id: 'confirmed',
    stepNumber: 3,
    stepIndex: 2,
    label: 'Bước 3: TAVY Xác nhận đơn',
    shortLabel: 'Đã xác nhận',
    color: '#0284C7',
    bgColor: '#E0F2FE',
    borderColor: '#38BDF8',
    desc: 'Admin kiểm tra sản phẩm, phân loại và lên lịch gom hàng tại Hàn Quốc.'
  },
  purchased: {
    id: 'purchased',
    stepNumber: 4,
    stepIndex: 3,
    label: 'Bước 4: Mua hàng (Video POV)',
    shortLabel: 'Đang mua (POV)',
    color: '#7C3AED',
    bgColor: '#F3E8FF',
    borderColor: '#8B5CF6',
    hasPovVideo: true,
    desc: 'Nhân viên TAVY trực tiếp mua hàng tại Store Hàn và quay video POV thực tế.'
  },
  packed_kr: {
    id: 'packed_kr',
    stepNumber: 5,
    stepIndex: 4,
    label: 'Bước 5: Đóng hàng (Video Đóng Kiện)',
    shortLabel: 'Kho Seoul',
    color: '#DB2777',
    bgColor: '#FCE7F3',
    borderColor: '#EC4899',
    hasPackingVideo: true,
    desc: 'Kiểm tra seal, bọc chống sốc 3 lớp, cân ký và quay video đóng thùng.'
  },
  in_transit_air: {
    id: 'in_transit_air',
    stepNumber: 6,
    stepIndex: 5,
    label: 'Bước 6: Vận chuyển bay Hàn - Việt',
    shortLabel: 'Đang bay',
    color: '#0891B2',
    bgColor: '#CFFAFE',
    borderColor: '#06B6D4',
    desc: 'Hàng bay chuyên tuyến Incheon ✈️ Hà Nội / TP.HCM trong 3-5 ngày.'
  },
  customs_cleared: {
    id: 'customs_cleared',
    stepNumber: 7,
    stepIndex: 6,
    label: 'Bước 7: Thông quan & Kho VN',
    shortLabel: 'Kho VN',
    color: '#0D9488',
    bgColor: '#CCFBF1',
    borderColor: '#14B8A6',
    desc: 'Hoàn tất thủ tục hải quan chính ngạch, cập nhật mã vận đơn nội địa.'
  },
  completed: {
    id: 'completed',
    stepNumber: 8,
    stepIndex: 7,
    label: 'Bước 8: Giao hàng & Tất toán',
    shortLabel: 'Đã giao',
    color: '#059669',
    bgColor: '#D1FAE5',
    borderColor: '#10B981',
    desc: 'Giao hàng tận tay khách hàng, đồng kiểm và hoàn tất đơn hàng.'
  },
  cancelled: {
    id: 'cancelled',
    stepNumber: -1,
    stepIndex: -1,
    label: 'Đã hủy đơn hàng',
    shortLabel: 'Đã hủy',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#EF4444',
    desc: 'Đơn hàng đã được hủy.'
  }
};
```

#### Step Index & Helpers:
- `ORDER_STEPS`: Array of 8 objects `{ key, step, title, shortLabel, stepIndex, hasPovVideo?, hasPackingVideo? }`.
- `getOrderStepIndex(orderObj)`: Returns integer `0..7` (or `-1` for cancelled).
- `getStatusConfig(statusKey)`: Returns matching status config with safe fallback.
- **Backward Compatibility Aliases**:
  - `quoted` ➔ `stepNumber: 2`, `stepIndex: 0`
  - `in_kr_warehouse` ➔ `stepNumber: 5`, `stepIndex: 4`
  - `transit` ➔ `stepNumber: 6`, `stepIndex: 5`
  - `in_vn_warehouse` ➔ `stepNumber: 7`, `stepIndex: 6`
  - `delivering` ➔ `stepNumber: 8`, `stepIndex: 7`

---

### 1.6. 8-Step Proof Hub & Logistics Fields

The data model includes full transparency and domestic tracking fields:
1. `povVideoUrl` (`string`): URL to video filmed at the Korean store (e.g. Olive Young Myeongdong POV).
2. `receiptImageUrl` (`string`): URL to store tax invoice / paper receipt.
3. `packingVideoUrl` (`string`): URL to 3-layer bubble packaging video at Seoul warehouse.
4. `packageWeightKg` (`number`): Package scale weight in kg (e.g. `1.85`).
5. `flightCode` (`string`): Airline flight code (e.g. `"VN415 - ICN/HAN"`).
6. `trackingCode` (`string`): Air Waybill (AWB) code for Incheon ✈️ Hanoi/HCM.
7. `domesticCarrier` (`string`): Domestic delivery carrier (Default `"ViettelPost"`, `"GHTK"`, `"EMS"`).
8. `domesticTrackingCode` (`string`): Domestic parcel tracking code (e.g. `"VT882910482VN"`).

---

### 1.7. Quotation & Pricing Calculation Contract
- **Exchange Rates & Fees** (`src/context/AppProvider.jsx` Lines 33–38):
  - `rates.KRW.rate`: 19.5 (1 KRW = 19.5 VNĐ)
  - `rates.serviceFeePercent`: 5 (5% purchasing & air cargo service fee)
  - Service multiplier formula: `serviceMultiplier = 1 + (rates.serviceFeePercent || 5) / 100` (e.g. 1.05)
- **Order Total Price Resolution Order**:
  1. `order.totalVnd` (if set and > 0)
  2. `order.quote?.totalVnd` (if admin quoted)
  3. `order.items.reduce((sum, item) => sum + (item.price || Math.round((item.foreignPrice || 0) * krwRate * serviceMultiplier)) * (item.qty || 1), 0)`
  4. `Math.round((order.foreignPrice || 0) * krwRate * serviceMultiplier * (order.qty || 1))`

---

### 1.8. Test Suite & Build Verification
- **Automated Test Suite**: Executed `node tests/run_all_tests.js`:
  - Tier 1 (Feature Coverage): 82 / 82 PASSED
  - Tier 2 (Boundary & Corner Cases): 81 / 81 PASSED
  - Tier 3 (Pairwise Integration): 16 / 16 PASSED
  - Tier 4 (Real-World Scenarios): 9 / 9 PASSED
  - **Total**: 188 / 188 test cases passed 100% in 19.25s.
- **Production Build**: Executed `npm run build`:
  - Vite v8.2.2 compiled client bundle in 675ms with 0 errors.

---

## 2. Logic Chain

The step-by-step reasoning from data layer observations to technical implementation:

```
[Observation: Firestore 'orders' collection has public read rule & AppContext syncs 'orders' in real-time]
                                  │
                                  ▼
[Logic Step 1: Guest Search Data Source]
Guest tracking does not require backend authentication. The component consumes `orders` directly from `AppContext` (with instant memory lookup and Firestore/localStorage sync).
                                  │
                                  ▼
[Logic Step 2: Normalization Strategy for Search Input]
User input can be a Phone Number (e.g., "0912 345 678", "+84912345678", "0912-345-678") or an Order ID (e.g., "ord-827192", "ORD-827192", "827192", "VT882910482VN").
  - Phone Normalization Rule:
      cleanPhone = input.replace(/\D/g, '');
      if (cleanPhone.startsWith('84') && cleanPhone.length >= 11) cleanPhone = '0' + cleanPhone.slice(2);
  - Order ID / Code Normalization Rule:
      cleanId = input.trim().toUpperCase();
                                  │
                                  ▼
[Logic Step 3: Match Resolution & Candidate Filtering]
Matches against all orders in memory:
  - Phone Match: candidate's normalized phone contains or equals cleanPhone.
  - ID Match: candidate.id.toUpperCase().includes(cleanId) or candidate.id.replace(/\D/g, '') === cleanId.
  - Tracking Match: candidate.trackingCode.toUpperCase().includes(cleanId) or candidate.domesticTrackingCode.toUpperCase().includes(cleanId).
                                  │
                                  ▼
[Logic Step 4: Multi-Order Handling Strategy]
When searching by Phone Number, a customer may have placed multiple orders:
  - Sort candidate matches: Active/in-progress orders first (`status !== 'completed' && status !== 'cancelled'`), then by `createdAt` descending.
  - Display UI: If multiple orders found (`matches.length > 1`), display the most recent active order by default, with order selector chips/tabs (e.g. "Đơn 1: ORD-827192 [Đang bay ✈️]", "Đơn 2: ORD-718293 [Đã giao ✓]") allowing instant 1-click toggling.
                                  │
                                  ▼
[Logic Step 5: Visual 8-Step Timeline & Status Card Generation]
Using `getOrderStepIndex(order)`:
  - For each of the 8 steps:
      idx < currentStepIdx  => Completed (Purple background, Checkmark icon)
      idx === currentStepIdx => Current Active (Solid Purple badge, pulsing highlight)
      idx > currentStepIdx  => Pending Future (Muted gray)
  - Display Proof Hub buttons (POV video, Store bill, Packing video, Weight, AWB) if present.
  - Render Product Summary with thumbnail, options, quantity, and total VNĐ.
```

---

## 3. Caveats & Edge Cases

1. **Phone Number Storage Variations in Legacy Data**:
   - In `initialMockOrders` and manual admin creations, phone numbers might be saved as `"0912345678"`, `"0912 345 678"`, or with spaces.
   - *Requirement*: Always normalize candidate orders' `customerPhone` at comparison time using `(order.customerPhone || '').replace(/\D/g, '')`.
2. **Order ID Format Variations**:
   - Customers may enter just the 6-digit number `"827192"` instead of `"ORD-827192"`.
   - *Requirement*: Support prefix-tolerant lookup: `cleanQuery = query.replace(/^ORD-?/i, '')`.
3. **Cart vs Legacy Single-Product Structure**:
   - Newer orders have `order.items` (array). Older orders have `order.productName`, `order.productImage`, `order.foreignPrice`.
   - *Requirement*: Order summary card must check `order.items && order.items.length > 0` and fall back to single-product fields cleanly.
4. **Cancelled Orders Handling**:
   - If `order.status === 'cancelled'`, `stepIndex` is `-1`.
   - *Requirement*: Show special cancelled banner with `cancelReason` (e.g. `"Hết hạn thanh toán cọc 15 phút"`) instead of normal timeline progression.
5. **No Results / Invalid Search Handling**:
   - If no order matches the query, display a friendly alert with clear instructions and a contact button to TAVY Korea Zalo/Messenger support.

---

## 4. Conclusion & Technical Recommendations

### Proposed Architecture for R1, R2, and R3:

1. **Guest Order Tracking Bar Component (`src/components/GuestOrderTrackingBar.jsx`)**:
   - Prominent container placed at the top of `#products` section or inside `HeroSection.jsx` on `KROrderHomePage.jsx`.
   - Search input supporting Phone Number or Order ID with clear button, submit button, and helper suggestion tags (e.g. `"VD: 0912345678 hoặc ORD-827192"`).
   - Real-time normalization engine.

2. **Visual 8-Step Timeline & Order Status Card Component (`src/components/GuestOrderTimelineCard.jsx`)**:
   - Header with Order ID, customer name masked/full, order date, status badge.
   - Multi-order switcher tabs if more than 1 order found for the phone number.
   - 8-step visual progress bar matching `OrdersPage.jsx` styling with responsive mobile grid.
   - Proof Hub section (Video POV, Bill Store, Packing Video, Weight, Air AWB, Domestic Tracking with 1-click copy).
   - Order product item breakdown and total VNĐ.
   - Collapse / close action to return to browsing catalog.

3. **Helper Normalization Utility (`src/utils/orderLookupUtils.js`)**:
   ```javascript
   export const normalizePhone = (phone) => {
     if (!phone) return '';
     let digits = String(phone).replace(/\D/g, '');
     if (digits.startsWith('84') && digits.length >= 11) {
       digits = '0' + digits.slice(2);
     }
     return digits;
   };

   export const searchOrders = (orders, rawQuery) => {
     if (!orders || !Array.isArray(orders) || !rawQuery) return [];
     const query = String(rawQuery).trim();
     if (!query) return [];

     const queryDigits = normalizePhone(query);
     const queryUpper = query.toUpperCase();
     const queryNoPrefix = queryUpper.replace(/^ORD-?/i, '');

     const matches = orders.filter((o) => {
       const oPhone = normalizePhone(o.customerPhone);
       const oId = (o.id || '').toUpperCase();
       const oIdDigits = oId.replace(/\D/g, '');
       const oAir = (o.trackingCode || '').toUpperCase();
       const oDomestic = (o.domesticTrackingCode || '').toUpperCase();

       const matchPhone = queryDigits.length >= 4 && oPhone.includes(queryDigits);
       const matchId = oId.includes(queryUpper) || (queryNoPrefix.length >= 4 && oId.includes(queryNoPrefix)) || (queryDigits.length >= 4 && oIdDigits.includes(queryDigits));
       const matchTracking = (queryUpper.length >= 4 && (oAir.includes(queryUpper) || oDomestic.includes(queryUpper)));

       return matchPhone || matchId || matchTracking;
     });

     // Sort: Active orders first, then newest createdAt
     return matches.sort((a, b) => {
       const aActive = a.status !== 'completed' && a.status !== 'cancelled';
       const bActive = b.status !== 'completed' && b.status !== 'cancelled';
       if (aActive && !bActive) return -1;
       if (!aActive && bActive) return 1;
       return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
     });
   };
   ```

---

## 5. Verification Method

To independently verify the data layer contracts and exploration results:

1. **Verify Test Suite**:
   ```bash
   node tests/run_all_tests.js
   ```
   *Expected*: All 188 test cases pass with exit code 0.

2. **Verify Production Build**:
   ```bash
   npm run build
   ```
   *Expected*: Vite builds bundle into `dist/` with 0 errors.

3. **Verify Data Flow Contract**:
   - Inspect `src/data/orderStatuses.js` lines 6–165 to confirm all 8 status keys and tokens.
   - Inspect `src/context/AppProvider.jsx` lines 248–257 to confirm `subscribeToOrders` realtime Firestore sync.
