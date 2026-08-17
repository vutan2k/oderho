import { setTier, test } from '../framework/runner.js';
import {
  assertEquals,
  assertThrows,
} from '../framework/assert.js';

setTier('Tier 2: Boundary & Corner Cases');

test('[F5-B1] Malformed email string validation error', () => {
  const validateEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  assertEquals(validateEmail('invalidemail'), false, 'Email without @ rejected');
  assertEquals(validateEmail('user@com'), false, 'Email without domain extension rejected');
  assertEquals(validateEmail('user@ domain.com'), false, 'Email with spaces rejected');
  assertEquals(validateEmail('user..name@domain.com'), true, 'Dotted user accepted if matches pattern');
  assertEquals(validateEmail('customer@tavykorea.vn'), true, 'Valid email accepted');
});

test('[F5-B2] Blank password login rejection', () => {
  const attemptLogin = (email, password) => {
    if (!email || !email.trim()) {
      throw new Error('Email không được để trống.');
    }
    if (!password || !password.trim()) {
      throw new Error('Mật khẩu không được để trống.');
    }
    return { success: true };
  };

  assertThrows(() => attemptLogin('user@example.com', ''), 'Mật khẩu không được để trống');
  assertThrows(() => attemptLogin('user@example.com', '   '), 'Mật khẩu không được để trống');
  assertThrows(() => attemptLogin('user@example.com', null), 'Mật khẩu không được để trống');
});

test('[F5-B3] Unauthorized non-admin role access attempt rejection', () => {
  const verifyAdminAccess = (user) => {
    if (!user || user.email !== 'admin@tavykorea.vn') {
      throw new Error('403 Forbidden: Bạn không có quyền truy cập trang quản trị!');
    }
    return true;
  };

  assertThrows(() => verifyAdminAccess({ email: 'customer@gmail.com', role: 'customer' }), '403 Forbidden');
  assertThrows(() => verifyAdminAccess(null), '403 Forbidden');
  assertEquals(verifyAdminAccess({ email: 'admin@tavykorea.vn', role: 'admin' }), true, 'Admin email grants access');
});

test('[F5-B4] Expired auth token state detection', () => {
  const isSessionValid = (sessionToken) => {
    if (!sessionToken || !sessionToken.expiresAt) return false;
    const now = Date.now();
    return sessionToken.expiresAt > now;
  };

  const expiredSession = { token: 'abc123token', expiresAt: Date.now() - 1000 };
  assertEquals(isSessionValid(expiredSession), false, 'Expired session token invalid');

  const validSession = { token: 'abc123token', expiresAt: Date.now() + 3600000 };
  assertEquals(isSessionValid(validSession), true, 'Future expiration session token valid');
});

test('[F5-B5] Duplicate email registration rejection', () => {
  const registeredUsers = ['existing@tavykorea.vn', 'user1@gmail.com'];

  const registerUser = (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (registeredUsers.includes(cleanEmail)) {
      throw new Error('auth/email-already-in-use: Email này đã được đăng ký tài khoản!');
    }
    registeredUsers.push(cleanEmail);
    return { success: true };
  };

  assertThrows(() => registerUser('existing@tavykorea.vn'), 'email-already-in-use');
  assertEquals(registerUser('newuser@gmail.com').success, true, 'New unique email registration succeeds');
});
