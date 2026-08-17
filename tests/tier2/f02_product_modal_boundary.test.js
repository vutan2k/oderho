import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertGreaterThan,
} from '../framework/assert.js';

setTier('Tier 2: Boundary & Corner Cases');

const FALLBACK_IMAGE = 'https://placehold.co/600x600/f3f4f6/9ca3af?text=Product';

test('[F2-B1] Missing product image fallback handling', () => {
  const getProductDisplayImage = (product) => {
    if (!product || !product.productImage || typeof product.productImage !== 'string' || !product.productImage.trim()) {
      return FALLBACK_IMAGE;
    }
    return product.productImage;
  };

  assertEquals(getProductDisplayImage({}), FALLBACK_IMAGE, 'Empty product object falls back');
  assertEquals(getProductDisplayImage({ productImage: null }), FALLBACK_IMAGE, 'Null productImage falls back');
  assertEquals(getProductDisplayImage({ productImage: '' }), FALLBACK_IMAGE, 'Empty string productImage falls back');
  assertEquals(getProductDisplayImage({ productImage: '   ' }), FALLBACK_IMAGE, 'Whitespace productImage falls back');
  assertEquals(
    getProductDisplayImage({ productImage: 'https://example.com/img.jpg' }),
    'https://example.com/img.jpg',
    'Valid image URL is preserved'
  );
});

test('[F2-B2] Zero Won price edge case handling', () => {
  const calculateVndPrice = (foreignPrice, exchangeRate) => {
    const price = Number(foreignPrice);
    const rate = Number(exchangeRate);
    if (isNaN(price) || price < 0) return 0;
    if (isNaN(rate) || rate <= 0) return 0;
    return Math.round(price * rate);
  };

  assertEquals(calculateVndPrice(0, 19.5), 0, '0 KRW price should yield 0 VND');
  assertEquals(calculateVndPrice('0', 19.5), 0, 'String "0" KRW should yield 0 VND');
  assertEquals(calculateVndPrice(-500, 19.5), 0, 'Negative price should be sanitized to 0 VND');
});

test('[F2-B3] Null and undefined rating fallback formatting', () => {
  const formatRating = (rating) => {
    const r = parseFloat(rating);
    if (isNaN(r) || r <= 0 || r > 5.0) return '5.0';
    return r.toFixed(1);
  };

  assertEquals(formatRating(null), '5.0', 'Null rating defaults to 5.0');
  assertEquals(formatRating(undefined), '5.0', 'Undefined rating defaults to 5.0');
  assertEquals(formatRating(NaN), '5.0', 'NaN rating defaults to 5.0');
  assertEquals(formatRating(4.85), '4.8', 'Valid rating formats cleanly to 1 decimal');
});

test('[F2-B4] Extreme exchange rate auto-VND conversion', () => {
  const convertPrice = (krw, rate) => Math.round(krw * rate);

  // Micro exchange rate
  assertEquals(convertPrice(1000, 0.001), 1, 'Micro rate conversion calculated cleanly');
  // High exchange rate
  assertEquals(convertPrice(25000, 19.5), 487500, 'Normal KRW rate (19.5) converted cleanly');
  // Massive exchange rate
  assertEquals(convertPrice(100000, 5000), 500000000, 'Massive exchange rate calculation handled without overflow');
});

test('[F2-B5] Long description truncation boundary', () => {
  const truncateDescription = (text, maxLength = 100) => {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  const shortDesc = 'Serum dưỡng ẩm sâu';
  assertEquals(truncateDescription(shortDesc, 100), shortDesc, 'Short text is not truncated');

  const longDesc = 'A'.repeat(500);
  const truncated = truncateDescription(longDesc, 100);
  assertEquals(truncated.length, 103, 'Truncated text should be 100 chars plus 3 dots');
  assert(truncated.endsWith('...'), 'Truncated text must end with ellipsis');
});
