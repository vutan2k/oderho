# Handoff Report — Challenger 1 (Adversarial Data & Fuzzing Challenger)

## 1. Observation

### Observation 1: Cross-Customer Order Leakage on Alphanumeric Order ID Search
- **Target File**: `src/services/guestTrackingService.js`
- **Lines**: 84–100 & Line 59
- **Code Extract**:
```javascript
// Line 59
const queryDigits = rawQuery.replace(/\D/g, '');

// Lines 84-100
// 2. Customer Phone Matching (normalized & raw digits)
const oPhone = normalizePhone(order.customerPhone || order.phone || '');
const oRawPhone = String(order.customerPhone || order.phone || '').replace(/\D/g, '');

const matchPhone = (
  (queryPhone.length >= 4 && oPhone.length >= 4 && (
    oPhone === queryPhone ||
    oPhone.includes(queryPhone) ||
    queryPhone.includes(oPhone)
  )) ||
  (queryDigits.length >= 4 && oRawPhone.length >= 4 && (
    oRawPhone === queryDigits ||
    oRawPhone.includes(queryDigits) ||
    queryDigits.includes(oRawPhone)
  ))
);
if (matchPhone) return true;
```
- **Empirical Execution & Verbatim Output**:
Command:
```bash
node -e "
import('./src/services/guestTrackingService.js').then(m => {
  const ordersDb = [
    { id: 'ORD-ALPHA-1234', customerPhone: '0905111222', customerName: 'Alice' },
    { id: 'ORD-2026-9999', customerPhone: '0912345678', customerName: 'Bob' }
  ];
  const results = m.findGuestOrders('ALPHA-1234', ordersDb);
  console.log('Search Query: ALPHA-1234');
  console.log('Matched Order IDs:', results.map(o => o.id));
  console.log('Unrelated Customer Leaked:', results.some(o => o.id === 'ORD-2026-9999'));
});"
```
Output:
```text
Search Query: ALPHA-1234
Matched Order IDs: [ 'ORD-ALPHA-1234', 'ORD-2026-9999' ]
Unrelated Customer Leaked: true
```

---

### Observation 2: Unstable / Corrupted Sorting Order with Invalid `createdAt` Strings
- **Target File**: `src/services/guestTrackingService.js`
- **Lines**: 124–128
- **Code Extract**:
```javascript
// Lines 124-128
return matches.sort((a, b) => {
  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return timeB - timeA;
});
```
- **Empirical Execution & Verbatim Output**:
Command:
```bash
node -e "
import('./src/services/guestTrackingService.js').then(m => {
  const mixedDates = [
    { id: 'O_CORRUPTED', customerPhone: '0900000000', createdAt: 'invalid-date' },
    { id: 'O_NEWEST', customerPhone: '0900000000', createdAt: '2026-08-26T12:00:00Z' },
    { id: 'O_OLDER', customerPhone: '0900000000', createdAt: '2026-08-20T00:00:00Z' }
  ];
  const sorted = m.findGuestOrders('0900000000', mixedDates);
  console.log('Result Order IDs:', sorted.map(o => o.id));
  console.log('Is newest first?', sorted[0].id === 'O_NEWEST');
});"
```
Output:
```text
Result Order IDs: [ 'O_CORRUPTED', 'O_NEWEST', 'O_OLDER' ]
Is newest first? false
```

---

### Observation 3: Baseline Test Suite & Performance Benchmark
- Command: `node tests/run_all_tests.js`
- Result: 218/218 passing (19,210.88ms).
- Command: `node tests/m4_guest_tracking_adversarial.test.js`
- Result: 24/24 passing (includes 10,000 order scale test in 58.50ms and 50,000 phone normalizations in 26.94ms).

---

## 2. Logic Chain

1. **Step 1 (Cross-Customer Leakage)**:
   - Observation 1 demonstrates that when a user searches for an alphanumeric Order ID like `'ALPHA-1234'`, `queryDigits` extracts `'1234'` (length 4).
   - The phone matching clause evaluates `oRawPhone.includes(queryDigits)`.
   - Any customer in the database whose phone number contains `'1234'` (e.g. `0912345678`) evaluates to `true`.
   - Consequently, searching for an Order ID containing 4 digits leaks unrelated customers' orders in the guest tracking interface, violating order isolation and privacy.

2. **Step 2 (Sort Comparator NaN Corruption)**:
   - Observation 2 demonstrates that `new Date('invalid-date').getTime()` evaluates to `NaN`.
   - In JavaScript, `a.createdAt ? new Date(a.createdAt).getTime() : 0` assigns `timeA = NaN` because `a.createdAt` is a non-empty truthy string.
   - The sort comparator returns `timeB - timeA` = `NaN`.
   - In ECMAScript array sorting, a comparator returning `NaN` leaves ordering undefined and fails to swap corrupted records to the bottom, causing corrupted records (`O_CORRUPTED`) to be placed before recent valid records (`O_NEWEST`).

---

## 3. Caveats
- Baseline test suite (`node tests/run_all_tests.js`) passes because existing test cases in `f06_order_tracking.test.js` use distinct non-overlapping digits in mock phone numbers (`0912 345 678` vs `0987654321`), which did not trigger the 4-digit substring collision.
- The service was tested against 100,000 character strings and 10,000 orders in memory and demonstrated no ReDoS or excessive memory consumption.

---

## 4. Conclusion & Actionable Mitigations

### Verdict: **REQUEST_CHANGES**

### Actionable Fixes Required:

#### Fix 1: Disallow raw phone substring matching when query contains letters or is not a phone lookup
In `src/services/guestTrackingService.js`:
- Only perform raw phone matching when the query is numeric/phone-formatted (e.g. `!/[a-zA-Z]/.test(rawQuery)`), OR when `queryPhone` matches `oPhone` directly:
```javascript
// 2. Customer Phone Matching (normalized & raw digits)
const oPhone = normalizePhone(order.customerPhone || order.phone || '');
const oRawPhone = String(order.customerPhone || order.phone || '').replace(/\D/g, '');
const isQueryAlphabetical = /[a-zA-Z]/.test(rawQuery);

const matchPhone = (
  (queryPhone.length >= 4 && oPhone.length >= 4 && (
    oPhone === queryPhone ||
    oPhone.includes(queryPhone) ||
    queryPhone.includes(oPhone)
  )) ||
  (!isQueryAlphabetical && queryDigits.length >= 4 && oRawPhone.length >= 4 && (
    oRawPhone === queryDigits ||
    oRawPhone.includes(queryDigits) ||
    queryDigits.includes(oRawPhone)
  ))
);
if (matchPhone) return true;
```

#### Fix 2: Safe Timestamp Extraction with `isNaN` guard in Sort Comparator
In `src/services/guestTrackingService.js` (lines 124-128):
```javascript
// Sort: Newest createdAt first (descending), invalid/missing dates last
return matches.sort((a, b) => {
  const parseTime = (val) => {
    if (!val) return 0;
    const t = new Date(val).getTime();
    return isNaN(t) ? 0 : t;
  };
  const timeA = parseTime(a.createdAt);
  const timeB = parseTime(b.createdAt);
  return timeB - timeA;
});
```

---

## 5. Verification Method

To independently verify these findings:

1. **Run Full Adversarial Harness**:
```bash
node tests/m4_guest_tracking_adversarial.test.js
```

2. **Run Empirical Reproduction Script for Vulnerability 1 (Overmatching Leak)**:
```bash
node -e "
import('./src/services/guestTrackingService.js').then(m => {
  const ordersDb = [
    { id: 'ORD-ALPHA-1234', customerPhone: '0905111222' },
    { id: 'ORD-2026-9999', customerPhone: '0912345678' }
  ];
  const results = m.findGuestOrders('ALPHA-1234', ordersDb);
  if (results.length > 1) {
    console.error('VULNERABILITY REPRODUCED: Matched ' + results.length + ' orders');
  } else {
    console.log('SECURE: Only target order matched');
  }
});"
```

3. **Run Empirical Reproduction Script for Vulnerability 2 (NaN Sort Corruption)**:
```bash
node -e "
import('./src/services/guestTrackingService.js').then(m => {
  const orders = [
    { id: 'CORRUPTED', customerPhone: '0900000000', createdAt: 'invalid-date' },
    { id: 'NEWEST', customerPhone: '0900000000', createdAt: '2026-08-26T12:00:00Z' }
  ];
  const sorted = m.findGuestOrders('0900000000', orders);
  if (sorted[0].id !== 'NEWEST') {
    console.error('VULNERABILITY REPRODUCED: Invalid date sorted before newest order');
  } else {
    console.log('SORT VALID: Newest order is first');
  }
});"
```
