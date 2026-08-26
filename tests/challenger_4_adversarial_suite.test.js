/**
 * Challenger 4 Final Adversarial Verification Test Suite
 * Comprehensive Empirical Stress-Testing & Boundary Fuzzing
 *
 * Covers:
 * 1. ALPHA-1234 isolation vs ORD-2026-1234 / ORD-BETA-1234
 * 2. ORD-TEST-9999 isolation vs ORD-2026-9999 / ORD-VIP-9999
 * 3. Exact numeric query 100001 matching ORD-100001 / 100001 and excluding ORD-2026-100001
 * 4. Vietnamese phone matching variations (+84, 84, spaces, dots, dashes, parentheses, missing leading 0)
 * 5. Cross-leakage matrix across alphanumeric, numeric, tracking, and phone lookups
 * 6. Adversarial injection payloads (SQLi, XSS, RegExp metas, null bytes, unicode, emoji)
 * 7. Boundary corrupted data sets, null prototype objects, empty queries, invalid dates
 * 8. calculateStepProgress and getProofBadges robustness under adversarial inputs
 * 9. High-volume Monte Carlo fuzzing & scalability stress (10,000+ orders)
 */

import { assert, assertEquals, assertDeepEquals, assertGreaterThan } from './framework/assert.js';
import {
  normalizePhone,
  findGuestOrders,
  calculateStepProgress,
  getProofBadges
} from '../src/services/guestTrackingService.js';
import { ORDER_STATUSES, ORDER_STEPS, getStatusConfig, getOrderStepIndex } from '../src/data/orderStatuses.js';

console.log('================================================================================');
console.log('  CHALLENGER 4 — FINAL ADVERSARIAL VERIFICATION TEST SUITE');
console.log('================================================================================');

let passedCount = 0;
let failedCount = 0;
const results = [];

function runVerificationTest(name, fn) {
  const t0 = performance.now();
  try {
    fn();
    const duration = performance.now() - t0;
    console.log(`[PASS] ${name} (${duration.toFixed(2)}ms)`);
    results.push({ name, status: 'PASS', duration });
    passedCount++;
  } catch (err) {
    const duration = performance.now() - t0;
    console.error(`[FAIL] ${name} (${duration.toFixed(2)}ms): ${err.message}`);
    results.push({ name, status: 'FAIL', duration, error: err.message, stack: err.stack });
    failedCount++;
  }
}

// -----------------------------------------------------------------------------
// 1. MANDATORY VERIFICATION: ALPHA-1234 ISOLATION
// -----------------------------------------------------------------------------
runVerificationTest('1.1 ALPHA-1234 strictly matches ORD-ALPHA-1234 and NEVER leaks ORD-2026-1234 or ORD-BETA-1234', () => {
  const orders = [
    { id: 'ORD-ALPHA-1234', customerName: 'Alice Alpha', customerPhone: '0901000001', createdAt: '2026-08-26T10:00:00Z' },
    { id: 'ORD-2026-1234', customerName: 'Bob 2026', customerPhone: '0912345678', createdAt: '2026-08-26T09:00:00Z' },
    { id: 'ORD-BETA-1234', customerName: 'Charlie Beta', customerPhone: '0988776655', createdAt: '2026-08-26T08:00:00Z' },
    { id: 'ORD-GAMMA-1234', customerName: 'David Gamma', customerPhone: '0933112233', createdAt: '2026-08-26T07:00:00Z' }
  ];

  const queries = [
    'ALPHA-1234',
    'alpha-1234',
    'ORD-ALPHA-1234',
    'ord-alpha-1234',
    '  ALPHA-1234  ',
    '#ALPHA-1234'
  ];

  for (const q of queries) {
    const matched = findGuestOrders(q, orders);
    assertEquals(matched.length, 1, `Query '${q}' must match exactly 1 order`);
    assertEquals(matched[0].id, 'ORD-ALPHA-1234', `Query '${q}' must match 'ORD-ALPHA-1234'`);
    assertEquals(matched.some(o => o.id === 'ORD-2026-1234'), false, `Query '${q}' leaked ORD-2026-1234`);
    assertEquals(matched.some(o => o.id === 'ORD-BETA-1234'), false, `Query '${q}' leaked ORD-BETA-1234`);
    assertEquals(matched.some(o => o.id === 'ORD-GAMMA-1234'), false, `Query '${q}' leaked ORD-GAMMA-1234`);
  }
});

// -----------------------------------------------------------------------------
// 2. MANDATORY VERIFICATION: ORD-TEST-9999 ISOLATION
// -----------------------------------------------------------------------------
runVerificationTest('2.1 ORD-TEST-9999 strictly matches ORD-TEST-9999 and NEVER leaks ORD-2026-9999 or ORD-VIP-9999', () => {
  const orders = [
    { id: 'ORD-TEST-9999', customerName: 'Tester User', customerPhone: '0909999999', createdAt: '2026-08-26T10:00:00Z' },
    { id: 'ORD-2026-9999', customerName: 'Prod User 2026', customerPhone: '0912349999', createdAt: '2026-08-26T09:00:00Z' },
    { id: 'ORD-VIP-9999', customerName: 'VIP Customer', customerPhone: '0933999999', createdAt: '2026-08-26T08:00:00Z' },
    { id: 'ORD-DEMO-9999', customerName: 'Demo Customer', customerPhone: '0944999999', createdAt: '2026-08-26T07:00:00Z' }
  ];

  const queries = [
    'ORD-TEST-9999',
    'ord-test-9999',
    'TEST-9999',
    'test-9999',
    '  ORD-TEST-9999  ',
    '#TEST-9999'
  ];

  for (const q of queries) {
    const matched = findGuestOrders(q, orders);
    assertEquals(matched.length, 1, `Query '${q}' must match exactly 1 order`);
    assertEquals(matched[0].id, 'ORD-TEST-9999', `Query '${q}' must match 'ORD-TEST-9999'`);
    assertEquals(matched.some(o => o.id === 'ORD-2026-9999'), false, `Query '${q}' leaked ORD-2026-9999`);
    assertEquals(matched.some(o => o.id === 'ORD-VIP-9999'), false, `Query '${q}' leaked ORD-VIP-9999`);
    assertEquals(matched.some(o => o.id === 'ORD-DEMO-9999'), false, `Query '${q}' leaked ORD-DEMO-9999`);
  }
});

// -----------------------------------------------------------------------------
// 3. MANDATORY VERIFICATION: NUMERIC QUERY 100001 EXACT MATCH
// -----------------------------------------------------------------------------
runVerificationTest('3.1 Numeric query 100001 matches ORD-100001 and 100001, but NOT ORD-2026-100001 or ORD-1000019', () => {
  const orders = [
    { id: 'ORD-100001', customerName: 'User Exact ORD', customerPhone: '0901111111', createdAt: '2026-08-26T10:00:00Z' },
    { id: '100001', customerName: 'User Exact Bare', customerPhone: '0902222222', createdAt: '2026-08-26T09:00:00Z' },
    { id: 'ORD-2026-100001', customerName: 'User Year Substring', customerPhone: '0903333333', createdAt: '2026-08-26T08:00:00Z' },
    { id: 'ORD-1000019', customerName: 'User Suffix Substring', customerPhone: '0904444444', createdAt: '2026-08-26T07:00:00Z' },
    { id: 'ORD-9100001', customerName: 'User Prefix Substring', customerPhone: '0905555555', createdAt: '2026-08-26T06:00:00Z' }
  ];

  const queries = ['100001', 'ORD-100001', 'ord-100001', '#100001', '  100001  '];

  for (const q of queries) {
    const matched = findGuestOrders(q, orders);
    const ids = matched.map(o => o.id);
    if (q === '100001' || q === '#100001' || q === '  100001  ') {
      assertEquals(matched.length, 2, `Query '${q}' should match both ORD-100001 and 100001`);
      assertEquals(ids.includes('ORD-100001'), true, `Query '${q}' must contain ORD-100001`);
      assertEquals(ids.includes('100001'), true, `Query '${q}' must contain 100001`);
    } else {
      // 'ORD-100001' or 'ord-100001'
      assertEquals(matched.length >= 1, true, `Query '${q}' should match at least ORD-100001`);
      assertEquals(ids.includes('ORD-100001'), true, `Query '${q}' must contain ORD-100001`);
    }
    assertEquals(ids.includes('ORD-2026-100001'), false, `Query '${q}' leaked ORD-2026-100001`);
    assertEquals(ids.includes('ORD-1000019'), false, `Query '${q}' leaked ORD-1000019`);
    assertEquals(ids.includes('ORD-9100001'), false, `Query '${q}' leaked ORD-9100001`);
  }
});

// -----------------------------------------------------------------------------
// 4. MANDATORY VERIFICATION: PHONE NUMBER FORMATS & MATCHING
// -----------------------------------------------------------------------------
runVerificationTest('4.1 Phone normalization handles all standard Vietnamese format variations', () => {
  const phoneVariations = [
    { input: '0912345678', expected: '0912345678' },
    { input: '+84912345678', expected: '0912345678' },
    { input: '84912345678', expected: '0912345678' },
    { input: '0912 345 678', expected: '0912345678' },
    { input: '0912-345-678', expected: '0912345678' },
    { input: '0912.345.678', expected: '0912345678' },
    { input: '(0912) 345-678', expected: '0912345678' },
    { input: '+84 (0) 912 345 678', expected: '0912345678' },
    { input: '912345678', expected: '0912345678' },
    { input: '  0912345678  \n', expected: '0912345678' }
  ];

  for (const item of phoneVariations) {
    const normalized = normalizePhone(item.input);
    assertEquals(normalized, item.expected, `normalizePhone('${item.input}') should produce '${item.expected}', got '${normalized}'`);
  }
});

runVerificationTest('4.2 Phone queries find orders regardless of stored phone format vs search input format', () => {
  const orders = [
    { id: 'ORD-PHONE-01', customerName: 'Customer A', customerPhone: '0912345678', createdAt: '2026-08-26T10:00:00Z' },
    { id: 'ORD-PHONE-02', customerName: 'Customer A Older', customerPhone: '+84 912 345 678', createdAt: '2026-08-26T09:00:00Z' },
    { id: 'ORD-OTHER-01', customerName: 'Customer B', customerPhone: '0988776655', createdAt: '2026-08-26T08:00:00Z' }
  ];

  const searchQueries = [
    '0912345678',
    '+84912345678',
    '0912 345 678',
    '0912-345-678',
    '(0912) 345-678',
    '84912345678'
  ];

  for (const q of searchQueries) {
    const matched = findGuestOrders(q, orders);
    assertEquals(matched.length, 2, `Query '${q}' should find both orders for customer A`);
    assertEquals(matched[0].id, 'ORD-PHONE-01', 'Newer order must be sorted first');
    assertEquals(matched[1].id, 'ORD-PHONE-02', 'Older order must be sorted second');
    assertEquals(matched.some(o => o.id === 'ORD-OTHER-01'), false, `Query '${q}' must NOT leak Customer B`);
  }
});

// -----------------------------------------------------------------------------
// 5. CROSS-LEAKAGE & MULTI-ATTRIBUTE ADVERSARIAL MATRIX
// -----------------------------------------------------------------------------
runVerificationTest('5.1 Comprehensive Cross-Attribute Non-Leakage Matrix', () => {
  const testDb = [
    {
      id: 'ORD-ALPHA-1234',
      customerName: 'Alice',
      customerPhone: '0901111222',
      trackingCode: 'AWB-AIR-7777',
      domesticTrackingCode: 'VNPOST-8888',
      flightCode: 'VN415',
      createdAt: '2026-08-26T10:00:00Z'
    },
    {
      id: 'ORD-BETA-5678',
      customerName: 'Bob',
      customerPhone: '0912345678', // Contains '1234' and '5678'
      trackingCode: 'AWB-AIR-1234', // Overlapping tracking code digits
      domesticTrackingCode: 'VTP-9999',
      flightCode: 'KE401',
      createdAt: '2026-08-26T09:00:00Z'
    },
    {
      id: 'ORD-1234-EXTRA',
      customerName: 'Charlie',
      customerPhone: '0988776655',
      trackingCode: 'AWB-AIR-3333',
      domesticTrackingCode: 'GHN-12345',
      flightCode: 'VJ981',
      createdAt: '2026-08-26T08:00:00Z'
    },
    {
      id: 'ORD-2026-1234',
      customerName: 'David',
      customerPhone: '0933445566',
      trackingCode: 'AWB-AIR-9999',
      domesticTrackingCode: 'JNT-7777',
      flightCode: 'OZ731',
      createdAt: '2026-08-26T07:00:00Z'
    }
  ];

  // Test 1: Searching 'ALPHA-1234' matches ONLY Alice
  const res1 = findGuestOrders('ALPHA-1234', testDb);
  assertEquals(res1.length, 1);
  assertEquals(res1[0].id, 'ORD-ALPHA-1234');

  // Test 2: Searching 'BETA-5678' matches ONLY Bob
  const res2 = findGuestOrders('BETA-5678', testDb);
  assertEquals(res2.length, 1);
  assertEquals(res2[0].id, 'ORD-BETA-5678');

  // Test 3: Searching tracking code 'AWB-AIR-7777' matches ONLY Alice
  const res3 = findGuestOrders('AWB-AIR-7777', testDb);
  assertEquals(res3.length, 1);
  assertEquals(res3[0].id, 'ORD-ALPHA-1234');

  // Test 4: Searching flight code 'VN415' matches ONLY Alice
  const res4 = findGuestOrders('VN415', testDb);
  assertEquals(res4.length, 1);
  assertEquals(res4[0].id, 'ORD-ALPHA-1234');

  // Test 5: Searching flight code 'KE401' matches ONLY Bob
  const res5 = findGuestOrders('KE401', testDb);
  assertEquals(res5.length, 1);
  assertEquals(res5[0].id, 'ORD-BETA-5678');

  // Test 6: Searching domestic tracking code 'VTP-9999' matches ONLY Bob
  const res6 = findGuestOrders('VTP-9999', testDb);
  assertEquals(res6.length, 1);
  assertEquals(res6[0].id, 'ORD-BETA-5678');
});

// -----------------------------------------------------------------------------
// 6. ADVERSARIAL INJECTIONS & MALICIOUS INPUT RESILIENCE
// -----------------------------------------------------------------------------
runVerificationTest('6.1 Malicious Injection Payloads & Edge Cases do NOT crash service', () => {
  const dummyDb = [
    { id: 'ORD-VALID-01', customerPhone: '0901234567', createdAt: '2026-08-26T10:00:00Z' }
  ];

  const maliciousQueries = [
    "'; DROP TABLE orders; --",
    "' OR '1'='1",
    "<script>alert('xss')</script>",
    '"><img src=x onerror=alert(1)>',
    '\\d+.*[a-z]',
    'ORD-[0-9]+',
    '(((?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+))',
    '\x00\x01\x02\x03',
    '   \r\n\t   ',
    '𝓞𝓡𝓓-1234',
    'ORD-🚀-2026',
    'null',
    'undefined',
    '[object Object]',
    'NaN',
    'Infinity',
    '-Infinity'
  ];

  for (const malicious of maliciousQueries) {
    let res;
    try {
      res = findGuestOrders(malicious, dummyDb);
    } catch (err) {
      throw new Error(`Query '${malicious}' crashed with error: ${err.message}`);
    }
    assertEquals(Array.isArray(res), true, `Query '${malicious}' must return an array`);
  }
});

// -----------------------------------------------------------------------------
// 7. CORRUPTED DATASETS & PROTOCOL RESILIENCE
// -----------------------------------------------------------------------------
runVerificationTest('7.1 Corrupted ordersList with nulls, primitives, and missing attributes', () => {
  const corruptedList = [
    null,
    undefined,
    0,
    123,
    'string_order',
    {},
    { id: null, customerPhone: null },
    { _id: 'ORD-MONGO-ID', customerPhone: '0908888888', createdAt: '2026-08-26T12:00:00Z' },
    Object.create(null),
    { id: 'ORD-NORMAL', customerPhone: '0908888888', createdAt: 'invalid-timestamp' }
  ];

  const res = findGuestOrders('0908888888', corruptedList);
  assertEquals(res.length, 2, 'Should match 2 valid objects with phone 0908888888');
  assertEquals(res[0]._id, 'ORD-MONGO-ID', 'Valid date order must be sorted before invalid timestamp');
  assertEquals(res[1].id, 'ORD-NORMAL');
});

// -----------------------------------------------------------------------------
// 8. PROGRESS CALCULATION & PROOF BADGES INVARIANT TESTS
// -----------------------------------------------------------------------------
runVerificationTest('8.1 Step Progress Calculation Invariant Coverage', () => {
  // 1. Null / undefined order -> default pending
  const pNull = calculateStepProgress(null);
  assertEquals(pNull.stepIndex, 0);
  assertEquals(pNull.isCancelled, false);
  assertEquals(pNull.progressPercent, '12.5%');

  // 2. Cancelled order
  const pCancelled = calculateStepProgress({ status: 'cancelled' });
  assertEquals(pCancelled.stepIndex, -1);
  assertEquals(pCancelled.isCancelled, true);
  assertEquals(pCancelled.progressPercentage, 0);

  // 3. Completed order (step 7 / 8)
  const pCompleted = calculateStepProgress({ status: 'completed' });
  assertEquals(pCompleted.stepIndex, 7);
  assertEquals(pCompleted.isCompleted, true);
  assertEquals(pCompleted.progressPercentage, 100);

  // 4. All 8 valid canonical lifecycle steps defined in ORDER_STEPS
  const canonicalStatuses = [
    'pending',
    'deposit_paid',
    'confirmed',
    'purchased',
    'packed_kr',
    'in_transit_air',
    'customs_cleared',
    'completed'
  ];

  canonicalStatuses.forEach((st, idx) => {
    const prog = calculateStepProgress({ status: st });
    assertEquals(prog.stepIndex, idx, `Status '${st}' should be at step index ${idx}`);
    assertEquals(prog.progressPercentage, ((idx + 1) / 8) * 100);
    assertEquals(prog.isCancelled, false);
  });
});

runVerificationTest('8.2 Proof Badges Extraction with all proof types', () => {
  const fullProofOrder = {
    id: 'ORD-PROOF-FULL',
    povVideoUrl: 'https://example.com/pov.mp4',
    receiptImageUrl: 'https://example.com/receipt.jpg',
    packingVideoUrl: 'https://example.com/packing.mp4',
    packageWeightKg: 1.85,
    flightCode: 'VN415',
    trackingCode: 'AWB-888999',
    domesticCarrier: 'ViettelPost',
    domesticTrackingCode: 'VTP-11223344'
  };

  const proof = getProofBadges(fullProofOrder);
  assertEquals(proof.hasProof, true);
  assertEquals(proof.badges.length, 7, 'Should have 7 badges');
  const badgeIds = proof.badges.map(b => b.id);
  assertEquals(badgeIds.includes('pov_video'), true);
  assertEquals(badgeIds.includes('receipt_bill'), true);
  assertEquals(badgeIds.includes('packing_video'), true);
  assertEquals(badgeIds.includes('package_weight'), true);
  assertEquals(badgeIds.includes('flight_code'), true);
  assertEquals(badgeIds.includes('air_awb'), true);
  assertEquals(badgeIds.includes('domestic_tracking'), true);

  // Empty order
  const emptyProof = getProofBadges({});
  assertEquals(emptyProof.hasProof, false);
  assertEquals(emptyProof.badges.length, 0);

  // Null order
  const nullProof = getProofBadges(null);
  assertEquals(nullProof.hasProof, false);
  assertEquals(nullProof.badges.length, 0);
});

// -----------------------------------------------------------------------------
// 9. HIGH-VOLUME SCALE & MONTE CARLO STRESS TEST (10,000 ORDERS)
// -----------------------------------------------------------------------------
runVerificationTest('9.1 Monte Carlo 10,000 Orders Stress Test & Exact Match Precision', () => {
  const scaleOrders = [];
  const count = 10000;

  for (let i = 0; i < count; i++) {
    const pad = String(i).padStart(6, '0');
    scaleOrders.push({
      id: `ORD-${pad}`,
      customerName: `Customer ${pad}`,
      customerPhone: `070${String(1000000 + i).slice(-7)}`,
      createdAt: new Date(Date.now() - i * 60000).toISOString()
    });
  }

  // Insert specific target orders
  scaleOrders.push({
    id: 'ORD-ALPHA-1234',
    customerName: 'Target Alpha',
    customerPhone: '0909090909',
    createdAt: new Date().toISOString()
  });

  scaleOrders.push({
    id: 'ORD-TEST-9999',
    customerName: 'Target Test',
    customerPhone: '0908080808',
    createdAt: new Date().toISOString()
  });

  scaleOrders.push({
    id: 'ORD-987654',
    customerName: 'Target Numeric Only',
    customerPhone: '0907070707',
    createdAt: new Date().toISOString()
  });

  const tStart = performance.now();

  // 1. Search 'ALPHA-1234' in 10,000+ orders -> must isolate cleanly
  const resAlpha = findGuestOrders('ALPHA-1234', scaleOrders);
  assertEquals(resAlpha.length, 1);
  assertEquals(resAlpha[0].id, 'ORD-ALPHA-1234');

  // 2. Search 'ORD-TEST-9999' in 10,000+ orders -> must isolate cleanly
  const resTest = findGuestOrders('ORD-TEST-9999', scaleOrders);
  assertEquals(resTest.length, 1);
  assertEquals(resTest[0].id, 'ORD-TEST-9999');

  // 3. Search exact numeric '987654' in 10,000+ orders -> must isolate cleanly
  const resNum = findGuestOrders('987654', scaleOrders);
  assertEquals(resNum.length, 1);
  assertEquals(resNum[0].id, 'ORD-987654');

  // 4. Search phone '0909090909' in 10,000+ orders -> must isolate cleanly
  const resPhone = findGuestOrders('0909090909', scaleOrders);
  assertEquals(resPhone.length, 1);
  assertEquals(resPhone[0].id, 'ORD-ALPHA-1234');

  const elapsed = performance.now() - tStart;
  console.log(`  Filtered 10,003 orders 4 times in ${elapsed.toFixed(2)}ms (< 200ms budget)`);
  assert(elapsed < 200, `Filtering took too long: ${elapsed}ms`);
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('================================================================================');
console.log(`SUMMARY: ${passedCount} Passed, ${failedCount} Failed out of ${passedCount + failedCount} Tests`);
console.log('================================================================================');

if (failedCount > 0) {
  process.exit(1);
}
