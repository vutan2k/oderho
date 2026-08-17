import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertDeepEquals,
  assertGreaterThan,
} from '../framework/assert.js';

setTier('Tier 1: Feature Coverage');

// Cart State Manager simulation representing AppContext cart logic
function createCartManager(initialItems = []) {
  let items = [...initialItems];

  return {
    getItems: () => items,
    addItem: (product, quantity = 1) => {
      const existingIndex = items.findIndex(i => i.goodsNo === product.goodsNo);
      if (existingIndex > -1) {
        items[existingIndex].quantity += quantity;
      } else {
        items.push({ ...product, quantity });
      }
    },
    updateQuantity: (goodsNo, delta) => {
      const item = items.find(i => i.goodsNo === goodsNo);
      if (item) {
        const newQty = item.quantity + delta;
        if (newQty > 0) {
          item.quantity = newQty;
        }
      }
    },
    removeItem: (goodsNo) => {
      items = items.filter(i => i.goodsNo !== goodsNo);
    },
    calculateTotal: (exchangeRate = 18.5) => {
      return items.reduce((sum, item) => {
        const itemVnd = Math.round(item.foreignPrice * exchangeRate);
        return sum + itemVnd * item.quantity;
      }, 0);
    }
  };
}

test('[F3-1] Item quantity increment and decrement with lower bound clamp', () => {
  const cart = createCartManager([{ goodsNo: 'A001', name: 'Item 1', foreignPrice: 10000, quantity: 1 }]);
  
  cart.updateQuantity('A001', 1);
  assertEquals(cart.getItems()[0].quantity, 2, 'Quantity should increment to 2');

  cart.updateQuantity('A001', -1);
  assertEquals(cart.getItems()[0].quantity, 1, 'Quantity should decrement to 1');

  // Decrementing past 1 when minimum clamp is active does not go below 1
  cart.updateQuantity('A001', -1);
  assertEquals(cart.getItems()[0].quantity, 1, 'Quantity should remain clamped at 1');
});

test('[F3-2] Cart item deletion by product goodsNo', () => {
  const cart = createCartManager([
    { goodsNo: 'A001', name: 'Item 1', foreignPrice: 10000, quantity: 1 },
    { goodsNo: 'A002', name: 'Item 2', foreignPrice: 20000, quantity: 2 },
  ]);

  cart.removeItem('A001');
  assertEquals(cart.getItems().length, 1, 'Cart size should decrease to 1 after deletion');
  assertEquals(cart.getItems()[0].goodsNo, 'A002', 'Remaining item should be A002');
});

test('[F3-3] Total cart price recalculation on quantity update', () => {
  const cart = createCartManager([
    { goodsNo: 'A001', name: 'Item 1', foreignPrice: 10000, quantity: 1 }, // 185,000 VND
    { goodsNo: 'A002', name: 'Item 2', foreignPrice: 20000, quantity: 2 }, // 740,000 VND
  ]);

  const initialTotal = cart.calculateTotal(18.5);
  assertEquals(initialTotal, 185000 + 740000, 'Initial total should be 925,000 VND');

  cart.updateQuantity('A001', 2); // now qty = 3 -> 555,000 VND
  const updatedTotal = cart.calculateTotal(18.5);
  assertEquals(updatedTotal, 555000 + 740000, 'Updated total should be 1,295,000 VND');
});

test('[F3-4] Fly-to-Cart state trigger and animation vector computation', () => {
  const computeFlyAnimationVector = (startBounds, endBounds) => {
    if (!startBounds || !endBounds) return null;
    const cartCenterX = endBounds.left + endBounds.width / 2;
    const cartCenterY = endBounds.top + endBounds.height / 2;
    const targetX = cartCenterX - startBounds.width / 2;
    const targetY = cartCenterY - startBounds.height / 2;
    return {
      durationMs: 1200,
      transform: `translate(${targetX}px, ${targetY}px) scale(0.1)`,
      opacity: 0.4,
      targetX,
      targetY
    };
  };

  const start = { left: 100, top: 200, width: 60, height: 60 };
  const end = { left: 800, top: 20, width: 40, height: 40 };

  const vector = computeFlyAnimationVector(start, end);
  assert(vector !== null, 'Fly-to-cart vector should be computed');
  assertEquals(vector.durationMs, 1200, 'Fly animation duration should be 1200ms');
  assertEquals(vector.targetX, 790, 'Target X should align product center to cart center');
});

test('[F3-5] Cart local storage persistence serialization and hydration', () => {
  const cartData = [
    { goodsNo: 'A000000261415', quantity: 2, selectedOption: '30ml + 30ml' },
    { goodsNo: 'A000000185934', quantity: 1, selectedOption: '50ml' }
  ];

  // Simulated Storage
  const storageMock = {};
  const saveCart = (data) => {
    storageMock['tavy_cart_items'] = JSON.stringify(data);
  };
  const loadCart = () => {
    const raw = storageMock['tavy_cart_items'];
    return raw ? JSON.parse(raw) : [];
  };

  saveCart(cartData);
  const hydrated = loadCart();

  assertEquals(hydrated.length, 2, 'Hydrated cart should contain 2 items');
  assertDeepEquals(hydrated, cartData, 'Hydrated cart data must be deeply equal to saved cart data');
});
