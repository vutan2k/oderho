/**
 * Milestone M4 Adversarial Fuzzing & Stress Test Suite
 * Author: Empirical Challenger 1 (Adversarial Data & Fuzzing Challenger)
 * Target: src/services/guestTrackingService.js & src/data/orderStatuses.js
 */

import { assert, assertEquals, assertDeepEquals, assertGreaterThan, assertThrows } from './framework/assert.js';
import {
  normalizePhone,
  findGuestOrders,
  calculateStepProgress,
  getProofBadges
} from '../src/services/guestTrackingService.js';
import { ORDER_STATUSES, ORDER_STEPS, getStatusConfig, getOrderStepIndex } from '../src/data/orderStatuses.js';

console.log("================================================================================");
console.log("  M4 GUEST TRACKING SERVICE — ADVERSARIAL FUZZING & STRESS HARNESS");
console.log("================================================================================");

let totalPassed = 0;
let totalFailed = 0;
const testResults = [];

function runChallengerTest(name, fn) {
  const start = performance.now();
  try {
    fn();
    const duration = performance.now() - start;
    console.log(`[PASS] ${name} (${duration.toFixed(2)}ms)`);
    testResults.push({ name, status: 'PASS', duration });
    totalPassed++;
  } catch (err) {
    const duration = performance.now() - start;
    console.error(`[FAIL] ${name} (${duration.toFixed(2)}ms): ${err.message}`);
    testResults.push({ name, status: 'FAIL', duration, error: err.message, stack: err.stack });
    totalFailed++;
  }
}

// =============================================================================
// TEST SUITE 1: normalizePhone ADVERSARIAL FUZZING
// =============================================================================

runChallengerTest('[FUZZ-PHONE-01] Vietnamese Valid Numbers in Various Standard Formats', () => {
  const validInputs = [
    { input: '0912345678', expected: '0912345678' },
    { input: '0381234567', expected: '0381234567' },
    { input: '0701234567', expected: '0701234567' },
    { input: '0891234567', expected: '0891234567' },
    { input: '0521234567', expected: '0521234567' },
  ];

  for (const { input, expected } of validInputs) {
    assertEquals(normalizePhone(input), expected, `Standard phone ${input}`);
  }
});

runChallengerTest('[FUZZ-PHONE-02] International Formats (+84, 84, (0) prefixes, delimiters)', () => {
  const intlInputs = [
    { input: '+84 912 345 678', expected: '0912345678' },
    { input: '+84-912-345-678', expected: '0912345678' },
    { input: '+84(0)912345678', expected: '0912345678' },
    { input: '+84 (0912) 345 678', expected: '0912345678' },
    { input: '+840912345678', expected: '0912345678' },
    { input: '84912345678', expected: '0912345678' },
    { input: '840912345678', expected: '0912345678' },
    { input: '+84 98.765.4321', expected: '0987654321' },
    { input: '84-98-765-4321', expected: '0987654321' },
  ];

  for (const { input, expected } of intlInputs) {
    assertEquals(normalizePhone(input), expected, `Intl phone ${input}`);
  }
});

runChallengerTest('[FUZZ-PHONE-03] Missing Leading Zero Normalization (9 or 10 digits)', () => {
  // 9-digit input without leading 0
  assertEquals(normalizePhone('912345678'), '0912345678');
  assertEquals(normalizePhone('381234567'), '0381234567');
  assertEquals(normalizePhone(912345678), '0912345678');
  assertEquals(normalizePhone('987654321'), '0987654321');
});

runChallengerTest('[FUZZ-PHONE-04] Boundary Lengths & Invalid Types Fuzzing', () => {
  // Empty, null, undefined, boolean, object, array, function
  assertEquals(normalizePhone(''), '');
  assertEquals(normalizePhone('   \t\n  '), '');
  assertEquals(normalizePhone(null), '');
  assertEquals(normalizePhone(undefined), '');
  assertEquals(normalizePhone(NaN), '');
  assertEquals(normalizePhone(true), '');
  assertEquals(normalizePhone(false), '');
  assertEquals(normalizePhone({}), '');
  assertEquals(normalizePhone({ phone: '0912345678' }), '');
  assertEquals(normalizePhone([]), '');
  assertEquals(normalizePhone(['0912345678']), '0912345678');
  assertEquals(normalizePhone(() => {}), '');

  // Numbers as inputs
  assertEquals(normalizePhone(912345678), '0912345678');
  assertEquals(normalizePhone(84912345678), '0912345678');
});

runChallengerTest('[FUZZ-PHONE-05] Adversarial Payloads & Non-Digit Encodings', () => {
  // XSS tags with phone
  assertEquals(normalizePhone('<script>0912345678</script>'), '0912345678');
  assertEquals(normalizePhone('<img src=x onerror=alert("x")>0912345678'), '0912345678');
  // Pure text without digits
  assertEquals(normalizePhone('alert("hello")'), '');
  assertEquals(normalizePhone('SELECT * FROM users'), '');
  assertEquals(normalizePhone('!@#$%^&*()_+{}|:<>?~`-=[]\\;,./'), '');
  // Unicode control chars & emojis
  assertEquals(normalizePhone('📞 0912-345-678 📱'), '0912345678');
  assertEquals(normalizePhone('\u00000912345678\u001F'), '0912345678');
});

runChallengerTest('[FUZZ-PHONE-06] Extreme Length Stress & Non-Crashing Invariant', () => {
  const hugeInput = '84' + '9'.repeat(100000);
  const start = performance.now();
  const res = normalizePhone(hugeInput);
  const duration = performance.now() - start;
  assert(res.startsWith('09999'), 'Huge input handled without crashing');
  assert(duration < 100, `Huge input processed in ${duration.toFixed(2)}ms (must be <100ms)`);
});

// =============================================================================
// TEST SUITE 2: findGuestOrders ADVERSARIAL FUZZING
// =============================================================================

const mockOrders = [
  {
    id: 'ORD-20260826-001',
    customerPhone: '0912345678',
    status: 'in_transit_air',
    createdAt: '2026-08-26T08:00:00.000Z',
    trackingCode: 'VN-KR-88291',
    domesticTrackingCode: 'VTP-982173491',
    flightCode: 'VN415',
    userEmail: 'user1@example.com'
  },
  {
    id: 'ORD-20260826-002',
    customerPhone: '0912345678',
    status: 'completed',
    createdAt: '2026-08-26T09:30:00.000Z', // More recent than 001
    trackingCode: 'VN-KR-88292',
    domesticTrackingCode: 'VTP-982173492',
    flightCode: 'VN415',
    userEmail: 'user1@example.com'
  },
  {
    id: 'ORD-20260825-999',
    phone: '0987654321', // Uses phone instead of customerPhone
    status: 'pending',
    createdAt: '2026-08-25T14:00:00.000Z',
    trackingCode: 'VN-KR-77100',
    domesticTrackingCode: 'VTP-771000000',
    flightCode: 'KE681',
    userEmail: 'lan@gmail.com'
  },
  {
    id: 'ORD-TEST-9999',
    customerPhone: '0905123456',
    status: 'cancelled',
    createdAt: '2026-08-24T10:00:00.000Z',
    trackingCode: null,
    domesticTrackingCode: null,
    flightCode: null,
    userEmail: 'guest_cancelled@test.vn'
  }
];

runChallengerTest('[FUZZ-SEARCH-01] Empty, Null, Undefined, and Corrupted Query Inputs', () => {
  assertEquals(findGuestOrders('', mockOrders).length, 0);
  assertEquals(findGuestOrders('   ', mockOrders).length, 0);
  assertEquals(findGuestOrders(null, mockOrders).length, 0);
  assertEquals(findGuestOrders(undefined, mockOrders).length, 0);
  assertEquals(findGuestOrders(NaN, mockOrders).length, 0);
  assertEquals(findGuestOrders(0, mockOrders).length, 0);
  assertEquals(findGuestOrders(false, mockOrders).length, 0);
});

runChallengerTest('[FUZZ-SEARCH-02] Corrupted and Non-Array ordersList Handling', () => {
  assertEquals(findGuestOrders('0912345678', null).length, 0);
  assertEquals(findGuestOrders('0912345678', undefined).length, 0);
  assertEquals(findGuestOrders('0912345678', {}).length, 0);
  assertEquals(findGuestOrders('0912345678', 'string_instead_of_array').length, 0);
  assertEquals(findGuestOrders('0912345678', 12345).length, 0);
  assertEquals(findGuestOrders('0912345678', []).length, 0);

  // Array with corrupted elements (null, undefined, strings, numbers, empty objects)
  const corruptedList = [
    null,
    undefined,
    42,
    "corrupted string",
    {},
    { id: null, customerPhone: null },
    { id: undefined, phone: undefined },
    { id: 12345, status: 'pending' },
    ...mockOrders
  ];
  const results = findGuestOrders('0912345678', corruptedList);
  assertEquals(results.length, 2, 'Should cleanly ignore corrupted elements and find 2 matching orders');
});

runChallengerTest('[FUZZ-SEARCH-03] Regex Injection Characters in Query (No ReDoS or Throw)', () => {
  const regexAttacks = [
    '.*',
    '.+',
    '^',
    '$',
    '[a-z]+',
    '([a-z]+)*',
    '(?=.*)',
    '(',
    ')',
    '\\',
    '\\\\',
    '?',
    '*',
    '+',
    '{',
    '}',
    '[',
    ']',
    '|',
    '^ORD-.*$',
    'ORD-(?=.*)'
  ];

  for (const attack of regexAttacks) {
    const res = findGuestOrders(attack, mockOrders);
    assert(Array.isArray(res), `Query with regex payload "${attack}" should return array without throwing`);
  }
});

runChallengerTest('[FUZZ-SEARCH-04] SQL Injection & XSS Attack Payloads in Query', () => {
  const attackPayloads = [
    "' OR '1'='1",
    "' OR 1=1 --",
    "'; DROP TABLE orders; --",
    "UNION SELECT * FROM users --",
    "<script>alert(document.cookie)</script>",
    "<img src=x onerror=alert(1)>",
    "javascript:alert(1)",
    "onload=alert(1)",
    "\"'--></script><script>alert(1)</script>"
  ];

  for (const payload of attackPayloads) {
    const res = findGuestOrders(payload, mockOrders);
    assert(Array.isArray(res), `Payload "${payload}" should safely return empty array or matches without execution`);
  }
});

runChallengerTest('[FUZZ-SEARCH-05] Order ID Matching: Case-Insensitive, Prefix-Free, Substring, Digits', () => {
  // Exact uppercase
  const res1 = findGuestOrders('ORD-20260826-001', mockOrders);
  assertEquals(res1.length, 1);
  assertEquals(res1[0].id, 'ORD-20260826-001');

  // Lowercase with prefix
  const res2 = findGuestOrders('ord-20260826-001', mockOrders);
  assertEquals(res2.length, 1);
  assertEquals(res2[0].id, 'ORD-20260826-001');

  // Without prefix
  const res3 = findGuestOrders('20260826-001', mockOrders);
  assertEquals(res3.length, 1);
  assertEquals(res3[0].id, 'ORD-20260826-001');

  // Substring of ID (length >= 3)
  const res4 = findGuestOrders('TEST-9999', mockOrders);
  assertEquals(res4.length, 1);
  assertEquals(res4[0].id, 'ORD-TEST-9999');

  // Digits only
  const res5 = findGuestOrders('20260826001', mockOrders);
  assertEquals(res5.length, 1);
  assertEquals(res5[0].id, 'ORD-20260826-001');
});

runChallengerTest('[FUZZ-SEARCH-06] Phone Search with Formatting Delimiters & Intl Prefixes', () => {
  // Query with +84
  const res1 = findGuestOrders('+84 912 345 678', mockOrders);
  assertEquals(res1.length, 2);

  // Query with 84
  const res2 = findGuestOrders('84912345678', mockOrders);
  assertEquals(res2.length, 2);

  // Query with hyphens
  const res3 = findGuestOrders('0912-345-678', mockOrders);
  assertEquals(res3.length, 2);

  // Query with phone on order having order.phone instead of order.customerPhone
  const res4 = findGuestOrders('0987654321', mockOrders);
  assertEquals(res4.length, 1);
  assertEquals(res4[0].id, 'ORD-20260825-999');
});

runChallengerTest('[FUZZ-SEARCH-07] Tracking Codes & Flight Code Search', () => {
  // Air AWB
  const res1 = findGuestOrders('VN-KR-88291', mockOrders);
  assertEquals(res1.length, 1);
  assertEquals(res1[0].id, 'ORD-20260826-001');

  // Domestic Tracking Code
  const res2 = findGuestOrders('VTP-982173492', mockOrders);
  assertEquals(res2.length, 1);
  assertEquals(res2[0].id, 'ORD-20260826-002');

  // Flight Code (matches multiple orders on same flight)
  const res3 = findGuestOrders('VN415', mockOrders);
  assertEquals(res3.length, 2);

  // User Email search fallback
  const res4 = findGuestOrders('lan@gmail.com', mockOrders);
  assertEquals(res4.length, 1);
  assertEquals(res4[0].id, 'ORD-20260825-999');
});

runChallengerTest('[FUZZ-SEARCH-08] Multi-Order Sorting Invariant (Newest createdAt First)', () => {
  const matches = findGuestOrders('0912345678', mockOrders);
  assertEquals(matches.length, 2);
  // ORD-20260826-002 was created at 09:30, ORD-20260826-001 was created at 08:00
  assertEquals(matches[0].id, 'ORD-20260826-002', 'Latest order should appear first');
  assertEquals(matches[1].id, 'ORD-20260826-001', 'Earlier order should appear second');
});

// =============================================================================
// TEST SUITE 3: calculateStepProgress ADVERSARIAL FUZZING
// =============================================================================

runChallengerTest('[FUZZ-PROGRESS-01] Valid Standard 8-Step Statuses', () => {
  const expectedSteps = [
    { status: 'pending', stepIndex: 0, stepNumber: 1, percent: 12.5, isComp: false, isCanc: false },
    { status: 'deposit_paid', stepIndex: 1, stepNumber: 2, percent: 25, isComp: false, isCanc: false },
    { status: 'confirmed', stepIndex: 2, stepNumber: 3, percent: 37.5, isComp: false, isCanc: false },
    { status: 'purchased', stepIndex: 3, stepNumber: 4, percent: 50, isComp: false, isCanc: false },
    { status: 'packed_kr', stepIndex: 4, stepNumber: 5, percent: 62.5, isComp: false, isCanc: false },
    { status: 'in_transit_air', stepIndex: 5, stepNumber: 6, percent: 75, isComp: false, isCanc: false },
    { status: 'customs_cleared', stepIndex: 6, stepNumber: 7, percent: 87.5, isComp: false, isCanc: false },
    { status: 'completed', stepIndex: 7, stepNumber: 8, percent: 100, isComp: true, isCanc: false },
  ];

  for (const exp of expectedSteps) {
    const res = calculateStepProgress(exp.status);
    assertEquals(res.stepIndex, exp.stepIndex, `stepIndex for ${exp.status}`);
    assertEquals(res.stepNumber, exp.stepNumber, `stepNumber for ${exp.status}`);
    assertEquals(res.progressPercentage, exp.percent, `progressPercentage for ${exp.status}`);
    assertEquals(res.progressPercent, `${exp.percent}%`, `progressPercent for ${exp.status}`);
    assertEquals(res.isCompleted, exp.isComp, `isCompleted for ${exp.status}`);
    assertEquals(res.isCancelled, exp.isCanc, `isCancelled for ${exp.status}`);
  }
});

runChallengerTest('[FUZZ-PROGRESS-02] Cancelled Orders Boundary Handling', () => {
  // String input
  const resStr = calculateStepProgress('cancelled');
  assertEquals(resStr.isCancelled, true);
  assertEquals(resStr.stepIndex, -1);
  assertEquals(resStr.stepNumber, -1);
  assertEquals(resStr.progressPercentage, 0);
  assertEquals(resStr.progressPercent, '0%');
  assertEquals(resStr.isCompleted, false);

  // Object input
  const resObj = calculateStepProgress({ id: 'ORD-CANCEL', status: 'cancelled' });
  assertEquals(resObj.isCancelled, true);
  assertEquals(resObj.stepIndex, -1);
  assertEquals(resObj.progressPercentage, 0);
});

runChallengerTest('[FUZZ-PROGRESS-03] Corrupted, Unknown & Malformed Status Keys', () => {
  const invalidStatuses = [
    '',
    null,
    undefined,
    'unknown_status_xyz',
    '__proto__',
    'constructor',
    'toString',
    12345,
    true,
    false,
    {},
    []
  ];

  for (const status of invalidStatuses) {
    const res = calculateStepProgress(status);
    assert(res !== null && typeof res === 'object', `Should return valid object for status: ${status}`);
    assert(typeof res.stepIndex === 'number', `stepIndex must be a number for status: ${status}`);
    assert(typeof res.progressPercentage === 'number', `progressPercentage must be a number for status: ${status}`);
    assert(res.progressPercentage >= 0 && res.progressPercentage <= 100, `progressPercentage in range [0, 100]`);
    assert(typeof res.progressPercent === 'string', `progressPercent must be string`);
  }
});

runChallengerTest('[FUZZ-PROGRESS-04] Legacy Status Aliases Compatibility', () => {
  const legacyMap = [
    { status: 'quoted', expectedStep: 0 },
    { status: 'in_kr_warehouse', expectedStep: 4 },
    { status: 'transit', expectedStep: 5 },
    { status: 'in_vn_warehouse', expectedStep: 6 },
    { status: 'delivering', expectedStep: 7 }
  ];

  for (const { status, expectedStep } of legacyMap) {
    const res = calculateStepProgress(status);
    assertEquals(res.stepIndex, expectedStep, `Legacy status ${status} maps to step ${expectedStep}`);
  }
});

// =============================================================================
// TEST SUITE 4: getProofBadges ADVERSARIAL FUZZING
// =============================================================================

runChallengerTest('[FUZZ-PROOF-01] Complete Proof Data Extraction', () => {
  const completeOrder = {
    id: 'ORD-FULL-PROOF',
    povVideoUrl: 'https://cdn.tavy.kr/videos/pov_123.mp4',
    receiptImageUrl: 'https://cdn.tavy.kr/bills/bill_123.jpg',
    packingVideoUrl: 'https://cdn.tavy.kr/videos/pack_123.mp4',
    packageWeightKg: 1.85,
    flightCode: 'VN415',
    trackingCode: 'AWB-883921',
    domesticCarrier: 'ViettelPost',
    domesticTrackingCode: 'VTP-99218273'
  };

  const proof = getProofBadges(completeOrder);
  assertEquals(proof.hasProof, true);
  assertEquals(proof.povVideoUrl, 'https://cdn.tavy.kr/videos/pov_123.mp4');
  assertEquals(proof.receiptImageUrl, 'https://cdn.tavy.kr/bills/bill_123.jpg');
  assertEquals(proof.packingVideoUrl, 'https://cdn.tavy.kr/videos/pack_123.mp4');
  assertEquals(proof.packageWeightKg, 1.85);
  assertEquals(proof.flightCode, 'VN415');
  assertEquals(proof.trackingCode, 'AWB-883921');
  assertEquals(proof.domesticCarrier, 'ViettelPost');
  assertEquals(proof.domesticTrackingCode, 'VTP-99218273');
  assertEquals(proof.badges.length, 7, 'Should have 7 badges');
});

runChallengerTest('[FUZZ-PROOF-02] Bill Image Alias (billImageUrl vs receiptImageUrl)', () => {
  const orderWithBill = {
    id: 'ORD-BILL-ALIAS',
    billImageUrl: 'https://cdn.tavy.kr/bills/bill_legacy.jpg'
  };

  const proof = getProofBadges(orderWithBill);
  assertEquals(proof.hasProof, true);
  assertEquals(proof.receiptImageUrl, 'https://cdn.tavy.kr/bills/bill_legacy.jpg');
  assertEquals(proof.badges.length, 1);
  assertEquals(proof.badges[0].id, 'receipt_bill');
});

runChallengerTest('[FUZZ-PROOF-03] Missing Proof Fields & Null/Undefined Orders', () => {
  const emptyOrder = {};
  const emptyProof = getProofBadges(emptyOrder);
  assertEquals(emptyProof.hasProof, false);
  assertEquals(emptyProof.badges.length, 0);
  assertEquals(emptyProof.domesticCarrier, 'ViettelPost');

  // Null & undefined inputs
  assertEquals(getProofBadges(null).hasProof, false);
  assertEquals(getProofBadges(undefined).hasProof, false);
  assertEquals(getProofBadges("not an object").hasProof, false);
  assertEquals(getProofBadges(12345).hasProof, false);
});

runChallengerTest('[FUZZ-PROOF-04] Corrupted Weights and Domestic Carrier Defaults', () => {
  // Numeric 0 weight
  const zeroWeightOrder = { packageWeightKg: 0 };
  const resZero = getProofBadges(zeroWeightOrder);
  assertEquals(resZero.hasProof, true);
  assertEquals(resZero.packageWeightKg, 0);

  // String weight
  const strWeightOrder = { packageWeightKg: '2.5' };
  const resStr = getProofBadges(strWeightOrder);
  assertEquals(resStr.hasProof, true);
  assertEquals(resStr.packageWeightKg, '2.5');

  // Empty string weight (should not create badge)
  const emptyWeightOrder = { packageWeightKg: '' };
  const resEmpty = getProofBadges(emptyWeightOrder);
  assertEquals(resEmpty.hasProof, false);

  // Custom carrier
  const ghnOrder = {
    domesticTrackingCode: 'GHN-123456',
    domesticCarrier: 'GiaoHangNhanh'
  };
  const resGhn = getProofBadges(ghnOrder);
  assertEquals(resGhn.domesticCarrier, 'GiaoHangNhanh');
  assertEquals(resGhn.badges[0].carrier, 'GiaoHangNhanh');
});

// =============================================================================
// TEST SUITE 5: LARGE-SCALE STRESS & PERFORMANCE HARNESS
// =============================================================================

runChallengerTest('[STRESS-PERF-01] 10,000 Orders Search Performance & Invariant Check', () => {
  const largeOrders = [];
  for (let i = 0; i < 10000; i++) {
    const pad = String(i).padStart(5, '0');
    largeOrders.push({
      id: `ORD-20260826-${pad}`,
      customerPhone: `09${String(i % 100000000).padStart(8, '0')}`,
      status: i % 2 === 0 ? 'in_transit_air' : 'completed',
      createdAt: new Date(Date.now() - i * 60000).toISOString(),
      trackingCode: `AWB-${pad}`,
      domesticTrackingCode: `VTP-${pad}`
    });
  }

  // 1. Search by Order ID in 10k orders
  const startId = performance.now();
  const foundId = findGuestOrders('ORD-20260826-05000', largeOrders);
  const durId = performance.now() - startId;
  assertEquals(foundId.length, 1);
  assertEquals(foundId[0].id, 'ORD-20260826-05000');
  assert(durId < 50, `10k Order ID lookup took ${durId.toFixed(2)}ms (< 50ms)`);

  // 2. Search by Phone in 10k orders
  const targetPhone = largeOrders[7777].customerPhone;
  const startPhone = performance.now();
  const foundPhone = findGuestOrders(targetPhone, largeOrders);
  const durPhone = performance.now() - startPhone;
  assertGreaterThan(foundPhone.length, 0);
  assert(durPhone < 50, `10k Phone lookup took ${durPhone.toFixed(2)}ms (< 50ms)`);

  // 3. Search non-existent in 10k orders
  const startMiss = performance.now();
  const foundMiss = findGuestOrders('ORD-NON-EXISTENT-XYZ', largeOrders);
  const durMiss = performance.now() - startMiss;
  assertEquals(foundMiss.length, 0);
  assert(durMiss < 50, `10k Miss lookup took ${durMiss.toFixed(2)}ms (< 50ms)`);
});

runChallengerTest('[STRESS-PERF-02] Rapid Sequential Normalization of 50,000 Phones', () => {
  const start = performance.now();
  for (let i = 0; i < 50000; i++) {
    const raw = `+84 (091) ${i % 1000}-${String(i % 10000).padStart(4, '0')}`;
    normalizePhone(raw);
  }
  const duration = performance.now() - start;
  console.log(`       -> 50,000 normalizations completed in ${duration.toFixed(2)}ms`);
  assert(duration < 500, `50,000 normalizations took ${duration.toFixed(2)}ms (< 500ms)`);
});

console.log("================================================================================");
console.log(`SUMMARY: ${totalPassed} Passed, ${totalFailed} Failed out of ${testResults.length} Tests`);
console.log("================================================================================");

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
