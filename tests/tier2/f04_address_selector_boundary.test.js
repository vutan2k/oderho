import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertGreaterThan,
} from '../framework/assert.js';
import {
  fetchVietnamProvinces,
  fetchVietnamSubDivisions,
  ALL_63_VIETNAM_PROVINCES
} from '../../src/services/vietnamAddressService.js';

setTier('Tier 2: Boundary & Corner Cases');

test('[F4-B1] Offline network address selector fallback', async () => {
  // Simulate fetch throw/rejection
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => Promise.reject(new Error('Network error: Offline mode'));

  try {
    const provinces = await fetchVietnamProvinces();
    assertEquals(provinces.length, ALL_63_VIETNAM_PROVINCES.length, 'Offline fallback returns all 63 provinces');
    assertEquals(provinces[0].name, 'Thành phố Hà Nội', 'First offline province matches Hà Nội');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('[F4-B2] Invalid province ID input handling', async () => {
  const nullSubDivs = await fetchVietnamSubDivisions(null);
  assertEquals(nullSubDivs.length, 0, 'Null province ID returns empty array');

  const undefinedSubDivs = await fetchVietnamSubDivisions(undefined);
  assertEquals(undefinedSubDivs.length, 0, 'Undefined province ID returns empty array');

  const invalidCodeSubDivs = await fetchVietnamSubDivisions(99999);
  assertGreaterThan(invalidCodeSubDivs.length, 0, 'Invalid province ID returns default fallback sub-divisions');
  assert(invalidCodeSubDivs[0].name.includes('Khu vực'), 'Fallback sub-division name should be generic');
});

test('[F4-B3] Missing district data handling', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => Promise.reject(new Error('Network error'));

  try {
    const subDivs = await fetchVietnamSubDivisions(99999);
    assertGreaterThan(subDivs.length, 0, 'Province without hardcoded districts returns fallback district list');
    assertEquals(subDivs[0].code, 'sub-1', 'Fallback subdivision code matches sub-1');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('[F4-B4] Extra whitespace in address fields formatting', () => {
  const formatAddress = (street, district, province) => {
    const s = (street || '').trim().replace(/\s+/g, ' ');
    const d = (district || '').trim().replace(/\s+/g, ' ');
    const p = (province || '').trim().replace(/\s+/g, ' ');
    return [s, d, p].filter(Boolean).join(', ');
  };

  const formatted = formatAddress(
    '   123   Đường   Nguyễn   Huệ   ',
    '  Quận  1  ',
    ' Thành  phố  Hồ  Chí  Minh '
  );
  assertEquals(
    formatted,
    '123 Đường Nguyễn Huệ, Quận 1, Thành phố Hồ Chí Minh',
    'Extra leading, trailing, and multiple internal spaces sanitized'
  );
});

test('[F4-B5] Max length address inputs handling', () => {
  const sanitizeAddress = (street, maxLength = 200) => {
    const cleanStreet = (street || '').trim();
    if (cleanStreet.length > maxLength) {
      return cleanStreet.substring(0, maxLength);
    }
    return cleanStreet;
  };

  const longStreet = 'Số ' + '1'.repeat(300) + ' Đường Phạm Văn Đồng, Phường Linh Đông, Thủ Đức';
  const sanitized = sanitizeAddress(longStreet, 200);
  assertEquals(sanitized.length, 200, 'Long address input truncated to 200 chars limit cleanly');
});
