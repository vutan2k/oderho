import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertContains,
} from '../framework/assert.js';
import { sendAdminCopilotMessage } from '../../src/services/adminAiCopilotService.js';

setTier('Tier 1: Feature Coverage');

test('[F19-1] Admin AI Copilot greeting & general management consultation', async () => {
  const res = await sendAdminCopilotMessage({
    userMessage: 'Xin chào bạn là ai?',
    chatHistory: [],
    contextData: {
      orders: [{ id: 'ORD-1', status: 'pending' }],
      products: [{ id: 'P-1' }],
      rates: { KRW: { rate: 19.5 }, serviceFeePercent: 5 },
      urgentQueue: { needQuote: [{ id: 'ORD-1' }], needPurchase: [] }
    }
  });

  assert(res !== null, 'Response exists');
  assertEquals(res.role, 'assistant', 'Role is assistant');
  assert(res.content.length > 0, 'Contains meaningful content');
});

test('[F19-2] Admin AI Copilot URL scraper intent recognition for Korean health links', async () => {
  const testUrl = 'https://brand.naver.com/kgcshop/products/10556547785';
  const res = await sendAdminCopilotMessage({
    userMessage: `Cào giúp tôi sản phẩm này: ${testUrl}`,
    chatHistory: [],
    contextData: {
      orders: [],
      products: [],
      rates: { KRW: { rate: 19.5 }, serviceFeePercent: 5 },
      urgentQueue: { needQuote: [], needPurchase: [] }
    }
  });

  assert(res !== null, 'Scraped response exists');
  assert(res.action !== undefined, 'Contains action payload');
  assertEquals(res.action.type, 'IMPORT_HEALTH_PRODUCT', 'Action is IMPORT_HEALTH_PRODUCT');
  assertContains(res.content, 'bóc tách thành công', 'Mentions successful scraping');
  assertContains(res.action.product.brand, 'KGC', 'Identifies KGC brand');
});

test('[F19-3] Admin AI Copilot handles empty input gracefully', async () => {
  const res = await sendAdminCopilotMessage({
    userMessage: '   ',
    chatHistory: [],
    contextData: {}
  });

  assert(res !== null, 'Fallback response exists');
  assertContains(res.content, 'Tôi có thể giúp gì', 'Provides helpful guidance');
});
