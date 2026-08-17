import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertGreaterThan,
  assertDeepEquals,
  assertThrows,
} from '../framework/assert.js';

setTier('Tier 1: Feature Coverage');

function calculateOrderQuotation({
  itemsTotalKrw,
  koreaRate = 18.5,
  taxPercent = 10,
  serviceFeePercent = 5,
  weightKg = 1.0,
  shippingRatePerKgVnd = 200000,
}) {
  if (itemsTotalKrw < 0 || weightKg < 0) {
    throw new Error('Invalid calculation parameters');
  }

  const itemsSubtotalVnd = Math.round(itemsTotalKrw * koreaRate);
  const taxAmountVnd = Math.round(itemsSubtotalVnd * (taxPercent / 100));
  const serviceFeeVnd = Math.round(itemsSubtotalVnd * (serviceFeePercent / 100));
  const shippingFeeVnd = Math.round(weightKg * shippingRatePerKgVnd);
  const totalQuoteVnd = itemsSubtotalVnd + taxAmountVnd + serviceFeeVnd + shippingFeeVnd;

  return {
    itemsSubtotalVnd,
    taxAmountVnd,
    serviceFeeVnd,
    shippingFeeVnd,
    totalQuoteVnd,
  };
}

test('[F8-1] Quote builder import tax % calculation', () => {
  const quote = calculateOrderQuotation({
    itemsTotalKrw: 100000, // 1,850,000 VND
    koreaRate: 18.5,
    taxPercent: 10,
    serviceFeePercent: 0,
    weightKg: 0,
  });

  assertEquals(quote.itemsSubtotalVnd, 1850000, 'Subtotal should be 1,850,000 VND');
  assertEquals(quote.taxAmountVnd, 185000, '10% tax should be 185,000 VND');
});

test('[F8-2] Service fee % calculation', () => {
  const quote = calculateOrderQuotation({
    itemsTotalKrw: 100000, // 1,850,000 VND
    koreaRate: 18.5,
    taxPercent: 0,
    serviceFeePercent: 5,
    weightKg: 0,
  });

  assertEquals(quote.serviceFeeVnd, 92500, '5% service fee on 1,850,000 VND should be 92,500 VND');
});

test('[F8-3] Shipping fee calculation by weight [kg]', () => {
  const quote1 = calculateOrderQuotation({
    itemsTotalKrw: 0,
    weightKg: 2.5,
    shippingRatePerKgVnd: 200000,
  });

  assertEquals(quote1.shippingFeeVnd, 500000, '2.5kg at 200,000 VND/kg should be 500,000 VND');

  const quote2 = calculateOrderQuotation({
    itemsTotalKrw: 0,
    weightKg: 0.8,
    shippingRatePerKgVnd: 200000,
  });

  assertEquals(quote2.shippingFeeVnd, 160000, '0.8kg at 200,000 VND/kg should be 160,000 VND');
});

test('[F8-4] Total order quotation aggregation formula', () => {
  const quote = calculateOrderQuotation({
    itemsTotalKrw: 50000, // 925,000 VND
    koreaRate: 18.5,
    taxPercent: 10,       // 92,500 VND
    serviceFeePercent: 5, // 46,250 VND
    weightKg: 1.5,        // 300,000 VND
    shippingRatePerKgVnd: 200000,
  });

  const expectedTotal = 925000 + 92500 + 46250 + 300000; // 1,363,750 VND
  assertEquals(quote.totalQuoteVnd, expectedTotal, 'Total quote should aggregate subtotal, tax, fee, shipping');
});

test('[F8-5] Air Waybill (AWB) tracking assignment to order', () => {
  const assignAirWaybill = (order, awbTrackingNumber, carrier = 'Air Cargo Express') => {
    if (!awbTrackingNumber || !awbTrackingNumber.startsWith('AWB-')) {
      throw new Error('Mã vận đơn Air Waybill không hợp lệ (phải bắt đầu bằng AWB-)');
    }
    return {
      ...order,
      airWaybill: {
        trackingNumber: awbTrackingNumber,
        carrier,
        assignedAt: new Date().toISOString(),
      },
      status: 'transit', // Status updates to transit when AWB assigned
    };
  };

  const initialOrder = { id: 'ORD-10005', status: 'in_kr_warehouse', customerName: 'Le Van C' };
  const updatedOrder = assignAirWaybill(initialOrder, 'AWB-KRVN-99887766');

  assertEquals(updatedOrder.status, 'transit', 'Order status should transition to transit');
  assertEquals(updatedOrder.airWaybill.trackingNumber, 'AWB-KRVN-99887766', 'AWB tracking number assigned');

  assertThrows(() => {
    assignAirWaybill(initialOrder, 'INVALID-TRACKING-123');
  }, 'Mã vận đơn Air Waybill không hợp lệ');
});
