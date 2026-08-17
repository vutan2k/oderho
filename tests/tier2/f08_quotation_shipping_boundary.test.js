import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertGreaterThan,
  assertThrows,
} from '../framework/assert.js';

setTier('Tier 2: Boundary & Corner Cases');

test('[F8-B1] Zero product weight quotation calculation', () => {
  const calculateShippingFee = (weightKg, ratePerKgVnd = 200000) => {
    const w = Math.max(0, Number(weightKg) || 0);
    if (w === 0) return 0; // or min base fee 0
    return Math.round(w * ratePerKgVnd);
  };

  assertEquals(calculateShippingFee(0), 0, 'Zero weight results in 0 VND shipping fee');
  assertEquals(calculateShippingFee(-2.5), 0, 'Negative weight sanitized to 0 VND fee');
});

test('[F8-B2] Extreme weight [1000kg+] shipping calculation', () => {
  const calculateShippingFee = (weightKg, ratePerKgVnd = 200000) => {
    const w = Math.max(0, Number(weightKg) || 0);
    return Math.round(w * ratePerKgVnd);
  };

  const extremeWeightFee = calculateShippingFee(1000, 200000);
  assertEquals(extremeWeightFee, 200000000, '1000kg shipping fee calculated as 200,000,000 VND without overflow');
});

test('[F8-B3] 0% tax rate quotation calculation', () => {
  const calculateOrderQuote = (itemsTotalVnd, serviceFeePercent, shippingFeeVnd, taxPercent) => {
    const serviceFee = Math.round(itemsTotalVnd * (serviceFeePercent / 100));
    const subtotal = itemsTotalVnd + serviceFee + shippingFeeVnd;
    const taxVnd = Math.round(subtotal * (taxPercent / 100));
    const grandTotalVnd = subtotal + taxVnd;

    return { serviceFee, shippingFeeVnd, taxVnd, grandTotalVnd };
  };

  const quote0Tax = calculateOrderQuote(1000000, 5, 200000, 0);
  assertEquals(quote0Tax.taxVnd, 0, '0% tax yields 0 VND tax amount');
  assertEquals(quote0Tax.grandTotalVnd, 1250000, 'Grand total matches items + service + shipping');
});

test('[F8-B4] Missing destination address calculation error', () => {
  const validateQuoteRequest = (order) => {
    if (!order || !order.customerAddress || typeof order.customerAddress !== 'string' || !order.customerAddress.trim()) {
      throw new Error('Thiếu địa chỉ giao hàng! Không thể tính toán báo giá chi tiết.');
    }
    return true;
  };

  assertThrows(() => validateQuoteRequest({ customerName: 'Anh Nam', customerAddress: '' }), 'Thiếu địa chỉ giao hàng');
  assertThrows(() => validateQuoteRequest({ customerName: 'Anh Nam' }), 'Thiếu địa chỉ giao hàng');
  assertEquals(validateQuoteRequest({ customerAddress: '789 Nguyễn Trãi, Q5, TP.HCM' }), true, 'Valid address request passes');
});

test('[F8-B5] Quote expiration timestamp & validity check', () => {
  const createQuoteWithExpiration = (quoteData, validityDays = 7) => {
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + validityDays * 24 * 60 * 60 * 1000);
    return {
      ...quoteData,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString()
    };
  };

  const isQuoteExpired = (quote) => {
    if (!quote || !quote.expiresAt) return true;
    return new Date(quote.expiresAt).getTime() < Date.now();
  };

  const quote = createQuoteWithExpiration({ grandTotalVnd: 500000 });
  assert(quote.expiresAt !== undefined, 'Quote contains expiresAt timestamp');
  assertEquals(isQuoteExpired(quote), false, 'Newly issued quote is not expired');

  const expiredQuote = { ...quote, expiresAt: new Date(Date.now() - 1000).toISOString() };
  assertEquals(isQuoteExpired(expiredQuote), true, 'Past quote is marked expired');
});
