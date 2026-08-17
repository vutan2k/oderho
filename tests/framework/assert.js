/**
 * Lightweight Zero-Dependency Assertion Library for TAVY KOREA E2E Test Suite
 */

export class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

function formatVal(val) {
  if (val === undefined) return 'undefined';
  if (typeof val === 'string') return JSON.stringify(val);
  if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
  if (val instanceof Error) return `${val.name}: ${val.message}`;
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

function isDeepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (typeof a !== 'object') return false;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString();
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const elem of a) {
      let found = false;
      for (const bElem of b) {
        if (isDeepEqual(elem, bElem)) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, val] of a) {
      if (!b.has(key) || !isDeepEqual(val, b.get(key))) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!isDeepEqual(a[key], b[key])) return false;
  }

  return true;
}

/**
 * Asserts that a condition is truthy.
 * @param {any} condition
 * @param {string} [message]
 */
export function assert(condition, message = 'Assertion failed: condition is falsy') {
  if (!condition) {
    throw new AssertionError(message, condition, true);
  }
}

/**
 * Asserts that actual equals expected using strict equality / Object.is.
 * @param {any} actual
 * @param {any} expected
 * @param {string} [message]
 */
export function assertEquals(actual, expected, message = '') {
  if (!Object.is(actual, expected)) {
    const msg = message || `Expected ${formatVal(expected)}, but got ${formatVal(actual)}`;
    throw new AssertionError(msg, actual, expected);
  }
}

/**
 * Asserts structural deep equality.
 * @param {any} actual
 * @param {any} expected
 * @param {string} [message]
 */
export function assertDeepEquals(actual, expected, message = '') {
  if (!isDeepEqual(actual, expected)) {
    const msg = message || `Expected deep equality:\n  Actual:   ${formatVal(actual)}\n  Expected: ${formatVal(expected)}`;
    throw new AssertionError(msg, actual, expected);
  }
}

/**
 * Asserts that haystack contains needle.
 * @param {string|Array|Set|Map|Object} haystack
 * @param {any} needle
 * @param {string} [message]
 */
export function assertContains(haystack, needle, message = '') {
  if (haystack === null || haystack === undefined) {
    throw new AssertionError(message || `Cannot check contains on ${formatVal(haystack)}`, haystack, needle);
  }

  let found = false;

  if (typeof haystack === 'string') {
    const normHaystack = haystack.normalize('NFC');
    const normNeedle = String(needle).normalize('NFC');
    found = normHaystack.includes(normNeedle);
  } else if (Array.isArray(haystack)) {
    found = haystack.includes(needle) || haystack.some(item => isDeepEqual(item, needle));
  } else if (haystack instanceof Set) {
    found = haystack.has(needle) || Array.from(haystack).some(item => isDeepEqual(item, needle));
  } else if (haystack instanceof Map) {
    found = haystack.has(needle) || Array.from(haystack.values()).some(item => isDeepEqual(item, needle));
  } else if (typeof haystack === 'object') {
    found = (needle in haystack) ||
            Object.keys(haystack).includes(String(needle)) ||
            Object.values(haystack).some(item => isDeepEqual(item, needle));
  }

  if (!found) {
    const msg = message || `Expected ${formatVal(haystack)} to contain ${formatVal(needle)}`;
    throw new AssertionError(msg, haystack, needle);
  }
}

/**
 * Asserts that actual is strictly greater than min.
 * @param {number|any} actual
 * @param {number|any} min
 * @param {string} [message]
 */
export function assertGreaterThan(actual, min, message = '') {
  if (!(actual > min)) {
    const msg = message || `Expected ${formatVal(actual)} to be greater than ${formatVal(min)}`;
    throw new AssertionError(msg, actual, min);
  }
}

/**
 * Asserts that executing fn throws an error containing expectedErrorSubstring.
 * Supports both sync and async functions.
 * @param {Function} fn
 * @param {string|RegExp} [expectedErrorSubstring]
 * @param {string} [message]
 */
export function assertThrows(fn, expectedErrorSubstring = null, message = '') {
  if (typeof fn !== 'function') {
    throw new AssertionError('assertThrows expects a function as first argument');
  }

  const checkError = (err) => {
    if (expectedErrorSubstring !== null && expectedErrorSubstring !== undefined) {
      const errMsg = err && err.message !== undefined ? String(err.message) : String(err);
      if (expectedErrorSubstring instanceof RegExp) {
        if (!expectedErrorSubstring.test(errMsg)) {
          throw new AssertionError(
            message || `Expected error matching ${expectedErrorSubstring}, but got: "${errMsg}"`,
            errMsg,
            expectedErrorSubstring
          );
        }
      } else {
        const sub = String(expectedErrorSubstring);
        if (!errMsg.includes(sub)) {
          throw new AssertionError(
            message || `Expected error containing "${sub}", but got: "${errMsg}"`,
            errMsg,
            sub
          );
        }
      }
    }
    return err;
  };

  try {
    const res = fn();
    if (res && typeof res.then === 'function') {
      return res.then(
        () => {
          throw new AssertionError(
            message || 'Expected function to throw an error, but it resolved successfully',
            null,
            expectedErrorSubstring
          );
        },
        (err) => checkError(err)
      );
    }
  } catch (err) {
    return checkError(err);
  }

  throw new AssertionError(
    message || 'Expected function to throw an error, but it returned normally',
    null,
    expectedErrorSubstring
  );
}
