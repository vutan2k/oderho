/**
 * Main CLI Entry Point for TAVY KOREA E2E Test Suite
 * Discovers and executes all test suites across Tier 1, Tier 2, Tier 3, and Tier 4.
 */

import { register } from 'node:module';
register('./framework/loader.js', import.meta.url);

import { runAllTests } from './framework/runner.js';

runAllTests({ exit: true }).catch((err) => {
  console.error('Fatal error during test suite execution:', err);
  process.exit(1);
});
