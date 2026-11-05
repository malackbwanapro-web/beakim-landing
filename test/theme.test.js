const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const zlib = require('node:zlib');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/js/theme.js'), 'utf8');
const pages = ['index.html','tower-cottages.html','beakim-darad.html','diani-darling.html','beakim-apartments.html','insights.html','privacy-policy.html','terms-of-service.html','404.html'];

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  assert.equal((html.match(/data-theme-toggle role="switch"/g) || []).length, 1, page);
  assert.ok(html.includes('aria-label="Dark theme"'));
  assert.ok(html.includes('theme-toggle-slot'));
  assert.ok(html.indexOf('data-theme-bootstrap') < html.indexOf('rel="stylesheet"'), 'Apply preference before CSS');
  const bootstrap = html.match(/<script data-theme-bootstrap>(.*?)<\/script>/s)[1];
  for (const [saved, expected] of [[null, 'dark'], ['light', 'light'], ['dark', 'dark'], ['invalid', 'dark'], ['BLOCKED', 'dark']]) {
    const meta = {};
    const ctx = { document: { documentElement: { dataset: { theme: 'dark' } }, querySelector: () => meta },
      localStorage: { getItem() { if (saved === 'BLOCKED') throw new Error('Storage unavailable'); return saved; } } };
    vm.runInNewContext(bootstrap, ctx);
    assert.equal(ctx.document.documentElement.dataset.theme, expected);
    assert.equal(meta.content, expected === 'light' ? '#F7F4EE' : '#0D2318');
  }
  assert.ok(zlib.gzipSync(Buffer.from(source + bootstrap)).length < 2048, 'Theme JS must stay within the 2KiB compressed budget');
}

function setup(blocked = false) {
  const values = new Map([['booking-draft', 'preserve this unrelated data']]);
  const button = { hidden: true, attributes: {}, events: {}, setAttribute(k, v) { this.attributes[k] = v; }, addEventListener(k, v) { this.events[k] = v; } };
  const rootNode = { dataset: { theme: 'dark' } };
  const meta = {};
  const events = {};
  const fields = { property: 'Tower Cottages', adults: 4, phone: '700000000', dates: ['2026-11-06', '2026-11-08'] };
  const ctx = { module: { exports: {} }, document: { readyState: 'complete', documentElement: rootNode,
      querySelector(selector) { assert.equal(selector, 'meta[name="theme-color"]'); return meta; },
      querySelectorAll(selector) { assert.equal(selector, '[data-theme-toggle]'); return [button]; } },
    window: { localStorage: { setItem(k, v) { if (blocked) throw new Error('Blocked'); values.set(k, v); } },
      addEventListener(k, callback) { events[k] = callback; } }, fields };
  vm.runInNewContext(source, ctx);
  return { ctx, rootNode, button, values, events, fields };
}
for (const blocked of [false, true]) {
  const test = setup(blocked);
  const before = JSON.stringify(test.fields);
  assert.equal(test.button.hidden, false);
  assert.equal(test.button.attributes['aria-checked'], 'true');
  test.button.events.click();
  assert.equal(test.rootNode.dataset.theme, 'light');
  assert.equal(test.button.attributes['aria-checked'], 'false');
  assert.equal(JSON.stringify(test.fields), before, 'Appearance switch must not rebuild form controls');
  assert.equal(test.values.get('booking-draft'), 'preserve this unrelated data');
  if (!blocked) assert.equal(test.values.get('beakim-theme'), 'light');
  test.events.storage({ key: 'beakim-theme', newValue: 'dark' });
  assert.equal(test.rootNode.dataset.theme, 'dark');
  test.events.storage({ key: 'unrelated', newValue: 'light' });
  assert.equal(test.rootNode.dataset.theme, 'dark');
  test.events.storage({ key: 'beakim-theme', newValue: 'light' });
  assert.equal(test.rootNode.dataset.theme, 'light');
  test.events.storage({ key: null, newValue: null });
  assert.equal(test.rootNode.dataset.theme, 'dark');
}
console.log('Theme checks passed: all nine public pages, first-paint bootstrap, saved/invalid/blocked storage, switch state, cross-tab updates, unchanged booking state and compressed JS budget.');
