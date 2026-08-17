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

test('[F12-1] Manifest V3 manifest.json structure validation', () => {
  const manifestPath = path.resolve(__dirname, '../../chrome-extension/manifest.json');
  assert(fs.existsSync(manifestPath), 'manifest.json must exist in chrome-extension/');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assertEquals(manifest.manifest_version, 3, 'manifest_version must be 3');
  assert(manifest.name.includes('Tavy Order - Olive Young Scraper'), 'Extension name matches');
  assertContains(manifest.permissions, 'activeTab', 'Permissions include activeTab');
  assertContains(manifest.permissions, 'storage', 'Permissions include storage');
  assertEquals(manifest.background.service_worker, 'background.js', 'Service worker defined as background.js');
});

test('[F12-2] background.js message listener action handling registration', () => {
  const bgPath = path.resolve(__dirname, '../../chrome-extension/background.js');
  assert(fs.existsSync(bgPath), 'background.js must exist');

  const bgCode = fs.readFileSync(bgPath, 'utf-8');
  assertContains(bgCode, 'chrome.runtime.onMessage.addListener', 'Registers runtime message listener');
  assertContains(bgCode, 'PROCESS_SCRAPED_DATA_AI', 'Handles action PROCESS_SCRAPED_DATA_AI');
  assertContains(bgCode, 'generativelanguage.googleapis.com', 'Fetches Gemini API URL');
});

test('[F12-3] content.js DOM extractor selectors & text truncation', () => {
  const contentPath = path.resolve(__dirname, '../../chrome-extension/content.js');
  assert(fs.existsSync(contentPath), 'content.js must exist');

  const contentCode = fs.readFileSync(contentPath, 'utf-8');
  assertContains(contentCode, 'SCRAPE_PRODUCT', 'Listens for SCRAPE_PRODUCT action');
  assertContains(contentCode, 'pickProductImage', 'Uses real product image picker');
  assertContains(contentCode, 'document.images', 'Scans page images from DOM');
  assertContains(contentCode, 'og:image', 'Queries og:image meta tag fallback');
  assertContains(contentCode, '20000', 'Truncates text to 20000 chars');
});

test('[F12-4] Base64 payload encoding & decoding roundtrip', () => {
  const encodePayload = (data) => {
    const jsonStr = JSON.stringify(data);
    return Buffer.from(encodeURIComponent(jsonStr)).toString('base64');
  };

  const decodePayload = (b64Str) => {
    const uriStr = Buffer.from(b64Str, 'base64').toString('utf-8');
    return JSON.parse(decodeURIComponent(uriStr));
  };

  const sampleProduct = {
    name: 'Serum Torriden Dive-In 50ml',
    price: 18000,
    brand: 'Torriden',
    category: 'skincare',
    url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000185934',
  };

  const encoded = encodePayload(sampleProduct);
  assert(typeof encoded === 'string' && encoded.length > 0, 'Encoded string should be non-empty');

  const decoded = decodePayload(encoded);
  assertDeepEquals(decoded, sampleProduct, 'Decoded product must match original payload');
});

test('[F12-5] Admin URL autoFill query string generation & parsing', () => {
  const generateAdminAutoFillUrl = (baseUrl, productData) => {
    const jsonStr = JSON.stringify(productData);
    const encodedData = Buffer.from(encodeURIComponent(jsonStr)).toString('base64');
    return `${baseUrl}?autoFill=${encodedData}`;
  };

  const parseAdminAutoFillQuery = (fullUrl) => {
    const urlObj = new URL(fullUrl);
    const autoFillParam = urlObj.searchParams.get('autoFill');
    if (!autoFillParam) return null;
    const jsonStr = decodeURIComponent(Buffer.from(autoFillParam, 'base64').toString('utf-8'));
    return JSON.parse(jsonStr);
  };

  const prod = { name: 'Anua Toner 250ml', price: 28000 };
  const adminUrl = generateAdminAutoFillUrl('https://tavy-oderho.web.app/admin/dashboard', prod);

  assertContains(adminUrl, 'https://tavy-oderho.web.app/admin/dashboard?autoFill=', 'Base URL and autoFill param formatting');

  const extractedData = parseAdminAutoFillQuery(adminUrl);
  assertDeepEquals(extractedData, prod, 'Extracted autoFill data matches original');
});
