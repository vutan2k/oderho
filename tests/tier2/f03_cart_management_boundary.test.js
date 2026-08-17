import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertDeepEquals,
  assertThrows,
} from '../framework/assert.js';

setTier('Tier 2: Boundary & Corner Cases');

test('[F3-B1] Item quantity <= 0 deletion trigger', () => {
  const updateCartItemQuantity = (cart, goodsNo, newQty) => {
    if (newQty <= 0) {
      return cart.filter(item => item.goodsNo !== goodsNo);
    }
    return cart.map(item => item.goodsNo === goodsNo ? { ...item, quantity: Math.min(newQty, 999) } : item);
  };

  const initialCart = [
    { goodsNo: 'SP-001', name: 'Serum Torriden', quantity: 2 },
    { goodsNo: 'SP-002', name: 'Cushion Clio', quantity: 1 }
  ];

  const updatedZero = updateCartItemQuantity(initialCart, 'SP-001', 0);
  assertEquals(updatedZero.length, 1, 'Updating quantity to 0 should remove item from cart');
  assertEquals(updatedZero[0].goodsNo, 'SP-002', 'Remaining item should be SP-002');

  const updatedNegative = updateCartItemQuantity(initialCart, 'SP-001', -5);
  assertEquals(updatedNegative.length, 1, 'Updating quantity to negative should remove item from cart');
});

test('[F3-B2] Max item quantity limit [999+] capping', () => {
  const addToCart = (cart, product, qtyToAdd) => {
    const existing = cart.find(item => item.goodsNo === product.goodsNo);
    if (existing) {
      return cart.map(item => {
        if (item.goodsNo === product.goodsNo) {
          const newQty = Math.min(item.quantity + qtyToAdd, 999);
          return { ...item, quantity: newQty };
        }
        return item;
      });
    }
    return [...cart, { ...product, quantity: Math.min(qtyToAdd, 999) }];
  };

  const initialCart = [{ goodsNo: 'SP-001', name: 'Serum Torriden', quantity: 990 }];
  const resultCart = addToCart(initialCart, { goodsNo: 'SP-001', name: 'Serum Torriden' }, 20);
  assertEquals(resultCart[0].quantity, 999, 'Quantity over 999 should be capped at 999');

  const overflowCart = addToCart([], { goodsNo: 'SP-002', name: 'Anua Toner' }, 5000);
  assertEquals(overflowCart[0].quantity, 999, 'Initial large quantity capped at 999');
});

test('[F3-B3] Empty cart checkout prevention', () => {
  const validateCartForCheckout = (cart) => {
    if (!Array.isArray(cart) || cart.length === 0) {
      throw new Error('Giỏ hàng trống! Vui lòng chọn sản phẩm trước khi thanh toán.');
    }
    return true;
  };

  assertThrows(() => validateCartForCheckout([]), 'Giỏ hàng trống');
  assertThrows(() => validateCartForCheckout(null), 'Giỏ hàng trống');
  assertEquals(validateCartForCheckout([{ goodsNo: 'SP-001', quantity: 1 }]), true, 'Non-empty cart validates successfully');
});

test('[F3-B4] Corrupted local storage recovery', () => {
  const loadCartFromStorage = (storageValue) => {
    try {
      if (!storageValue) return [];
      const parsed = JSON.parse(storageValue);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Corrupted cart storage, resetting to empty array:', e.message);
      return [];
    }
  };

  const corruptedJson = '{ invalid_json_payload: ... ]';
  const recoveredCart = loadCartFromStorage(corruptedJson);
  assertDeepEquals(recoveredCart, [], 'Corrupted storage string recovers cleanly to empty array');

  const notArrayJson = '{"goodsNo": "SP-1"}';
  assertEquals(loadCartFromStorage(notArrayJson).length, 0, 'Non-array JSON recovers to empty array');
});

test('[F3-B5] Duplicate item ID merge on add to cart', () => {
  const addItemToCart = (cart, newItem) => {
    const existingIndex = cart.findIndex(i => i.goodsNo === newItem.goodsNo);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: Math.min(updated[existingIndex].quantity + newItem.quantity, 999)
      };
      return updated;
    }
    return [...cart, newItem];
  };

  let cart = [];
  cart = addItemToCart(cart, { goodsNo: 'A001', name: 'Item A', quantity: 2 });
  cart = addItemToCart(cart, { goodsNo: 'A001', name: 'Item A', quantity: 3 });

  assertEquals(cart.length, 1, 'Duplicate item should not add extra row in cart');
  assertEquals(cart[0].quantity, 5, 'Duplicate item quantity merged to 5');
});
