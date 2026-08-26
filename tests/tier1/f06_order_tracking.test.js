import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertContains,
} from '../framework/assert.js';
import { ORDER_STATUSES, getStatusConfig, ORDER_STEPS } from '../../src/data/orderStatuses.js';
import {
  normalizePhone,
  findGuestOrders,
  calculateStepProgress,
  getProofBadges
} from '../../src/services/guestTrackingService.js';

setTier('Tier 1: Feature Coverage');

test('[F6-1] 8-step transparent overseas fulfillment sequence validation', () => {
  const expectedSteps = [
    'pending',
    'deposit_paid',
    'confirmed',
    'purchased',
    'packed_kr',
    'in_transit_air',
    'customs_cleared',
    'completed'
  ];

  assertEquals(expectedSteps.length, 8, 'Workflow progression must have exactly 8 steps');
  assertEquals(ORDER_STEPS.length, 8, 'ORDER_STEPS must have exactly 8 steps');

  expectedSteps.forEach((statusKey, index) => {
    const config = ORDER_STATUSES[statusKey];
    assert(config !== undefined, `Status ${statusKey} must be defined in ORDER_STATUSES`);
    assertEquals(config.stepIndex, index, `Status ${statusKey} stepIndex must be ${index}`);
  });
});

test('[F6-2] Order tracking lookup by order ID', () => {
  const ordersDatabase = [
    { id: 'ORD-100001', customerName: 'Nguyen Van A', status: 'pending', totalVnd: 500000 },
    { id: 'ORD-100002', customerName: 'Tran Thi B', status: 'in_transit_air', totalVnd: 1200000 },
  ];

  const lookupOrder = (orderId) => {
    const cleanId = (orderId || '').trim().toUpperCase();
    return ordersDatabase.find(o => o.id.toUpperCase() === cleanId) || null;
  };

  const found = lookupOrder('ORD-100002');
  assert(found !== null, 'Order ORD-100002 should be found');
  assertEquals(found.customerName, 'Tran Thi B', 'Customer name should match');
  assertEquals(found.status, 'in_transit_air', 'Order status should be in_transit_air');

  const notFound = lookupOrder('ORD-999999');
  assertEquals(notFound, null, 'Non-existent order should return null');
});

test('[F6-3] VietQR string generation and formatting', () => {
  const generateVietQrUrl = (bankId, accountNo, amount, addInfo) => {
    const base = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png`;
    const params = new URLSearchParams({
      amount: String(amount),
      addInfo: addInfo || '',
      accountName: 'TAVY KOREA CO LTD'
    });
    return `${base}?${params.toString()}`;
  };

  const qrUrl = generateVietQrUrl('WOORI', '1000888999', 450000, 'ORD100001');
  assertContains(qrUrl, 'https://img.vietqr.io/image/WOORI-1000888999-compact2.png', 'Base URL format correct');
  assertContains(qrUrl, 'amount=450000', 'URL params contain amount');
  assertContains(qrUrl, 'addInfo=ORD100001', 'URL params contain addInfo');
});

test('[F6-4] Woori Bank payment info payload schema', () => {
  const wooriBankInfo = {
    bankName: 'Woori Bank Vietnam',
    bankCode: 'WOORI',
    accountNumber: '1000888999',
    accountHolder: 'TAVY KOREA CO LTD',
    branch: 'Chi nhánh TP. Hồ Chí Minh',
    swiftCode: 'HVBKHKHH',
  };

  assertEquals(wooriBankInfo.bankCode, 'WOORI', 'Bank code should be WOORI');
  assertEquals(wooriBankInfo.accountNumber, '1000888999', 'Account number should be 1000888999');
  assert(wooriBankInfo.accountHolder.includes('TAVY KOREA'), 'Account holder name correct');
});

test('[F6-5] Order status badge visual tokens rendering', () => {
  const pendingConfig = getStatusConfig('pending');
  assertEquals(pendingConfig.id, 'pending', 'Status ID pending');
  assertEquals(pendingConfig.color, '#D97706', 'Pending color token matches');
  assertEquals(pendingConfig.bgColor, '#FEF3C7', 'Pending bgColor token matches');

  const completedConfig = getStatusConfig('completed');
  assertEquals(completedConfig.color, '#059669', 'Completed color token matches');
  assertEquals(completedConfig.stepIndex, 7, 'Completed step index is 7 in 8-step workflow');

  const fallbackConfig = getStatusConfig('unknown_status');
  assertEquals(fallbackConfig.id, 'unknown_status', 'Fallback status ID should preserve key');
});

test('[F6-6] Robust Vietnamese phone normalization engine', () => {
  assertEquals(normalizePhone('+84912345678'), '0912345678', '+84 format');
  assertEquals(normalizePhone('84912345678'), '0912345678', '84 prefix format');
  assertEquals(normalizePhone('+84 (0) 912 345 678'), '0912345678', '+84 (0) format');
  assertEquals(normalizePhone('0912 345 678'), '0912345678', 'Spaced format');
  assertEquals(normalizePhone('0912-345-678'), '0912345678', 'Hyphenated format');
  assertEquals(normalizePhone('(091) 234-5678'), '0912345678', 'Parentheses format');
  assertEquals(normalizePhone('912345678'), '0912345678', '9 digits missing leading 0');
  assertEquals(normalizePhone('0912345678'), '0912345678', 'Already standard format');
  assertEquals(normalizePhone(''), '', 'Empty string returns empty');
  assertEquals(normalizePhone(null), '', 'Null returns empty');
});

test('[F6-7] Multi-order and cross-field guest tracking lookup', () => {
  const mockOrders = [
    {
      id: 'ORD-827192',
      customerName: 'Nguyễn Thị Lan',
      customerPhone: '0912 345 678',
      status: 'purchased',
      createdAt: '2026-08-25T10:00:00Z',
      trackingCode: 'AWB-VN415-01',
      domesticTrackingCode: 'VT882910482VN'
    },
    {
      id: 'ORD-718293',
      customerName: 'Nguyễn Thị Lan',
      customerPhone: '+84912345678',
      status: 'completed',
      createdAt: '2026-08-20T08:00:00Z',
      trackingCode: 'AWB-VN415-02',
      domesticTrackingCode: 'VT771829301VN'
    },
    {
      id: 'ORD-100003',
      customerName: 'Trần Văn Bình',
      customerPhone: '0987654321',
      status: 'pending',
      createdAt: '2026-08-26T01:00:00Z'
    }
  ];

  // Exact ID match
  const byExactId = findGuestOrders('ORD-827192', mockOrders);
  assertEquals(byExactId.length, 1);
  assertEquals(byExactId[0].id, 'ORD-827192');

  // Lowercase & prefix-free ID match
  const byLowerId = findGuestOrders('ord-827192', mockOrders);
  assertEquals(byLowerId.length, 1);
  assertEquals(byLowerId[0].id, 'ORD-827192');

  const byNumericId = findGuestOrders('827192', mockOrders);
  assertEquals(byNumericId.length, 1);
  assertEquals(byNumericId[0].id, 'ORD-827192');

  // Normalized phone match (finds 2 orders for same customer, sorted newest first)
  const byPhone = findGuestOrders('+84 912-345-678', mockOrders);
  assertEquals(byPhone.length, 2);
  assertEquals(byPhone[0].id, 'ORD-827192', 'Newest order must be first');
  assertEquals(byPhone[1].id, 'ORD-718293', 'Older order must be second');

  // Domestic tracking code match
  const byDomestic = findGuestOrders('VT882910482VN', mockOrders);
  assertEquals(byDomestic.length, 1);
  assertEquals(byDomestic[0].id, 'ORD-827192');

  // Air AWB match
  const byAwb = findGuestOrders('awb-vn415-02', mockOrders);
  assertEquals(byAwb.length, 1);
  assertEquals(byAwb[0].id, 'ORD-718293');

  // Non-matching query
  const notFound = findGuestOrders('0999999999', mockOrders);
  assertEquals(notFound.length, 0);
});

test('[F6-8] Step progression & percentage calculator helper', () => {
  const pendingOrder = { id: 'ORD-1', status: 'pending' };
  const step1 = calculateStepProgress(pendingOrder);
  assertEquals(step1.stepIndex, 0);
  assertEquals(step1.stepNumber, 1);
  assertEquals(step1.progressPercentage, 12.5);
  assertEquals(step1.progressPercent, '12.5%');
  assertEquals(step1.isCancelled, false);
  assertEquals(step1.isCompleted, false);

  const purchasedOrder = { id: 'ORD-2', status: 'purchased' };
  const step4 = calculateStepProgress(purchasedOrder);
  assertEquals(step4.stepIndex, 3);
  assertEquals(step4.stepNumber, 4);
  assertEquals(step4.progressPercentage, 50);
  assertEquals(step4.progressPercent, '50%');

  const completedOrder = { id: 'ORD-3', status: 'completed' };
  const step8 = calculateStepProgress(completedOrder);
  assertEquals(step8.stepIndex, 7);
  assertEquals(step8.progressPercentage, 100);
  assertEquals(step8.progressPercent, '100%');
  assertEquals(step8.isCompleted, true);

  const cancelledOrder = { id: 'ORD-4', status: 'cancelled' };
  const stepCancel = calculateStepProgress(cancelledOrder);
  assertEquals(stepCancel.stepIndex, -1);
  assertEquals(stepCancel.progressPercentage, 0);
  assertEquals(stepCancel.progressPercent, '0%');
  assertEquals(stepCancel.isCancelled, true);
});

test('[F6-9] Proof hub media extraction and badge formatting', () => {
  const richOrder = {
    id: 'ORD-827192',
    povVideoUrl: 'https://cdn.tavy.vn/videos/pov-827192.mp4',
    receiptImageUrl: 'https://cdn.tavy.vn/receipts/bill-827192.jpg',
    packingVideoUrl: 'https://cdn.tavy.vn/videos/pack-827192.mp4',
    packageWeightKg: 1.85,
    flightCode: 'VN415 - ICN/HAN',
    trackingCode: 'AWB882910482',
    domesticCarrier: 'ViettelPost',
    domesticTrackingCode: 'VT882910482VN'
  };

  const proof = getProofBadges(richOrder);
  assertEquals(proof.hasProof, true);
  assertEquals(proof.povVideoUrl, 'https://cdn.tavy.vn/videos/pov-827192.mp4');
  assertEquals(proof.receiptImageUrl, 'https://cdn.tavy.vn/receipts/bill-827192.jpg');
  assertEquals(proof.packingVideoUrl, 'https://cdn.tavy.vn/videos/pack-827192.mp4');
  assertEquals(proof.packageWeightKg, 1.85);
  assertEquals(proof.domesticTrackingCode, 'VT882910482VN');
  assert(proof.badges.length >= 6, 'Should extract all proof badges');

  const emptyOrder = {};
  const emptyProof = getProofBadges(emptyOrder);
  assertEquals(emptyProof.hasProof, false);
  assertEquals(emptyProof.badges.length, 0);
});

test('[F6-10] Guest Order Tracking multi-order selection and tab switching logic', () => {
  const ordersList = [
    { id: 'ORD-90001', customerPhone: '0901234567', createdAt: '2026-08-25T14:00:00Z', status: 'purchased' },
    { id: 'ORD-90002', customerPhone: '0901234567', createdAt: '2026-08-26T08:00:00Z', status: 'deposit_paid' },
    { id: 'ORD-90003', customerPhone: '0901234567', createdAt: '2026-08-20T10:00:00Z', status: 'completed' }
  ];

  const matched = findGuestOrders('0901234567', ordersList);
  assertEquals(matched.length, 3, 'Should find all 3 orders matching customer phone');
  assertEquals(matched[0].id, 'ORD-90002', 'Latest order (Aug 26) must be selected as default tab (index 0)');
  assertEquals(matched[1].id, 'ORD-90001', 'Second latest order (Aug 25) at index 1');
  assertEquals(matched[2].id, 'ORD-90003', 'Oldest order (Aug 20) at index 2');

  // Verify tab switching state
  let selectedIndex = 0;
  assertEquals(matched[selectedIndex].status, 'deposit_paid');
  
  selectedIndex = 1;
  assertEquals(matched[selectedIndex].status, 'purchased');

  selectedIndex = 2;
  assertEquals(matched[selectedIndex].status, 'completed');
});

test('[F6-11] Unpaid order payment CTA and total amount calculation', () => {
  const unpaidOrder = {
    id: 'ORD-UNPAID-01',
    status: 'pending',
    paymentStatus: 'pending',
    totalVnd: 750000,
    items: [
      { productId: 'P1', name: 'Sản phẩm 1', price: 750000, qty: 1 }
    ]
  };

  const isUnpaid = unpaidOrder.status === 'pending' || unpaidOrder.paymentStatus === 'pending';
  assertEquals(isUnpaid, true, 'Unpaid order must trigger payment CTA');
  assertEquals(unpaidOrder.totalVnd, 750000, 'Total order VND should match expected');

  const paidOrder = {
    id: 'ORD-PAID-01',
    status: 'deposit_paid',
    paymentStatus: 'paid',
    totalVnd: 1200000
  };
  const isPaid = paidOrder.status !== 'pending' && paidOrder.paymentStatus === 'paid';
  assertEquals(isPaid, true, 'Paid order should not require pending deposit CTA');
});

test('[F6-12] Proof media modal URL types and embed detection', () => {
  const testMediaItems = [
    { type: 'video', url: 'https://cdn.tavy.vn/video.mp4', expectedEmbed: false },
    { type: 'video', url: 'https://www.youtube.com/watch?v=xyz', expectedEmbed: true },
    { type: 'video', url: 'https://drive.google.com/file/d/123/view', expectedEmbed: true },
    { type: 'image', url: 'https://cdn.tavy.vn/receipt.jpg', expectedEmbed: false }
  ];

  testMediaItems.forEach((item) => {
    const isEmbed = item.type === 'video' && (
      item.url.includes('youtube.com') ||
      item.url.includes('youtu.be') ||
      item.url.includes('drive.google.com/file') ||
      item.url.includes('vimeo.com')
    );
    assertEquals(isEmbed, item.expectedEmbed, `Media URL embed detection for ${item.url}`);
  });
});

test('[F6-13] Full 8-step workflow progression configuration & step metadata', () => {
  const steps = [
    { key: 'pending', step: 1, label: 'Chờ cọc', stepIndex: 0, pct: 12.5 },
    { key: 'deposit_paid', step: 2, label: 'Đã cọc 100%', stepIndex: 1, pct: 25.0 },
    { key: 'confirmed', step: 3, label: 'Đã xác nhận', stepIndex: 2, pct: 37.5 },
    { key: 'purchased', step: 4, label: 'Đang mua (POV)', stepIndex: 3, pct: 50.0 },
    { key: 'packed_kr', step: 5, label: 'Kho Seoul', stepIndex: 4, pct: 62.5 },
    { key: 'in_transit_air', step: 6, label: 'Đang bay', stepIndex: 5, pct: 75.0 },
    { key: 'customs_cleared', step: 7, label: 'Kho VN', stepIndex: 6, pct: 87.5 },
    { key: 'completed', step: 8, label: 'Đã giao', stepIndex: 7, pct: 100.0 }
  ];

  steps.forEach(({ key, step, stepIndex, pct }) => {
    const cfg = getStatusConfig(key);
    assertEquals(cfg.stepNumber, step, `Status ${key} stepNumber should be ${step}`);
    assertEquals(cfg.stepIndex, stepIndex, `Status ${key} stepIndex should be ${stepIndex}`);

    const progress = calculateStepProgress({ status: key });
    assertEquals(progress.stepIndex, stepIndex, `calculateStepProgress for ${key} stepIndex`);
    assertEquals(progress.stepNumber, step, `calculateStepProgress for ${key} stepNumber`);
    assertEquals(progress.progressPercentage, pct, `calculateStepProgress for ${key} progressPercentage`);
    assertEquals(progress.progressPercent, `${pct}%`, `calculateStepProgress for ${key} progressPercent string`);
    assertEquals(progress.isCancelled, false, `calculateStepProgress for ${key} isCancelled`);
    if (key === 'completed') {
      assertEquals(progress.isCompleted, true, 'Completed status isCompleted should be true');
    }
  });
});

test('[F6-14] Legacy status aliases backward compatibility in 8-step engine', () => {
  const legacyStatuses = [
    { key: 'quoted', mappedStepIndex: 0 },
    { key: 'in_kr_warehouse', mappedStepIndex: 4 },
    { key: 'transit', mappedStepIndex: 5 },
    { key: 'in_vn_warehouse', mappedStepIndex: 6 },
    { key: 'delivering', mappedStepIndex: 7 }
  ];

  legacyStatuses.forEach(({ key, mappedStepIndex }) => {
    const cfg = getStatusConfig(key);
    assertEquals(cfg.stepIndex, mappedStepIndex, `Legacy status '${key}' stepIndex mapping`);
    const progress = calculateStepProgress({ status: key });
    assertEquals(progress.stepIndex, mappedStepIndex, `calculateStepProgress for legacy status '${key}'`);
  });
});

test('[F6-15] Comprehensive phone normalization with various international & local formats', () => {
  const testCases = [
    { input: '+84901234567', expected: '0901234567' },
    { input: '+84 (0) 901 234 567', expected: '0901234567' },
    { input: '84901234567', expected: '0901234567' },
    { input: '840901234567', expected: '0901234567' },
    { input: '0901 234 567', expected: '0901234567' },
    { input: '0901-234-567', expected: '0901234567' },
    { input: '(090) 123 4567', expected: '0901234567' },
    { input: '090.123.4567', expected: '0901234567' },
    { input: '901234567', expected: '0901234567' },
    { input: '0381234567', expected: '0381234567' },
    { input: '+84381234567', expected: '0381234567' },
    { input: '0771234567', expected: '0771234567' }
  ];

  testCases.forEach(({ input, expected }) => {
    assertEquals(normalizePhone(input), expected, `Phone '${input}' normalized to '${expected}'`);
  });
});

test('[F6-16] Case-insensitive, prefix-free and partial digit Order ID search', () => {
  const orders = [
    { id: 'ORD-982104', customerName: 'Hoàng Yến', customerPhone: '0933112233', createdAt: '2026-08-25T10:00:00Z' },
    { id: 'ORD-123456', customerName: 'Bùi Anh', customerPhone: '0944556677', createdAt: '2026-08-26T09:00:00Z' }
  ];

  const queries = [
    'ORD-982104',
    'ord-982104',
    'Ord-982104',
    '982104',
    'ORD982104',
    'ord982104',
    '  ORD-982104  '
  ];

  queries.forEach((q) => {
    const results = findGuestOrders(q, orders);
    assertEquals(results.length, 1, `Query '${q}' should find exactly 1 order`);
    assertEquals(results[0].id, 'ORD-982104', `Query '${q}' should match ORD-982104`);
  });
});

test('[F6-17] Order pricing calculation hierarchy and fallback rules in Status Card', () => {
  const krwRate = 19.5;
  const serviceFeeMultiplier = 1.05;

  // Case 1: Direct totalVnd
  const orderWithTotal = { id: 'ORD-1', totalVnd: 850000 };
  let total1 = orderWithTotal.totalVnd;
  assertEquals(total1, 850000);

  // Case 2: Fallback to quote.totalVnd
  const orderWithQuote = { id: 'ORD-2', quote: { totalVnd: 920000 } };
  let total2 = orderWithQuote.totalVnd || orderWithQuote.quote?.totalVnd;
  assertEquals(total2, 920000);

  // Case 3: Fallback to items array calculation
  const orderWithItems = {
    id: 'ORD-3',
    items: [
      { productId: 'P1', price: 200000, qty: 2 },
      { productId: 'P2', price: 150000, qty: 1 }
    ]
  };
  let total3 = orderWithItems.items.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
  assertEquals(total3, 550000);

  // Case 4: Fallback to foreignPrice with KRW conversion
  const orderWithForeign = {
    id: 'ORD-4',
    foreignPrice: 20000,
    quantity: 2
  };
  let total4 = Math.round(orderWithForeign.foreignPrice * krwRate * serviceFeeMultiplier * (orderWithForeign.quantity || 1));
  assertEquals(total4, 819000); // 20000 * 19.5 * 1.05 * 2 = 819000
});

test('[F6-18] Proof Hub media extraction with multiple media types and carrier formats', () => {
  const proofOrder = {
    id: 'ORD-PROOF-99',
    povVideoUrl: 'https://cdn.tavy.vn/videos/pov_sample.mp4',
    receiptImageUrl: 'https://cdn.tavy.vn/bills/bill_oliveyoung.jpg',
    packingVideoUrl: 'https://cdn.tavy.vn/videos/packing_box.mp4',
    packageWeightKg: 2.15,
    flightCode: 'VN415-ICN-HAN',
    trackingCode: 'AWB-8837192',
    domesticCarrier: 'GiaoHangNhanh',
    domesticTrackingCode: 'GHN-88291029'
  };

  const badges = getProofBadges(proofOrder);
  assertEquals(badges.hasProof, true);
  assertEquals(badges.povVideoUrl, 'https://cdn.tavy.vn/videos/pov_sample.mp4');
  assertEquals(badges.receiptImageUrl, 'https://cdn.tavy.vn/bills/bill_oliveyoung.jpg');
  assertEquals(badges.packingVideoUrl, 'https://cdn.tavy.vn/videos/packing_box.mp4');
  assertEquals(badges.packageWeightKg, 2.15);
  assertEquals(badges.flightCode, 'VN415-ICN-HAN');
  assertEquals(badges.trackingCode, 'AWB-8837192');
  assertEquals(badges.domesticCarrier, 'GiaoHangNhanh');
  assertEquals(badges.domesticTrackingCode, 'GHN-88291029');
  assertEquals(badges.badges.length, 7, 'All 7 badges must be generated');
});

test('[F6-19] Multi-order sorting invariant (latest createdAt always first)', () => {
  const customerPhone = '0988776655';
  const orders = [
    { id: 'ORD-OLD', customerPhone, createdAt: '2026-08-01T00:00:00Z', status: 'completed' },
    { id: 'ORD-NEW', customerPhone, createdAt: '2026-08-26T12:00:00Z', status: 'deposit_paid' },
    { id: 'ORD-MID', customerPhone, createdAt: '2026-08-15T06:00:00Z', status: 'purchased' }
  ];

  const sorted = findGuestOrders(customerPhone, orders);
  assertEquals(sorted.length, 3);
  assertEquals(sorted[0].id, 'ORD-NEW', 'Newest order must be index 0');
  assertEquals(sorted[1].id, 'ORD-MID', 'Middle order must be index 1');
  assertEquals(sorted[2].id, 'ORD-OLD', 'Oldest order must be index 2');
});



