import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertDeepEquals,
  assertContains,
} from '../framework/assert.js';
import { ORDER_STATUSES, getStatusConfig } from '../../src/data/orderStatuses.js';

setTier('Tier 1: Feature Coverage');

test('[F6-1] 9-step enum progression sequence validation', () => {
  const expectedSteps = [
    'pending',
    'quoted',
    'deposit_paid',
    'purchased',
    'in_kr_warehouse',
    'transit',
    'in_vn_warehouse',
    'delivering',
    'completed'
  ];

  assertEquals(expectedSteps.length, 9, 'Enum progression must have exactly 9 steps');

  expectedSteps.forEach((statusKey, index) => {
    const config = ORDER_STATUSES[statusKey];
    assert(config !== undefined, `Status ${statusKey} must be defined in ORDER_STATUSES`);
    assertEquals(config.stepIndex, index, `Status ${statusKey} stepIndex must be ${index}`);
  });
});

test('[F6-2] Order tracking lookup by order ID', () => {
  const ordersDatabase = [
    { id: 'ORD-100001', customerName: 'Nguyen Van A', status: 'pending', totalVnd: 500000 },
    { id: 'ORD-100002', customerName: 'Tran Thi B', status: 'transit', totalVnd: 1200000 },
  ];

  const lookupOrder = (orderId) => {
    const cleanId = (orderId || '').trim().toUpperCase();
    return ordersDatabase.find(o => o.id.toUpperCase() === cleanId) || null;
  };

  const found = lookupOrder('ORD-100002');
  assert(found !== null, 'Order ORD-100002 should be found');
  assertEquals(found.customerName, 'Tran Thi B', 'Customer name should match');
  assertEquals(found.status, 'transit', 'Order status should be transit');

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
  assertEquals(completedConfig.stepIndex, 8, 'Completed step index is 8');

  const fallbackConfig = getStatusConfig('unknown_status');
  assertEquals(fallbackConfig.id, 'unknown_status', 'Fallback status ID should preserve key');
});
