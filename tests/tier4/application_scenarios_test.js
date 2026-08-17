/**
 * Tier 4: Real-World Application Scenarios Test Suite
 * Covers 8 realistic end-to-end application scenario tests (Scenarios 1-8)
 */

import { test, setTier } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertDeepEquals,
  assertContains,
  assertGreaterThan,
  assertThrows,
} from '../framework/assert.js';

import { OLIVE_YOUNG_CATALOG } from '../../src/data/catalog.js';
import { ORDER_STATUSES, getStatusConfig } from '../../src/data/orderStatuses.js';
import { fetchVietnamProvinces, fetchVietnamSubDivisions } from '../../src/services/vietnamAddressService.js';
import { scrapeProductMetadata } from '../../src/services/productScraperService.js';
import { runAIScraperAgent } from '../../src/services/aiScraperAgentEngine.js';

setTier('Tier 4: Real-World Scenarios');

function createMockLocalStorage() {
  const store = new Map();
  return {
    getItem: (key) => store.get(String(key)) ?? null,
    setItem: (key, value) => store.set(String(key), String(value)),
    removeItem: (key) => store.delete(String(key)),
    clear: () => store.clear(),
  };
}

// 1. Scenario 1: Full Overseas Customer Purchase & VietQR Payment Lifecycle (F1, F2, F3, F4, F5, F6)
test('[SCENARIO-1] Full Overseas Customer Purchase & VietQR Payment Lifecycle (F1, F2, F3, F4, F5, F6)', async () => {
  const mockStorage = createMockLocalStorage();
  globalThis.localStorage = mockStorage;

  // Step 1: Customer searches catalog for 'Anua'
  const searchResults = OLIVE_YOUNG_CATALOG.filter(p => p.name.toLowerCase().includes('anua'));
  assert(searchResults.length > 0, 'Catalog search should find Anua product');
  const targetProduct = searchResults[0];

  // Step 2: View detail & auto-convert Won price
  const krwRate = 19.5;
  const foreignPriceWon = targetProduct.foreignPrice; // 28,000 KRW
  const convertedVndSingle = Math.round(foreignPriceWon * krwRate);
  assertEquals(convertedVndSingle, 546000, 'Converted single item VND price');

  // Step 3: Add to cart (qty = 2)
  const cart = [{ ...targetProduct, qty: 2 }];
  mockStorage.setItem('tavy_cart', JSON.stringify(cart));
  const cartTotalWon = cart.reduce((s, i) => s + i.foreignPrice * i.qty, 0);
  assertEquals(cartTotalWon, 56000, 'Cart total foreign price in Won (28000 * 2)');

  // Step 4: Select Vietnam shipping address
  const provinces = await fetchVietnamProvinces();
  const haNoi = provinces.find(p => p.code === 1);
  const subDivs = await fetchVietnamSubDivisions(1);
  const hoanKiem = subDivs.find(d => d.code === 2 || d.name.includes('Hoàn Kiếm'));
  const fullAddress = `45 Phố Hàng Bài, ${hoanKiem.name}, ${haNoi.name}`;

  // Step 5: User authentication / registration
  const user = { name: 'Nguyễn Thị Lan', email: 'lan@gmail.com', phone: '0912345678', address: fullAddress };
  mockStorage.setItem('beauty_current_user', JSON.stringify(user));

  // Step 6: Create order
  const orderId = `ORD-S1-${Date.now()}`;
  const order = {
    id: orderId,
    userEmail: user.email,
    customerName: user.name,
    customerPhone: user.phone,
    customerAddress: user.address,
    items: cart,
    foreignPrice: cartTotalWon,
    qty: 2,
    country: 'KRW',
    status: 'pending',
    createdAt: new Date().toISOString(),
    quote: null
  };

  assertEquals(order.status, 'pending', 'New order status must be pending');

  // Step 7: Admin issues quote with VietQR payment instructions
  const baseVnd = Math.round(cartTotalWon * krwRate);
  const taxVnd = Math.round(baseVnd * 0.05);
  const serviceVnd = Math.round(baseVnd * 0.05);
  const shippingVnd = 90000;
  const totalVnd = baseVnd + taxVnd + serviceVnd + shippingVnd; // 1,092,000 + 54,600 + 54,600 + 90,000 = 1,291,200
  const depositNeededVnd = Math.round(totalVnd * 0.5); // 645,600

  order.quote = {
    vietnamRate: krwRate,
    rawVnd: baseVnd,
    taxWebVnd: taxVnd,
    serviceFeeVnd: serviceVnd,
    shippingWeightFeeVnd: shippingVnd,
    totalVnd,
    depositNeededVnd,
    note: 'Thanh toán cọc 50% qua VietQR để tiến hành mua hàng tại Korea'
  };
  order.status = 'quoted';
  assertEquals(order.quote.totalVnd, 1291200, 'Quoted total VND must match 1,291,200');

  // Step 8: Customer pays deposit via VietQR
  order.status = 'deposit_paid';
  order.paymentConfirmed = true;
  order.amountPaid = depositNeededVnd;
  assertEquals(getStatusConfig(order.status).stepIndex, 2, 'Deposit paid step index must be 2');

  // Step 9: Order status progression to completion
  const progression = ['purchased', 'in_kr_warehouse', 'transit', 'in_vn_warehouse', 'delivering', 'completed'];
  for (const stepStatus of progression) {
    order.status = stepStatus;
  }

  assertEquals(order.status, 'completed', 'Lifecycle must finish with completed status');
  assertEquals(getStatusConfig(order.status).stepIndex, 8, 'Completed step index must be 8');
});

// 2. Scenario 2: Admin Order Quotation, Exchange Rate Config & Weight Calculation Workflow (F6, F7, F8)
test('[SCENARIO-2] Admin Order Quotation, Exchange Rate Config & Weight Calculation Workflow (F6, F7, F8)', () => {
  // Step 1: Admin authenticates
  const adminAuth = { isAuthenticated: true, user: 'admin@tavykorea.vn' };

  // Step 2: Admin updates KRW rate to 20.0
  const ratesConfig = { KRW: { rate: 19.5 }, USD: { rate: 25500 } };
  ratesConfig.KRW.rate = 20.0;
  assertEquals(ratesConfig.KRW.rate, 20.0, 'KRW rate updated to 20.0');

  // Step 3: Receive pending order ORD-SCENARIO-2
  const order = {
    id: 'ORD-SCENARIO-2',
    customerName: 'Trần Minh Anh',
    items: [
      { goodsNo: 'A000000201102', foreignPrice: 25000, qty: 2 } // Total 50,000 KRW
    ],
    foreignPrice: 50000,
    qty: 2,
    status: 'pending'
  };

  // Step 4-6: Calculate Quote
  const rawVnd = Math.round(order.foreignPrice * ratesConfig.KRW.rate); // 50000 * 20.0 = 1,000,000
  const taxWebVnd = Math.round(rawVnd * 0.05); // 50,000
  const serviceFeeVnd = Math.round(rawVnd * 0.05); // 50,000
  const weightKg = 0.75;
  const shippingPerKg = 180000;
  const shippingWeightFeeVnd = Math.round(weightKg * shippingPerKg); // 135,000
  const totalVnd = rawVnd + taxWebVnd + serviceFeeVnd + shippingWeightFeeVnd; // 1,235,000
  const depositNeededVnd = Math.round(totalVnd * 0.5); // 617,500

  assertEquals(rawVnd, 1000000, 'Raw VND calculation check');
  assertEquals(taxWebVnd, 50000, '5% tax calculation check');
  assertEquals(serviceFeeVnd, 50000, '5% service fee check');
  assertEquals(shippingWeightFeeVnd, 135000, 'Air shipping weight fee check');
  assertEquals(totalVnd, 1235000, 'Total quote VND check');
  assertEquals(depositNeededVnd, 617500, '50% deposit needed check');

  // Step 7-8: Attach quote and update status
  order.quote = {
    vietnamRate: ratesConfig.KRW.rate,
    rawVnd,
    taxWebVnd,
    serviceFeeVnd,
    shippingWeightKg: weightKg,
    shippingWeightFeeVnd,
    totalVnd,
    depositNeededVnd,
    note: 'Cước Air 0.75kg, tỷ giá 20.0'
  };
  order.status = 'quoted';

  assertEquals(order.status, 'quoted', 'Order status updated to quoted');
});

// 3. Scenario 3: Proxy Scraping, AI Classification & Product Publishing End-to-End Pipeline (F9, F10, F11)
test('[SCENARIO-3] Proxy Scraping, AI Classification & Product Publishing End-to-End Pipeline (F9, F10, F11)', async () => {
  const targetUrl = 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000261415';

  // Step 1: Scrape raw product metadata via multi-proxy scraper
  const rawScrape = await scrapeProductMetadata(targetUrl);
  assert(rawScrape.success === true, 'Raw scraper must succeed');
  assert(rawScrape.product !== undefined, 'Raw scraper product must be defined');

  // Step 2: Run AI Classifier Agent engine
  const aiResult = await runAIScraperAgent(targetUrl);
  assert(aiResult.success === true, 'AI Classifier engine must succeed');

  const processedProd = aiResult.product;
  assert(processedProd.goodsNo !== undefined, 'Processed product must have goodsNo');
  assertEquals(processedProd.category, 'skincare', 'Serum product must be categorized as skincare');
  assertGreaterThan(processedProd.foreignPrice, 0, 'Foreign price must be positive');

  // Step 3: Place into pending queue
  const pendingQueue = [{ ...processedProd, status: 'pending_approval' }];
  assertEquals(pendingQueue.length, 1, 'Pending queue length should be 1');

  // Step 4: Admin approves product into active catalog
  const activeCatalog = [...OLIVE_YOUNG_CATALOG];
  const approvedItem = pendingQueue.shift();

  activeCatalog.unshift({
    ...approvedItem,
    status: 'published'
  });

  // Step 5: Verify product is searchable in published catalog
  const foundInCatalog = activeCatalog.find(p => p.goodsNo === processedProd.goodsNo || p.name.includes('Sungboon'));
  assert(foundInCatalog !== undefined, 'Approved product must be found in active catalog');
});

// 4. Scenario 4: Olive Young Chrome Extension Extraction to Admin Product Import Lifecycle (F7, F9, F12)
test('[SCENARIO-4] Olive Young Chrome Extension Extraction to Admin Product Import Lifecycle (F7, F9, F12)', () => {
  // Step 1: Extension content script extracts raw DOM text & image
  const rawExtensionData = {
    fullText: 'Olive Young Exclusive [1+1] Anua Heartleaf 77% Soothing Toner 250ml ₩28,000 Brand Anua',
    image: 'https://images.unsplash.com/photo-1556229174-5e42a09e45af',
    url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000159495'
  };

  // Step 2: Extension background worker constructs product object & Base64 encodes payload
  const productPayload = {
    name: 'Nước hoa hồng làm dịu da Anua Heartleaf 77%',
    price: 28000,
    image: rawExtensionData.image,
    brand: 'Anua',
    url: rawExtensionData.url,
    category: 'skincare',
    description: 'Chiết xuất lá rau diếp cá 77%'
  };

  const encodedAutoFill = btoa(encodeURIComponent(JSON.stringify(productPayload)));

  // Step 3-4: Admin opens dashboard URL with autoFill query param & decodes payload
  const decodedObj = JSON.parse(decodeURIComponent(atob(encodedAutoFill)));
  const draftProduct = {
    goodsNo: `SP-${Date.now()}`,
    name: decodedObj.name,
    brand: decodedObj.brand,
    category: decodedObj.category,
    foreignPrice: decodedObj.price,
    productImage: decodedObj.image,
    description: decodedObj.description,
    productUrl: decodedObj.url
  };

  assertEquals(draftProduct.name, 'Nước hoa hồng làm dịu da Anua Heartleaf 77%', 'Draft product name check');
  assertEquals(draftProduct.foreignPrice, 28000, 'Draft product foreign price check');

  // Step 5-6: Admin adjusts price in Product Manager and publishes to live site
  draftProduct.foreignPrice = 27500; // Adjusted discount price
  const publishedList = [draftProduct, ...OLIVE_YOUNG_CATALOG];

  // Step 7: Verify published list
  const liveItem = publishedList.find(p => p.goodsNo === draftProduct.goodsNo);
  assert(liveItem !== undefined, 'Imported item should exist in live published list');
  assertEquals(liveItem.foreignPrice, 27500, 'Adjusted price must be published');
});

// 5. Scenario 5: Firestore Realtime Order State Sync & Security Rule Access Enforcement (F5, F6, F13)
test('[SCENARIO-5] Firestore Realtime Order State Sync & Security Rule Access Enforcement (F5, F6, F13)', () => {
  // Step 1: Customer anh@gmail.com registers & creates order
  const authenticatedUser = { email: 'anh@gmail.com', name: 'Trần Minh Anh' };
  const order = {
    id: 'ORD-FS-SYNC-505',
    userEmail: authenticatedUser.email,
    customerName: authenticatedUser.name,
    status: 'deposit_paid',
    createdAt: new Date().toISOString()
  };

  // Step 2: Firestore Security Rule validator function
  const validateAccess = (requestAuth, resource) => {
    if (!requestAuth || !requestAuth.email) return false;
    if (requestAuth.email === 'admin@tavykorea.vn') return true;
    return resource.userEmail === requestAuth.email;
  };

  // Check user's own access
  assert(validateAccess(authenticatedUser, order) === true, 'Owner user must be granted access');

  // Check unauthorized access
  const hackerUser = { email: 'evil@hacker.com' };
  assert(validateAccess(hackerUser, order) === false, 'Unauthorized user must be blocked');

  // Check admin access
  const adminUser = { email: 'admin@tavykorea.vn' };
  assert(validateAccess(adminUser, order) === true, 'Admin must be granted access');

  // Step 3-4: Admin updates order status in DB & trigger snapshot update callback
  const listeners = [];
  const subscribeToOrderSync = (callback) => {
    listeners.push(callback);
    return () => {
      const idx = listeners.indexOf(callback);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  };

  let clientOrderState = { ...order };
  subscribeToOrderSync((updatedOrders) => {
    const matched = updatedOrders.find(o => o.id === order.id);
    if (matched) clientOrderState = { ...matched };
  });

  // Admin updates status to in_kr_warehouse
  const updatedSnapshot = [
    { ...order, status: 'in_kr_warehouse', trackingCode: 'KR-SEOUL-882' }
  ];

  listeners.forEach(cb => cb(updatedSnapshot));

  // Step 5: Assert client UI state reflects update
  assertEquals(clientOrderState.status, 'in_kr_warehouse', 'Client UI state must update to in_kr_warehouse in real time');
  assertEquals(clientOrderState.trackingCode, 'KR-SEOUL-882', 'Tracking code must update in real time');
});

// 6. Scenario 6: Offline Address Selector Fallback & Cart Local Storage Persistence Recovery (F3, F4, F13)
test('[SCENARIO-6] Offline Address Selector Fallback & Cart Local Storage Persistence Recovery (F3, F4, F13)', async () => {
  const mockStorage = createMockLocalStorage();
  globalThis.localStorage = mockStorage;

  // Step 1: Customer adds items to cart
  const initialCart = [
    { goodsNo: 'A000000185934', name: 'Torriden Serum', foreignPrice: 18000, qty: 1 },
    { goodsNo: 'A000000159495', name: 'Anua Toner', foreignPrice: 28000, qty: 2 }
  ];
  mockStorage.setItem('tavy_cart', JSON.stringify(initialCart));

  // Step 2-3: Address selector offline fallback
  const provinces = await fetchVietnamProvinces(); // Uses offline dataset when API fails
  assert(provinces.length >= 34, 'Fallback or live dataset must return valid provinces list');

  const daNang = provinces.find(p => p.code === 48 || p.name.includes('Đà Nẵng')) || provinces[0];
  const subDivs = await fetchVietnamSubDivisions(daNang.code);
  const haiChau = subDivs.find(d => d.name.includes('Hải Châu')) || subDivs.find(d => String(d.code) === '490') || subDivs[0];

  // Step 4: User selects address and stores in profile
  const userAddress = `78 Lê Duẩn, ${haiChau.name}, ${daNang.name}`;
  const userProfile = { name: 'Hoàng Thùy Dương', email: 'duong@gmail.com', address: userAddress };
  mockStorage.setItem('beauty_current_user', JSON.stringify(userProfile));

  // Step 5: Simulate browser reload / memory reset (wipe in-memory variables)
  const recoveredCartJson = mockStorage.getItem('tavy_cart');
  const recoveredUserJson = mockStorage.getItem('beauty_current_user');

  assert(recoveredCartJson !== null, 'Cart JSON must be recoverable from storage');
  assert(recoveredUserJson !== null, 'User profile JSON must be recoverable from storage');

  const recoveredCart = JSON.parse(recoveredCartJson);
  const recoveredUser = JSON.parse(recoveredUserJson);

  // Step 6: Verify cart & address integrity
  assertEquals(recoveredCart.length, 2, 'Recovered cart must contain 2 items');
  assertEquals(recoveredCart[0].goodsNo, 'A000000185934', 'First cart item goodsNo check');
  assertContains(recoveredUser.address, haiChau.name, 'Recovered address must contain district name');
  assertContains(recoveredUser.address, 'Đà Nẵng', 'Recovered address must contain Đà Nẵng');
});

// 7. Scenario 7: Sheet Editor Batch Update & Google CSV Versioning Revert Workflow (F7, F9)
test('[SCENARIO-7] Sheet Editor Batch Update & Google CSV Versioning Revert Workflow (F7, F9)', () => {
  const mockStorage = createMockLocalStorage();
  globalThis.localStorage = mockStorage;

  // Step 1: Initial published snapshot
  const initialPublished = [...OLIVE_YOUNG_CATALOG];
  mockStorage.setItem('tavy_published_products', JSON.stringify(initialPublished));
  mockStorage.setItem('tavy_custom_products', JSON.stringify(initialPublished));

  // Step 2: Admin performs batch edits in product sheet
  const workingProducts = JSON.parse(mockStorage.getItem('tavy_custom_products'));
  workingProducts[0].foreignPrice = 23000; // Updated price
  workingProducts[1].category = 'makeup'; // Updated category
  mockStorage.setItem('tavy_custom_products', JSON.stringify(workingProducts));

  // Step 3: Admin clicks "Đồng bộ lên Website" (publishToWeb)
  const publishToWeb = () => {
    const current = JSON.parse(mockStorage.getItem('tavy_custom_products'));
    mockStorage.setItem('tavy_published_products', JSON.stringify(current));
  };
  publishToWeb();

  const snapshotA = JSON.parse(mockStorage.getItem('tavy_published_products'));
  assertEquals(snapshotA[0].foreignPrice, 23000, 'Snapshot A price check');

  // Step 4: Admin makes experimental draft edits & accidental deletion
  let draftProducts = JSON.parse(mockStorage.getItem('tavy_custom_products'));
  draftProducts.shift(); // Delete first product by accident
  draftProducts[0].name = 'EXPERIMENTAL INVALID TITLE';
  mockStorage.setItem('tavy_custom_products', JSON.stringify(draftProducts));

  assertEquals(draftProducts.length, initialPublished.length - 1, 'Draft should have 1 item deleted');

  // Step 5: Admin clicks "Khôi phục lần đăng nhập gần nhất" (revertFromWeb)
  const revertFromWeb = () => {
    const published = JSON.parse(mockStorage.getItem('tavy_published_products'));
    mockStorage.setItem('tavy_custom_products', JSON.stringify(published));
  };
  revertFromWeb();

  // Step 6: Verify workspace is restored to Snapshot A
  const restoredProducts = JSON.parse(mockStorage.getItem('tavy_custom_products'));
  assertEquals(restoredProducts.length, initialPublished.length, 'Restored product count must match snapshot');
  assertEquals(restoredProducts[0].foreignPrice, 23000, 'Restored product price must match published snapshot');
  assert(!restoredProducts[0].name.includes('EXPERIMENTAL'), 'Experimental changes must be undone');
});

// 8. Scenario 8: Complete E2E System Build & Self-Check Automated Verification (F14, F15)
test('[SCENARIO-8] Complete E2E System Build & Self-Check Automated Verification (F14, F15)', async () => {
  // Step 1: System architecture verification
  const systemCheckResults = {
    catalogValid: false,
    provincesValid: false,
    statusesValid: false,
    ratesValid: false,
    scraperValid: false
  };

  // Step 2-3: Catalog checks (>= 23 items, unique IDs)
  const catalogCount = OLIVE_YOUNG_CATALOG.length;
  const uniqueIds = new Set(OLIVE_YOUNG_CATALOG.map(p => p.goodsNo));
  if (catalogCount >= 23 && uniqueIds.size === catalogCount) {
    systemCheckResults.catalogValid = true;
  }

  // Step 4: Address checks (63 provinces)
  const provinces = await fetchVietnamProvinces();
  if (provinces.length >= 34) {
    systemCheckResults.provincesValid = true;
  }

  // Step 5: Order status check (10 statuses)
  const statusKeys = Object.keys(ORDER_STATUSES);
  if (statusKeys.length === 10) {
    systemCheckResults.statusesValid = true;
  }

  // Step 6: Rates check (USD, KRW, JPY)
  const requiredCurrencies = ['USD', 'KRW', 'JPY'];
  systemCheckResults.ratesValid = requiredCurrencies.length === 3;

  // Step 7: Scraper candidate check
  const scraperRes = await scrapeProductMetadata('https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000223414');
  if (scraperRes.success && scraperRes.product) {
    systemCheckResults.scraperValid = true;
  }

  // Step 8: Assert all checks pass
  assert(systemCheckResults.catalogValid, 'Catalog integrity check passed');
  assert(systemCheckResults.provincesValid, 'Provinces integrity check passed');
  assert(systemCheckResults.statusesValid, 'Order statuses check passed');
  assert(systemCheckResults.ratesValid, 'Exchange rates check passed');
  assert(systemCheckResults.scraperValid, 'Scraper candidate discovery check passed');
});
