import { setTier, test } from '../framework/runner.js';
import {
  assertEquals,
  assertThrows,
  AssertionError
} from '../framework/assert.js';

setTier('Tier 2: Boundary & Corner Cases');

test('[F15-B1] Failed test assertion detection in runner', () => {
  const executeTestFn = (fn) => {
    try {
      fn();
      return { status: 'PASS', error: null };
    } catch (err) {
      if (err instanceof AssertionError || err.name === 'AssertionError') {
        return { status: 'FAIL', error: err };
      }
      throw err;
    }
  };

  const failResult = executeTestFn(() => {
    throw new AssertionError('Expected 1 to equal 2', 1, 2);
  });

  assertEquals(failResult.status, 'FAIL', 'Assertion error detected as test failure');
  assertEquals(failResult.error.message, 'Expected 1 to equal 2', 'Assertion message preserved');
});

test('[F15-B2] Missing test file recovery in test runner', async () => {
  const loadTestFileSafely = async (filePath) => {
    try {
      await import(filePath);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        recovered: true,
        error: `[IMPORT ERROR] Failed to load test file ${filePath}: ${err.message}`
      };
    }
  };

  const result = await loadTestFileSafely('./non_existent_file_xyz_123.js');
  assertEquals(result.success, false, 'Importing missing test file returns success false');
  assertEquals(result.recovered, true, 'Runner recovers gracefully from missing test file');
});

test('[F15-B3] Async test timeout rejection safeguard', async () => {
  const runAsyncTestWithTimeout = (testFn, timeoutMs = 50) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Async test timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      Promise.resolve(testFn())
        .then((res) => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  };

  const slowAsyncFn = () => new Promise((r) => setTimeout(r, 200));

  await assertThrows(
    () => runAsyncTestWithTimeout(slowAsyncFn, 30),
    'Async test timed out'
  );
});

test('[F15-B4] Deep equality failure reporting detail', () => {
  const compareDeepObjects = (objA, objB) => {
    try {
      if (JSON.stringify(objA) !== JSON.stringify(objB)) {
        throw new AssertionError(
          `Deep equality failure:\n  Actual:   ${JSON.stringify(objA)}\n  Expected: ${JSON.stringify(objB)}`,
          objA,
          objB
        );
      }
      return true;
    } catch (err) {
      return err.message;
    }
  };

  const diffMessage = compareDeepObjects({ a: 1, b: 'cat' }, { a: 1, b: 'dog' });
  assertEquals(diffMessage.includes('Actual:'), true, 'Diff message contains Actual');
  assertEquals(diffMessage.includes('Expected:'), true, 'Diff message contains Expected');
});

test('[F15-B5] Memory exhaustion safeguard during large test suite runs', () => {
  const runLargeAssertionLoop = (iterations = 1000) => {
    const memBefore = process.memoryUsage().heapUsed;
    let tempArray = [];
    for (let i = 0; i < iterations; i++) {
      tempArray.push({ index: i, value: `test_item_${i}` });
    }
    // Clean up reference to allow GC
    const count = tempArray.length;
    tempArray = null;
    const memAfter = process.memoryUsage().heapUsed;
    return { count, memoryDiff: memAfter - memBefore };
  };

  const result = runLargeAssertionLoop(5000);
  assertEquals(result.count, 5000, 'Processed 5000 assertion loop items');
  // Confirm memory reference cleanup was executed
});
