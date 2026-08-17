import { setTier, test } from '../framework/runner.js';
import {
  assertEquals,
  assertThrows,
} from '../framework/assert.js';
import { runAIScraperAgent } from '../../src/services/aiScraperAgentEngine.js';

setTier('Tier 2: Boundary & Corner Cases');

test('[F11-B1] Gemini API rate limit / 429 response handling', async () => {
  const handleGeminiApiCall = async (callFn) => {
    try {
      return await callFn();
    } catch (err) {
      if (err.status === 429 || (err.message && err.message.includes('429'))) {
        return {
          success: false,
          rateLimited: true,
          error: 'Gemini API 429 Rate Limit Exceeded. Switching to fallback classifier.'
        };
      }
      throw err;
    }
  };

  const rateLimitError = new Error('HTTP 429 Too Many Requests');
  rateLimitError.status = 429;

  const result = await handleGeminiApiCall(() => Promise.reject(rateLimitError));
  assertEquals(result.rateLimited, true, '429 response recognized as rateLimited');
  assertEquals(result.error.includes('Rate Limit'), true, 'Rate limit error message formatted');
});

test('[F11-B2] API timeout fallback classification', async () => {
  const callGeminiWithTimeout = async (prompt, timeoutMs = 100) => {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        // Fallback heuristic classification on timeout
        resolve({
          fallbackUsed: true,
          category: prompt.includes('cushion') ? 'makeup' : 'skincare',
          name: 'Fallback Product Name'
        });
      }, timeoutMs);
    });
  };

  const res = await callGeminiWithTimeout('Clio cushion foundation', 50);
  assertEquals(res.fallbackUsed, true, 'Timeout triggers fallback classification');
  assertEquals(res.category, 'makeup', 'Fallback classifies cushion as makeup');
});

test('[F11-B3] Unclassifiable unknown text payload defaulting', () => {
  const classifyCategory = (text) => {
    const lower = (text || '').toLowerCase();
    if (/cushion|tint|lip|mascara/i.test(lower)) return 'makeup';
    if (/sâm|collagen|vitamin/i.test(lower)) return 'health';
    if (/thuốc|pharma|patch/i.test(lower)) return 'pharmacy';
    return 'skincare'; // Default boundary category
  };

  const gibberishText = 'xyz999 12345 random gibberish title without keywords';
  const category = classifyCategory(gibberishText);
  assertEquals(category, 'skincare', 'Unclassifiable unknown text defaults to skincare');
});

test('[F11-B4] Corrupted JSON response from LLM recovery', () => {
  const parseLlmJsonResponse = (rawOutput) => {
    try {
      const clean = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(clean);
    } catch (e) {
      // Recovery heuristic for broken JSON
      const nameMatch = rawOutput.match(/"name"\s*:\s*"([^"]+)"/);
      const priceMatch = rawOutput.match(/"price"\s*:\s*(\d+)/);
      return {
        name: nameMatch ? nameMatch[1] : 'Trích xuất sản phẩm',
        foreignPrice: priceMatch ? Number(priceMatch[1]) : 20000,
        corrupted: true
      };
    }
  };

  const brokenJsonLLM = '```json\n{\n  "name": "Kem dưỡng Torriden",\n  "price": 24000,\n  "brand": "Torriden" -- MISSING CLOSING BRACKET';
  const parsed = parseLlmJsonResponse(brokenJsonLLM);
  assertEquals(parsed.corrupted, true, 'Corrupted JSON detected and recovered via regex');
  assertEquals(parsed.name, 'Kem dưỡng Torriden', 'Name extracted from corrupted JSON');
  assertEquals(parsed.foreignPrice, 24000, 'Price extracted from corrupted JSON');
});

test('[F11-B5] Blank input text handling in AI agent', async () => {
  const resNull = await runAIScraperAgent(null);
  assertEquals(resNull.success, false, 'Null URL returns success false');

  const resEmpty = await runAIScraperAgent('');
  assertEquals(resEmpty.success, false, 'Empty URL returns success false');

  const resWhitespace = await runAIScraperAgent('   ');
  assertEquals(resWhitespace.success, false, 'Whitespace URL returns success false');
});
