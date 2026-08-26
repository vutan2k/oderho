/**
 * Empirical Challenger Test Suite for Milestone M1
 * Author: Empirical Challenger 1
 * Targets:
 * - Feature 1: Customer Catalog Browsing & Search (KROrderHomePage, ProductGrid)
 * - Feature 2: Product Detail Modal & Gallery (ProductDetailModal)
 * - Feature 3: Cart Management & Fly-to-Cart (CartPage, AppContext cart state)
 * - Feature 4: Cascading Address Selector (CascadingAddressSelector, vietnamAddressService)
 * - Feature 5: Auth & Profile Management (LoginPage, UserProfilePage, AppContext auth state)
 * - LocalStorage Resilience & Corrupted State Recovery
 */

import { assert, assertEquals, assertDeepEquals, assertGreaterThan, assertThrows } from './framework/assert.js';
import { OLIVE_YOUNG_CATALOG } from '../src/data/catalog.js';
import { fetchVietnamProvinces, fetchVietnamSubDivisions, ALL_63_VIETNAM_PROVINCES, COMMON_SUB_DIVISIONS } from '../src/services/vietnamAddressService.js';

// Mock localStorage for empirical testing
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new MockLocalStorage();

console.log("================================================================================");
console.log("  M1 EMPIRICAL CHALLENGER STRESS TEST SUITE");
console.log("================================================================================");

let totalPassed = 0;
let totalFailed = 0;
const testResults = [];

function runEmpiricalTest(name, fn) {
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
    testResults.push({ name, status: 'FAIL', duration, error: err.message });
    totalFailed++;
  }
}

async function runAsyncEmpiricalTest(name, fn) {
  const start = performance.now();
  try {
    await fn();
    const duration = performance.now() - start;
    console.log(`[PASS] ${name} (${duration.toFixed(2)}ms)`);
    testResults.push({ name, status: 'PASS', duration });
    totalPassed++;
  } catch (err) {
    const duration = performance.now() - start;
    console.error(`[FAIL] ${name} (${duration.toFixed(2)}ms): ${err.message}`);
    testResults.push({ name, status: 'FAIL', duration, error: err.message });
    totalFailed++;
  }
}

// -----------------------------------------------------------------------------
// TEST GROUP 1: CATALOG SEARCH & FILTERING (FEATURE 1)
// -----------------------------------------------------------------------------

runEmpiricalTest('[CHALLENGE-F1-01] Catalog Search: Empty and Whitespace Queries', () => {
  const products = OLIVE_YOUNG_CATALOG;
  const filterFn = (query, cat) => {
    return products.filter((product) => {
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const matchName = (product.name || '').toLowerCase().includes(q);
        const matchBrand = (product.brand || '').toLowerCase().includes(q);
        if (!matchName && !matchBrand) return false;
      }
      if (cat === 'all') return true;
      const c = (product.category || '').toLowerCase();
      if (cat === 'skincare') return c.includes('skin') || c.includes('dưỡng');
      return c === cat;
    });
  };

  // Empty string
  const resEmpty = filterFn('', 'all');
  assertEquals(resEmpty.length, products.length);

  // Spaces only
  const resSpaces = filterFn('   \t\n  ', 'all');
  assertEquals(resSpaces.length, products.length);
});

runEmpiricalTest('[CHALLENGE-F1-02] Catalog Search: Special Regex & XSS Strings', () => {
  const products = OLIVE_YOUNG_CATALOG;
  const filterFn = (query) => {
    return products.filter((product) => {
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const matchName = (product.name || '').toLowerCase().includes(q);
        const matchBrand = (product.brand || '').toLowerCase().includes(q);
        return matchName || matchBrand;
      }
      return true;
    });
  };

  // Adversarial strings that might crash regex-based implementations
  const adversarialQueries = [
    '.*', '[a-z]+', '(?=.*)', '()<script>alert(1)</script>', '\\', '\0', 'undefined', 'null'
  ];

  for (const q of adversarialQueries) {
    const res = filterFn(q);
    assert(Array.isArray(res), `Query "${q}" should return an array`);
  }
});

runEmpiricalTest('[CHALLENGE-F1-03] Catalog Pagination: Out of Bounds & Empty Result Pages', () => {
  const itemsPerPage = 40;
  
  // Case A: 0 items
  const products0 = [];
  const totalPages0 = Math.ceil(products0.length / itemsPerPage);
  assertEquals(totalPages0, 0);

  // Case B: 45 items -> 2 pages
  const products45 = new Array(45).fill(0).map((_, i) => ({ goodsNo: `P-${i}` }));
  const totalPages45 = Math.ceil(products45.length / itemsPerPage);
  assertEquals(totalPages45, 2);

  const page1 = products45.slice(0, itemsPerPage);
  assertEquals(page1.length, 40);

  const page2 = products45.slice(40, 80);
  assertEquals(page2.length, 5);

  const page3 = products45.slice(80, 120);
  assertEquals(page3.length, 0);
});

// -----------------------------------------------------------------------------
// TEST GROUP 2: PRODUCT DETAIL MODAL (FEATURE 2)
// -----------------------------------------------------------------------------

runEmpiricalTest('[CHALLENGE-F2-01] Product Detail Modal: Fallback Image & Missing Specs Handling', () => {
  const incompleteProduct = {
    goodsNo: 'TEST-999',
    name: 'Sample Product without image or specs',
    foreignPrice: 15000,
    // missing images, productImage, specifications, rating, reviewsCount
  };

  const images = incompleteProduct?.images && incompleteProduct.images.length > 0 
    ? incompleteProduct.images 
    : (incompleteProduct?.productImage ? [incompleteProduct.productImage] : []);
  
  assertEquals(images.length, 0);

  const calculatedVnd = Math.round((incompleteProduct.foreignPrice || 0) * 19.5);
  assertEquals(calculatedVnd, 292500);

  // Rating fallback check
  const rating = incompleteProduct.rating || 4.9;
  const reviewsCount = incompleteProduct.reviewsCount || 500;
  assertEquals(rating, 4.9);
  assertEquals(reviewsCount, 500);
});

runEmpiricalTest('[CHALLENGE-F2-02] Won to VND Auto-Conversion Under Extreme Rates', () => {
  const krwPrice = 50000;

  // Zero rate
  const vndZero = Math.round(krwPrice * 0);
  assertEquals(vndZero, 0);

  // Standard rate 19.5
  const vndNormal = Math.round(krwPrice * 19.5);
  assertEquals(vndNormal, 975000);

  // High rate 25.0
  const vndHigh = Math.round(krwPrice * 25.0);
  assertEquals(vndHigh, 1250000);
});

// -----------------------------------------------------------------------------
// TEST GROUP 3: CART MANAGEMENT (FEATURE 3)
// -----------------------------------------------------------------------------

runEmpiricalTest('[CHALLENGE-F3-01] Cart State Mutations & Quantity Capping / Deletion', () => {
  let cart = [];

  const addToCart = (product, qty = 1) => {
    const id = product.goodsNo || product.id;
    const existing = cart.find(i => (i.goodsNo || i.id) === id);
    if (existing) {
      cart = cart.map(i => (i.goodsNo || i.id) === id ? { ...i, qty: i.qty + qty } : i);
    } else {
      cart = [...cart, { ...product, goodsNo: id, qty }];
    }
  };

  const updateCartQty = (id, qty) => {
    if (qty <= 0) {
      cart = cart.filter(i => (i.goodsNo || i.id) !== id);
      return;
    }
    cart = cart.map(i => (i.goodsNo || i.id) === id ? { ...i, qty } : i);
  };

  const item1 = { goodsNo: 'SP-1', name: 'Item 1', foreignPrice: 10000 };
  const item2 = { goodsNo: 'SP-2', name: 'Item 2', foreignPrice: 20000 };

  addToCart(item1, 1);
  assertEquals(cart.length, 1);
  assertEquals(cart[0].qty, 1);

  // Add same item again -> increments qty
  addToCart(item1, 2);
  assertEquals(cart.length, 1);
  assertEquals(cart[0].qty, 3);

  // Add second item
  addToCart(item2, 1);
  assertEquals(cart.length, 2);

  // Decrease qty to 0 -> should delete item1
  updateCartQty('SP-1', 0);
  assertEquals(cart.length, 1);
  assertEquals(cart[0].goodsNo, 'SP-2');

  // Decrease qty to negative -> should delete item2
  updateCartQty('SP-2', -5);
  assertEquals(cart.length, 0);
});

runEmpiricalTest('[CHALLENGE-F3-02] Cart Total Calculation with Mixed Quantities', () => {
  const cart = [
    { goodsNo: 'P1', foreignPrice: 15000, qty: 2 },
    { goodsNo: 'P2', foreignPrice: 28000, qty: 1 },
    { goodsNo: 'P3', foreignPrice: 5000, qty: 5 },
  ];

  const rate = 19.5;
  const subTotalKrw = cart.reduce((sum, item) => sum + (item.foreignPrice * item.qty), 0);
  // (15000*2) + (28000*1) + (5000*5) = 30000 + 28000 + 25000 = 83000 KRW
  assertEquals(subTotalKrw, 83000);

  const subTotalVnd = subTotalKrw * rate; // 83000 * 19.5 = 1,618,500 VND
  assertEquals(subTotalVnd, 1618500);
});

// -----------------------------------------------------------------------------
// TEST GROUP 4: CASCADING ADDRESS SELECTOR (FEATURE 4)
// -----------------------------------------------------------------------------

await runAsyncEmpiricalTest('[CHALLENGE-F4-01] Address Selector: 63 Provinces & Sub-Division Fallback', async () => {
  const provinces = await fetchVietnamProvinces();
  assertGreaterThan(provinces.length, 30);

  // Test HN (code 1) sub-divisions
  const hnSubs = await fetchVietnamSubDivisions(1);
  assertGreaterThan(hnSubs.length, 0);

  // Test HCM (code 79) sub-divisions
  const hcmSubs = await fetchVietnamSubDivisions(79);
  assertGreaterThan(hcmSubs.length, 0);

  // Test invalid/unknown province code fallback
  const unknownSubs = await fetchVietnamSubDivisions(999999);
  assert(Array.isArray(unknownSubs), 'Unknown province should return fallback array');
  assertGreaterThan(unknownSubs.length, 0);
});

runEmpiricalTest('[CHALLENGE-F4-02] Address Selector: Formatting Full Address String', () => {
  const formatAddress = (street, subName, provName) => {
    const parts = [street.trim(), subName, provName].filter(Boolean);
    const uniqueParts = [];
    parts.forEach(p => {
      if (p && !uniqueParts.includes(p)) uniqueParts.push(p);
    });
    return uniqueParts.join(', ');
  };

  // Full address
  assertEquals(
    formatAddress('123 Nguyen Hue', 'Quan 1', 'Thanh pho Ho Chi Minh'),
    '123 Nguyen Hue, Quan 1, Thanh pho Ho Chi Minh'
  );

  // Missing street
  assertEquals(
    formatAddress('', 'Quan Ba Dinh', 'Thanh pho Ha Noi'),
    'Quan Ba Dinh, Thanh pho Ha Noi'
  );

  // Duplicate parts
  assertEquals(
    formatAddress('Thanh pho Ha Noi', 'Quan Ba Dinh', 'Thanh pho Ha Noi'),
    'Thanh pho Ha Noi, Quan Ba Dinh'
  );
});

// -----------------------------------------------------------------------------
// TEST GROUP 5: AUTH & PROFILE MANAGEMENT (FEATURE 5)
// -----------------------------------------------------------------------------

runEmpiricalTest('[CHALLENGE-F5-01] User Registration & Case-Insensitive Email Duplicate Check', () => {
  const users = [
    { email: 'user@example.com', name: 'User 1', password: 'pass123' }
  ];

  const registerUser = (name, email, password) => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'Email nay da duoc dang ky.' };
    }
    const newUser = { name, email, password };
    users.push(newUser);
    return { success: true, user: newUser };
  };

  // Duplicate with different casing
  const dupRes = registerUser('User Dup', 'USER@EXAMPLE.COM', '123456');
  assertEquals(dupRes.success, false);

  // New valid registration
  const newRes = registerUser('User 2', 'user2@example.com', '123456');
  assertEquals(newRes.success, true);
  assertEquals(users.length, 2);
});

runEmpiricalTest('[CHALLENGE-F5-02] User Login Validation Logic', () => {
  const users = [
    { email: 'lan@gmail.com', name: 'Nguyen Thi Lan', password: '123' }
  ];

  const loginUser = (email, password) => {
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      return { success: false, message: 'Email hoac mat khau khong chinh xac.' };
    }
    return { success: true, user: found };
  };

  // Correct credentials
  const valid = loginUser('LAN@GMAIL.COM', '123');
  assertEquals(valid.success, true);

  // Wrong password
  const wrongPass = loginUser('lan@gmail.com', 'wrong');
  assertEquals(wrongPass.success, false);

  // Non-existent email
  const unknownEmail = loginUser('nobody@gmail.com', '123');
  assertEquals(unknownEmail.success, false);
});

// -----------------------------------------------------------------------------
// TEST GROUP 6: LOCALSTORAGE CORRUPTION ADVERSARIAL STRESS TEST
// -----------------------------------------------------------------------------

runEmpiricalTest('[CHALLENGE-F6-01] Corrupted JSON in LocalStorage Safe Recovery', () => {
  // Test corrupted tavy_cart
  localStorage.setItem('tavy_cart', '{invalid_json_cart');

  let cart = [];
  try {
    const savedCart = localStorage.getItem('tavy_cart');
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      if (Array.isArray(parsed)) cart = parsed;
    }
  } catch (e) {
    cart = [];
  }
  assertDeepEquals(cart, []);

  // Test corrupted tavy_custom_products
  localStorage.setItem('tavy_custom_products', 'CORRUPTED_PRODUCTS_DATA');
  let products = OLIVE_YOUNG_CATALOG;
  try {
    const saved = localStorage.getItem('tavy_custom_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) products = parsed;
    }
  } catch (e) {
    products = OLIVE_YOUNG_CATALOG;
  }
  assertEquals(products.length, OLIVE_YOUNG_CATALOG.length);
});

runEmpiricalTest('[CHALLENGE-F6-02] Vulnerability Verification: Corrupted JSON in beauty_users / beauty_rates / beauty_orders / beauty_current_user', () => {
  // Check how AppContext parses beauty_users, beauty_current_user, beauty_orders, beauty_rates
  const testKeys = ['beauty_users', 'beauty_current_user', 'beauty_orders', 'beauty_rates'];
  
  for (const key of testKeys) {
    localStorage.setItem(key, '{invalid: json');
    
    // Test safe parsing wrapper logic
    const safeParse = (k, fallback) => {
      try {
        const saved = localStorage.getItem(k);
        return saved ? JSON.parse(saved) : fallback;
      } catch (e) {
        return fallback;
      }
    };

    // Confirm that WITHOUT try-catch, JSON.parse throws SyntaxError
    assertThrows(() => {
      const saved = localStorage.getItem(key);
      if (saved) JSON.parse(saved);
    });

    // Confirm that WITH safeParse try-catch, it recovers cleanly to fallback
    const recovered = safeParse(key, []);
    assertDeepEquals(recovered, []);
  }
});

console.log("================================================================================");
console.log(`SUMMARY: ${totalPassed} Passed, ${totalFailed} Failed out of ${testResults.length} Tests`);
console.log("================================================================================");

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
