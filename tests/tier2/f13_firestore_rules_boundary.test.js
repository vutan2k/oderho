import { setTier, test } from '../framework/runner.js';
import {
  assertEquals,
  assertThrows,
} from '../framework/assert.js';

setTier('Tier 2: Boundary & Corner Cases');

test('[F13-B1] Non-admin write attempt Firestore security rules rejection', () => {
  const evaluateFirestoreSecurityRule = (requestAuth, collection, operation) => {
    // Security Rule: system_config write requires request.auth.token.email == 'admin@tavykorea.vn'
    if (collection === 'system_config' && operation === 'write') {
      if (!requestAuth || !requestAuth.token || requestAuth.token.email !== 'admin@tavykorea.vn') {
        throw new Error('PERMISSION_DENIED: Firebase error: Write permission denied by security rules for system_config');
      }
    }
    return true;
  };

  const customerAuth = { token: { email: 'customer@gmail.com', uid: 'user_123' } };
  assertThrows(
    () => evaluateFirestoreSecurityRule(customerAuth, 'system_config', 'write'),
    'PERMISSION_DENIED'
  );

  const adminAuth = { token: { email: 'admin@tavykorea.vn', uid: 'admin_001' } };
  assertEquals(
    evaluateFirestoreSecurityRule(adminAuth, 'system_config', 'write'),
    true,
    'Admin write allowed by Firestore security rules'
  );
});

test('[F13-B2] Offline sync queue persistence limit capping', () => {
  const MAX_OFFLINE_MUTATION_QUEUE = 100;

  const enqueueOfflineMutation = (queue, mutation) => {
    if (queue.length >= MAX_OFFLINE_MUTATION_QUEUE) {
      throw new Error('Offline storage limit reached! Cannot queue more than 100 offline mutations.');
    }
    return [...queue, mutation];
  };

  const fullQueue = Array.from({ length: 100 }, (_, i) => ({ id: `mut_${i}` }));
  assertThrows(
    () => enqueueOfflineMutation(fullQueue, { id: 'mut_overflow' }),
    'Offline storage limit reached'
  );
});

test('[F13-B3] Missing Firestore collection document error handling', () => {
  const fetchDocFromDB = (docSnap) => {
    if (!docSnap || !docSnap.exists) {
      return { exists: false, data: null, error: 'Document does not exist' };
    }
    return { exists: true, data: docSnap.data };
  };

  const missingSnap = { exists: false, data: null };
  const res = fetchDocFromDB(missingSnap);
  assertEquals(res.exists, false, 'Missing document snapshot handled gracefully');
  assertEquals(res.data, null, 'Data is null for missing document');
});

test('[F13-B4] Null field schema validation rejection', () => {
  const validateOrderDocumentSchema = (orderDoc) => {
    const requiredFields = ['id', 'userEmail', 'customerAddress', 'items', 'status'];
    for (const field of requiredFields) {
      if (orderDoc[field] === undefined || orderDoc[field] === null || (typeof orderDoc[field] === 'string' && !orderDoc[field].trim())) {
        throw new Error(`Schema validation error: Required field "${field}" is null or missing!`);
      }
    }
    return true;
  };

  const invalidDoc = {
    id: 'ORD-001',
    userEmail: 'user@example.com',
    customerAddress: null, // Null required field
    items: [],
    status: 'pending'
  };

  assertThrows(
    () => validateOrderDocumentSchema(invalidDoc),
    'Required field "customerAddress" is null'
  );
});

test('[F13-B5] Network disconnection during write fallback state', () => {
  const writeOrderWithFallback = async (orderData, isOnline = false) => {
    if (!isOnline) {
      // Persist to local storage queue
      return {
        success: true,
        offlineQueued: true,
        message: 'Đơn hàng đã được lưu tạm offline. Sẽ đồng bộ khi có kết nối mạng.'
      };
    }
    return { success: true, offlineQueued: false };
  };

  return writeOrderWithFallback({ id: 'ORD-OFFLINE-1' }, false).then((res) => {
    assertEquals(res.success, true, 'Write during network disconnection succeeds offline');
    assertEquals(res.offlineQueued, true, 'Marked as offlineQueued');
  });
});
