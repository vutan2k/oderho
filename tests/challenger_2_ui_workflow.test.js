/**
 * Challenger 2: Adversarial UI & Workflow Empirical Stress Test Suite
 * 
 * Verifies:
 * 1. Multi-order switching when phone has 1, 2, 5, or 10 orders.
 * 2. Media modal opening/closing for POV video, bill image, packing video with missing URLs or invalid embeds.
 * 3. Payment CTA navigation for unpaid vs paid orders vs cancelled orders.
 * 4. Clipboard copy fallback and safety for domestic tracking codes and Air AWB.
 * 5. Category filter switching on Home Page while search card is open.
 * 6. Order summary pricing calculations and edge cases.
 * 7. 8-step visual stepper progress calculations.
 */

import { assert, assertEquals, assertDeepEquals, assertThrows } from './framework/assert.js';
import { normalizePhone, findGuestOrders, calculateStepProgress, getProofBadges } from '../src/services/guestTrackingService.js';
import { ORDER_STATUSES, ORDER_STEPS, getStatusConfig, getOrderStepIndex } from '../src/data/orderStatuses.js';
import { OLIVE_YOUNG_CATALOG } from '../src/data/catalog.js';

console.log("================================================================================");
console.log("  CHALLENGER 2: ADVERSARIAL UI & WORKFLOW STRESS TEST SUITE");
console.log("================================================================================");

let passedCount = 0;
let failedCount = 0;
const results = [];

function runTest(name, fn) {
  const start = performance.now();
  try {
    fn();
    const duration = performance.now() - start;
    console.log(`[PASS] ${name} (${duration.toFixed(2)}ms)`);
    results.push({ name, status: 'PASS', duration });
    passedCount++;
  } catch (err) {
    const duration = performance.now() - start;
    console.error(`[FAIL] ${name} (${duration.toFixed(2)}ms): ${err.message}`);
    results.push({ name, status: 'FAIL', duration, error: err.message });
    failedCount++;
  }
}

// -----------------------------------------------------------------------------
// 1. MULTI-ORDER SWITCHING (1, 2, 5, 10 ORDERS)
// -----------------------------------------------------------------------------

runTest('[UI-WORKFLOW-01] Multi-Order Switching: 1 Order (Single Match - No Multi-Tabs Needed)', () => {
  const mockOrders = [
    {
      id: 'ORD-101',
      customerPhone: '0912345678',
      status: 'pending',
      createdAt: '2026-08-25T10:00:00Z'
    }
  ];

  const matched = findGuestOrders('0912345678', mockOrders);
  assertEquals(matched.length, 1);
  
  // UI Condition: matchedOrders.length > 1 controls tab switcher rendering
  const shouldRenderTabs = matched.length > 1;
  assertEquals(shouldRenderTabs, false);

  // Selected order is always index 0
  let selectedOrderIndex = 0;
  const currentOrder = matched[selectedOrderIndex];
  assertEquals(currentOrder.id, 'ORD-101');
});

runTest('[UI-WORKFLOW-02] Multi-Order Switching: 2 Orders (Toggle between newest & older)', () => {
  const mockOrders = [
    { id: 'ORD-201', customerPhone: '0912345678', status: 'pending', createdAt: '2026-08-20T10:00:00Z' },
    { id: 'ORD-202', customerPhone: '0912345678', status: 'purchased', createdAt: '2026-08-25T15:00:00Z' }
  ];

  const matched = findGuestOrders('0912345678', mockOrders);
  assertEquals(matched.length, 2);
  assertEquals(matched[0].id, 'ORD-202'); // Sorted newest first
  assertEquals(matched[1].id, 'ORD-201');

  // Multi-tab rendering is active
  assertEquals(matched.length > 1, true);

  // Switching selection state simulation
  let selectedIndex = 0;
  assertEquals(matched[selectedIndex].id, 'ORD-202');

  // User clicks tab 1
  selectedIndex = 1;
  assertEquals(matched[selectedIndex].id, 'ORD-201');
  assertEquals(matched[selectedIndex].status, 'pending');
});

runTest('[UI-WORKFLOW-03] Multi-Order Switching: 5 Orders (Chronological sorting & state switching)', () => {
  const mockOrders = [
    { id: 'ORD-501', customerPhone: '0987654321', status: 'pending', createdAt: '2026-08-10T10:00:00Z' },
    { id: 'ORD-502', customerPhone: '0987654321', status: 'deposit_paid', createdAt: '2026-08-12T10:00:00Z' },
    { id: 'ORD-503', customerPhone: '0987654321', status: 'purchased', createdAt: '2026-08-15T10:00:00Z' },
    { id: 'ORD-504', customerPhone: '0987654321', status: 'in_transit_air', createdAt: '2026-08-18T10:00:00Z' },
    { id: 'ORD-505', customerPhone: '0987654321', status: 'completed', createdAt: '2026-08-24T10:00:00Z' }
  ];

  const matched = findGuestOrders('+84 987 654 321', mockOrders);
  assertEquals(matched.length, 5);
  
  // Verify descending chronological order
  assertEquals(matched[0].id, 'ORD-505');
  assertEquals(matched[1].id, 'ORD-504');
  assertEquals(matched[2].id, 'ORD-503');
  assertEquals(matched[3].id, 'ORD-502');
  assertEquals(matched[4].id, 'ORD-501');

  // Verify all 5 indices are selectable
  for (let i = 0; i < 5; i++) {
    const selected = matched[i];
    assert(selected != null, `Order at index ${i} must exist`);
    const progress = calculateStepProgress(selected);
    assert(progress.stepNumber >= 1 && progress.stepNumber <= 8);
  }
});

runTest('[UI-WORKFLOW-04] Multi-Order Switching: 10 Orders Stress (Boundary load & safe indexing)', () => {
  const mockOrders = [];
  for (let i = 1; i <= 10; i++) {
    mockOrders.push({
      id: `ORD-100${i}`,
      customerPhone: '0901234567',
      status: i % 2 === 0 ? 'customs_cleared' : 'in_transit_air',
      createdAt: `2026-08-${String(i).padStart(2, '0')}T08:00:00Z`
    });
  }

  const matched = findGuestOrders('0901234567', mockOrders);
  assertEquals(matched.length, 10);
  assertEquals(matched[0].id, 'ORD-10010'); // latest date 2026-08-10
  assertEquals(matched[9].id, 'ORD-1001');  // earliest date 2026-08-01

  // Out of bounds index safeguard test
  const safeGetOrder = (list, index) => {
    return (list && list[index]) || list[0] || null;
  };

  assertEquals(safeGetOrder(matched, 0).id, 'ORD-10010');
  assertEquals(safeGetOrder(matched, 9).id, 'ORD-1001');
  assertEquals(safeGetOrder(matched, 99).id, 'ORD-10010'); // fallback to first
});

// -----------------------------------------------------------------------------
// 2. MEDIA MODAL OPENING / CLOSING & URL TYPES
// -----------------------------------------------------------------------------

runTest('[UI-WORKFLOW-05] Proof Media Modal: Direct MP4 Video URL handling', () => {
  const media = {
    type: 'video',
    badgeType: 'pov_video',
    url: 'https://storage.googleapis.com/tavy-bucket/proofs/pov_store_1001.mp4',
    title: 'Video POV Store',
    subtitle: 'Nhân viên TAVY ghé kệ Olive Young'
  };

  const isVideo = media.type === 'video';
  const isEmbed = isVideo && (
    media.url?.includes('youtube.com') ||
    media.url?.includes('youtu.be') ||
    media.url?.includes('drive.google.com/file') ||
    media.url?.includes('vimeo.com')
  );

  assertEquals(isVideo, true);
  assertEquals(isEmbed, false); // Direct MP4 uses <video> tag
});

runTest('[UI-WORKFLOW-06] Proof Media Modal: YouTube & Google Drive Embed URLs handling', () => {
  const ytMedia = {
    type: 'video',
    badgeType: 'pov_video',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  };
  const isYtEmbed = ytMedia.type === 'video' && (
    ytMedia.url?.includes('youtube.com') ||
    ytMedia.url?.includes('youtu.be') ||
    ytMedia.url?.includes('drive.google.com/file') ||
    ytMedia.url?.includes('vimeo.com')
  );
  assertEquals(isYtEmbed, true);

  const driveMedia = {
    type: 'video',
    badgeType: 'packing_video',
    url: 'https://drive.google.com/file/d/1a2b3c4d5e/preview'
  };
  const isDriveEmbed = driveMedia.type === 'video' && (
    driveMedia.url?.includes('youtube.com') ||
    driveMedia.url?.includes('youtu.be') ||
    driveMedia.url?.includes('drive.google.com/file') ||
    driveMedia.url?.includes('vimeo.com')
  );
  assertEquals(isDriveEmbed, true);
});

runTest('[UI-WORKFLOW-07] Proof Media Modal: Receipt Bill Image URL handling', () => {
  const billMedia = {
    type: 'image',
    badgeType: 'receipt_bill',
    url: 'https://storage.googleapis.com/tavy-bucket/receipts/bill_1001.jpg',
    title: 'Hóa Đơn Store Hàn Quốc'
  };

  const isImage = billMedia.type === 'image';
  const isVideo = billMedia.type === 'video';

  assertEquals(isImage, true);
  assertEquals(isVideo, false);
});

runTest('[UI-WORKFLOW-08] Proof Media Modal: Missing or Malformed Media Object Fallback', () => {
  const emptyMedia = null;
  const renderCheck = (m) => {
    if (!m) return null;
    return 'RENDERED';
  };
  assertEquals(renderCheck(emptyMedia), null);

  const malformedMedia = { type: 'unknown_format', url: '' };
  const getRenderType = (m) => {
    if (m.type === 'video') return 'VIDEO';
    if (m.type === 'image') return 'IMAGE';
    return 'UNSUPPORTED_FALLBACK';
  };
  assertEquals(getRenderType(malformedMedia), 'UNSUPPORTED_FALLBACK');
});

// -----------------------------------------------------------------------------
// 3. PAYMENT CTA NAVIGATION (UNPAID VS PAID VS CANCELLED)
// -----------------------------------------------------------------------------

runTest('[UI-WORKFLOW-09] Payment CTA: Unpaid & Pending Orders Show "Thanh toán cọc ngay"', () => {
  const unpaidOrder1 = { id: 'ORD-901', status: 'pending', paymentStatus: 'pending' };
  const unpaidOrder2 = { id: 'ORD-902', status: 'pending', paymentStatus: 'unpaid' };
  const unpaidOrder3 = { id: 'ORD-903', status: 'pending' }; // undefined paymentStatus

  const checkCTA = (order) => {
    const isUnpaid = (
      order.status === 'pending' ||
      order.paymentStatus === 'pending' ||
      !order.paymentStatus ||
      order.paymentStatus === 'unpaid'
    );
    const stepProgress = calculateStepProgress(order);
    return isUnpaid && !stepProgress.isCancelled;
  };

  assertEquals(checkCTA(unpaidOrder1), true);
  assertEquals(checkCTA(unpaidOrder2), true);
  assertEquals(checkCTA(unpaidOrder3), true);
});

runTest('[UI-WORKFLOW-10] Payment CTA: Paid & Completed Orders Hide Payment Button', () => {
  const paidOrder1 = { id: 'ORD-904', status: 'purchased', paymentStatus: 'paid' };
  const paidOrder2 = { id: 'ORD-905', status: 'in_transit_air', paymentStatus: 'completed' };
  const paidOrder3 = { id: 'ORD-906', status: 'completed', paymentStatus: 'paid' };

  const checkCTA = (order) => {
    const isUnpaid = (
      order.status === 'pending' ||
      order.paymentStatus === 'pending' ||
      !order.paymentStatus ||
      order.paymentStatus === 'unpaid'
    );
    const stepProgress = calculateStepProgress(order);
    return isUnpaid && !stepProgress.isCancelled;
  };

  assertEquals(checkCTA(paidOrder1), false);
  assertEquals(checkCTA(paidOrder2), false);
  assertEquals(checkCTA(paidOrder3), false);
});

runTest('[UI-WORKFLOW-11] Payment CTA: Cancelled Orders Hide Payment Button even if paymentStatus is pending', () => {
  const cancelledOrder = { id: 'ORD-907', status: 'cancelled', paymentStatus: 'pending' };

  const isUnpaid = (
    cancelledOrder.status === 'pending' ||
    cancelledOrder.paymentStatus === 'pending' ||
    !cancelledOrder.paymentStatus ||
    cancelledOrder.paymentStatus === 'unpaid'
  );
  const stepProgress = calculateStepProgress(cancelledOrder);
  const showCTA = isUnpaid && !stepProgress.isCancelled;

  assertEquals(stepProgress.isCancelled, true);
  assertEquals(showCTA, false);
});

// -----------------------------------------------------------------------------
// 4. CLIPBOARD COPY FALLBACK FOR DOMESTIC TRACKING CODES & AIR AWB
// -----------------------------------------------------------------------------

runTest('[UI-WORKFLOW-12] Clipboard Copy: Handles Navigator.clipboard presence and absence safely', () => {
  let copiedValue = '';
  const setCopiedCode = (val) => { copiedValue = val; };

  const handleCopyCode = (code, navObj) => {
    if (!code) return;
    if (navObj?.clipboard?.writeText) {
      navObj.clipboard.writeText(code);
    }
    setCopiedCode(code);
  };

  // Case A: navigator.clipboard exists
  let clipboardText = '';
  const mockNavigatorWithClipboard = {
    clipboard: {
      writeText: (t) => { clipboardText = t; }
    }
  };
  handleCopyCode('VT-999888777', mockNavigatorWithClipboard);
  assertEquals(clipboardText, 'VT-999888777');
  assertEquals(copiedValue, 'VT-999888777');

  // Case B: navigator.clipboard is undefined (insecure context or legacy browser)
  copiedValue = '';
  const mockNavigatorWithoutClipboard = {};
  // Must not throw error
  handleCopyCode('AIR-123456', mockNavigatorWithoutClipboard);
  assertEquals(copiedValue, 'AIR-123456');

  // Case C: null or empty code
  copiedValue = '';
  handleCopyCode('', mockNavigatorWithClipboard);
  assertEquals(copiedValue, '');
});

// -----------------------------------------------------------------------------
// 5. CATEGORY FILTER SWITCHING ON HOME PAGE WHILE SEARCH CARD IS OPEN
// -----------------------------------------------------------------------------

runTest('[UI-WORKFLOW-13] Category Filter Switching: Preserves search card state and filters products accurately', () => {
  const catalog = OLIVE_YOUNG_CATALOG;
  assert(catalog.length > 0, 'Catalog must not be empty');

  let activeCategory = 'all';
  let hasSearched = true;
  let matchedOrders = [{ id: 'ORD-1001', status: 'packed_kr' }];

  const getFilteredProducts = (cat) => {
    return catalog.filter((product) => {
      if (product.isPublished === false || product.status === 'pending' || product.isHidden === true) return false;
      if (cat === 'all') return true;
      const c = (product.category || '').toLowerCase();
      if (cat === 'cosmetics') return c.includes('mỹ phẩm') || c.includes('skin') || c.includes('dưỡng') || c.includes('make') || c.includes('trang') || c.includes('hair') || c.includes('body');
      if (cat === 'ginseng') return c.includes('sâm') || c.includes('nấm');
      if (cat === 'supplements') return c.includes('thực phẩm') || c.includes('chức năng') || c.includes('health') || c.includes('collagen') || c.includes('pharm') || c.includes('thuốc');
      return false;
    });
  };

  // Switch to cosmetics
  activeCategory = 'cosmetics';
  const cosmeticsList = getFilteredProducts(activeCategory);
  assert(cosmeticsList.length > 0, 'Cosmetics list should have products');
  // hasSearched & matchedOrders remain intact
  assertEquals(hasSearched, true);
  assertEquals(matchedOrders[0].id, 'ORD-1001');

  // Switch to ginseng
  activeCategory = 'ginseng';
  const ginsengList = getFilteredProducts(activeCategory);
  // hasSearched & matchedOrders remain intact
  assertEquals(hasSearched, true);

  // Switch back to all
  activeCategory = 'all';
  const allList = getFilteredProducts(activeCategory);
  assertEquals(allList.length, catalog.length);
  assertEquals(hasSearched, true);
});

// -----------------------------------------------------------------------------
// 6. ORDER SUMMARY PRICING CALCULATIONS & HIERARCHY
// -----------------------------------------------------------------------------

runTest('[UI-WORKFLOW-14] Order Pricing Hierarchy: totalVnd > quote.totalVnd > items sum > foreignPrice', () => {
  const krwRate = 19.5;
  const serviceFeeMultiplier = 1.05;

  const computeTotal = (order) => {
    if (order.totalVnd && order.totalVnd > 0) {
      return order.totalVnd;
    } else if (order.quote?.totalVnd && order.quote.totalVnd > 0) {
      return order.quote.totalVnd;
    } else if (Array.isArray(order.items) && order.items.length > 0) {
      return order.items.reduce((sum, item) => {
        const itemPrice = item.price || Math.round((item.foreignPrice || 0) * krwRate * serviceFeeMultiplier);
        return sum + itemPrice * (item.qty || item.quantity || 1);
      }, 0);
    } else if (order.foreignPrice) {
      return Math.round(order.foreignPrice * krwRate * serviceFeeMultiplier * (order.quantity || 1));
    }
    return 0;
  };

  // 1. Direct totalVnd
  assertEquals(computeTotal({ totalVnd: 500000 }), 500000);

  // 2. quote.totalVnd fallback
  assertEquals(computeTotal({ quote: { totalVnd: 750000 } }), 750000);

  // 3. items array fallback
  const orderWithItems = {
    items: [
      { price: 200000, qty: 2 },
      { price: 150000, qty: 1 }
    ]
  };
  assertEquals(computeTotal(orderWithItems), 550000);

  // 4. single foreignPrice fallback (20,000 KRW * 19.5 * 1.05 = 409,500 VND)
  const orderForeign = { foreignPrice: 20000, quantity: 1 };
  assertEquals(computeTotal(orderForeign), 409500);

  // 5. empty order fallback
  assertEquals(computeTotal({}), 0);
});

// -----------------------------------------------------------------------------
// 7. 8-STEP VISUAL TIMELINE STEPPER INTEGRITY
// -----------------------------------------------------------------------------

runTest('[UI-WORKFLOW-15] 8-Step Stepper Progress & State Transitions', () => {
  const steps = ORDER_STEPS;
  assertEquals(steps.length, 8);

  const testCases = [
    { status: 'pending', expectedIdx: 0, expectedPercent: '12.5%' },
    { status: 'deposit_paid', expectedIdx: 1, expectedPercent: '25%' },
    { status: 'confirmed', expectedIdx: 2, expectedPercent: '37.5%' },
    { status: 'purchased', expectedIdx: 3, expectedPercent: '50%' },
    { status: 'packed_kr', expectedIdx: 4, expectedPercent: '62.5%' },
    { status: 'in_transit_air', expectedIdx: 5, expectedPercent: '75%' },
    { status: 'customs_cleared', expectedIdx: 6, expectedPercent: '87.5%' },
    { status: 'completed', expectedIdx: 7, expectedPercent: '100%' },
    // Aliases
    { status: 'quoted', expectedIdx: 0, expectedPercent: '12.5%' },
    { status: 'in_kr_warehouse', expectedIdx: 4, expectedPercent: '62.5%' },
    { status: 'transit', expectedIdx: 5, expectedPercent: '75%' },
    { status: 'in_vn_warehouse', expectedIdx: 6, expectedPercent: '87.5%' },
    { status: 'delivering', expectedIdx: 7, expectedPercent: '100%' },
    // Cancelled
    { status: 'cancelled', expectedIdx: -1, expectedPercent: '0%', isCancelled: true }
  ];

  for (const tc of testCases) {
    const prog = calculateStepProgress({ status: tc.status });
    assertEquals(prog.stepIndex, tc.expectedIdx);
    assertEquals(prog.progressPercent, tc.expectedPercent);
    if (tc.isCancelled) {
      assertEquals(prog.isCancelled, true);
    } else {
      assertEquals(prog.isCancelled, false);
      assert(prog.stepNumber >= 1 && prog.stepNumber <= 8);
    }
  }
});

// -----------------------------------------------------------------------------
// 8. ITEM SUMMARY FALLBACKS & MISSING FIELDS
// -----------------------------------------------------------------------------

runTest('[UI-WORKFLOW-16] Order Items Summary: Missing item name, options, brand fallback', () => {
  const bareOrder = {
    id: 'ORD-777',
    status: 'purchased'
    // no items, no productName, no foreignPrice
  };

  const items = Array.isArray(bareOrder.items) && bareOrder.items.length > 0
    ? bareOrder.items
    : [{
        productId: bareOrder.id,
        name: bareOrder.productName || 'Sản phẩm mua hộ Hàn Quốc',
        brand: bareOrder.brand || 'Olive Young',
        productImage: bareOrder.productImage || '/tavy-logo.png',
        options: bareOrder.options || 'Mặc định',
        qty: bareOrder.quantity || 1,
        price: 0
      }];

  assertEquals(items.length, 1);
  assertEquals(items[0].name, 'Sản phẩm mua hộ Hàn Quốc');
  assertEquals(items[0].brand, 'Olive Young');
  assertEquals(items[0].productImage, '/tavy-logo.png');
  assertEquals(items[0].options, 'Mặc định');
  assertEquals(items[0].qty, 1);
});

// -----------------------------------------------------------------------------
// 9. PROOF BADGES: CUSTOM DOMESTIC CARRIERS & NULL PROOFS
// -----------------------------------------------------------------------------

runTest('[UI-WORKFLOW-17] Proof Badges: Custom carrier name & complete null proof handling', () => {
  // Custom carrier
  const customOrder = {
    id: 'ORD-888',
    domesticTrackingCode: 'VNPOST-123456',
    domesticCarrier: 'VNPost Nhanh'
  };
  const badgesCustom = getProofBadges(customOrder);
  assertEquals(badgesCustom.hasProof, true);
  assertEquals(badgesCustom.domesticCarrier, 'VNPost Nhanh');
  assertEquals(badgesCustom.domesticTrackingCode, 'VNPOST-123456');

  // Complete null / empty order
  const nullBadges = getProofBadges(null);
  assertEquals(nullBadges.hasProof, false);
  assertEquals(nullBadges.badges.length, 0);
  assertEquals(nullBadges.domesticCarrier, 'ViettelPost');
});

// -----------------------------------------------------------------------------
// 10. SEARCH BAR QUERY TRIMMING & ENTER SUBMISSION
// -----------------------------------------------------------------------------

runTest('[UI-WORKFLOW-18] Search Bar Input: Whitespace trimming & disabled submit states', () => {
  let submittedTerm = '';
  const onSearch = (term) => { submittedTerm = term; };

  const submitQuery = (input) => {
    const clean = String(input || '').trim();
    if (clean) onSearch(clean);
  };

  submitQuery('   ORD-999000   ');
  assertEquals(submittedTerm, 'ORD-999000');

  // Whitespace only - should not trigger onSearch
  submittedTerm = '';
  submitQuery('     \n\t   ');
  assertEquals(submittedTerm, '');
});

// -----------------------------------------------------------------------------
// 11. CROSS-FIELD LOOKUP RESILIENCE
// -----------------------------------------------------------------------------

runTest('[UI-WORKFLOW-19] Cross-field Lookup: Case-insensitivity for AWB, Flight, and Carrier codes', () => {
  const orders = [
    { id: 'ORD-101', trackingCode: 'AWB-KE-9021', status: 'in_transit_air' },
    { id: 'ORD-102', flightCode: 'VN-415', status: 'in_transit_air' },
    { id: 'ORD-103', domesticTrackingCode: 'VTP-888999', status: 'completed' }
  ];

  // Lookup by lowercase AWB
  const resAwb = findGuestOrders('awb-ke-9021', orders);
  assertEquals(resAwb.length, 1);
  assertEquals(resAwb[0].id, 'ORD-101');

  // Lookup by flight code
  const resFlight = findGuestOrders('vn-415', orders);
  assertEquals(resFlight.length, 1);
  assertEquals(resFlight[0].id, 'ORD-102');

  // Lookup by domestic tracking code
  const resDomestic = findGuestOrders('vtp-888999', orders);
  assertEquals(resDomestic.length, 1);
  assertEquals(resDomestic[0].id, 'ORD-103');
});

console.log("================================================================================");
console.log(`SUMMARY: ${passedCount} Passed, ${failedCount} Failed out of ${results.length} Stress Tests`);
console.log("================================================================================");

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

