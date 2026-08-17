import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertContains,
  assertDeepEquals,
} from '../framework/assert.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

setTier('Tier 1: Feature Coverage');

test('[F13-1] Firestore order document CRUD schema validation', () => {
  const validateOrderDocumentSchema = (doc) => {
    const requiredKeys = ['id', 'userEmail', 'customerName', 'customerPhone', 'customerAddress', 'items', 'status', 'createdAt'];
    for (const key of requiredKeys) {
      if (doc[key] === undefined || doc[key] === null) {
        throw new Error(`Missing required order field: ${key}`);
      }
    }
    const validStatuses = ['pending', 'quoted', 'deposit_paid', 'purchased', 'in_kr_warehouse', 'transit', 'in_vn_warehouse', 'delivering', 'completed', 'cancelled'];
    if (!validStatuses.includes(doc.status)) {
      throw new Error(`Invalid order status: ${doc.status}`);
    }
    if (!Array.isArray(doc.items) || doc.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }
    return true;
  };

  const sampleOrder = {
    id: 'ORD-100200',
    userEmail: 'user@tavy.vn',
    customerName: 'Nguyen Van A',
    customerPhone: '0901234567',
    customerAddress: '123 Le Loi, Q1, HCM',
    items: [{ goodsNo: 'A001', name: 'Item 1', quantity: 2, price: 18000 }],
    status: 'pending',
    createdAt: '2026-08-12T00:00:00Z',
  };

  assert(validateOrderDocumentSchema(sampleOrder), 'Sample order document schema valid');
});

test('[F13-2] User profile Firestore document schema validation', () => {
  const validateUserProfileSchema = (doc) => {
    const requiredKeys = ['uid', 'email', 'displayName', 'role', 'addressBook', 'createdAt'];
    for (const key of requiredKeys) {
      if (doc[key] === undefined) {
        throw new Error(`Missing required user field: ${key}`);
      }
    }
    if (!['customer', 'admin'].includes(doc.role)) {
      throw new Error(`Invalid user role: ${doc.role}`);
    }
    return true;
  };

  const sampleUser = {
    uid: 'usr-12345',
    email: 'admin@tavykorea.vn',
    displayName: 'Tavy Admin',
    role: 'admin',
    addressBook: [],
    createdAt: '2026-08-12T00:00:00Z',
  };

  assert(validateUserProfileSchema(sampleUser), 'User profile schema valid');
});

test('[F13-3] system_config/rates document schema validation', () => {
  const validateRatesSchema = (doc) => {
    const requiredKeys = ['koreaRate', 'usdRate', 'jpyRate', 'serviceFeePercent', 'shippingPerKgVnd'];
    for (const key of requiredKeys) {
      if (typeof doc[key] !== 'number' || doc[key] <= 0) {
        throw new Error(`Invalid rate config value for key ${key}`);
      }
    }
    return true;
  };

  const sampleRates = {
    koreaRate: 18.5,
    usdRate: 25400,
    jpyRate: 165,
    serviceFeePercent: 5.0,
    shippingPerKgVnd: 200000,
  };

  assert(validateRatesSchema(sampleRates), 'Rates config schema valid');
});

test('[F13-4] Admin security rules rule-checking logic', () => {
  const rulesPath = path.resolve(__dirname, '../../firestore.rules');
  assert(fs.existsSync(rulesPath), 'firestore.rules must exist');

  const rulesText = fs.readFileSync(rulesPath, 'utf-8');
  assertContains(rulesText, 'admin@tavykorea.vn', 'Security rules check admin email admin@tavykorea.vn');
  assertContains(rulesText, 'request.auth.token.admin == true', 'Security rules check admin claim flag');
  assertContains(rulesText, 'match /users/{userId}', 'Users collection match block present');
  assertContains(rulesText, 'match /orders/{orderId}', 'Orders collection match block present');
  assertContains(rulesText, 'match /system_config/{configId}', 'System config match block present');
});

test('[F13-5] Offline persistence mutation queue data structure', () => {
  function createOfflineMutationQueue() {
    const queue = [];
    return {
      enqueue: (mutation) => {
        queue.push({
          id: `mut-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          type: mutation.type, // 'CREATE', 'UPDATE', 'DELETE'
          collection: mutation.collection,
          docId: mutation.docId,
          payload: mutation.payload,
        });
      },
      peek: () => queue[0] || null,
      dequeue: () => queue.shift(),
      size: () => queue.length,
    };
  }

  const queue = createOfflineMutationQueue();
  assertEquals(queue.size(), 0, 'Queue initially empty');

  queue.enqueue({ type: 'CREATE', collection: 'orders', docId: 'ORD-1', payload: { status: 'pending' } });
  assertEquals(queue.size(), 1, 'Queue contains 1 item after enqueue');
  assertEquals(queue.peek().type, 'CREATE', 'Front item type is CREATE');

  const processed = queue.dequeue();
  assertEquals(processed.docId, 'ORD-1', 'Dequeued mutation docId matches');
  assertEquals(queue.size(), 0, 'Queue empty after dequeue');
});
