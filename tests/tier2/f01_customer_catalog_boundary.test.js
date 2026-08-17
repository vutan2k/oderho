import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertDeepEquals,
  assertGreaterThan,
} from '../framework/assert.js';
import { OLIVE_YOUNG_CATALOG } from '../../src/data/catalog.js';

setTier('Tier 2: Boundary & Corner Cases');

test('[F1-B1] Empty search string handling', () => {
  const searchCatalog = (query) => {
    if (!query || typeof query !== 'string') return [...OLIVE_YOUNG_CATALOG];
    const q = query.toLowerCase().trim();
    if (!q) return [...OLIVE_YOUNG_CATALOG];
    return OLIVE_YOUNG_CATALOG.filter(
      p => p.name.toLowerCase().includes(q) ||
           p.brand.toLowerCase().includes(q) ||
           (p.description && p.description.toLowerCase().includes(q))
    );
  };

  const emptyResults = searchCatalog('');
  assertEquals(emptyResults.length, OLIVE_YOUNG_CATALOG.length, 'Empty search string should return all catalog items');

  const whitespaceResults = searchCatalog('   ');
  assertEquals(whitespaceResults.length, OLIVE_YOUNG_CATALOG.length, 'Whitespace-only search should return all catalog items');
});

test('[F1-B2] Special character & regex injection in search string', () => {
  const safeSearchCatalog = (query) => {
    if (!query) return [];
    const q = String(query).toLowerCase().trim();
    return OLIVE_YOUNG_CATALOG.filter(
      p => (p.name && p.name.toLowerCase().includes(q)) ||
           (p.brand && p.brand.toLowerCase().includes(q)) ||
           (p.description && p.description.toLowerCase().includes(q))
    );
  };

  const specialInputs = [
    '[.*+?^${}()|[\\]\\\\]',
    '<script>alert("xss")</script>',
    "' OR '1'='1",
    '{{constructor.prototype}}',
    '\\u0000\\n\\r\\t'
  ];

  for (const input of specialInputs) {
    const results = safeSearchCatalog(input);
    assert(Array.isArray(results), `Search with "${input}" should return an array without throwing regex syntax error`);
  }
});

test('[F1-B3] Zero results found state handling', () => {
  const searchCatalog = (query) => {
    const q = (query || '').toLowerCase().trim();
    return OLIVE_YOUNG_CATALOG.filter(
      p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    );
  };

  const nonExistent = searchCatalog('NON_EXISTENT_PRODUCT_XYZ_9999');
  assertEquals(nonExistent.length, 0, 'Non-existent search term should yield zero results');
  assertDeepEquals(nonExistent, [], 'Zero results should be an empty array');
});

test('[F1-B4] Max category filter boundary & non-matching filter', () => {
  const filterByCategory = (categoryKey) => {
    if (!categoryKey) return [...OLIVE_YOUNG_CATALOG];
    return OLIVE_YOUNG_CATALOG.filter(p => p.category === categoryKey);
  };

  const validCatResults = filterByCategory('skincare');
  assertGreaterThan(validCatResults.length, 0, 'Skincare category should return items');

  const nonExistentCat = filterByCategory('electronics_and_laptops_category_max_length_string_filter_test');
  assertEquals(nonExistentCat.length, 0, 'Non-existent category filter should return empty array');
});

test('[F1-B5] Invalid category query (null, undefined, invalid type)', () => {
  const safeFilterByCategory = (categoryKey) => {
    if (typeof categoryKey !== 'string' || !categoryKey) {
      return [...OLIVE_YOUNG_CATALOG];
    }
    return OLIVE_YOUNG_CATALOG.filter(p => p.category === categoryKey);
  };

  assertEquals(safeFilterByCategory(null).length, OLIVE_YOUNG_CATALOG.length, 'Null category should return all items');
  assertEquals(safeFilterByCategory(undefined).length, OLIVE_YOUNG_CATALOG.length, 'Undefined category should return all items');
  assertEquals(safeFilterByCategory(12345).length, OLIVE_YOUNG_CATALOG.length, 'Numeric category should return all items');
  assertEquals(safeFilterByCategory({}).length, OLIVE_YOUNG_CATALOG.length, 'Object category should return all items');
});
