const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const main = require('../assets/js/main');
const { BEAKIM_CATALOG, getOfferingById } = require('../assets/js/catalog');

const routes = [
  ['/', '254750864119'], ['/index.html', '254750864119'],
  ['/tower-cottages', '254750864119'], ['/tower-cottages.html', '254750864119'],
  ['/beakim-darad/', '254750864119'], ['/beakim-darad.html', '254750864119'],
  ['/diani-darling', '254119237439'], ['/diani-darling.html', '254119237439'],
  ['/diani-darling/?test=true#booking-entry', '254119237439'],
  ['/insights', '254750864119'], ['/unknown', '254750864119']
];
const message = 'Two rooms & breakfast\nGuest’s request: +254';
for (const [page, phone] of routes) {
  assert.equal(main.resolveWhatsAppPhone(page), phone);
  global.window = { location: { pathname: page } };
  const url = new URL(main.CommunicationService.buildWhatsAppUrl(message));
  assert.equal(url.pathname, '/' + phone);
  assert.equal(url.searchParams.get('text'), message);
  // Saved links retain their message while adopting the current page destination.
  const recovered = new URL(main.getInquiryWhatsAppUrl({ whatsappUrl: 'https://wa.me/254746938529?text=' + encodeURIComponent(message) }));
  assert.equal(recovered.pathname, '/' + phone);
  assert.equal(recovered.searchParams.get('text'), message);
  const modal = { innerHTML: '' };
  global.document = { getElementById: id => id === 'inquiry-review-modal' ? modal : null };
  const summary = { messageText: message, whatsappUrl: 'https://wa.me/254746938529?text=stale',
    name: 'Local Fixture', property: 'Beakim Darad', dates: '2026-11-06 to 2026-11-08',
    guests: '4', estimatedTotal: 'KSh 6,800', preferredContactMethod: 'WhatsApp / Text' };
  main.renderInquiryNetworkFailure(summary);
  assert.ok(modal.innerHTML.includes('https://wa.me/' + phone + '?text='));
  assert.ok(modal.innerHTML.includes('Retry Server Submission'));
  main.renderInquirySuccessReceipt(summary, 'INQ-LOCAL-FIXTURE');
  assert.ok(modal.innerHTML.includes('https://wa.me/' + phone + '?text='));
  delete global.document;
}
delete global.window;

const html = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const footerPhone = name => /href="tel:\+(\d+)"/.exec(html(name).split('<footer')[1])[1];
assert.equal(main.resolveWhatsAppPhone('/'), footerPhone('index.html'));
assert.equal(main.resolveWhatsAppPhone('/tower-cottages'), footerPhone('index.html'));
assert.equal(main.resolveWhatsAppPhone('/diani-darling'), footerPhone('diani-darling.html'));
assert.equal(main.resolveWhatsAppPhone('/beakim-darad'), footerPhone('beakim-darad.html'));
assert.equal(footerPhone('tower-cottages.html'), '254750864119');
for (const [page, file] of [['/', 'index.html'], ['/tower-cottages', 'tower-cottages.html'], ['/diani-darling', 'diani-darling.html'], ['/beakim-darad', 'beakim-darad.html']]) {
  for (const match of html(file).matchAll(/https:\/\/wa\.me\/(\d+)/g)) {
    assert.equal(match[1], main.resolveWhatsAppPhone(page), file + ' static WhatsApp destination');
  }
}

const tower = main.resolveBookingBenefits('Tower Cottages - 2-Bedroom Apartment', BEAKIM_CATALOG);
assert.equal(tower.showBreakfast, false);
assert.ok(tower.poolDescription.includes('No swimming pool'));
const darling = main.resolveBookingBenefits('Diani Darling Cottages - Deluxe Studio Room', BEAKIM_CATALOG);
assert.ok(darling.poolTitle.startsWith('Swimming Pool'));
assert.ok(!darling.poolDescription.includes('No swimming pool'));
assert.ok(darling.breakfastDescription.includes('1,000'));
assert.ok(main.resolveBookingBenefits('Beakim Darad - Standard Room (Without AC)', BEAKIM_CATALOG).poolTitle.startsWith('2 Swimming Pools'));

// Actual submission-to-review boundary: the page wins over the selected residence.
for (const [page, expected] of [['/', '254750864119'], ['/tower-cottages.html', '254750864119'], ['/diani-darling', '254119237439']]) {
  const ctx = { module: { exports: {} }, console, URL, URLSearchParams, Date, AbortController, setTimeout, clearTimeout,
    getOfferingById, BEAKIM_CATALOG, window: { location: { pathname: page }, addEventListener() {} }, captured: null,
    fixture: { name: 'Local Fixture', phoneNumber: '700000000', countryCode: '+254', email: '',
      property: 'Beakim Darad - Standard Room (Without AC)', checkIn: '2026-11-06', checkOut: '2026-11-08',
      adults: 4, children: 0, unitsCount: 2, hasBreakfast: false, selectedAddons: [], preferredContactMethod: 'WhatsApp / Text' } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/js/main.js'), 'utf8'), ctx);
  vm.runInContext('showInquiryReviewModal = summary => { captured = summary; }; processValidBookingSubmission(fixture);', ctx);
  assert.equal(new URL(ctx.captured.whatsappUrl).pathname, '/' + expected);
  assert.equal(ctx.captured.inquiryPayload.estimatedTotal, 6800);
  assert.equal(ctx.captured.inquiryPayload.unitsCount, 2);
}

// Text contrast for the approved default/hover and two remaining failing areas.
function luminance(hex) {
  const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return channels.reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
}
for (const [foreground, background] of [['#0D2318', '#25D366'], ['#0D2318', '#1EBE5D'], ['#0D2318', '#B8965A'], ['#D4B07A', '#1A3D28']]) {
  const [dark, light] = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  assert.ok((light + 0.05) / (dark + 0.05) >= 4.5);
}
console.log('Contact routing, footer agreement, saved messages, receipt/failure helpers, page-based review routing, benefits and contrast checks passed. No inquiries or messages sent.');
