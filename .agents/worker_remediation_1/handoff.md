# Handoff Report — Worker 3 (Iteration 2 Remediation)

## 1. Observation

### Observation 1: Cross-Customer Order Leakage on Alphanumeric Order ID Search
- **Target File**: `src/services/guestTrackingService.js`
- **Initial Vulnerability**: In `findGuestOrders`, when a user searched for an alphanumeric Order ID such as `'ALPHA-1234'`, `queryDigits` extracted `'1234'`, and the phone matching clause evaluated `oRawPhone.includes(queryDigits)` against customer phone numbers. If customer Bob had phone `0912345678`, Bob's order was matched and returned alongside Alice's order `ORD-ALPHA-1234`.
- **Applied Fix**: Guarded the customer phone matching block with `if (!isQueryAlphabetical)` where `const isQueryAlphabetical = /[a-zA-Z]/.test(rawQuery)`. Alphanumeric queries (Order IDs, tracking numbers, flight codes) never evaluate raw digit phone matching.
- **Verification Execution & Result**:
```bash
node -e "
import('./src/services/guestTrackingService.js').then(m => {
  const ordersDb = [
    { id: 'ORD-ALPHA-1234', customerPhone: '0905111222' },
    { id: 'ORD-2026-9999', customerPhone: '0912345678' }
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
Matched Order IDs: [ 'ORD-ALPHA-1234' ]
Unrelated Customer Leaked: false
```

---

### Observation 2: NaN Sort Invariant Corruption with Invalid `createdAt` Strings
- **Target File**: `src/services/guestTrackingService.js` (lines 124–128)
- **Initial Vulnerability**: `new Date(a.createdAt).getTime()` evaluates to `NaN` when `a.createdAt` is an unparseable string (e.g. `'invalid-date'`). The comparator returned `timeB - timeA` as `NaN`, corrupting sort order and placing corrupted records before valid recent orders.
- **Applied Fix**: Updated comparator with safe `isNaN` checks:
```javascript
return matches.sort((a, b) => {
  const timeA = a.createdAt && !isNaN(new Date(a.createdAt).getTime()) ? new Date(a.createdAt).getTime() : 0;
  const timeB = b.createdAt && !isNaN(new Date(b.createdAt).getTime()) ? new Date(b.createdAt).getTime() : 0;
  return timeB - timeA;
});
```
- **Verification Execution & Result**:
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
Result Order IDs: [ 'O_NEWEST', 'O_OLDER', 'O_CORRUPTED' ]
Is newest first? true
```

---

### Observation 3: Regression Tests Added to `tests/tier2/f06_order_tracking_boundary.test.js`
- Added `[F6-B16]` asserting that searching `ALPHA-1234` only matches `ORD-ALPHA-1234` and does NOT match order with phone `0912345678`.
- Added `[F6-B17]` asserting that searching with invalid `createdAt` strings (`invalid-date`, `null`, `undefined`) deterministically sorts valid newest orders first.

---

### Observation 4: Full Test Suite & Production Build Verification
- Command: `node tests/m4_guest_tracking_adversarial.test.js`
  - Output: `SUMMARY: 24 Passed, 0 Failed out of 24 Tests`
- Command: `node tests/run_all_tests.js`
  - Output: `Passed: 220, Failed: 0, Skipped: 0, Total Suites: 37`
- Command: `npm run build`
  - Output: `✓ built in 600ms (Exit Code 0, 0 errors)`

---

## 2. Logic Chain

1. **Step 1 (Fix 1: Phone Overmatching Elimination)**:
   - When a search query contains letters (`/[a-zA-Z]/.test(rawQuery)`), the user is searching by Order ID, Flight Code, Tracking Code, or Email — not a customer phone number.
   - Guarding the phone matching branch with `!isQueryAlphabetical` ensures digits inside alphanumeric tokens (`ALPHA-1234`) are never compared against `customerPhone`.
   - Genuine phone queries (`0912345678`, `+84 912 345 678`, `0912-345-678`) contain no alphabetical characters and continue to match customer phones accurately across all supported Vietnamese formats.

2. **Step 2 (Fix 2: Deterministic Date Sorting Invariant)**:
   - Checking `!isNaN(new Date(val).getTime())` guarantees that any missing, empty, or unparseable date is safely evaluated as timestamp `0`.
   - The comparator `timeB - timeA` produces a valid numeric difference (never `NaN`), ensuring strict mathematical ordering where valid dates sort in descending order (newest first) and invalid/corrupted records sort to the end.

3. **Step 3 (Test Suite & Regression Verification)**:
   - `f06_order_tracking_boundary.test.js` now explicitly exercises both corner cases (`[F6-B16]` and `[F6-B17]`).
   - The entire 37-suite test harness (220 tests total) passes 100% with 0 regressions.
   - Vite production build generates all assets cleanly with 0 errors.

---

## 3. Caveats
- Vietnamese phone numbers with non-standard letters (e.g. `TEL:0912345678`) are treated as text/ID queries; standard phone formatting (spaces, dots, hyphens, plus signs, brackets) is fully supported.
- `createdAt` timestamps with non-ISO custom string formats that `Date.parse()` cannot parse will be given timestamp `0` and sorted to the bottom of the list.

---

## 4. Conclusion
- Both vulnerabilities reported by Challenger 1 (Cross-Customer Order Leakage & NaN Sort Invariant Corruption) have been completely resolved in `src/services/guestTrackingService.js`.
- Regression tests `[F6-B16]` and `[F6-B17]` are in place in `tests/tier2/f06_order_tracking_boundary.test.js`.
- 100% automated test suite passing (220/220) and clean production build verified.

---

## 5. Verification Method

To independently verify:
```bash
# 1. Run full automated test suite (37 test suites, 220 tests)
node tests/run_all_tests.js

# 2. Run adversarial stress & fuzzing suite (24 tests)
node tests/m4_guest_tracking_adversarial.test.js

# 3. Run production build
npm run build
```
