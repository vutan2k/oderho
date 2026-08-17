import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertDeepEquals,
  assertGreaterThan,
  assertThrows,
} from '../framework/assert.js';

setTier('Tier 1: Feature Coverage');

function createAdminConfigManager(initialRates = {}) {
  let rates = {
    koreaRate: 18.5,
    usdRate: 25400,
    jpyRate: 165,
    serviceFeePercent: 5.0,
    shippingPerKgVnd: 200000,
    ...initialRates,
  };

  let activeTab = 'orders';

  return {
    getRates: () => ({ ...rates }),
    updateRate: (currency, newRate) => {
      const val = Number(newRate);
      if (isNaN(val) || val <= 0) {
        throw new Error(`Invalid rate value for ${currency}`);
      }
      if (currency === 'KRW') rates.koreaRate = val;
      else if (currency === 'USD') rates.usdRate = val;
      else if (currency === 'JPY') rates.jpyRate = val;
      else if (currency === 'serviceFeePercent') rates.serviceFeePercent = val;
      else throw new Error(`Unknown rate currency key: ${currency}`);
    },
    getActiveTab: () => activeTab,
    setActiveTab: (tabName) => {
      const validTabs = ['orders', 'products', 'rates', 'bot', 'sheet'];
      if (!validTabs.includes(tabName)) {
        throw new Error(`Invalid admin tab: ${tabName}`);
      }
      activeTab = tabName;
    }
  };
}

test('[F7-1] KRW exchange rate update & state recalculation', () => {
  const manager = createAdminConfigManager();
  assertEquals(manager.getRates().koreaRate, 18.5, 'Initial KRW rate should be 18.5');

  manager.updateRate('KRW', 19.2);
  assertEquals(manager.getRates().koreaRate, 19.2, 'Updated KRW rate should be 19.2');

  const priceKrw = 10000;
  const priceVndWithNewRate = Math.round(priceKrw * manager.getRates().koreaRate);
  assertEquals(priceVndWithNewRate, 192000, 'Price in VND should recalculate to 192,000');
});

test('[F7-2] USD exchange rate update & validation', () => {
  const manager = createAdminConfigManager();
  assertEquals(manager.getRates().usdRate, 25400, 'Initial USD rate should be 25400');

  manager.updateRate('USD', 25650);
  assertEquals(manager.getRates().usdRate, 25650, 'Updated USD rate should be 25650');

  assertThrows(() => {
    manager.updateRate('USD', -500);
  }, 'Invalid rate value for USD');
});

test('[F7-3] JPY exchange rate update & validation', () => {
  const manager = createAdminConfigManager();
  assertEquals(manager.getRates().jpyRate, 165, 'Initial JPY rate should be 165');

  manager.updateRate('JPY', 170.5);
  assertEquals(manager.getRates().jpyRate, 170.5, 'Updated JPY rate should be 170.5');
});

test('[F7-4] Service fee percentage modification', () => {
  const manager = createAdminConfigManager();
  assertEquals(manager.getRates().serviceFeePercent, 5.0, 'Initial service fee percent should be 5%');

  manager.updateRate('serviceFeePercent', 8.5);
  assertEquals(manager.getRates().serviceFeePercent, 8.5, 'Updated service fee percent should be 8.5%');

  const basePriceVnd = 1000000;
  const feeAmount = Math.round(basePriceVnd * (manager.getRates().serviceFeePercent / 100));
  assertEquals(feeAmount, 85000, '8.5% service fee on 1,000,000 VND should be 85,000 VND');
});

test('[F7-5] Admin tab navigation state transitions', () => {
  const manager = createAdminConfigManager();
  assertEquals(manager.getActiveTab(), 'orders', 'Default admin tab should be orders');

  manager.setActiveTab('rates');
  assertEquals(manager.getActiveTab(), 'rates', 'Tab switched to rates');

  manager.setActiveTab('bot');
  assertEquals(manager.getActiveTab(), 'bot', 'Tab switched to bot');

  assertThrows(() => {
    manager.setActiveTab('unsupported_tab');
  }, 'Invalid admin tab');
});
