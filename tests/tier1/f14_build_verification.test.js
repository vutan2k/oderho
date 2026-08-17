import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertContains,
} from '../framework/assert.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

setTier('Tier 1: Feature Coverage');

test('[F14-1] Vite build configuration verification', () => {
  const configPath = path.resolve(__dirname, '../../vite.config.js');
  assert(fs.existsSync(configPath), 'vite.config.js must exist');

  const configContent = fs.readFileSync(configPath, 'utf-8');
  assertContains(configContent, 'defineConfig', 'Uses defineConfig helper');
  assertContains(configContent, '@vitejs/plugin-react', 'Imports react plugin');
  assertContains(configContent, 'port: 3000', 'Defines dev server port 3000');
  assertContains(configContent, 'strictPort: true', 'Defines strictPort true');
});

test('[F14-2] Oxlint configuration JSON structure validation', () => {
  const oxlintPath = path.resolve(__dirname, '../../.oxlintrc.json');
  assert(fs.existsSync(oxlintPath), '.oxlintrc.json must exist');

  const configJson = JSON.parse(fs.readFileSync(oxlintPath, 'utf-8'));
  assert(Array.isArray(configJson.plugins), 'Plugins must be an array');
  assertContains(configJson.plugins, 'react', 'Plugins include react');
  assert(configJson.rules !== undefined, 'Rules block must exist');
  assertEquals(configJson.rules['react/rules-of-hooks'], 'error', 'react/rules-of-hooks rule configured as error');
});

test('[F14-3] Automated self-check npm script command verification', () => {
  const pkgPath = path.resolve(__dirname, '../../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  assert(pkg.scripts['self-check'] !== undefined, 'self-check script must exist in package.json');
  assertEquals(pkg.scripts['self-check'], 'oxlint && vite build', 'self-check script command matches oxlint && vite build');
});

test('[F14-4] Package.json npm scripts suite integrity check', () => {
  const pkgPath = path.resolve(__dirname, '../../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  const requiredScripts = ['dev', 'build', 'lint', 'test', 'self-check', 'preview'];
  requiredScripts.forEach(scriptName => {
    assert(pkg.scripts[scriptName] !== undefined, `Script '${scriptName}' must exist in package.json`);
  });

  assertEquals(pkg.scripts.test, 'node tests/run_all_tests.js', 'test script entry point points to node tests/run_all_tests.js');
});

test('[F14-5] Environment variable schema validation (.env.example)', () => {
  const envExamplePath = path.resolve(__dirname, '../../.env.example');
  assert(fs.existsSync(envExamplePath), '.env.example must exist');

  const envContent = fs.readFileSync(envExamplePath, 'utf-8');
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_ADMIN_PASSWORD',
  ];

  requiredEnvVars.forEach(envVar => {
    assertContains(envContent, envVar, `Environment variable '${envVar}' must be defined in .env.example`);
  });
});
