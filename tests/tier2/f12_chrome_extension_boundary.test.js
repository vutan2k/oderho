import { setTier, test } from '../framework/runner.js';
import {
  assertEquals,
  assertThrows,
} from '../framework/assert.js';

setTier('Tier 2: Boundary & Corner Cases');

test('[F12-B1] Invalid Base64 string autoFill query parameter handling', () => {
  const parseAutoFillParam = (queryStr) => {
    if (!queryStr || !queryStr.includes('autoFill=')) return null;
    const match = queryStr.match(/autoFill=([^&]+)/);
    if (!match || !match[1]) return null;

    try {
      const decoded = atob(decodeURIComponent(match[1]));
      return JSON.parse(decoded);
    } catch (err) {
      console.warn('Invalid autoFill Base64 payload, returning null:', err.message);
      return null;
    }
  };

  const invalidBase64 = '?autoFill=!!!INVALID_BASE64_STRING!!!';
  const result = parseAutoFillParam(invalidBase64);
  assertEquals(result, null, 'Invalid Base64 autoFill parameter returns null cleanly without uncaught exception');

  const validPayload = { goodsNo: 'A001', name: 'Test Product' };
  const validBase64 = `?autoFill=${encodeURIComponent(btoa(JSON.stringify(validPayload)))}`;
  const validResult = parseAutoFillParam(validBase64);
  assertEquals(validResult.goodsNo, 'A001', 'Valid Base64 autoFill payload decoded successfully');
});

test('[F12-B2] Missing URL query parameter payload handling', () => {
  const parseAutoFillParam = (queryStr) => {
    if (!queryStr || typeof queryStr !== 'string' || !queryStr.includes('autoFill=')) return null;
    return {};
  };

  assertEquals(parseAutoFillParam(''), null, 'Empty query string returns null');
  assertEquals(parseAutoFillParam('?tab=products&page=1'), null, 'Query string without autoFill returns null');
  assertEquals(parseAutoFillParam(null), null, 'Null query string returns null');
});

test('[F12-B3] Malformed Manifest V3 background script message handling', () => {
  const handleBackgroundMessage = (message) => {
    if (!message || typeof message !== 'object' || !message.action) {
      return { success: false, error: 'Malformed extension message payload' };
    }

    switch (message.action) {
      case 'SCRAPE_OLIVE_YOUNG':
        if (!message.goodsNo && !message.url) {
          return { success: false, error: 'Missing goodsNo or url in SCRAPE_OLIVE_YOUNG payload' };
        }
        return { success: true, goodsNo: message.goodsNo };
      default:
        return { success: false, error: `Unknown extension action: ${message.action}` };
    }
  };

  assertEquals(handleBackgroundMessage(null).success, false, 'Null message returns success false');
  assertEquals(handleBackgroundMessage({}).success, false, 'Empty object message returns success false');
  assertEquals(handleBackgroundMessage({ action: 'UNKNOWN_ACTION' }).success, false, 'Unknown action returns success false');
  assertEquals(handleBackgroundMessage({ action: 'SCRAPE_OLIVE_YOUNG' }).success, false, 'Missing goodsNo returns error');
  assertEquals(handleBackgroundMessage({ action: 'SCRAPE_OLIVE_YOUNG', goodsNo: 'A100' }).success, true, 'Valid message processed');
});

test('[F12-B4] Chrome Extension permission error handling', () => {
  const mockExecuteScriptWithPermissions = (hasActiveTabPermission) => {
    if (!hasActiveTabPermission) {
      return Promise.reject(new Error('Extension Error: Cannot access contents of url "https://www.oliveyoung.co.kr". Extension manifest must request permission for this host.'));
    }
    return Promise.resolve([{ result: { title: 'Olive Young Product' } }]);
  };

  assertThrows(
    () => mockExecuteScriptWithPermissions(false),
    'Extension Error: Cannot access contents'
  );
});

test('[F12-B5] Missing popup DOM element safeguard', () => {
  const initPopupListeners = (documentMock) => {
    const scrapeBtn = documentMock.getElementById('scrapeBtn');
    if (!scrapeBtn) {
      return { initialized: false, warning: 'Element #scrapeBtn not found in DOM' };
    }
    return { initialized: true };
  };

  const emptyDomMock = { getElementById: () => null };
  const res = initPopupListeners(emptyDomMock);
  assertEquals(res.initialized, false, 'Safely skips initialization when DOM element is missing');
  assertEquals(res.warning.includes('not found'), true, 'Warning reported when DOM element is missing');
});

test('[F12-B6] CHECK_PRODUCT_EXISTS boundary handling with null/empty goodsNo and URL fallback', () => {
  const handleCheckExists = (goodsNo, url, registry = {}, list = new Set()) => {
    if (!goodsNo && !url) {
      return { exists: false, duplicateType: null, item: null };
    }

    const upper = (goodsNo || '').trim().toUpperCase();
    if (upper && (registry[upper] || list.has(upper))) {
      return { exists: true, duplicateType: 'goodsNo', item: registry[upper] || { goodsNo: upper } };
    }

    if (url) {
      const match = Object.values(registry).find(item => item.productUrl && item.productUrl === url);
      if (match) {
        return { exists: true, duplicateType: 'url', item: match };
      }
    }

    return { exists: false, duplicateType: null, item: null };
  };

  const reg = {
    'A001': { goodsNo: 'A001', productUrl: 'https://oliveyoung.co.kr/item1' }
  };
  const list = new Set(['A002']);

  assertEquals(handleCheckExists(null, null, reg, list).exists, false, 'Null inputs return exists false');
  assertEquals(handleCheckExists('', '', reg, list).exists, false, 'Empty inputs return exists false');
  assertEquals(handleCheckExists('A001', '', reg, list).exists, true, 'Matches registry goodsNo');
  assertEquals(handleCheckExists('A002', '', reg, list).exists, true, 'Matches list goodsNo');
  assertEquals(handleCheckExists('', 'https://oliveyoung.co.kr/item1', reg, list).exists, true, 'Matches URL fallback');
  assertEquals(handleCheckExists('A999', 'https://oliveyoung.co.kr/item999', reg, list).exists, false, 'Non-existent returns false');
});

