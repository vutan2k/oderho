import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { setTier, test } from '../framework/runner.js';
import { assert, assertEquals } from '../framework/assert.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

setTier('Tier 1: Feature Coverage');

test('[THEME-ISO-1] Admin dark CSS rules must never leak to user inputs (Strictly Scoped)', () => {
  const cssPath = path.resolve(__dirname, '../../src/index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  const hasUnscopedAdminInput = /\[data-admin-theme="dark"\]\s+input\b/i.test(cssContent);
  const hasUnscopedAdminSelect = /\[data-admin-theme="dark"\]\s+select\b/i.test(cssContent);
  const hasUnscopedAdminTextarea = /\[data-admin-theme="dark"\]\s+textarea\b/i.test(cssContent);
  const hasUnscopedAdminTable = /\[data-admin-theme="dark"\]\s+table\b/i.test(cssContent);

  const isStrictlyScoped = !hasUnscopedAdminInput && !hasUnscopedAdminSelect && !hasUnscopedAdminTextarea && !hasUnscopedAdminTable;
  assert(isStrictlyScoped, 'Found unscoped [data-admin-theme="dark"] selector targeting global inputs/selects');
});

test('[THEME-ISO-2] User Light Mode inputs (.input, .input-field) have pure white background and dark text', () => {
  const cssPath = path.resolve(__dirname, '../../src/index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  const hasInputClass = /\.input,\s*\n*\.input-field\s*\{[^}]*background-color:\s*#FFFFFF/i.test(cssContent);
  assert(hasInputClass, 'Missing white background definition for .input / .input-field in index.css');
});

test('[THEME-ISO-3] CascadingAddressSelector uses clean white background and dark text in light mode', () => {
  const addressSelectorPath = path.resolve(__dirname, '../../src/components/CascadingAddressSelector.jsx');
  const addressSelectorContent = fs.readFileSync(addressSelectorPath, 'utf8');
  const hasCleanInputStyle = /backgroundColor:\s*'var\(--bg-white,\s*#FFF\)'/i.test(addressSelectorContent);
  assert(hasCleanInputStyle, 'CascadingAddressSelector missing clean background styling');
});

test('[THEME-ISO-4] AdminDashboardPage root container applies data-admin-theme properly', () => {
  const adminPagePath = path.resolve(__dirname, '../../src/pages/AdminDashboardPage.jsx');
  const adminPageContent = fs.readFileSync(adminPagePath, 'utf8');
  const hasDataAdminTheme = /data-admin-theme=\{adminTheme\}/i.test(adminPageContent);
  assert(hasDataAdminTheme, 'AdminDashboardPage missing data-admin-theme={adminTheme}');
});
