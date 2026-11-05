/* Page appearance only: never rebuild or reset booking controls. */
(function () {
  'use strict';
  const STORAGE_KEY = 'beakim-theme';
  let initialized = false;
  const normalizeTheme = value => value === 'light' ? 'light' : 'dark';

  function applyTheme(value, persist = true) {
    const theme = normalizeTheme(value);
    if (typeof document === 'undefined') return theme;
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'light' ? '#F7F4EE' : '#0D2318';
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-checked', String(theme === 'dark'));
      button.title = theme === 'dark' ? 'Switch to Ivory Light' : 'Switch to Forest Dark';
    });
    if (persist && typeof window !== 'undefined') {
      try { window.localStorage.setItem(STORAGE_KEY, theme); } catch (_) { /* Session switching still works. */ }
    }
    return theme;
  }

  function initializeTheme() {
    if (initialized || typeof document === 'undefined') return;
    initialized = true;
    applyTheme(document.documentElement.dataset.theme, false);
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.hidden = false;
      button.addEventListener('click', () => {
        applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
      });
    });
    window.addEventListener('storage', event => {
      if (event.key === STORAGE_KEY || event.key === null) applyTheme(event.newValue, false);
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { STORAGE_KEY, normalizeTheme, applyTheme, initializeTheme };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeTheme, { once: true });
    else initializeTheme();
  }
})();
