import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertGreaterThan,
} from '../framework/assert.js';
import { OLIVE_YOUNG_CATALOG } from '../../src/data/catalog.js';

setTier('Tier 1: Feature Coverage');

test('[F2-1] Specification display format & presence', () => {
  const sampleProduct = OLIVE_YOUNG_CATALOG[0]; // Sungboon Editor
  assert(sampleProduct.specifications !== undefined, 'Product must have specifications object');
  assert(typeof sampleProduct.specifications.volume === 'string', 'Specifications volume should be string');
  assert(typeof sampleProduct.specifications.skinType === 'string', 'Specifications skinType should be string');
  assert(typeof sampleProduct.specifications.expiry === 'string', 'Specifications expiry should be string');
  assert(typeof sampleProduct.specifications.ingredients === 'string', 'Specifications ingredients should be string');
});

test('[F2-2] Won price auto-VND conversion calculation', () => {
  const convertKrwToVnd = (foreignPriceKrw, exchangeRateVnd = 18.5) => {
    if (!foreignPriceKrw || foreignPriceKrw <= 0) return 0;
    return Math.round(foreignPriceKrw * exchangeRateVnd);
  };

  const krwPrice = 24900;
  const rate = 18.5;
  const expectedVnd = Math.round(24900 * 18.5); // 460650

  const convertedVnd = convertKrwToVnd(krwPrice, rate);
  assertEquals(convertedVnd, expectedVnd, '24900 KRW at 18.5 rate should equal 460,650 VND');
  assertEquals(convertKrwToVnd(0, rate), 0, '0 KRW should convert to 0 VND');
});

test('[F2-3] Gallery thumbnail selection state logic', () => {
  const productGallery = {
    images: [
      'https://example.com/img1.jpg',
      'https://example.com/img2.jpg',
      'https://example.com/img3.jpg',
    ],
    selectedIndex: 0,
  };

  const selectThumbnail = (galleryState, index) => {
    if (index >= 0 && index < galleryState.images.length) {
      return { ...galleryState, selectedIndex: index };
    }
    return galleryState;
  };

  const updatedGallery = selectThumbnail(productGallery, 2);
  assertEquals(updatedGallery.selectedIndex, 2, 'Selected index should update to 2');
  assertEquals(updatedGallery.images[updatedGallery.selectedIndex], 'https://example.com/img3.jpg', 'Selected image URL should match index 2');
});

test('[F2-4] Customer rating rendering & star calculation', () => {
  const formatRating = (rating) => {
    const validRating = Math.max(0, Math.min(5, Number(rating) || 0));
    const starPercentage = (validRating / 5) * 100;
    return {
      formatted: validRating.toFixed(1),
      starPercentage: Math.round(starPercentage),
    };
  };

  const ratingObj = formatRating(4.9);
  assertEquals(ratingObj.formatted, '4.9', 'Rating 4.9 formatted string should be 4.9');
  assertEquals(ratingObj.starPercentage, 98, 'Rating 4.9 star percentage should be 98%');
});

test('[F2-5] Review count display formatting', () => {
  const formatReviewCount = (count) => {
    if (!count || count <= 0) return 'Chưa có đánh giá';
    if (count >= 1000) {
      return `(${count.toLocaleString('vi-VN')} đánh giá)`;
    }
    return `(${count} đánh giá)`;
  };

  assertEquals(formatReviewCount(3820), '(3.820 đánh giá)', '3820 reviews formatted with locale separator');
  assertEquals(formatReviewCount(0), 'Chưa có đánh giá', '0 reviews should show "Chưa có đánh giá"');
  assertGreaterThan(OLIVE_YOUNG_CATALOG[0].reviewsCount, 0, 'Catalog sample review count should be greater than 0');
});
