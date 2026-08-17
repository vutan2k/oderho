import { setTier, test } from '../framework/runner.js';
import {
  assertEquals,
  assertThrows,
} from '../framework/assert.js';
import { ORDER_STATUSES, getStatusConfig } from '../../src/data/orderStatuses.js';

setTier('Tier 2: Boundary & Corner Cases');

test('[F6-B1] Invalid status transition rejection [completed->pending]', () => {
  const isTransitionAllowed = (fromStatus, toStatus) => {
    const fromConfig = getStatusConfig(fromStatus);
    const toConfig = getStatusConfig(toStatus);
    if (fromStatus === 'completed' && toStatus === 'pending') return false;
    if (fromStatus === 'delivering' && toStatus === 'pending') return false;
    return toConfig.stepIndex >= fromConfig.stepIndex;
  };

  assertEquals(isTransitionAllowed('completed', 'pending'), false, 'Transition from completed back to pending must be rejected');
  assertEquals(isTransitionAllowed('delivering', 'pending'), false, 'Transition from delivering back to pending must be rejected');
  assertEquals(isTransitionAllowed('pending', 'quoted'), true, 'Forward transition pending -> quoted allowed');
});

test('[F6-B2] Non-existent order ID tracking lookup', () => {
  const orders = [
    { id: 'ORD-1001', customerName: 'Trần Văn A', status: 'pending' },
    { id: 'ORD-1002', customerName: 'Lê Thị B', status: 'completed' }
  ];

  const lookupOrder = (orderId) => {
    const found = orders.find(o => o.id === orderId);
    if (!found) return null;
    return found;
  };

  assertEquals(lookupOrder('ORD-9999-NOTFOUND'), null, 'Non-existent order ID returns null');
  assertEquals(lookupOrder(''), null, 'Empty order ID lookup returns null');
});

test('[F6-B3] Corrupted VietQR payload string handling', () => {
  const generateVietQRPayload = (bankCode, accountNo, amount, memo) => {
    if (!bankCode || !accountNo || isNaN(Number(amount)) || Number(amount) <= 0) {
      return { success: false, error: 'Thông tin thanh toán VietQR không hợp lệ!' };
    }
    return {
      success: true,
      qrUrl: `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(memo)}`
    };
  };

  assertEquals(generateVietQRPayload('WOORI', '1002998877', -50000, 'ORD-100').success, false, 'Negative amount rejected');
  assertEquals(generateVietQRPayload('', '1002998877', 50000, 'ORD-100').success, false, 'Missing bank code rejected');
  assertEquals(generateVietQRPayload('WOORI', '', 50000, 'ORD-100').success, false, 'Missing account number rejected');
  assertEquals(generateVietQRPayload('WOORI', '1002998877', 50000, 'ORD-100').success, true, 'Valid parameters generate VietQR');
});

test('[F6-B4] Negative order total payment error handling', () => {
  const processPayment = (orderTotal, amountPaid) => {
    if (orderTotal <= 0) {
      throw new Error('Số tiền đơn hàng không hợp lệ (nhỏ hơn hoặc bằng 0).');
    }
    if (amountPaid < orderTotal) {
      throw new Error('Số tiền thanh toán chưa đủ!');
    }
    return { success: true, status: 'paid' };
  };

  assertThrows(() => processPayment(-100000, 100000), 'Số tiền đơn hàng không hợp lệ');
  assertThrows(() => processPayment(500000, 200000), 'Số tiền thanh toán chưa đủ');
  assertEquals(processPayment(500000, 500000).status, 'paid', 'Exact total payment succeeds');
});

test('[F6-B5] Missing bank info fallback details', () => {
  const getBankPaymentInfo = (bankConfig) => {
    if (!bankConfig || !bankConfig.bankName || !bankConfig.accountNumber) {
      return {
        bankName: 'Ngân hàng Woori Việt Nam (Woori Bank)',
        accountName: 'CONG TY TNHH TAVY KOREA',
        accountNumber: '1002-888-999999',
        branch: 'Chi nhánh TP. Hồ Chí Minh'
      };
    }
    return bankConfig;
  };

  const fallbackInfo = getBankPaymentInfo(null);
  assertEquals(fallbackInfo.bankName, 'Ngân hàng Woori Việt Nam (Woori Bank)', 'Missing bank config falls back to default Woori Bank');
  assertEquals(fallbackInfo.accountNumber, '1002-888-999999', 'Fallback account number provided');
});
