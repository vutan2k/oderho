import { test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertDeepEquals,
  assertContains,
  assertGreaterThan,
  assertThrows,
} from '../framework/assert.js';

test('[INFRA-SMOKE-1] Assertion library truthy assert & equality', () => {
  assert(true, 'true should be truthy');
  assertEquals(42, 42, 'numbers should match');
  assertEquals('tavy', 'tavy', 'strings should match');
});

test('[INFRA-SMOKE-2] Deep equality & container checks', () => {
  const obj1 = { name: 'Tavy Korea', items: [1, 2, { a: 'b' }] };
  const obj2 = { name: 'Tavy Korea', items: [1, 2, { a: 'b' }] };
  assertDeepEquals(obj1, obj2, 'Objects should be deeply equal');
  assertContains(['skincare', 'makeup'], 'skincare', 'Array should contain element');
  assertContains('Olive Young Scraper', 'Olive', 'String should contain substring');
});

test('[INFRA-SMOKE-3] Numeric assertions & throws checks', () => {
  assertGreaterThan(100, 50, '100 is greater than 50');
  assertThrows(() => {
    throw new Error('Invalid product price');
  }, 'Invalid product price');
});
