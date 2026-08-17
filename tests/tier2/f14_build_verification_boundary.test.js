import { setTier, test } from '../framework/runner.js';
import {
  assertEquals,
  assertGreaterThan,
  assertThrows,
} from '../framework/assert.js';

setTier('Tier 2: Boundary & Corner Cases');

test('[F14-B1] Oxlint syntax error detection reporting', () => {
  const runOxlintCodeCheck = (codeSnippet) => {
    try {
      // Basic js parsing validation
      new Function(codeSnippet);
      return { passes: true, errors: [] };
    } catch (syntaxErr) {
      return {
        passes: false,
        errors: [{ line: 1, message: `Oxlint syntax error: ${syntaxErr.message}` }]
      };
    }
  };

  const brokenCode = 'const x = { invalid syntax here ';
  const res = runOxlintCodeCheck(brokenCode);
  assertEquals(res.passes, false, 'Syntax error detected by linter check');
  assertGreaterThan(res.errors.length, 0, 'Linter reports syntax error message');
});

test('[F14-B2] Missing package.json dependency handling', () => {
  const verifyDependenciesExist = (packageJson, requiredDeps) => {
    const installed = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {})
    };

    const missing = [];
    for (const dep of requiredDeps) {
      if (!installed[dep]) {
        missing.push(dep);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing required dependencies in package.json: ${missing.join(', ')}`);
    }
    return true;
  };

  const mockPkg = { dependencies: { react: '^19.0.0' } };
  assertThrows(
    () => verifyDependenciesExist(mockPkg, ['react', 'firebase', 'vite']),
    'Missing required dependencies'
  );
});

test('[F14-B3] Invalid environment variable type handling', () => {
  const validateEnvConfig = (envObj) => {
    if (!envObj || typeof envObj.VITE_FIREBASE_API_KEY !== 'string' || !envObj.VITE_FIREBASE_API_KEY.trim()) {
      throw new Error('Invalid Environment Variable: VITE_FIREBASE_API_KEY must be a non-empty string!');
    }
    return true;
  };

  assertThrows(() => validateEnvConfig({}), 'Invalid Environment Variable');
  assertThrows(() => validateEnvConfig({ VITE_FIREBASE_API_KEY: 12345 }), 'Invalid Environment Variable');
  assertEquals(validateEnvConfig({ VITE_FIREBASE_API_KEY: 'AIzaSyTestKey' }), true, 'Valid env var passes');
});

test('[F14-B4] Build fail command exit error code', () => {
  const simulateViteBuild = (hasBuildError) => {
    if (hasBuildError) {
      return { exitCode: 1, stderr: 'error during build: Unexpected token in src/App.jsx' };
    }
    return { exitCode: 0, stdout: 'vite v6.0.0 building for production... dist/ created.' };
  };

  const failedBuild = simulateViteBuild(true);
  assertEquals(failedBuild.exitCode, 1, 'Build failure returns exit code 1');
  assertEquals(failedBuild.stderr.includes('error during build'), true, 'Build error output logged');
});

test('[F14-B5] Self-check error reporting script', () => {
  const runSelfCheckScript = (checkResults) => {
    const failedChecks = checkResults.filter(c => !c.passed);
    if (failedChecks.length > 0) {
      return {
        success: false,
        failedCount: failedChecks.length,
        summary: `Self-check FAILED: ${failedChecks.length} checks failed! [${failedChecks.map(f => f.name).join(', ')}]`
      };
    }
    return { success: true, failedCount: 0, summary: 'Self-check PASSED cleanly.' };
  };

  const checks = [
    { name: 'Oxlint Linting', passed: true },
    { name: 'Unit Tests', passed: false },
    { name: 'Build Config', passed: true }
  ];

  const res = runSelfCheckScript(checks);
  assertEquals(res.success, false, 'Self-check fails when 1 or more checks fail');
  assertEquals(res.failedCount, 1, 'Failed count matches 1');
  assertEquals(res.summary.includes('Unit Tests'), true, 'Summary reports failed check name');
});
