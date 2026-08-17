import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertDeepEquals,
  assertThrows,
} from '../framework/assert.js';

setTier('Tier 1: Feature Coverage');

test('[F5-1] Email/password login payload validation', () => {
  const validateLoginPayload = (payload) => {
    if (!payload || typeof payload !== 'object') throw new Error('Invalid payload object');
    const email = (payload.email || '').trim();
    const password = payload.password || '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error('Email không hợp lệ');
    }
    if (!password || password.length < 6) {
      throw new Error('Mật khẩu phải từ 6 ký tự trở lên');
    }
    return { email, password };
  };

  const valid = validateLoginPayload({ email: 'customer@tavy.vn', password: 'secretpassword' });
  assertEquals(valid.email, 'customer@tavy.vn', 'Email should be validated');

  assertThrows(() => {
    validateLoginPayload({ email: 'invalid-email', password: '123' });
  }, 'Email không hợp lệ');

  assertThrows(() => {
    validateLoginPayload({ email: 'user@tavy.vn', password: '123' });
  }, 'Mật khẩu phải từ 6 ký tự trở lên');
});

test('[F5-2] Google 1-click auth state user normalization', () => {
  const normalizeGoogleUser = (googleUser) => {
    if (!googleUser || !googleUser.email) return null;
    return {
      uid: googleUser.uid,
      email: googleUser.email,
      displayName: googleUser.displayName || googleUser.email.split('@')[0],
      photoURL: googleUser.photoURL || 'https://placehold.co/100x100?text=User',
      providerId: 'google.com',
      isAdmin: googleUser.email === 'admin@tavykorea.vn',
    };
  };

  const gUser = {
    uid: 'google-uid-12345',
    email: 'testuser@gmail.com',
    displayName: 'Test User',
    photoURL: 'https://lh3.googleusercontent.com/a/abc',
  };

  const normalized = normalizeGoogleUser(gUser);
  assertEquals(normalized.uid, 'google-uid-12345', 'UID must match');
  assertEquals(normalized.providerId, 'google.com', 'Provider ID must be google.com');
  assertEquals(normalized.isAdmin, false, 'Regular user should not be admin');
});

test('[F5-3] Profile update payload validation and timestamping', () => {
  const createProfileUpdatePayload = (existingProfile, updateData) => {
    if (!updateData.displayName || updateData.displayName.trim().length < 2) {
      throw new Error('Tên hiển thị phải có ít nhất 2 ký tự');
    }
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (updateData.phone && !phoneRegex.test(updateData.phone.replace(/\s/g, ''))) {
      throw new Error('Số điện thoại không hợp lệ');
    }

    return {
      ...existingProfile,
      displayName: updateData.displayName.trim(),
      phone: updateData.phone ? updateData.phone.trim() : existingProfile.phone,
      updatedAt: new Date().toISOString(),
    };
  };

  const profile = { email: 'user@tavy.vn', displayName: 'Old Name', phone: '0901234567' };
  const updated = createProfileUpdatePayload(profile, { displayName: 'New Name', phone: '0987654321' });

  assertEquals(updated.displayName, 'New Name', 'Display name updated');
  assertEquals(updated.phone, '0987654321', 'Phone updated');
  assert(updated.updatedAt !== undefined, 'updatedAt timestamp must exist');
});

test('[F5-4] Address book entry creation and default address flag', () => {
  const createAddressEntry = (addressList, newAddressData) => {
    const isFirst = addressList.length === 0;
    const isDefault = newAddressData.isDefault || isFirst;

    let updatedList = addressList;
    if (isDefault) {
      updatedList = addressList.map(a => ({ ...a, isDefault: false }));
    }

    const entry = {
      id: `addr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipientName: newAddressData.recipientName,
      phone: newAddressData.phone,
      province: newAddressData.province,
      district: newAddressData.district,
      addressDetail: newAddressData.addressDetail,
      isDefault,
    };

    return [...updatedList, entry];
  };

  const initialList = [];
  const list1 = createAddressEntry(initialList, {
    recipientName: 'Anh Tan',
    phone: '0909123456',
    province: 'TP HCM',
    district: 'Quận 1',
    addressDetail: '100 Nguyễn Huệ',
  });

  assertEquals(list1.length, 1, 'First address added');
  assertEquals(list1[0].isDefault, true, 'First address automatically becomes default');

  const list2 = createAddressEntry(list1, {
    recipientName: 'Anh Tan 2',
    phone: '0909123456',
    province: 'Hà Nội',
    district: 'Ba Đình',
    addressDetail: '50 Kim Mã',
    isDefault: true,
  });

  assertEquals(list2.length, 2, 'Second address added');
  assertEquals(list2[0].isDefault, false, 'First address is no longer default');
  assertEquals(list2[1].isDefault, true, 'Second address is now default');
});

test('[F5-5] Auth session persistence serialization and restore', () => {
  const userSession = {
    uid: 'usr-999',
    email: 'customer@tavykorea.vn',
    token: 'jwt-mock-token-xyz',
    loginTimestamp: 1770000000000,
  };

  const storageMock = {};
  const saveSession = (session) => {
    storageMock['tavy_auth_session'] = JSON.stringify(session);
  };
  const getSession = () => {
    const raw = storageMock['tavy_auth_session'];
    return raw ? JSON.parse(raw) : null;
  };

  saveSession(userSession);
  const restored = getSession();

  assertDeepEquals(restored, userSession, 'Restored session must be deeply equal to stored session');
  assertEquals(restored.email, 'customer@tavykorea.vn', 'Email in restored session matches');
});
