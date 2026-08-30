import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertDeepEquals,
  assertGreaterThan,
  assertContains
} from '../framework/assert.js';
import {
  calculateVndPrice,
  syncProductPriceWithOliveYoung,
  syncAllProductsWithOliveYoung,
  getOliveYoungVerifiedPrice
} from '../../src/services/oliveYoungPriceSyncService.js';
import {
  getPriceSyncConfig,
  savePriceSyncConfig,
  clearPriceSyncLogs,
  getRecentPriceAlerts,
  executeAutoPriceSync
} from '../../src/services/autoScraperBotService.js';

setTier('Tier 1: Feature Coverage');

test('[F22-1] calculateVndPrice accurately calculates estimated VND from Won, rate, and fee', () => {
  // 10,000 KRW * 19.5 * 1.05 = 204,750 VND
  const price1 = calculateVndPrice(10000, 19.5, 5);
  assertEquals(price1, 204750, 'Standard 10k KRW price with 19.5 rate & 5% fee should be 204,750 VND');

  // 25,000 KRW * 20.0 * 1.10 = 550,000 VND
  const price2 = calculateVndPrice(25000, 20.0, 10);
  assertEquals(price2, 550000, 'Custom 25k KRW with 20.0 rate & 10% fee should be 550,000 VND');

  // Edge cases
  assertEquals(calculateVndPrice(0, 19.5, 5), 0, 'Zero won should produce 0 VND');
  assertEquals(calculateVndPrice(null, 19.5, 5), 0, 'Null won should produce 0 VND');
});

test('[F22-2] syncProductPriceWithOliveYoung detects price drop, creates priceHistory entry & badge', () => {
  const initialProduct = {
    goodsNo: 'A000000223414',
    name: 'Mặt Nạ Giấy Mediheal Essential Sheet Mask',
    foreignPrice: 15000, // Old price
    price: 15000,
    priceVnd: 300000,
    category: 'cosmetics'
  };

  // A000000223414 verified price is 10,000 KRW (Drop from 15,000 -> 10,000: -33.3%)
  const synced = syncProductPriceWithOliveYoung(initialProduct, { krwRate: 19.5, serviceFeePercent: 5 });

  assertEquals(synced.foreignPrice, 10000, 'Synced foreign price should be 10,000 KRW');
  assertEquals(synced.priceSyncStatus, 'synced_oliveyoung', 'Status should be synced_oliveyoung');
  assert(Array.isArray(synced.priceHistory), 'priceHistory must be an array');
  assertEquals(synced.priceHistory.length, 1, 'priceHistory should have 1 recorded entry');

  const historyEntry = synced.priceHistory[0];
  assertEquals(historyEntry.oldForeignPrice, 15000, 'oldForeignPrice should be 15,000');
  assertEquals(historyEntry.newForeignPrice, 10000, 'newForeignPrice should be 10,000');
  assertEquals(historyEntry.changeType, 'drop', 'changeType must be "drop"');
  assertEquals(historyEntry.changePercent, -33.3, 'changePercent should be -33.3%');

  assert(synced.priceChangeAlert.hasChanged, 'priceChangeAlert.hasChanged must be true');
  assertEquals(synced.priceChangeAlert.changeType, 'drop', 'priceChangeAlert.changeType should be "drop"');
  assertContains(synced.priceChangeAlert.badgeText, '33.3%', 'Badge text must mention 33.3%');
});

test('[F22-3] syncProductPriceWithOliveYoung detects price increase from live scrape', () => {
  const initialProduct = {
    goodsNo: 'CUSTOM_SKU_99',
    name: 'Kem Dưỡng Da Cao Cấp Hàn Quốc',
    foreignPrice: 20000,
    price: 20000,
    category: 'cosmetics'
  };

  // Live scrape returned 25,000 KRW (+25% increase)
  const synced = syncProductPriceWithOliveYoung(initialProduct, {
    krwRate: 19.5,
    serviceFeePercent: 5,
    scrapedWon: 25000
  });

  assertEquals(synced.foreignPrice, 25000, 'New foreign price should be 25,000 KRW');
  assertEquals(synced.priceSyncStatus, 'synced_live_scrape', 'Status should be synced_live_scrape');
  assertEquals(synced.priceHistory.length, 1, 'priceHistory should record the increase');

  const historyEntry = synced.priceHistory[0];
  assertEquals(historyEntry.changeType, 'increase', 'changeType should be "increase"');
  assertEquals(historyEntry.changePercent, 25.0, 'changePercent should be +25%');
  assertEquals(synced.priceChangeAlert.changeType, 'increase', 'Alert changeType should be increase');
});

test('[F22-4] syncAllProductsWithOliveYoung tracks both drops & increases across inventory catalog', () => {
  const mockCatalog = [
    { goodsNo: 'A000000223414', name: 'Mediheal Mask', foreignPrice: 20000, price: 20000 }, // Will drop to 10,000 (-50%)
    { goodsNo: 'A000000260530', name: 'Beplain Mask', foreignPrice: 5000, price: 5000 },     // Will increase to 7,100 (+42%)
    { goodsNo: 'A000000117541', name: 'ULOS All-In-One', foreignPrice: 23700, price: 23700 } // Unchanged (23,700)
  ];

  const result = syncAllProductsWithOliveYoung(mockCatalog, { krwRate: 19.5, serviceFeePercent: 5 });

  assertEquals(result.totalScanned, 3, 'Should have scanned 3 products');
  assertEquals(result.updatedCount, 2, '2 products should have price changes');
  assertEquals(result.priceDropsCount, 1, '1 product should be recorded as a price drop');
  assertEquals(result.priceIncreasesCount, 1, '1 product should be recorded as a price increase');
  assertEquals(result.verifiedCount, 3, 'All 3 items are in verified catalog');
});

test('[F22-5] getRecentPriceAlerts extracts products with active price alerts', () => {
  const products = [
    { goodsNo: 'P1', name: 'Item 1', priceChangeAlert: { hasChanged: true, changePercent: -15, changeType: 'drop' } },
    { goodsNo: 'P2', name: 'Item 2', priceChangeAlert: { hasChanged: false } },
    { goodsNo: 'P3', name: 'Item 3', priceHistory: [{ changePercent: 12, changeType: 'increase' }] }
  ];

  const alerts = getRecentPriceAlerts(products);
  assertEquals(alerts.length, 2, 'Should filter 2 products with active price changes');
  assertEquals(alerts[0].goodsNo, 'P1', 'First alert is P1');
  assertEquals(alerts[1].goodsNo, 'P3', 'Second alert is P3');
});

test('[F22-6] Scheduler configuration & log management via autoScraperBotService', () => {
  savePriceSyncConfig({
    enabled: true,
    intervalHours: 6,
    lastSyncTime: '2026-08-30T10:00:00.000Z',
    logs: [{ id: 'L1', text: 'Test log entry' }]
  });

  const config = getPriceSyncConfig();
  assertEquals(config.enabled, true, 'Scheduler should be enabled');
  assertEquals(config.intervalHours, 6, 'Scheduler interval should be 6 hours');
  assertEquals(config.intervalMins, 360, 'Scheduler interval mins should be 360');
  assertEquals(config.logs.length, 1, 'Logs count should be 1');

  clearPriceSyncLogs();
  const cleared = getPriceSyncConfig();
  assertEquals(cleared.logs.length, 0, 'Logs should be empty after clearPriceSyncLogs');
});
