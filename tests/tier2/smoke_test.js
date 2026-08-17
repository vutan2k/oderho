import { test } from '../framework/runner.js';
import {
  assertEquals,
  assertDeepEquals,
  assertGreaterThan,
  assertThrows,
} from '../framework/assert.js';

test('[INFRA-SMOKE-4] Tier 2 boundary conditions & zero handling', () => {
  assertEquals(0, 0, 'Zero equals zero');
  assertGreaterThan(0.001, 0, 'Small float greater than zero');
  assertDeepEquals([], [], 'Empty arrays are equal');
  assertDeepEquals({}, {}, 'Empty objects are equal');
});

test('[INFRA-SMOKE-5] Async assertThrows verification', async () => {
  await assertThrows(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1));
    throw new Error('Async network timeout');
  }, 'network timeout');
});
