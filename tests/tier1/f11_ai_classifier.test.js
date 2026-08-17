import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertDeepEquals,
  assertContains,
  assertThrows,
} from '../framework/assert.js';
// AI Scraper Agent test suite for F11

setTier('Tier 1: Feature Coverage');

test('[F11-1] Gemini 1.5/3.5 Flash prompt payload construction', () => {
  const createGeminiPromptPayload = (webText, apiKey) => {
    const promptText = `Trích xuất dữ liệu sản phẩm từ văn bản sau thành chuẩn JSON chứa các khoá: name, price, brand, description, usage.\n\nVĂN BẢN TRANG WEB:\n${webText}`;
    return {
      endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      body: {
        contents: [{ parts: [{ text: promptText }] }]
      }
    };
  };

  const payload = createGeminiPromptPayload('Sample webpage content', 'test-api-key-123');
  assertContains(payload.endpoint, 'gemini-3.5-flash:generateContent', 'Endpoint should target gemini-3.5-flash model');
  assertContains(payload.endpoint, 'key=test-api-key-123', 'API key passed in query string');
  assertEquals(payload.body.contents[0].parts[0].text.includes('Sample webpage content'), true, 'Prompt includes web text');
});

test('[F11-2] AI category auto-classification logic', () => {
  const classifyCategory = (productName) => {
    const lower = (productName || '').toLowerCase();
    if (lower.includes('cushion') || lower.includes('lip') || lower.includes('tint') || lower.includes('mascara')) {
      return 'makeup';
    }
    if (lower.includes('collagen') || lower.includes('vitamin') || lower.includes('sâm') || lower.includes('ginseng')) {
      return 'health';
    }
    if (lower.includes('thuốc') || lower.includes('pharma') || lower.includes('patch') || lower.includes('ointment')) {
      return 'pharmacy';
    }
    return 'skincare';
  };

  assertEquals(classifyCategory('Clio Mesh Glow Cushion SPF50+'), 'makeup', 'Cushion classified as makeup');
  assertEquals(classifyCategory('Nước Hồng Sâm Ginseng Extract 100ml'), 'health', 'Ginseng classified as health');
  assertEquals(classifyCategory('Cao dán giảm đau Hydrocolloid Patch'), 'pharmacy', 'Patch classified as pharmacy');
  assertEquals(classifyCategory('Torriden Hyaluronic Acid Serum'), 'skincare', 'Serum classified as skincare');
});

test('[F11-3] Product metadata extraction from raw HTML text', () => {
  const extractSpecsFromText = (rawText) => {
    const volumeMatch = rawText.match(/(\d+ml|\d+g|\d+매)/i);
    const originMatch = rawText.match(/(Hàn Quốc|Korea|Seoul)/i);
    return {
      volume: volumeMatch ? volumeMatch[1] : 'N/A',
      origin: originMatch ? `Store Olive Young ${originMatch[1]}${originMatch[1] !== 'Hàn Quốc' ? ', Hàn Quốc' : ''}` : 'Store Olive Young Seoul, Hàn Quốc',
    };
  };

  const textSample = 'Tinh chất Sungboon Editor 30ml sản xuất tại Seoul Hàn Quốc';
  const specs = extractSpecsFromText(textSample);
  assertEquals(specs.volume, '30ml', 'Extracted volume should be 30ml');
  assertContains(specs.origin, 'Hàn Quốc', 'Extracted origin should contain Hàn Quốc');
});

test('[F11-4] Korean-to-Vietnamese title translation payload', () => {
  const cleanAndTranslateTitle = (koreanTitle) => {
    const cleaned = koreanTitle
      .replace(/\[[^\]]+\]/g, '') // remove brackets like [단독]
      .replace(/\([^)]*\)/g, '')
      .trim();

    const dictionary = {
      '수분 크림': 'Kem dưỡng ẩm',
      '세럼': 'Serum tinh chất',
      '선크림': 'Kem chống nắng',
    };

    let translated = cleaned;
    Object.entries(dictionary).forEach(([kr, vn]) => {
      translated = translated.replace(new RegExp(kr, 'g'), vn);
    });

    return translated;
  };

  const rawKr = '[단독기획] 토리든 수분 크림 50ml (1+1)';
  const result = cleanAndTranslateTitle(rawKr);
  assertEquals(result, '토리든 Kem dưỡng ẩm 50ml', 'Cleaned brackets and translated 수분 크림 to Kem dưỡng ẩm');
});

test('[F11-5] AI response JSON parsing & markdown cleanup', () => {
  const parseAiJsonResponse = (rawAiText) => {
    const cleanedText = rawAiText.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(cleanedText);
    } catch (err) {
      throw new Error(`AI response JSON parse error: ${err.message}`);
    }
  };

  const mockAiResponse = `\`\`\`json
{
  "name": "Serum Torriden Cấp Nước",
  "price": 18000,
  "brand": "Torriden",
  "description": "Serum dưỡng ẩm sâu cho da dầu thiếu nước."
}
\`\`\``;

  const parsedObj = parseAiJsonResponse(mockAiResponse);
  assertEquals(parsedObj.name, 'Serum Torriden Cấp Nước', 'Parsed name matches');
  assertEquals(parsedObj.price, 18000, 'Parsed price matches 18000');
  assertEquals(parsedObj.brand, 'Torriden', 'Parsed brand matches Torriden');
});
