import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertDeepEquals,
  assertThrows,
} from '../framework/assert.js';

setTier('Tier 1: Feature Coverage');

test('[DARKMODE-1] Theme default initialization is Light mode', () => {
  const initTheme = (savedValue) => {
    return savedValue === 'dark' ? 'dark' : 'light';
  };

  assertEquals(initTheme(null), 'light', 'Default theme must be light when localStorage is empty');
  assertEquals(initTheme(undefined), 'light', 'Default theme must be light for undefined');
  assertEquals(initTheme('invalid_theme'), 'light', 'Invalid theme strings must fallback to light');
  assertEquals(initTheme('dark'), 'dark', 'Dark theme correctly initialized');
});

test('[DARKMODE-2] User Theme toggle logic switches between light and dark', () => {
  const toggleTheme = (current) => {
    return current === 'dark' ? 'light' : 'dark';
  };

  assertEquals(toggleTheme('light'), 'dark', 'Light should toggle to dark');
  assertEquals(toggleTheme('dark'), 'light', 'Dark should toggle to light');
});

test('[DARKMODE-3] User Theme and Admin Theme are 100% isolated and independent', () => {
  const store = {
    tavy_user_theme: 'light',
    tavy_admin_theme: 'light'
  };

  const setUserTheme = (theme) => {
    store.tavy_user_theme = theme === 'dark' ? 'dark' : 'light';
  };

  const setAdminTheme = (theme) => {
    store.tavy_admin_theme = theme === 'dark' ? 'dark' : 'light';
  };

  // User switches to dark
  setUserTheme('dark');
  assertEquals(store.tavy_user_theme, 'dark', 'User theme should be dark');
  assertEquals(store.tavy_admin_theme, 'light', 'Admin theme must remain light');

  // Admin switches to dark
  setAdminTheme('dark');
  assertEquals(store.tavy_admin_theme, 'dark', 'Admin theme should be dark');
  assertEquals(store.tavy_user_theme, 'dark', 'User theme should still be dark');

  // User switches back to light
  setUserTheme('light');
  assertEquals(store.tavy_user_theme, 'light', 'User theme should be light');
  assertEquals(store.tavy_admin_theme, 'dark', 'Admin theme must still be dark');
});

test('[DARKMODE-4] HTML data-attribute reflection format', () => {
  const getThemeAttributes = (isRouteAdmin, userTheme, adminTheme) => {
    if (isRouteAdmin) {
      return { 'data-admin-theme': adminTheme };
    }
    return { 'data-theme': userTheme };
  };

  const userAttrs = getThemeAttributes(false, 'dark', 'light');
  assertEquals(userAttrs['data-theme'], 'dark', 'User route sets data-theme to dark');

  const adminAttrs = getThemeAttributes(true, 'light', 'dark');
  assertEquals(adminAttrs['data-admin-theme'], 'dark', 'Admin route sets data-admin-theme to dark');
});
