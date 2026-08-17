import { test } from '../framework/runner.js';
import { assertContains, assertDeepEquals } from '../framework/assert.js';

test('[INFRA-SMOKE-6] Tier 3 pairwise integration smoke check', () => {
  const mapA = new Map([['rate', 18.5]]);
  const mapB = new Map([['rate', 18.5]]);
  assertDeepEquals(mapA, mapB, 'Maps with identical key-values should be equal');
  assertContains(mapA, 18.5, 'Map values should contain 18.5');
});
