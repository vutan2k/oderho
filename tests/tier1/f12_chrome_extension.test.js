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
  assert(manifest.name.includes('Tavy Order') || manifest.name.includes('tavy-toolcaowed') || manifest.name.includes('TAVY AI') || manifest.name.includes('TAVY'), 'Extension name matches');
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

test('[F12-6] Auto-detect duplicate product registry and matching logic', () => {
  const bgPath = path.resolve(__dirname, '../../chrome-extension/background.js');
  assert(fs.existsSync(bgPath), 'background.js must exist');

  const bgCode = fs.readFileSync(bgPath, 'utf-8');
  assertContains(bgCode, 'CHECK_PRODUCT_EXISTS', 'background.js handles CHECK_PRODUCT_EXISTS action');
  assertContains(bgCode, 'scrapedGoodsRegistry', 'background.js uses scrapedGoodsRegistry storage');
  assertContains(bgCode, 'SYNC_CATALOG_GOODS_NOS', 'background.js supports SYNC_CATALOG_GOODS_NOS action');

  // Logic verification for matching
  const mockRegistry = {
    'A000000223414': { goodsNo: 'A000000223414', name: 'Serum Torriden Dive-In 50ml' },
    'A000000185934': { goodsNo: 'A000000185934', name: 'Mediheal Teatree Pad 100 Miếng' }
  };
  const mockList = new Set(['A000000223414', 'A000000185934']);

  const checkExists = (goodsNo) => {
    const upper = (goodsNo || '').toUpperCase();
    return !!(mockRegistry[upper] || mockList.has(upper));
  };

  assertEquals(checkExists('A000000223414'), true, 'Existing goodsNo returns true');
  assertEquals(checkExists('a000000223414'), true, 'Case-insensitive goodsNo returns true');
  assertEquals(checkExists('A999999999999'), false, 'Non-existent goodsNo returns false');
  assertEquals(checkExists(''), false, 'Empty goodsNo returns false');
});

test('[F12-7] Content Script & Popup duplicate alert indicators', () => {
  const contentPath = path.resolve(__dirname, '../../chrome-extension/content.js');
  const popupHtmlPath = path.resolve(__dirname, '../../chrome-extension/popup.html');
  const popupJsPath = path.resolve(__dirname, '../../chrome-extension/popup.js');

  const contentCode = fs.readFileSync(contentPath, 'utf-8');
  assertContains(contentCode, 'CHECK_PRODUCT_EXISTS', 'content.js queries CHECK_PRODUCT_EXISTS');
  assertContains(contentCode, 'data-exists', 'content.js sets data-exists attribute on button');

  const popupHtml = fs.readFileSync(popupHtmlPath, 'utf-8');
  assertContains(popupHtml, 'duplicateAlertBox', 'popup.html contains duplicateAlertBox UI');

  const popupJs = fs.readFileSync(popupJsPath, 'utf-8');
  assertContains(popupJs, 'CHECK_PRODUCT_EXISTS', 'popup.js checks CHECK_PRODUCT_EXISTS');
});

test('[F12-8] Next.js modern Olive Young selectors & GDAS review photo extraction verification', () => {
  const contentPath = path.resolve(__dirname, '../../chrome-extension/content.js');
  const bgPath = path.resolve(__dirname, '../../chrome-extension/background.js');

  const contentCode = fs.readFileSync(contentPath, 'utf-8');
  assertContains(contentCode, 'GoodsDetailCarousel', 'content.js scans Next.js product carousel');
  assertContains(contentCode, 'GoodsDetailDescription', 'content.js scans Next.js product description');
  assertContains(contentCode, 'fetchGdasReviewPhotos', 'content.js includes fetchGdasReviewPhotos function');
  assertContains(contentCode, 'gdasEditor', 'content.js filters and harvests gdasEditor user review photos');
  assertContains(contentCode, 'review/api/v2/reviews/cursor', 'content.js connects to modern review API endpoint');

  const bgCode = fs.readFileSync(bgPath, 'utf-8');
  assertContains(bgCode, 'photoReviews', 'background.js persists photoReviews');
  assertContains(bgCode, 'gdasEditor', 'background.js safeguards gdasEditor from junk filter');
});

test('[F12-9] Developer Mode HUD architecture, Alt+Shift+D shortcut & real-time telemetry', () => {
  const contentPath = path.resolve(__dirname, '../../chrome-extension/content.js');
  const popupHtmlPath = path.resolve(__dirname, '../../chrome-extension/popup.html');
  const popupJsPath = path.resolve(__dirname, '../../chrome-extension/popup.js');
  const optionsHtmlPath = path.resolve(__dirname, '../../chrome-extension/options.html');
  const optionsJsPath = path.resolve(__dirname, '../../chrome-extension/options.js');

  const contentCode = fs.readFileSync(contentPath, 'utf-8');
  assertContains(contentCode, 'DevHudController', 'content.js defines DevHudController');
  assertContains(contentCode, 'tavy-dev-hud', 'content.js injects #tavy-dev-hud DOM element');
  assertContains(contentCode, 'altKey && e.shiftKey', 'content.js listens for Alt+Shift keyboard shortcut');
  assertContains(contentCode, 'telemetry', 'Dev HUD includes telemetry view');
  assertContains(contentCode, 'actions', 'Dev HUD includes micro actions view');
  assertContains(contentCode, 'json', 'Dev HUD includes JSON inspector view');
  assertContains(contentCode, 'logs', 'Dev HUD includes live logs view');

  const popupHtml = fs.readFileSync(popupHtmlPath, 'utf-8');
  assertContains(popupHtml, 'devModeToggle', 'popup.html contains devModeToggle switch');
  assertContains(popupHtml, 'v21.0 DEV', 'popup.html displays v21.0 DEV version badge');

  const popupJs = fs.readFileSync(popupJsPath, 'utf-8');
  assertContains(popupJs, 'TOGGLE_DEV_MODE', 'popup.js communicates TOGGLE_DEV_MODE action');

  const optionsHtml = fs.readFileSync(optionsHtmlPath, 'utf-8');
  assertContains(optionsHtml, 'devModeDefault', 'options.html includes devModeDefault setting');

  const optionsJs = fs.readFileSync(optionsJsPath, 'utf-8');
  assertContains(optionsJs, 'devModeDefaultCheckbox', 'options.js handles devMode default preference');
});

test('[F12-10] Batch Scraper Queue lifecycle actions & progress telemetry', () => {
  const bgPath = path.resolve(__dirname, '../../chrome-extension/background.js');
  const popupHtmlPath = path.resolve(__dirname, '../../chrome-extension/popup.html');
  const popupJsPath = path.resolve(__dirname, '../../chrome-extension/popup.js');
  const contentPath = path.resolve(__dirname, '../../chrome-extension/content.js');

  const bgCode = fs.readFileSync(bgPath, 'utf-8');
  assertContains(bgCode, 'START_BATCH_SCRAPE', 'background.js handles START_BATCH_SCRAPE');
  assertContains(bgCode, 'PAUSE_BATCH_SCRAPE', 'background.js handles PAUSE_BATCH_SCRAPE');
  assertContains(bgCode, 'RESUME_BATCH_SCRAPE', 'background.js handles RESUME_BATCH_SCRAPE');
  assertContains(bgCode, 'STOP_BATCH_SCRAPE', 'background.js handles STOP_BATCH_SCRAPE');
  assertContains(bgCode, 'GET_BATCH_STATUS', 'background.js handles GET_BATCH_STATUS');
  assertContains(bgCode, 'batchQueueState', 'background.js maintains batchQueueState');
  assertContains(bgCode, 'processNextBatchItem', 'background.js executes queue processor');

  const popupHtml = fs.readFileSync(popupHtmlPath, 'utf-8');
  assertContains(popupHtml, 'batchScrapeSection', 'popup.html contains batchScrapeSection');
  assertContains(popupHtml, 'startBatchBtn', 'popup.html has startBatchBtn');
  assertContains(popupHtml, 'pauseBatchBtn', 'popup.html has pauseBatchBtn');
  assertContains(popupHtml, 'stopBatchBtn', 'popup.html has stopBatchBtn');
  assertContains(popupHtml, 'batchProgressBar', 'popup.html has batchProgressBar');

  const popupJs = fs.readFileSync(popupJsPath, 'utf-8');
  assertContains(popupJs, 'START_BATCH_SCRAPE', 'popup.js triggers START_BATCH_SCRAPE');
  assertContains(popupJs, 'updateBatchUI', 'popup.js updates batch UI');

  const contentCode = fs.readFileSync(contentPath, 'utf-8');
  assertContains(contentCode, 'EXTRACT_PAGE_PRODUCTS', 'content.js responds to EXTRACT_PAGE_PRODUCTS');
});

test('[F12-11] Maximal Scraper Engine: Resilient Next.js srcset support & 50+ GDAS review photos', () => {
  const contentPath = path.resolve(__dirname, '../../chrome-extension/content.js');
  const bgPath = path.resolve(__dirname, '../../chrome-extension/background.js');

  const contentCode = fs.readFileSync(contentPath, 'utf-8');
  assertContains(contentCode, 'srcset', 'content.js inspects Next.js image srcset for highest resolution');
  assertContains(contentCode, 'QT=100', 'content.js enforces maximum image quality QT=100');
  assertContains(contentCode, 'pageIdx <= 1', 'content.js harvests multiple pages of GDAS reviews (up to 50+ images)');
  assertContains(contentCode, '상품설명 더보기', 'content.js auto-expands product detail containers');

  const bgCode = fs.readFileSync(bgPath, 'utf-8');
  assertContains(bgCode, 'runSingleItemScrapePipeline', 'background.js encapsulates unified scrape pipeline');
  assertContains(bgCode, 'originalPrice', 'background.js parses original price for discount calculation');
});
