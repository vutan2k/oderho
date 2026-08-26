# Handoff Report — Challenger 3 (Re-verification Adversarial Challenger)

**Verdict**: ❌ **REQUEST_CHANGES**

---

## 1. Observation

### Observation 1: Phone Overmatching Fix Verified (Positive Confirmation)
- **Target File**: `/Users/tan/Downloads/tavy/src/services/guestTrackingService.js` (lines 87–104)
- **Observation**: When searching with an alphanumeric query (e.g. `'ALPHA-1234'`), the customer phone matching block is guarded by `if (!isQueryAlphabetical)`.
- **Command & Output**:
```bash
node -e "
import('./src/services/guestTrackingService.js').then(m => {
  const orders = [
    { id: 'ORD-ALPHA-1234', customerPhone: '0905111222' },
    { id: 'ORD-9999', customerPhone: '0912345678' }
  ];
  const res = m.findGuestOrders('ALPHA-1234', orders);
  console.log('Results:', res.map(o => o.id));
});"
```
Output:
```text
Results: [ 'ORD-ALPHA-1234' ]
```
Bob's order with phone `0912345678` is no longer matched via phone digits.

---

### Observation 2: Deterministic Date Sorting Fix Verified (Positive Confirmation)
- **Target File**: `/Users/tan/Downloads/tavy/src/services/guestTrackingService.js` (lines 128–132)
- **Observation**: Sorting comparator uses `a.createdAt && !isNaN(new Date(a.createdAt).getTime()) ? new Date(a.createdAt).getTime() : 0`. Invalid strings (`'invalid-date'`), `null`, `undefined`, and `{}` produce `0` (never `NaN`), ensuring valid recent orders sort to the top and corrupted orders sort deterministically to the end.
- **Monte Carlo Shuffle Test (200 random permutations)**: Passed 100% without sorting inversions or exceptions.

---

### Observation 3: CRITICAL REPRODUCIBLE DEFECT — Cross-Order ID Digit Collision Leakage
- **Target File**: `/Users/tan/Downloads/tavy/src/services/guestTrackingService.js` (lines 77–82)
- **Code in Question**:
```javascript
    const isIdDigitsMatch = queryDigits.length >= 4 && (
      orderIdDigits === queryDigits ||
      orderIdDigits.includes(queryDigits)
    );

    const matchId = isIdExact || isIdSub || isIdNoPrefixMatch || isIdDigitsMatch;
    if (matchId) return true;
```
- **Vulnerability**: While phone matching was guarded with `!isQueryAlphabetical`, `isIdDigitsMatch` in Section 1 (Order ID Matching) was left **completely unguarded**.
- When a user searches for an alphanumeric Order ID containing 4 or more digits (e.g. `ALPHA-1234`, `ORD-ALPHA-1234`, `ORD-TEST-9999`, `VIP-2026-0001`, or `ALPHA-00050`), `queryDigits` extracts the numeric subsequence (`'1234'`, `'9999'`, `'0001'`, `'00050'`).
- `orderIdDigits.includes(queryDigits)` then evaluates to `true` for **all other orders in the database** sharing those digits in their IDs, leaking unrelated customer orders, names, status, tracking details, and proof media!
- **Empirical Reproduction Script & Result**:
```bash
node -e "
import('./src/services/guestTrackingService.js').then(m => {
  const orders = [
    { id: 'ORD-ALPHA-1234', customerName: 'Alice Nguyen (Target)' },
    { id: 'ORD-2026-1234', customerName: 'Bob Tran (Unrelated Customer 1)' },
    { id: 'ORD-BETA-1234', customerName: 'Charlie Le (Unrelated Customer 2)' }
  ];
  const res = m.findGuestOrders('ALPHA-1234', orders);
  console.log('Query: ALPHA-1234');
  console.log('Matched Order IDs:', res.map(o => o.id));
  console.log('Matched Customer Names:', res.map(o => o.customerName));
});"
```
Output:
```text
Query: ALPHA-1234
Matched Order IDs: [ 'ORD-ALPHA-1234', 'ORD-2026-1234', 'ORD-BETA-1234' ]
Matched Customer Names: [ 'Alice Nguyen (Target)', 'Bob Tran (Unrelated Customer 1)', 'Charlie Le (Unrelated Customer 2)' ]
```
```bash
node -e "
import('./src/services/guestTrackingService.js').then(m => {
  const orders = [
    { id: 'ORD-TEST-9999', customerName: 'Test Order' },
    { id: 'ORD-2026-9999', customerName: 'Production Order Bob' },
    { id: 'ORD-VIP-9999', customerName: 'VIP Order Charlie' }
  ];
  const res = m.findGuestOrders('ORD-TEST-9999', orders);
  console.log('Query: ORD-TEST-9999');
  console.log('Matched Order IDs:', res.map(o => o.id));
});"
```
Output:
```text
Query: ORD-TEST-9999
Matched Order IDs: [ 'ORD-TEST-9999', 'ORD-2026-9999', 'ORD-VIP-9999' ]
```

---

## 2. Logic Chain

1. **Step 1 (Root Cause Analysis)**:
   - In `findGuestOrders`, `queryDigits` extracts all digits from the raw query string (e.g. `'ALPHA-1234'` -> `'1234'`).
   - Line 77 evaluates `isIdDigitsMatch = queryDigits.length >= 4 && (orderIdDigits === queryDigits || orderIdDigits.includes(queryDigits))`.
   - Because `isIdDigitsMatch` has no guard checking whether the query contains letters or non-`ORD-` prefixes, it treats any alphanumeric query with 4+ digits as a wildcard numeric substring query against every order's ID.

2. **Step 2 (Security & Privacy Impact)**:
   - In production, when customer Alice queries her specific order `ALPHA-1234`, any other order in the system ending in or containing `1234` (such as `ORD-2026-1234`, `ORD-BETA-1234`, `ORD-123456`) is returned in `findGuestOrders`.
   - The UI displays multi-order tabs for all matched orders, exposing other customers' full names, package tracking codes, POV fulfillment videos, and purchase details to guest users without authentication.

3. **Step 3 (Remediation Design)**:
   - Alphanumeric Order ID search must match on string identity (`isIdExact`), substring match (`isIdSub`), or prefix-stripped ID match (`isIdNoPrefixMatch`).
   - `isIdDigitsMatch` must ONLY be activated when the user searches with a numeric-only query (`!isQueryAlphabetical` or `queryLower.startsWith('ord-')` where the remaining portion is numeric), OR must require exact digit match (`orderIdDigits === queryDigits`) instead of substring `includes`.

---

## 3. Caveats
- Genuine phone number searches (`0912345678`, `+84 912 345 678`, `0912-345-678`) and date sorting function correctly.
- Production build (`npm run build`) and baseline tests pass, but this specific alphanumeric cross-order ID collision is a critical privacy regression not caught by unit tests that only had single distinct order IDs.

---

## 4. Conclusion & Required Changes

**Verdict**: ❌ **REQUEST_CHANGES**

### Required Action for Worker:
In `src/services/guestTrackingService.js`:
Update `isIdDigitsMatch` (lines 77–80) so that digit-only substring matching against `orderIdDigits` is **only** performed when the query is numeric/prefix-free (`!isQueryAlphabetical`) or matches exact order ID digits:
```javascript
// Before:
const isIdDigitsMatch = queryDigits.length >= 4 && (
  orderIdDigits === queryDigits ||
  orderIdDigits.includes(queryDigits)
);

// Recommended Fix:
const isIdDigitsMatch = !isQueryAlphabetical && queryDigits.length >= 4 && (
  orderIdDigits === queryDigits ||
  orderIdDigits.includes(queryDigits)
);
```
Add regression tests covering multiple orders with identical numeric suffixes (e.g. `ORD-ALPHA-1234`, `ORD-BETA-1234`, `ORD-2026-1234`) to guarantee complete customer order isolation.

---

## 5. Verification Method

Run the following command to verify the bug and confirm fix:
```bash
node -e "
import('./src/services/guestTrackingService.js').then(m => {
  const orders = [
    { id: 'ORD-ALPHA-1234', customerName: 'Alice' },
    { id: 'ORD-2026-1234', customerName: 'Bob' },
    { id: 'ORD-BETA-1234', customerName: 'Charlie' }
  ];
  const res = m.findGuestOrders('ALPHA-1234', orders);
  console.log('Results:', res.map(o => o.id));
  if (res.length === 1 && res[0].id === 'ORD-ALPHA-1234') {
    console.log('PASS: Isolated cleanly');
  } else {
    console.log('FAIL: Leaked unrelated orders:', res.map(o => o.id));
  }
});"
```
