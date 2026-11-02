// Behavioral regressions: native cross-page navigation, motion and multi-room pricing.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { isCalendarModalViewport, resolveLocalAnchor, getPreferredScrollBehavior, scrollToPageTarget } = require('../assets/js/main');
const home = 'https://www.beakimhospitalitygroup.co.ke/';
const property = home + 'diani-darling';
assert.equal(resolveLocalAnchor('/#booking-entry', property), null);
assert.equal(resolveLocalAnchor('#booking-entry', property), 'booking-entry');
assert.equal(resolveLocalAnchor('/index.html#booking', home), 'booking');
assert.equal(resolveLocalAnchor('/diani-darling.html#conference-packages', property), 'conference-packages');
assert.equal(resolveLocalAnchor('https://example.com/#booking-entry', home), null);
assert.equal(resolveLocalAnchor('/?demo=true#booking-entry', home), null);
assert.equal(resolveLocalAnchor('#booking-entry', home + '?demo=true'), 'booking-entry');
assert.equal(resolveLocalAnchor('#%broken', home), null);
assert.equal(resolveLocalAnchor('#', home), null);
assert.equal(resolveLocalAnchor('/tower-cottages#booking-entry', property), null);
assert.equal(getPreferredScrollBehavior(), 'smooth');
let scrollOptions;
global.window = { matchMedia: () => ({ matches: true }) };
scrollToPageTarget({ scrollIntoView: options => { scrollOptions = options; } });
assert.deepEqual(scrollOptions, { behavior: 'auto', block: 'start' });
global.window.matchMedia = () => ({ matches: false });
scrollToPageTarget({ scrollIntoView: options => { scrollOptions = options; } });
assert.equal(scrollOptions.behavior, 'smooth');
delete global.window;
const { getOfferingById } = require('../assets/js/catalog');
const ctx = { module: { exports: {} }, console, URL, URLSearchParams, Date,
  AbortController, setTimeout, clearTimeout, getOfferingById, captured: null,
  fixture: { name: 'Local Test', phoneNumber: '700000000', countryCode: '+254', email: '',
    property: 'Beakim Darad - Standard Room (Without AC)', checkIn: '2026-11-03',
    checkOut: '2026-11-05', adults: 4, children: 0, unitsCount: 2, hasBreakfast: false,
    selectedAddons: [], preferredContactMethod: 'WhatsApp / Text' } };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/js/main.js'), 'utf8'), ctx);
vm.runInContext('showInquiryReviewModal = summary => { captured = summary; }; processValidBookingSubmission(fixture);', ctx);
assert.equal(ctx.captured.estimatedTotal, 'KSh 6,800');
assert.equal(ctx.captured.inquiryPayload.unitsCount, 2);
assert.equal(ctx.captured.inquiryPayload.estimatedTotal, 6800);
vm.runInContext('fixture.hasBreakfast = true; processValidBookingSubmission(fixture);', ctx);
assert.equal(ctx.captured.estimatedTotal, 'KSh 10,800');
assert.equal(ctx.captured.inquiryPayload.estimatedTotal, 10800);


assert.equal(isCalendarModalViewport(320, 740), true);
assert.equal(isCalendarModalViewport(740, 360), true);
assert.equal(isCalendarModalViewport(1280, 800), false);
assert.equal(isCalendarModalViewport(640, 600), false);
console.log('Mobile UX behavioral regressions passed (navigation, reduced motion, two-room review/payload totals). No inquiries sent.');
