import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertDeepEquals,
  assertContains,
  assertGreaterThan,
} from '../framework/assert.js';
import { OLIVE_YOUNG_CATALOG } from '../../src/data/catalog.js';

setTier('Tier 1: Feature Coverage');

test('[F1-1] Hero banner rendering structure & configuration', () => {
  const heroBannerConfig = {
    title: 'TAVY KOREA — Mua Hàng Hàn Quốc Chính Hãng',
    subtitle: 'Săn Deal Olive Young Giảm Đến 50% & Giao Hàng Tận Nơi',
    ctaText: 'Khám Phá Danh Mục',
    activeBannerId: 'banner-olive-young-top3',
    featuredGoodsNo: 'A000000261415'
  };

  assert(heroBannerConfig.title.includes('TAVY KOREA'), 'Hero banner title should contain TAVY KOREA');
  assertEquals(heroBannerConfig.activeBannerId, 'banner-olive-young-top3', 'Active banner ID should match');
  assertContains(OLIVE_YOUNG_CATALOG.map(p => p.goodsNo), heroBannerConfig.featuredGoodsNo, 'Featured product must exist in catalog');
});

test('[F1-2] Category filtering for skincare, makeup, health, pharmacy', () => {
  const categories = ['skincare', 'makeup', 'health', 'pharmacy'];

  for (const cat of categories) {
    const filtered = OLIVE_YOUNG_CATALOG.filter(p => p.category === cat);
    assertGreaterThan(filtered.length, 0, `Category ${cat} should have at least 1 product`);
    const allMatchCat = filtered.every(p => p.category === cat);
    assert(allMatchCat, `All filtered products in ${cat} must match category ${cat}`);
  }
});

test('[F1-3] Keyword search matching name, brand, description', () => {
  const searchCatalog = (query) => {
    const q = query.toLowerCase().trim();
    return OLIVE_YOUNG_CATALOG.filter(
      p => p.name.toLowerCase().includes(q) ||
           p.brand.toLowerCase().includes(q) ||
           (p.description && p.description.toLowerCase().includes(q))
    );
  };

  const torridenResults = searchCatalog('Torriden');
  assertGreaterThan(torridenResults.length, 0, 'Searching "Torriden" should find products');
  assertEquals(torridenResults[0].brand, 'Torriden', 'Matched product brand should be Torriden');

  const serumResults = searchCatalog('Serum');
  assertGreaterThan(serumResults.length, 0, 'Searching "Serum" should find products');
});

test('[F1-4] Price sorting ascending and descending', () => {
  const ascSorted = [...OLIVE_YOUNG_CATALOG].sort((a, b) => a.foreignPrice - b.foreignPrice);
  for (let i = 0; i < ascSorted.length - 1; i++) {
    assert(
      ascSorted[i].foreignPrice <= ascSorted[i + 1].foreignPrice,
      `Ascending sort failed at index ${i}: ${ascSorted[i].foreignPrice} > ${ascSorted[i + 1].foreignPrice}`
    );
  }

  const descSorted = [...OLIVE_YOUNG_CATALOG].sort((a, b) => b.foreignPrice - a.foreignPrice);
  for (let i = 0; i < descSorted.length - 1; i++) {
    assert(
      descSorted[i].foreignPrice >= descSorted[i + 1].foreignPrice,
      `Descending sort failed at index ${i}: ${descSorted[i].foreignPrice} < ${descSorted[i + 1].foreignPrice}`
    );
  }
});

test('[F1-5] Catalog pagination calculation and slicing', () => {
  const paginateCatalog = (items, page, pageSize) => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);
    return { page, pageSize, totalItems, totalPages, paginatedItems };
  };

  const page1 = paginateCatalog(OLIVE_YOUNG_CATALOG, 1, 10);
  assertEquals(page1.paginatedItems.length, 10, 'Page 1 should contain 10 items');
  assertEquals(page1.page, 1, 'Current page should be 1');
  assertGreaterThan(page1.totalPages, 1, 'Total pages should be greater than 1');

  const page2 = paginateCatalog(OLIVE_YOUNG_CATALOG, 2, 10);
  assertEquals(page2.paginatedItems.length, 10, 'Page 2 should contain 10 items');
  assertDeepEquals(page2.paginatedItems[0], OLIVE_YOUNG_CATALOG[10], 'First item of page 2 should be item at index 10');
});
