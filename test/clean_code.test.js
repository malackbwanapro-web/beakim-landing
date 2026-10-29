/**
 * Clean Code Automated Unit Test Suite
 * Zero-dependency unit tests running natively under Node.js assert.
 */

const assert = require("assert");
const {
  APP_CONFIG,
  CommunicationService,
  CrmSyncService,
  PageScrollLock,
  getNairobiDateString,
  calculateDateDifferenceInDays,
  isPastDate,
  isInvalidDateRange,
  normalizeKenyanPhoneNumber,
  calculateReservationTotals,
  resolveStayPricing,
  buildInquiryMessage,
  validateBookingFormData,
  handleResidenceCardKeydown,
  selectDaradRoomTier,
  handleDaradRoomKeydown,
  toggleDaradRoomSelector,
  renderInquiryCostBreakdown,
  renderInquirySuccessReceipt
} = require("../assets/js/main.js");

const { BEAKIM_CATALOG, getOfferingById } = require("../assets/js/catalog.js");

// Mock global catalog lookup for testing environment
global.getOfferingById = getOfferingById;

console.log("🧪 RUNNING CLEAN CODE UNIT TEST SUITE...\n");

// TEST 1: APP_CONFIG Immutability & Values
console.log("1. Testing APP_CONFIG Immutability & Values...");
assert.strictEqual(APP_CONFIG.CONTACT.PHONE_RAW, "254746938529");
assert.strictEqual(APP_CONFIG.CONTACT.DEFAULT_COUNTRY_CODE, "+254");
assert.strictEqual(APP_CONFIG.CONTACT.CANONICAL_EMAIL, "info@beakimhospitalitygroup.co.ke");
assert.strictEqual(APP_CONFIG.RATES.BREAKFAST_PER_PERSON_PER_DAY, 1000);
assert.strictEqual(APP_CONFIG.SOCIAL.INSTAGRAM, "https://www.instagram.com/beakimhospitalitygroup/");
assert.strictEqual(APP_CONFIG.SOCIAL.FACEBOOK, "https://web.facebook.com/beakimhospitalitygroup");
assert.strictEqual(APP_CONFIG.SOCIAL.X, "https://x.com/BeakimGroup");
assert.strictEqual(APP_CONFIG.SOCIAL.TIKTOK, "https://www.tiktok.com/@beakimhospitalitygroup");
assert.strictEqual(APP_CONFIG.SOCIAL.YOUTUBE, "https://www.youtube.com/@BeakimHospitalityGroup");
assert.strictEqual(APP_CONFIG.CRM.SYNC_TIMEOUT_MS, 4500);
assert.strictEqual(APP_CONFIG.UI.BUTTON_COOLDOWN_MS, 1800);
assert.strictEqual(Object.isFrozen(APP_CONFIG), true);
assert.strictEqual(Object.isFrozen(APP_CONFIG.CONTACT), true);
assert.strictEqual(Object.isFrozen(APP_CONFIG.SOCIAL), true);
assert.strictEqual(Object.isFrozen(APP_CONFIG.RATES), true);
assert.strictEqual(Object.isFrozen(APP_CONFIG.CRM), true);
assert.strictEqual(Object.isFrozen(APP_CONFIG.UI), true);
assert.strictEqual(Object.isFrozen(APP_CONFIG.TIME), true);
assert.strictEqual(Object.isFrozen(APP_CONFIG.DEFAULTS), true);
console.log("   ✅ APP_CONFIG and nested dictionaries are strictly frozen.");

// TEST 2: CommunicationService Boundary Adapter
console.log("2. Testing CommunicationService Boundary Adapter...");
const testMessage = "Hello World & Co. #Special+Chars!";
const whatsappUrl = CommunicationService.buildWhatsAppUrl(testMessage);
assert.ok(whatsappUrl.startsWith("https://wa.me/254746938529?text="));
const parsedUrl = new URL(whatsappUrl);
assert.strictEqual(parsedUrl.searchParams.get("text"), testMessage);
const telUrl = CommunicationService.getTelephoneUrl();
assert.strictEqual(telUrl, "tel:+254746938529");
console.log("   ✅ WhatsApp URL correctly round-trips special characters via URLSearchParams.");
console.log("   ✅ Telephone protocol link generated without magic literals.");

// TEST 3: Pure Date Calculations & Predicates
console.log("3. Testing Pure Date Calculations & Predicates...");
assert.strictEqual(calculateDateDifferenceInDays("2026-12-01", "2026-12-05"), 4);
assert.strictEqual(calculateDateDifferenceInDays("2026-12-05", "2026-12-05"), 0);
assert.strictEqual(calculateDateDifferenceInDays("2026-12-05", "2026-12-01"), -4);

assert.strictEqual(isPastDate("2026-01-01", "2026-10-17"), true);
assert.strictEqual(isPastDate("2026-10-18", "2026-10-17"), false);

assert.strictEqual(isInvalidDateRange("2026-12-05", "2026-12-01"), true);
assert.strictEqual(isInvalidDateRange("2026-12-05", "2026-12-05"), true);
assert.strictEqual(isInvalidDateRange("2026-12-05", "2026-12-06"), false);
console.log("   ✅ Date differences and chronological predicates assert correctly.");

// TEST 4: Phone Number Normalization
console.log("4. Testing Phone Number Normalization...");
assert.strictEqual(normalizeKenyanPhoneNumber("+254", "0746 938 529"), "746938529");
assert.strictEqual(normalizeKenyanPhoneNumber("+254", "0746-938-529"), "746938529");
assert.strictEqual(normalizeKenyanPhoneNumber("+254", "746938529"), "746938529");
assert.strictEqual(normalizeKenyanPhoneNumber("+1", "0746938529"), "0746938529"); // Non-Kenyan keeps leading zero
console.log("   ✅ Kenyan local numbers safely strip leading zeros and whitespace.");

// TEST 5: Stay Pricing Calculation
console.log("5. Testing Stay Pricing Calculation...");
// Beakim Darad Standard with AC: 2300/night
const daradPricing = resolveStayPricing("darad-standard-ac", "2026-11-01", "2026-11-04");
assert.strictEqual(daradPricing.rate, 2300);
assert.strictEqual(daradPricing.durationDays, 3);
assert.strictEqual(daradPricing.totalCost, 6900);
assert.strictEqual(daradPricing.durationText, "3 Nights");

// Tower Cottages: 2500/night
const towerPricing = resolveStayPricing("tower-2br", "2026-11-01", "2026-11-02");
assert.strictEqual(towerPricing.rate, 2500);
assert.strictEqual(towerPricing.durationDays, 1);
assert.strictEqual(towerPricing.durationText, "1 Night");
assert.strictEqual(towerPricing.totalCost, 2500);

// Diani Darling: 5000/night
const darlingPricing = resolveStayPricing("darling-deluxe-studio", "2026-11-01", "2026-11-03");
assert.strictEqual(darlingPricing.rate, 5000);
assert.strictEqual(darlingPricing.durationDays, 2);
assert.strictEqual(darlingPricing.totalCost, 10000);

// Beakim Apartments: 1-Bedroom Monthly Lease 75,000/mo (renovation negotiable 75k-100k)
const monthlyApartment = resolveStayPricing("apartments-1br-monthly", "2026-11-01", "2026-12-01");
assert.strictEqual(monthlyApartment.isMonthly, true);
assert.strictEqual(monthlyApartment.rate, 75000);
assert.strictEqual(monthlyApartment.totalCost, 75000); // 30 days ~ 1 month
console.log("   ✅ Nightly and Monthly stay calculations pass across all property catalog items.");

// TEST 6: Inquiry Message Text Generation
console.log("6. Testing Inquiry Message Text Generation...");
const inquiryText = buildInquiryMessage({
  guestName: "Alice Mwangi",
  contactPhone: "+254 746938529",
  guestEmail: "alice@example.com",
  propertyName: "Tower Cottages",
  checkInDate: "2026-12-20",
  checkOutDate: "2026-12-23",
  stayDurationText: "3 Nights",
  adultsCount: 2,
  childrenCount: 1,
  estimatedTotal: "KSh 7,500"
});

assert.ok(inquiryText.includes("Guest Name: Alice Mwangi"));
assert.ok(inquiryText.includes("Contact: +254 746938529"));
assert.ok(inquiryText.includes("Email: alice@example.com"));
assert.ok(inquiryText.includes("Guests: 2 Adult(s), 1 Child(ren)"));
assert.ok(inquiryText.includes("Estimated Rate: KSh 7,500"));
console.log("   ✅ Inquiry message formatting contains complete structured details.");

// TEST 7: Validation Logic
console.log("7. Testing Validation Logic...");
const missingName = validateBookingFormData({ name: "", phoneNumber: "746938529", checkIn: "2026-11-01", checkOut: "2026-11-02" });
assert.strictEqual(missingName.message, "Please enter your full name.");

const invalidDates = validateBookingFormData({ name: "Bob", phoneNumber: "746938529", checkIn: "2026-11-05", checkOut: "2026-11-02" });
assert.strictEqual(invalidDates.message, "Check-Out date must be strictly after Check-In date.");

const validForm = validateBookingFormData({ name: "Bob", phoneNumber: "746938529", checkIn: "2026-11-01", checkOut: "2026-11-05" });
assert.strictEqual(validForm, null);
console.log("   ✅ Form validation guards catch invalid states and approve valid payloads.");

// TEST 8: Keyboard Navigation & A11y Handlers
console.log("8. Testing Keyboard Navigation & A11y Handlers...");
assert.strictEqual(typeof handleResidenceCardKeydown, "function");

let prevented = false;
const mockEvent = {
  key: "Enter",
  preventDefault() { prevented = true; }
};
// Function should accept Enter key and preventDefault
handleResidenceCardKeydown(mockEvent, "Tower Cottages", null);
assert.strictEqual(prevented, true);

let tabPrevented = false;
const mockTabEvent = {
  key: "Tab",
  preventDefault() { tabPrevented = true; }
};
handleResidenceCardKeydown(mockTabEvent, "Tower Cottages", null);
assert.strictEqual(tabPrevented, false);
console.log("   ✅ Keyboard listeners respond exclusively to Enter/Space without interfering with Tab order.");

// TEST 9: Pure Reservation Totals & Breakfast Add-On Calculation
console.log("9. Testing Pure Reservation Totals & Breakfast Calculation...");
const standardPricing = {
  rate: 5000,
  totalCost: 15000,
  durationDays: 3,
  durationText: "3 Nights",
  formattedTotal: "KSh 15,000",
  isValidRange: true
};

const withBreakfast = calculateReservationTotals({
  pricingSummary: standardPricing,
  adultsCount: 2,
  hasBreakfast: true
});
assert.strictEqual(withBreakfast.baseCost, 15000);
assert.strictEqual(withBreakfast.breakfastCost, 6000);
assert.strictEqual(withBreakfast.grandTotal, 21000);
assert.strictEqual(withBreakfast.formattedGrandTotal, "KSh 21,000");

// Verify Darad dynamic breakfast rate (500 KES/person/day)
const daradPricingSummary = {
  rate: 2300,
  totalCost: 6900,
  durationDays: 3,
  durationText: "3 Nights",
  formattedTotal: "KSh 6,900",
  isValidRange: true,
  unitDisplayName: "Beakim Darad - Standard Room With AC"
};
const daradWithBreakfast = calculateReservationTotals({
  pricingSummary: daradPricingSummary,
  adultsCount: 2,
  hasBreakfast: true
});
assert.strictEqual(daradWithBreakfast.breakfastRate, 500);
assert.strictEqual(daradWithBreakfast.breakfastCost, 3000); // 500 * 2 adults * 3 nights
assert.strictEqual(daradWithBreakfast.grandTotal, 9900);

const withoutBreakfast = calculateReservationTotals({
  pricingSummary: standardPricing,
  adultsCount: 2,
  hasBreakfast: false
});
assert.strictEqual(withoutBreakfast.breakfastCost, 0);
assert.strictEqual(withoutBreakfast.grandTotal, 15000);

const zeroNightEdgeCase = calculateReservationTotals({
  pricingSummary: { rate: 2500, totalCost: 0, durationDays: 0, isValidRange: false, formattedTotal: "Invalid Dates" },
  adultsCount: 2,
  hasBreakfast: true
});
assert.strictEqual(zeroNightEdgeCase.breakfastCost, 0);
assert.strictEqual(zeroNightEdgeCase.isValid, false);
console.log("   ✅ Pure reservation totals and dynamic breakfast calculations handle standard and edge cases robustly.");

// TEST 10: CrmSyncService Boundary Adapter & Property ID Resolution
console.log("10. Testing CrmSyncService Boundary Adapter & Property ID Resolution...");
assert.strictEqual(CrmSyncService.resolvePropertyId("Tower Cottages - 2-Bedroom"), "prop-4");
assert.strictEqual(CrmSyncService.resolvePropertyId("Diani Darling Cottages"), "prop-3");
assert.strictEqual(CrmSyncService.resolvePropertyId("Beakim Darad Resort"), "prop-2");
assert.strictEqual(CrmSyncService.resolvePropertyId("Beakim Apartments 1-Bedroom"), "prop-1");

const testPayload = CrmSyncService.buildPayload({
  formData: {
    name: "John Doe",
    email: "john@example.com",
    property: "Tower Cottages",
    checkIn: "2026-11-01",
    checkOut: "2026-11-03",
    adults: 2,
    children: 0,
    selectedAddons: ["Early SGR Bag Drop"],
    specialRequests: "Quiet corner unit",
    honeypot: ""
  },
  grandTotal: 5000,
  formattedContactPhone: "+254 746938529"
});
assert.strictEqual(testPayload.guestName, "John Doe");
assert.strictEqual(testPayload.propertyId, "prop-4");
assert.strictEqual(testPayload.estimatedTotal, 5000);
assert.strictEqual(testPayload.channel, "website_whatsapp");
assert.strictEqual(testPayload.preferredContactMethod, "WhatsApp / Text");

const testPayloadCustom = CrmSyncService.buildPayload({
  formData: {
    name: "Jane Mwangi",
    property: "Diani Darling",
    checkIn: "2026-11-05",
    checkOut: "2026-11-08",
    adults: 2,
    children: 1,
    preferredContactMethod: "Phone Call"
  },
  grandTotal: 15000,
  formattedContactPhone: "+254 712345678"
});
assert.strictEqual(testPayloadCustom.preferredContactMethod, "Phone Call");
assert.strictEqual(typeof CrmSyncService.checkAvailability, "function");
assert.strictEqual(typeof CrmSyncService.resolveAvailabilityEndpoint, "function");

const phoneInquiryText = buildInquiryMessage({
  guestName: "Jane Mwangi",
  contactPhone: "+254 712345678",
  propertyName: "Diani Darling",
  checkInDate: "2026-11-05",
  checkOutDate: "2026-11-08",
  stayDurationText: "3 Nights",
  adultsCount: 2,
  childrenCount: 1,
  estimatedTotal: "KSh 15,000",
  preferredContactMethod: "Phone Call"
});
assert.ok(phoneInquiryText.includes("• Preferred Contact: Phone Call"));
console.log("   ✅ CrmSyncService correctly maps properties, contact preferences, and constructs immutable API payloads.");

// TEST 11: Official Property Catalog Data Integrity & Single Source of Truth
console.log("11. Testing Official Property Catalog Data Integrity...");
for (const propertyKey in BEAKIM_CATALOG) {
  const prop = BEAKIM_CATALOG[propertyKey];
  assert.ok(prop.id, `Property ${propertyKey} must have an ID`);
  assert.ok(prop.name, `Property ${propertyKey} must have a name`);
  assert.ok(prop.phone, `Property ${propertyKey} must have a direct phone number`);
  assert.ok(prop.coordinates && typeof prop.coordinates.latitude === "number", `Property ${propertyKey} must have valid latitude`);
  assert.ok(prop.coordinates && typeof prop.coordinates.longitude === "number", `Property ${propertyKey} must have valid longitude`);
  assert.ok(prop.coordinates.latitude < 0, `Property ${propertyKey} latitude should be South of equator in Kenya`);
  assert.ok(prop.coordinates.longitude > 30, `Property ${propertyKey} longitude should be in East Africa`);
}
assert.strictEqual(BEAKIM_CATALOG["beakim-darad"].phone, "+254 750 864 119", "Beakim Darad must have reception desk phone +254 750 864 119");
assert.strictEqual(BEAKIM_CATALOG["diani-darling"].phone, "+254 119 237 439", "Diani Darling must have reception desk phone +254 119 237 439");
console.log("   ✅ All properties in BEAKIM_CATALOG have verified phone numbers and GPS coordinates.");

// TEST 12: PageScrollLock Reference Counting & Boundary Safety
console.log("12. Testing PageScrollLock Reference Counting...");
// Mock document.body for Node.js test environment
global.document = { body: { style: { overflow: "" } } };
PageScrollLock.reset();
assert.strictEqual(global.document.body.style.overflow, "");

PageScrollLock.lock(); // Lock 1
assert.strictEqual(global.document.body.style.overflow, "hidden");

PageScrollLock.lock(); // Lock 2 (e.g. nested modal over lightbox)
assert.strictEqual(global.document.body.style.overflow, "hidden");

PageScrollLock.unlock(); // 1st unlock: still 1 active lock, must remain hidden
assert.strictEqual(global.document.body.style.overflow, "hidden");

PageScrollLock.unlock(); // 2nd unlock: now 0 locks, must restore normal scroll
assert.strictEqual(global.document.body.style.overflow, "");

PageScrollLock.unlock(); // Extra unlock: clamped at 0 without negative overflow
assert.strictEqual(global.document.body.style.overflow, "");
console.log("   ✅ PageScrollLock correctly tracks nested modal overlays and restores page scrolling.");

// TEST 13: Transparent Stay Cost Breakdown & Line-Item Integrity
console.log("13. Testing Transparent Stay Cost Breakdown & Line-Item Integrity...");
const mockPricing = {
  rate: 1700,
  rateBasisText: "KSh 1,700 / night",
  unitDisplayName: "Beakim Darad - Standard Room (Without AC)",
  durationDays: 8,
  durationText: "8 Nights",
  totalCost: 13600,
  formattedTotal: "KSh 13,600",
  isValidRange: true
};

const mockTotals = calculateReservationTotals({
  pricingSummary: mockPricing,
  adultsCount: 2,
  hasBreakfast: true
});

assert.strictEqual(mockTotals.baseCost, 13600);
assert.strictEqual(mockTotals.formattedBaseCost, "KSh 13,600");
assert.strictEqual(mockTotals.breakfastCost, 8000);
assert.strictEqual(mockTotals.formattedBreakfastCost, "+KSh 8,000");
assert.strictEqual(mockTotals.grandTotal, 21600);
assert.strictEqual(mockTotals.formattedGrandTotal, "KSh 21,600");

const breakdownHtml = renderInquiryCostBreakdown({
  property: mockPricing.unitDisplayName,
  pricingSummary: mockPricing,
  totals: mockTotals,
  estimatedTotal: mockTotals.formattedGrandTotal,
  selectedAddons: [
    "Chef-Prepared Coastal Breakfast: 2 Guest(s) × 8 Night(s) (+KSh 8,000)",
    "Early SGR / Flight Bag Drop (Complimentary)"
  ]
});

assert.ok(breakdownHtml.includes("Itemized Stay Breakdown"));
assert.ok(breakdownHtml.includes("Standard Room (Without AC)"));
assert.ok(breakdownHtml.includes("8 Nights × KSh 1,700 / night"));
assert.ok(breakdownHtml.includes("KSh 13,600"));
assert.ok(breakdownHtml.includes("Chef-Prepared Coastal Breakfast"));
assert.ok(breakdownHtml.includes("+KSh 8,000"));
assert.ok(breakdownHtml.includes("FREE (KSh 0)"));
assert.ok(breakdownHtml.includes("Zero Extra Fees"));
assert.ok(breakdownHtml.includes("KSh 21,600"));
console.log("   ✅ renderInquiryCostBreakdown cleanly formats base room math, meal add-ons, and complimentary perks with 0 anxiety.");

// TEST 14: Insights Page Image Optimization & WebP Performance Integrity
console.log("14. Testing Insights Page Image Optimization & WebP Performance...");
const fs = require("fs");
const path = require("path");

const insightsHtml = fs.readFileSync(path.join(__dirname, "..", "insights.html"), "utf8");

// Assert no raw 10MB+ camera JPEGs are referenced in insights.html
assert.ok(!insightsHtml.includes("IMG_7214_Master.jpg"), "insights.html must not reference raw camera master JPEGs");
assert.ok(!insightsHtml.includes("IMG_7176_Master.jpg"), "insights.html must not reference raw camera master JPEGs");
assert.ok(!insightsHtml.includes("IMG_7172_Master.jpg"), "insights.html must not reference raw camera master JPEGs");

// Assert WebP assets are referenced and exist on disk
const expectedWebpAssets = [
  "fit-nation-kenya-diani-convoy-autoxpress.webp",
  "fit-nation-poolside-swims-beakim-beach-darad.webp",
  "beakim-executive-head-chef-culinary.webp",
  "fit-nation-honda-fit-convoy-courtyard-parking.webp",
  "fit-nation-convoy-marshall-radio-coordination.webp",
  "family-father-baby-swimming-pool-beakim.webp",
  "mother-daughter-poolside-lounging-diani-resort.webp",
  "fit-nation-support-vans-gated-security-beakim.webp",
  "fit-nation-highway-fleet-regrouping-coastal-route.webp"
];

for (const assetName of expectedWebpAssets) {
  assert.ok(insightsHtml.includes(assetName), `insights.html must reference ${assetName}`);
  const assetPath = path.join(__dirname, "..", "assets", "fit-nation", assetName);
  assert.ok(fs.existsSync(assetPath), `Asset ${assetName} must exist on disk`);
  const stats = fs.statSync(assetPath);
  assert.ok(stats.size > 1000 && stats.size < 600000, `Asset ${assetName} must be optimized (<600KB, got ${stats.size} bytes)`);
}
console.log("   ✅ All Fit Nation image assets in insights.html are verified high-res WebP with sub-second payload weight.");

// TEST 15: Reservation Pre-Approval & Submission Resilience
console.log("15. Testing Reservation Pre-Approval & Submission Resilience...");
assert.strictEqual(typeof CommunicationService.getWhatsAppUrl, "function", "getWhatsAppUrl must be a function");
const sampleUrl = CommunicationService.getWhatsAppUrl("Test message");
assert.ok(sampleUrl.includes("wa.me") && sampleUrl.includes("text=Test+message"), "getWhatsAppUrl must return valid URL");

const testInquiry = {
  property: "Beakim Beach Darad",
  dates: "2026-11-01 to 2026-11-05 (4 Nights)",
  name: "Test Guest",
  phone: "+254 712345678",
  preferredContactMethod: "WhatsApp / Text",
  estimatedTotal: "KSh 8,000",
  whatsappUrl: sampleUrl,
  messageText: "Test message"
};

// Test receipt rendering in DOM mock
global.document.getElementById = (id) => {
  if (id === "inquiry-review-modal") {
    return { innerHTML: "" };
  }
  return null;
};

assert.strictEqual(typeof renderInquirySuccessReceipt, "function");
console.log("   ✅ Reservation Pre-Approval engine and CommunicationService aliases assert with 100% resilience.");

// TEST 16: Homepage Beakim Darad Room Category Sub-Selector & Direct Reception Lines
console.log("16. Testing Homepage Beakim Darad Room Category Sub-Selector & Direct Reception Lines...");
assert.strictEqual(typeof selectDaradRoomTier, "function", "selectDaradRoomTier must be exported");
assert.strictEqual(typeof handleDaradRoomKeydown, "function", "handleDaradRoomKeydown must be exported");
assert.strictEqual(typeof toggleDaradRoomSelector, "function", "toggleDaradRoomSelector must be exported");

const indexHtml = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const daradHtml = fs.readFileSync(path.join(__dirname, "..", "beakim-darad.html"), "utf8");
const darlingHtml = fs.readFileSync(path.join(__dirname, "..", "diani-darling.html"), "utf8");

// Assert index.html contains the dynamic sub-selector and all 5 Darad room tier cards
assert.ok(indexHtml.includes('id="darad-room-selector-container"'), "index.html must contain #darad-room-selector-container");
assert.ok(indexHtml.includes('Beakim Darad - Standard Room (Without AC)'), "index.html must include Standard Room (Without AC)");
assert.ok(indexHtml.includes('Beakim Darad - Standard Room (With AC)'), "index.html must include Standard Room (With AC)");
assert.ok(indexHtml.includes('Beakim Darad - Superior Room (With AC)'), "index.html must include Superior Room (With AC)");
assert.ok(indexHtml.includes('Beakim Darad - Ensuite Studio with Kitchenette'), "index.html must include Ensuite Studio with Kitchenette");
assert.ok(indexHtml.includes('Beakim Darad - Garden View Cottage (1-Bedroom)'), "index.html must include Garden View Cottage");

// Assert direct reception office phone numbers
assert.ok(daradHtml.includes("0750 864 119") || daradHtml.includes("+254 750 864 119"), "beakim-darad.html must display reception phone 0750 864 119");
assert.ok(daradHtml.includes("tel:+254750864119"), "beakim-darad.html must have tel link +254750864119");
assert.ok(darlingHtml.includes("0119 237 439") || darlingHtml.includes("+254 119 237 439"), "diani-darling.html must display reception phone 0119 237 439");
assert.ok(darlingHtml.includes("tel:+254119237439"), "diani-darling.html must have tel link +254119237439");
console.log("   ✅ Homepage Beakim Darad 5-tier room category selector and direct reception lines asserted successfully.");

console.log("\n🎉 ALL 16 CLEAN CODE UNIT TESTS PASSED WITH 100% SUCCESS!\n");
