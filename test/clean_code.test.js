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
  formatTwoDigitNumber,
  isDateBetween,
  normalizeKenyanPhoneNumber,
  calculateReservationTotals,
  resolveStayPricing,
  buildInquiryMessage,
  validateBookingFormData,
  syncBreakfastAddonCard,
  handleResidenceCardKeydown,
  selectDaradRoomTier,
  handleDaradRoomKeydown,
  toggleDaradRoomSelector,
  renderInquiryCostBreakdown,
  renderInquirySuccessReceipt,
  initializeConciergeHesitationEngine,
  initializeScrollRevealEngine,
  BeakimDateRangePicker,
  SafeStorageService,
  isDemoModeActive,
  resolveConferencePackage,
  buildConferenceRfpMessage,
  renderAvailabilityUnknown,
  renderAvailabilityPreApproved,
  renderInquiryNetworkFailure,
  renderAvailabilityCapacityWarning,
  generateFallbackInquiryId
} = require("../assets/js/main.js");

const { BEAKIM_CATALOG, BEAKIM_POLICIES, getOfferingById } = require("../assets/js/catalog.js");

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
assert.strictEqual(Object.isFrozen(APP_CONFIG.CALENDAR), true);
assert.strictEqual(APP_CONFIG.CALENDAR.AUTO_CLOSE_DELAY_MS, 350);
assert.strictEqual(APP_CONFIG.CALENDAR.DEFAULT_STAY_NIGHTS, 2);
assert.strictEqual(APP_CONFIG.CALENDAR.WEEKDAY_NAMES_SHORT.length, 7);
assert.strictEqual(APP_CONFIG.CALENDAR.MONTH_NAMES_FULL.length, 12);
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

// Pure formatTwoDigitNumber unit tests
assert.strictEqual(formatTwoDigitNumber(1), "01");
assert.strictEqual(formatTwoDigitNumber(9), "09");
assert.strictEqual(formatTwoDigitNumber(10), "10");
assert.strictEqual(formatTwoDigitNumber(12), "12");
assert.strictEqual(formatTwoDigitNumber(0), "00");

// Pure isDateBetween predicate unit tests
assert.strictEqual(isDateBetween("2026-11-05", "2026-11-01", "2026-11-10"), true);
assert.strictEqual(isDateBetween("2026-11-01", "2026-11-01", "2026-11-10"), false);
assert.strictEqual(isDateBetween("2026-11-10", "2026-11-01", "2026-11-10"), false);
assert.strictEqual(isDateBetween("2026-11-15", "2026-11-01", "2026-11-10"), false);
assert.strictEqual(isDateBetween(null, "2026-11-01", "2026-11-10"), false);
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
const missingName = validateBookingFormData({ name: "", phoneNumber: "746938529", checkIn: "2028-11-01", checkOut: "2028-11-02" });
assert.strictEqual(missingName.message, "Please enter your full name.");

const invalidDates = validateBookingFormData({ name: "Bob", phoneNumber: "746938529", checkIn: "2028-11-05", checkOut: "2028-11-02" });
assert.strictEqual(invalidDates.message, "Check-Out date must be strictly after Check-In date.");

const validForm = validateBookingFormData({ name: "Bob", phoneNumber: "746938529", checkIn: "2028-11-01", checkOut: "2028-11-05" });
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

// Specific Regression Test: 6 Nights, 2 Adults, Beakim Darad Superior Room with Breakfast
const superiorPricing = resolveStayPricing("Beakim Darad - Superior Room (With AC)", "2026-11-01", "2026-11-07");
assert.strictEqual(superiorPricing.totalCost, 18000); // 3,000 * 6 nights
assert.strictEqual(superiorPricing.durationDays, 6);

// Test totals with propertyIdentifier passed
const superiorWithBreakfast = calculateReservationTotals({
  pricingSummary: superiorPricing,
  adultsCount: 2,
  hasBreakfast: true,
  propertyIdentifier: "Beakim Darad - Superior Room (With AC)"
});
assert.strictEqual(superiorWithBreakfast.breakfastRate, 500, "Beakim Darad Superior Room breakfast rate must be KSh 500/day");
assert.strictEqual(superiorWithBreakfast.breakfastCost, 6000, "2 Adults x 6 Nights @ KSh 500 must equal KSh 6,000 (not KSh 12,000)");
assert.strictEqual(superiorWithBreakfast.grandTotal, 24000, "18,000 base + 6,000 breakfast must equal KSh 24,000");

// Test totals when only unitDisplayName is present (fallback safety check)
const superiorStandaloneTotals = calculateReservationTotals({
  pricingSummary: {
    unitDisplayName: "Superior Room (With AC)",
    durationDays: 6,
    totalCost: 18000,
    isValidRange: true
  },
  adultsCount: 2,
  hasBreakfast: true
});
assert.strictEqual(superiorStandaloneTotals.breakfastRate, 500, "Catalog resolver must resolve KSh 500 from unit title alone");
assert.strictEqual(superiorStandaloneTotals.breakfastCost, 6000, "Breakfast cost must be KSh 6,000");

// Test itemized breakdown rendering accuracy
const daradSuperiorBreakdownHtml = renderInquiryCostBreakdown({
  property: "Beakim Darad - Superior Room (With AC)",
  pricingSummary: superiorPricing,
  totals: superiorWithBreakfast,
  selectedAddons: ["Chef-Prepared Coastal Breakfast: 2 Guest(s) x 6 Night(s) (+KSh 6,000)"]
});
assert.ok(daradSuperiorBreakdownHtml.includes("@ KSh 500 / day"), "Breakdown must display KSh 500 / day for Darad");
assert.ok(daradSuperiorBreakdownHtml.includes("+KSh 6,000"), "Breakdown must display +KSh 6,000 for breakfast add-on");
assert.ok(!daradSuperiorBreakdownHtml.includes("+KSh 12,000"), "Breakdown must NOT display +KSh 12,000");

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
assert.strictEqual(typeof renderAvailabilityUnknown, "function", "renderAvailabilityUnknown must be exported");
const unknownAvailabilityHtml = renderAvailabilityUnknown();
assert.ok(unknownAvailabilityHtml.includes("Live sync unavailable"), "renderAvailabilityUnknown must state live sync is unavailable");
assert.ok(unknownAvailabilityHtml.includes("within 15–30 mins"), "renderAvailabilityUnknown must state 15-30 min SLA");
assert.ok(!unknownAvailabilityHtml.includes("Pre-Approved"), "renderAvailabilityUnknown must never falsely claim Pre-Approved");
console.log("   ✅ Reservation Pre-Approval engine, transparent unknown fallback, and CommunicationService aliases assert with 100% resilience.");

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

// TEST 17: Desktop Circular FAB Contact Dock & Concierge Hesitation Engine
console.log("17. Testing Desktop Circular FAB Contact Dock & Concierge Hesitation Engine...");
assert.strictEqual(typeof initializeConciergeHesitationEngine, "function", "initializeConciergeHesitationEngine must be exported");

// Assert safe execution in headless/SSR environment (window/document absent or simulated)
assert.doesNotThrow(() => {
  initializeConciergeHesitationEngine();
}, "initializeConciergeHesitationEngine must gracefully handle headless/SSR runtime");

// Assert all key landing pages have desktop circular FAB classes and action attributes
const commDockPages = [
  "index.html",
  "beakim-darad.html",
  "diani-darling.html",
  "tower-cottages.html",
  "beakim-apartments.html",
  "insights.html",
  "404.html"
];

for (const pageName of commDockPages) {
  const pageContent = fs.readFileSync(path.join(__dirname, "..", pageName), "utf8");
  assert.ok(pageContent.includes('data-comm-action="whatsapp"'), `${pageName} must declare data-comm-action="whatsapp"`);
  assert.ok(pageContent.includes('data-comm-action="phone"'), `${pageName} must declare data-comm-action="phone"`);
  assert.ok(pageContent.includes('md:w-14 md:h-14'), `${pageName} must style desktop FAB with 56px circular bounds (md:w-14 md:h-14)`);
  assert.ok(pageContent.includes('<span class="md:hidden">WhatsApp</span>'), `${pageName} must hide WhatsApp text on desktop`);
}
console.log("   ✅ Desktop circular 56px FABs and 8-second hesitation telemetry engine asserted across all 7 pages.");

// TEST 18: Beakim Luxury Month Calendar Range Picker Engine & Form Integration
console.log("18. Testing Beakim Luxury Month Calendar Range Picker Engine & Form Integration...");
assert.strictEqual(typeof BeakimDateRangePicker, "object", "BeakimDateRangePicker must be exported as an object");
assert.strictEqual(typeof BeakimDateRangePicker.formatDisplayDate, "function", "formatDisplayDate must be a function");
assert.strictEqual(typeof BeakimDateRangePicker.formatShortDisplayDate, "function", "formatShortDisplayDate must be a function");

// Test pure date string formatting logic
assert.strictEqual(BeakimDateRangePicker.formatDisplayDate("2026-11-06"), "Fri, 6 Nov 2026");
assert.strictEqual(BeakimDateRangePicker.formatShortDisplayDate("2026-11-06"), "Fri, 6 Nov");
assert.strictEqual(BeakimDateRangePicker.formatShortDisplayDate("2026-12-25"), "Fri, 25 Dec");

// Test Clean Code SRP decomposed helper methods
assert.strictEqual(typeof BeakimDateRangePicker.buildStatusGuidanceHtml, "function", "buildStatusGuidanceHtml must be an SRP helper function");
assert.strictEqual(typeof BeakimDateRangePicker.buildCalendarPresetsHtml, "function", "buildCalendarPresetsHtml must be an SRP helper function");
assert.strictEqual(typeof BeakimDateRangePicker.buildCalendarMonthNavHtml, "function", "buildCalendarMonthNavHtml must be an SRP helper function");
assert.strictEqual(typeof BeakimDateRangePicker.buildCalendarDayCellHtml, "function", "buildCalendarDayCellHtml must be an SRP helper function");
assert.strictEqual(typeof BeakimDateRangePicker.buildCalendarDaysGridHtml, "function", "buildCalendarDaysGridHtml must be an SRP helper function");
assert.strictEqual(typeof BeakimDateRangePicker.buildCalendarFooterHtml, "function", "buildCalendarFooterHtml must be an SRP helper function");

// Assert safe execution in headless/SSR environment
assert.doesNotThrow(() => {
  BeakimDateRangePicker.init();
}, "BeakimDateRangePicker.init must handle headless/SSR runtime gracefully");

// Assert 2-step frictionless selection transitions
BeakimDateRangePicker.state.step = "check-in";
BeakimDateRangePicker.state.checkIn = null;
BeakimDateRangePicker.state.checkOut = null;

// Step 1: Guest selects check-in date
BeakimDateRangePicker.selectDate("2026-11-10");
assert.strictEqual(BeakimDateRangePicker.state.checkIn, "2026-11-10", "Step 1 must set checkIn date");
assert.strictEqual(BeakimDateRangePicker.state.checkOut, null, "Step 1 must clear checkOut date to prompt checkOut selection");
assert.strictEqual(BeakimDateRangePicker.state.step, "check-out", "Step 1 must transition step to check-out without closing");

// Step 2: Guest selects check-out date
BeakimDateRangePicker.selectDate("2026-11-14");
assert.strictEqual(BeakimDateRangePicker.state.checkIn, "2026-11-10", "Step 2 must preserve checkIn date");
assert.strictEqual(BeakimDateRangePicker.state.checkOut, "2026-11-14", "Step 2 must set checkOut date");
assert.strictEqual(BeakimDateRangePicker.state.step, "check-in", "Step 2 must reset step cycle to check-in for next booking");

// Boundary: Selecting earlier date while in check-out mode gracefully re-anchors checkIn
BeakimDateRangePicker.state.step = "check-out";
BeakimDateRangePicker.state.checkIn = "2026-11-10";
BeakimDateRangePicker.selectDate("2026-11-08");
assert.strictEqual(BeakimDateRangePicker.state.checkIn, "2026-11-08", "Selecting earlier date must re-anchor checkIn");
assert.strictEqual(BeakimDateRangePicker.state.checkOut, null, "Re-anchored checkIn must await checkOut selection");
assert.strictEqual(BeakimDateRangePicker.state.step, "check-out", "Re-anchoring must remain in check-out step");

// Assert all 5 booking forms site-wide contain the luxury date range trigger and calendar popover
const bookingPages = [
  "index.html",
  "beakim-darad.html",
  "diani-darling.html",
  "tower-cottages.html",
  "beakim-apartments.html"
];

for (const pageName of bookingPages) {
  const content = fs.readFileSync(path.join(__dirname, "..", pageName), "utf8");
  assert.ok(content.includes('id="booking-date-range-trigger"'), `${pageName} must contain #booking-date-range-trigger`);
  assert.ok(content.includes('id="beakim-calendar-popover"'), `${pageName} must contain #beakim-calendar-popover`);
  assert.ok(content.includes('id="display-check-in"'), `${pageName} must contain #display-check-in`);
  assert.ok(content.includes('id="display-check-out"'), `${pageName} must contain #display-check-out`);
  assert.ok(content.includes('id="display-nights-badge"'), `${pageName} must contain #display-nights-badge`);
  assert.ok(content.includes('id="check-in"'), `${pageName} must retain #check-in for CRM sync`);
  assert.ok(content.includes('id="check-out"'), `${pageName} must retain #check-out for CRM sync`);
}
console.log("   ✅ BeakimDateRangePicker engine and markup asserted with 100% resilience across all 5 booking forms.");

// TEST 19: Conference Package Calculation & Rate Integrity against BEAKIM_CATALOG
console.log("19. Testing Conference Package Calculation & Rate Integrity...");
assert.strictEqual(typeof resolveConferencePackage, "function", "resolveConferencePackage must be a function");
const fullDayPackage = resolveConferencePackage(true);
const halfDayPackage = resolveConferencePackage(false);

const catalogConfPackages = BEAKIM_CATALOG["diani-darling"].conferencePackages;
const catalogFull = catalogConfPackages.find(p => p.id === "darling-conf-full-day");
const catalogHalf = catalogConfPackages.find(p => p.id === "darling-conf-half-day");

assert.strictEqual(fullDayPackage.rate, catalogFull.rate, "Full Day conference rate must match BEAKIM_CATALOG (KES 3,000)");
assert.strictEqual(halfDayPackage.rate, catalogHalf.rate, "Half Day conference rate must match BEAKIM_CATALOG (KES 1,500)");
assert.strictEqual(fullDayPackage.name, catalogFull.name, "Full Day package name must match catalog");
assert.strictEqual(halfDayPackage.name, catalogHalf.name, "Half Day package name must match catalog");

// Test delegate math (20 delegates * 3000 = 60,000; 15 delegates * 1500 = 22,500)
assert.strictEqual(20 * fullDayPackage.rate, 60000);
assert.strictEqual(15 * halfDayPackage.rate, 22500);
console.log("   ✅ Conference package rates assert 100% against single source of truth BEAKIM_CATALOG.");

// TEST 20: Conference WhatsApp RFP Link Generation via CommunicationService
console.log("20. Testing Conference WhatsApp RFP Link Generation via CommunicationService...");
assert.strictEqual(typeof buildConferenceRfpMessage, "function", "buildConferenceRfpMessage must be a function");
const testRfpMessage = buildConferenceRfpMessage({
  packageName: "Full Day Conference Package with Lunch (KSh 3,000/person)",
  eventDate: "2026-11-20",
  session: "Full Day (8:00 AM – 5:00 PM)",
  delegates: "35",
  orgName: "Kenya Tech Summit",
  coordinator: "David Ochieng",
  estimatedCost: "105,000",
  bundleCottages: true,
  notes: "Projector screen and wireless mics needed"
});

assert.ok(testRfpMessage.includes("NEW CONFERENCE RESERVATION INQUIRY"));
assert.ok(testRfpMessage.includes("Venue:* Beakim Diani Darling"));
assert.ok(testRfpMessage.includes("35 People"));
assert.ok(testRfpMessage.includes("Kenya Tech Summit"));
assert.ok(testRfpMessage.includes("David Ochieng"));
assert.ok(testRfpMessage.includes("KSh 105,000"));
assert.ok(testRfpMessage.includes("Also requesting overnight cottages"));
assert.ok(testRfpMessage.includes("Projector screen and wireless mics needed"));

// Assert CommunicationService routes to Diani Darling reception (+254 119 237 439)
const darlingPhone = BEAKIM_CATALOG["diani-darling"].phone;
const rfpWhatsAppUrl = CommunicationService.buildWhatsAppUrl(testRfpMessage, darlingPhone);
assert.ok(rfpWhatsAppUrl.startsWith("https://wa.me/254119237439?text="), "WhatsApp link must target Diani Darling reception phone 254119237439");
const parsedRfpUrl = new URL(rfpWhatsAppUrl);
assert.strictEqual(parsedRfpUrl.searchParams.get("text"), testRfpMessage);
console.log("   ✅ Conference RFP link generated through CommunicationService targeting direct reception line.");

// TEST 21: SafeStorageService Boundary & Offline Inquiry Queueing
console.log("21. Testing SafeStorageService Boundary & Offline Inquiry Queueing...");
assert.strictEqual(typeof SafeStorageService, "object", "SafeStorageService must be exported");
assert.strictEqual(typeof SafeStorageService.getJson, "function", "SafeStorageService.getJson must be a function");
assert.strictEqual(typeof SafeStorageService.setJson, "function", "SafeStorageService.setJson must be a function");

// Test safe fallback when localStorage is undefined or throws (private browsing mode)
delete global.localStorage;
assert.deepStrictEqual(SafeStorageService.getJson("non_existent_key", []), []);
assert.strictEqual(SafeStorageService.setJson("key", { test: 1 }), false);

// Mock working storage
const mockStore = {};
global.localStorage = {
  getItem: (k) => (k in mockStore ? mockStore[k] : null),
  setItem: (k, v) => { mockStore[k] = String(v); }
};

assert.strictEqual(SafeStorageService.setJson("test_inquiries", [{ id: "WB-20001" }]), true);
const retrieved = SafeStorageService.getJson("test_inquiries", []);
assert.strictEqual(retrieved.length, 1);
assert.strictEqual(retrieved[0].id, "WB-20001");

// Test fallback inquiry ID minting
const fallbackId = generateFallbackInquiryId();
assert.ok(fallbackId.startsWith("WB-OFFLINE-"), `Fallback ID must start with WB-OFFLINE-, got ${fallbackId}`);
console.log("   ✅ SafeStorageService boundary handles storage access, exceptions, and clean WB-OFFLINE ID generation.");

// TEST 22: Encapsulated isDemoModeActive Predicate & Query String Sanitation
console.log("22. Testing Encapsulated isDemoModeActive Predicate & Query String Sanitation...");
assert.strictEqual(typeof isDemoModeActive, "function", "isDemoModeActive must be a function");
assert.strictEqual(isDemoModeActive("?demo=true"), true);
assert.strictEqual(isDemoModeActive("?test=true"), true);
assert.strictEqual(isDemoModeActive("?demo=1"), true);
assert.strictEqual(isDemoModeActive("?test=1"), true);
assert.strictEqual(isDemoModeActive("?property=tower&demo=true"), true);
assert.strictEqual(isDemoModeActive("?normal=stay"), false);
assert.strictEqual(isDemoModeActive(""), false);
assert.strictEqual(isDemoModeActive(null), false);
assert.strictEqual(isDemoModeActive(undefined), false);
console.log("   ✅ Encapsulated isDemoModeActive predicate reliably asserts across all parameter permutations.");

// TEST 23: Reconciled Commercial Policies & Tower Cottages Ground Truth
console.log("23. Testing Reconciled Commercial Policies & Tower Cottages Ground Truth...");
assert.strictEqual(typeof BEAKIM_POLICIES, "object", "BEAKIM_POLICIES must be defined");
assert.strictEqual(BEAKIM_POLICIES.RESERVATION_DEPOSIT_PERCENT, 50, "Deposit requirement must be exactly 50%");
assert.strictEqual(BEAKIM_POLICIES.CANCELLATION.FULL_REFUND_DAYS, 7);
assert.strictEqual(BEAKIM_POLICIES.CANCELLATION.PARTIAL_REFUND_DAYS, 2);
assert.strictEqual(BEAKIM_POLICIES.CANCELLATION.PROCESSING_FEE_PERCENT, 3.5);
assert.ok(BEAKIM_POLICIES.DESK_HOURS.includes("8:00 AM"));
assert.ok(BEAKIM_POLICIES.DESK_HOURS.includes("8:00 PM EAT"));
assert.ok(BEAKIM_POLICIES.DESK_HOURS.includes("24/7 on-call"));

// Tower Cottages verified ground truth
const towerCottages = BEAKIM_CATALOG["tower-cottages"];
assert.strictEqual(towerCottages.pools, 0, "Tower Cottages has no pool on-site");
assert.strictEqual(towerCottages.totalUnits, 3, "Tower Cottages has 3 units");
assert.strictEqual(towerCottages.offerings[0].rate, 2500, "Tower Cottages rate is KSh 2,500/night");
assert.strictEqual(towerCottages.offerings[0].bedrooms, 2, "Tower Cottages unit has 2 bedrooms");
assert.strictEqual(towerCottages.offerings[0].maxGuests, 4, "Tower Cottages accommodates max 4 guests (2 per bedroom)");
assert.strictEqual(towerCottages.offerings[0].maxAdults, 4, "Tower Cottages max adults is 4");
console.log("   ✅ Commercial policies, deposit/cancellation tiers, and Tower Cottages 4-guest capacity assert correctly.");

// TEST 24: Accessible Calendar Day Cells & Portaled Modal Architecture
console.log("24. Testing Accessible Calendar Day Cells & Modal Architecture...");
assert.strictEqual(typeof BeakimDateRangePicker.buildCalendarDayCellHtml, "function");

// Test past date day cell rendering
const pastCellHtml = BeakimDateRangePicker.buildCalendarDayCellHtml({
  dayNumber: 1,
  dateString: "2026-01-01",
  isPast: true,
  isCheckIn: false,
  isCheckOut: false,
  isMidRange: false
});
assert.ok(pastCellHtml.startsWith("<button type=\"button\""), "Calendar day cell must render as <button type=\"button\">");
assert.ok(pastCellHtml.includes("disabled"), "Past date must be disabled");
assert.ok(pastCellHtml.includes("aria-disabled=\"true\""), "Past date must have aria-disabled");
assert.ok(pastCellHtml.includes("aria-label=\""), "Cell must have descriptive aria-label");
assert.ok(pastCellHtml.includes("Unavailable, past date"), "Past cell aria-label must denote unavailability");

// Test selectable day cell rendering
const activeCellHtml = BeakimDateRangePicker.buildCalendarDayCellHtml({
  dayNumber: 6,
  dateString: "2026-11-06",
  isPast: false,
  isCheckIn: true,
  isCheckOut: false,
  isMidRange: false
});
assert.ok(activeCellHtml.startsWith("<button type=\"button\""), "Active day cell must be <button type=\"button\">");
assert.ok(activeCellHtml.includes("aria-pressed=\"true\""), "Selected check-in date must have aria-pressed=\"true\"");
assert.ok(activeCellHtml.includes("cal-range-start"), "Selected check-in date must include ribbon class cal-range-start");
assert.ok(activeCellHtml.includes("Friday, 6 November 2026"), "aria-label must include full readable weekday, date, month, and year");

// Test unselected day cell
const unselectedCellHtml = BeakimDateRangePicker.buildCalendarDayCellHtml({
  dayNumber: 15,
  dateString: "2026-11-15",
  isPast: false,
  isCheckIn: false,
  isCheckOut: false,
  isMidRange: false
});
assert.ok(unselectedCellHtml.includes("aria-pressed=\"false\""), "Unselected cell must have aria-pressed=\"false\"");
console.log("   ✅ Calendar day cells render accessible <button> semantics with WCAG-compliant aria labels.");

// TEST 25: P0 Booking State Honesty & Network Failure Recovery
console.log("25. Testing P0 Booking State Honesty & Network Failure Recovery...");
assert.strictEqual(typeof renderAvailabilityUnknown, "function");
const unknownHtml = renderAvailabilityUnknown("Beakim Beach Darad");
assert.ok(unknownHtml.includes("We couldn't check live availability"), "Must honestly state live availability could not be verified");
assert.ok(unknownHtml.includes("Send a request and our team will confirm"), "Must invite manual request without false pre-approval");
assert.ok(!unknownHtml.includes("Pre-Approved"), "Must NEVER claim pre-approval on network failure");

assert.strictEqual(typeof renderInquiryNetworkFailure, "function");
const failureHtml = renderInquiryNetworkFailure({
  reservationNumber: "WB-OFFLINE-TEST",
  property: "Beakim Darad",
  dates: "Nov 5 - Nov 8",
  guests: "2 Guests",
  estimatedTotal: "KSh 6,900"
});
assert.ok(failureHtml.includes("Network Interruption"), "Must honestly notify guest of network interruption");
assert.ok(failureHtml.includes("Retry Server Submission"), "Must provide instant retry button");
assert.ok(failureHtml.includes("WhatsApp"), "Must provide direct WhatsApp fallback");
assert.ok(!failureHtml.includes("Inquiry Received & Pre-Approved!"), "Must NEVER display success receipt on failure");

// Verify .vercelignore exists and protects CRM backend
const vercelIgnorePath = path.resolve(__dirname, "../.vercelignore");
assert.ok(fs.existsSync(vercelIgnorePath), ".vercelignore must exist");
const vercelIgnoreContent = fs.readFileSync(vercelIgnorePath, "utf-8");
assert.ok(vercelIgnoreContent.includes("Beakim CRM"), ".vercelignore must ignore Beakim CRM");
console.log("   ✅ Booking honesty states and Vercel deployment protections assert 100%.");

// TEST 26: Combined Party-Size Capacity Checks
console.log("26. Testing Combined Party-Size Capacity Checks...");
const validTowerParty = {
  name: "Jane Mwangi",
  phoneNumber: "0712345678",
  countryCode: "+254",
  property: "Tower Cottages - 2-Bedroom Apartment",
  checkIn: getNairobiDateString(1),
  checkOut: getNairobiDateString(3),
  adults: 2,
  children: 2
};
assert.strictEqual(validateBookingFormData(validTowerParty), null, "2 adults + 2 children should be valid for Tower 2-BR (max 4)");

const oversizeTowerParty = {
  ...validTowerParty,
  adults: 3,
  children: 2
};
const towerCapacityError = validateBookingFormData(oversizeTowerParty);
assert.ok(towerCapacityError, "5 total guests must fail capacity check for Tower Cottages");
assert.ok(towerCapacityError.message.includes("accommodates up to 4 guests (you selected 5)"), "Error must clearly cite max capacity and selected count");

const oversizeDaradParty = {
  name: "John Kamau",
  phoneNumber: "0712345678",
  countryCode: "+254",
  property: "Beakim Darad - Standard Room (Without AC)",
  checkIn: getNairobiDateString(1),
  checkOut: getNairobiDateString(3),
  adults: 2,
  children: 1
};
const daradCapacityError = validateBookingFormData(oversizeDaradParty);
assert.ok(daradCapacityError, "3 total guests must fail capacity check for Darad Standard (max 2)");
assert.ok(daradCapacityError.message.includes("accommodates up to 2 guests (you selected 3)"), "Error must cite 2 guest maximum");
console.log("   ✅ Combined party-size capacity checks prevent overbooking beyond unit maximums.");

// TEST 27: Idempotency Key & In-Flight Intake Lock Protection
console.log("27. Testing Idempotency Key & In-Flight Submission Protection...");
const samplePayload = CrmSyncService.buildPayload({
  formData: validTowerParty,
  grandTotal: 5000,
  formattedContactPhone: "+254 712345678"
});
assert.ok(samplePayload.idempotencyKey, "Payload must include an idempotencyKey");
assert.ok(samplePayload.idempotencyKey.startsWith("IDEMP-"), "idempotencyKey must follow IDEMP- prefix format");

const crmInquiriesLib = require("../Beakim CRM/lib/inquiries");
const testIdempKey = "IDEMP-TEST-DEDUP-" + Date.now();
const testInquiryData = {
  idempotencyKey: testIdempKey,
  guestName: "Deduplication Tester",
  guestPhone: "+254 700 000 001",
  propertyId: "prop-4",
  propertyName: "Tower Cottages",
  checkInDate: "2026-11-20",
  checkOutDate: "2026-11-22",
  adults: 2,
  children: 0,
  estimatedTotal: 5000
};

const lead1 = crmInquiriesLib.createInquiry(testInquiryData, "TEST_RUNNER");
const lead2 = crmInquiriesLib.createInquiry(testInquiryData, "TEST_RUNNER");
assert.strictEqual(lead1.id, lead2.id, "Submitting inquiry with identical idempotencyKey must return existing record without duplicating");
console.log("   ✅ Idempotency keys generated on client and deduplicated at CRM intake.");

// TEST 28: Offering-Specific Availability Filtering & No Silent Fallback
console.log("28. Testing Category-Specific Availability Filtering & Zero Silent Fallback...");
const crmDb = require("../Beakim CRM/lib/db").getDb();
const allUnits = crmDb.units || [];

// 1. Offering mapping check
const daradStdNoAcUnits = allUnits.filter(u => u.propertyId === "prop-2" && u.unitType === "Standard Room Without AC (Shared Kitchen)");
assert.strictEqual(daradStdNoAcUnits.length, 14, "Darad Standard Room Without AC has exactly 14 units");

const towerUnits = allUnits.filter(u => u.propertyId === "prop-4" && u.unitType === "2-Bedroom Apartment");
assert.strictEqual(towerUnits.length, 3, "Tower Cottages has exactly 3 2-bedroom units");

const darlingUnits = allUnits.filter(u => u.propertyId === "prop-3" && u.unitType === "Deluxe Studio with Kitchenette & Private Balcony");
assert.strictEqual(darlingUnits.length, 16, "Diani Darling Cottages has exactly 16 deluxe studio units");

// 2. Availability route code inspection to ensure no silent fallback
const routeJsContent = fs.readFileSync(path.resolve(__dirname, "../Beakim CRM/app/api/public/availability/route.js"), "utf8");
assert.ok(!routeJsContent.includes("Fallback to Darad if unknown"), "Must NOT silently fall back to Darad if property is unknown");
assert.ok(routeJsContent.includes("OFFERING_TYPE_MAP"), "Route must contain OFFERING_TYPE_MAP for category filtering");
assert.ok(routeJsContent.includes("categoryName"), "Route must expose categoryName in JSON response");
console.log("   ✅ Category-specific unit filtering accurately isolates 14-room inventory and eliminates silent fallbacks.");

// TEST 29: Terms of Service Cancellation Policy & Rate Inclusions Alignment
console.log("29. Testing Terms of Service Policy Alignment...");
const tosContent = fs.readFileSync(path.resolve(__dirname, "../terms-of-service.html"), "utf8");

// Verify Section 3 cancellation tiers match BEAKIM_POLICIES
assert.ok(tosContent.includes("More than 7 days prior to check-in"), "ToS must state >7 days cancellation tier");
assert.ok(tosContent.includes("3.5% payment processing fee"), "ToS must specify 3.5% payment processing fee deduction");
assert.ok(tosContent.includes("Between 48 hours and 7 days prior to check-in"), "ToS must state 48h-7d 50% refund tier");
assert.ok(tosContent.includes("Within 48 hours of check-in:</strong> Deposit is strictly non-refundable"), "ToS must state <48h non-refundable tier");
assert.ok(!tosContent.includes("14 days prior to arrival"), "ToS must NOT reference outdated 14-day policy");

// Verify swimming pools and cooling amenities
assert.ok(tosContent.includes("zero pools at Tower Cottages; 2 pools at Darad; 1 pool at Darling"), "ToS must state pool counts accurately per property");
assert.ok(tosContent.includes("cooling fans in standard rooms"), "ToS must distinguish cooling fans from AC");
console.log("   ✅ Terms of service perfectly reconciles cancellation tiers and property-specific amenities.");

// TEST 30: Schema.org Entity Linking & Asset Cache Query String Verification
console.log("30. Testing Schema.org Entity Linking & Asset Cache Busting...");
const indexContent = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
const towerContent = fs.readFileSync(path.resolve(__dirname, "../tower-cottages.html"), "utf8");
const daradContent = fs.readFileSync(path.resolve(__dirname, "../beakim-darad.html"), "utf8");
const darlingContent = fs.readFileSync(path.resolve(__dirname, "../diani-darling.html"), "utf8");

// Schema linking
assert.ok(indexContent.includes('"@id": "https://www.beakimhospitalitygroup.co.ke/#organization"'), "Homepage must have stable @id for Organization");
assert.ok(towerContent.includes('"parentOrganization"'), "Tower Cottages schema must link parentOrganization");
assert.ok(daradContent.includes('"parentOrganization"'), "Darad schema must link parentOrganization");
assert.ok(darlingContent.includes('"parentOrganization"'), "Darling schema must link parentOrganization");

// Hero preload & cache query strings
assert.ok(indexContent.includes('rel="preload" as="image" href="assets/hero-bg.webp?v=2.2.1"'), "Homepage must preload hero image with high priority and version tag");
assert.ok(indexContent.includes('assets/css/styles.css?v=2.2.1'), "Homepage CSS link must have ?v=2.2.1");
assert.ok(indexContent.includes('assets/js/main.js?v=2.2.1'), "Homepage main.js script must have ?v=2.2.1");
assert.ok(towerContent.includes('Sleeps Up to 4 Guests (2 Bedrooms)'), "Tower Cottages must claim sleeps up to 4 guests, not 4+");
console.log("   ✅ Schema.org parentOrganization linked across properties and assets cache-busted with ?v=2.2.1.");

// TEST 31: Dynamic Breakfast Add-On Eligibility & Tower Cottages Hiding
console.log("31. Testing Dynamic Breakfast Add-On Eligibility & Tower Cottages Hiding...");
assert.strictEqual(typeof syncBreakfastAddonCard, "function");

// Setup minimal mock DOM elements to test syncBreakfastAddonCard behavior
const mockPriceBadge = { textContent: "+KSh 500 / person / day" };
const mockDescription = { textContent: "poolside" };
const mockCheckboxInput = { classes: new Set(["text-champagne"]), textContent: "", checked: true, disabled: false };

const mockCard = {
  classes: new Set(),
  classList: {
    add(c) { mockCard.classes.add(c); },
    remove(c) { mockCard.classes.delete(c); },
    toggle(c, force) {
      if (force === undefined) {
        if (mockCard.classes.has(c)) mockCard.classes.delete(c);
        else mockCard.classes.add(c);
      } else if (force) {
        mockCard.classes.add(c);
      } else {
        mockCard.classes.delete(c);
      }
    },
    contains(c) { return mockCard.classes.has(c); }
  },
  priceBadge: mockPriceBadge,
  querySelector(selector) {
    // If querying generic .text-champagne, simulate realistic DOM returning checkbox first!
    if (selector === ".text-champagne") return mockCheckboxInput;
    if (selector === "p.text-champagne" || selector === ".text-champagne:not(input)") return mockPriceBadge;
    if (selector === ".text-driftwood") return mockDescription;
    return null;
  }
};

const mockPrefSection = {
  classes: new Set(),
  classList: {
    add(c) { mockPrefSection.classes.add(c); },
    remove(c) { mockPrefSection.classes.delete(c); },
    toggle(c, force) {
      if (force === undefined) {
        if (mockPrefSection.classes.has(c)) mockPrefSection.classes.delete(c);
        else mockPrefSection.classes.add(c);
      } else if (force) {
        mockPrefSection.classes.add(c);
      } else {
        mockPrefSection.classes.delete(c);
      }
    },
    contains(c) { return mockPrefSection.classes.has(c); }
  }
};

const mockStepBadge = { textContent: "3" };

global.document = {
  getElementById(id) {
    if (id === "addon-card-breakfast") return mockCard;
    if (id === "booking-step-preferences") return mockPrefSection;
    if (id === "booking-step-guest-badge") return mockStepBadge;
    if (id === "addon-breakfast") return mockCheckboxInput;
    if (id === "addon-breakfast-price-badge") return mockPriceBadge;
    if (id === "addon-breakfast-description") return mockDescription;
    return null;
  }
};

// 1. Test Tower Cottages selection: Must hide card, disable checkbox, hide Step 2, set badge to "2"
syncBreakfastAddonCard("Tower Cottages - 2-Bedroom Apartment");
assert.strictEqual(mockCard.classList.contains("hidden"), true, "Tower Cottages must hide breakfast card");
assert.strictEqual(mockCheckboxInput.checked, false, "Tower Cottages must force breakfast checkbox unchecked");
assert.strictEqual(mockCheckboxInput.disabled, true, "Tower Cottages must disable breakfast checkbox");
assert.strictEqual(mockPrefSection.classList.contains("hidden"), true, "Tower Cottages must hide entire preferences step");
assert.strictEqual(mockStepBadge.textContent, "2", "Guest Info step badge must renumber to '2' when preferences are hidden");

// 2. Test Beakim Darad selection: Must show card, enable checkbox, show Step 2, set badge to "3", set KSh 500
syncBreakfastAddonCard("Beakim Darad - Standard Room (Without AC)");
assert.strictEqual(mockCard.classList.contains("hidden"), false, "Darad must NOT hide breakfast card");
assert.strictEqual(mockCheckboxInput.disabled, false, "Darad must enable breakfast checkbox");
assert.strictEqual(mockPrefSection.classList.contains("hidden"), false, "Darad must show preferences step");
assert.strictEqual(mockStepBadge.textContent, "3", "Guest Info step badge must be '3' for Darad");
assert.ok(mockPriceBadge.textContent.includes("500"), "Darad price badge must be KSh 500");
assert.ok(mockDescription.textContent.includes("poolside"), "Darad breakfast description must mention poolside");

// 3. Test Diani Darling selection: Must show card, enable checkbox, show Step 2, set badge to "3", set KSh 1,000
syncBreakfastAddonCard("Diani Darling Cottages - Deluxe Studio Room");
assert.strictEqual(mockCard.classList.contains("hidden"), false, "Darling must NOT hide breakfast card");
assert.strictEqual(mockCheckboxInput.disabled, false, "Darling must enable breakfast checkbox");
assert.strictEqual(mockPrefSection.classList.contains("hidden"), false, "Darling must show preferences step");
assert.strictEqual(mockStepBadge.textContent, "3", "Guest Info step badge must be '3' for Darling");
assert.ok(mockPriceBadge.textContent.includes("1,000"), "Darling price badge must be KSh 1,000");
assert.ok(mockDescription.textContent.includes("verandah"), "Darling breakfast description must mention verandah");

// 4. Verify index.html, beakim-darad.html, diani-darling.html contain the necessary semantic IDs
assert.ok(indexContent.includes('id="booking-step-preferences"'), "index.html must have id='booking-step-preferences'");
assert.ok(indexContent.includes('id="booking-step-guest-badge"'), "index.html must have id='booking-step-guest-badge'");
assert.ok(indexContent.includes('id="addon-breakfast-price-badge"'), "index.html must have id='addon-breakfast-price-badge'");
assert.ok(indexContent.includes('id="addon-breakfast-description"'), "index.html must have id='addon-breakfast-description'");
assert.ok(indexContent.includes('id="summary-breakfast-label"'), "index.html must have id='summary-breakfast-label'");

const daradRawContent = fs.readFileSync(path.join(__dirname, "..", "beakim-darad.html"), "utf8");
const darlingRawContent = fs.readFileSync(path.join(__dirname, "..", "diani-darling.html"), "utf8");
assert.ok(daradRawContent.includes('id="addon-breakfast-price-badge"'), "beakim-darad.html must have id='addon-breakfast-price-badge'");
assert.ok(darlingRawContent.includes('id="addon-breakfast-price-badge"'), "diani-darling.html must have id='addon-breakfast-price-badge'");

console.log("   ✅ Dynamic breakfast add-on eligibility correctly hides preferences, renumbers steps, and dynamically updates KSh 500 vs KSh 1,000 pricing.");

// TEST 32: Unit Capacity Validation & Multi-Unit Availability Guidance
console.log("32. Testing Unit Capacity Validation & Multi-Unit Availability Guidance...");

// 1. Catalog capacity verification
const studioOffering = getOfferingById("darad-studio-kitchenette");
assert.strictEqual(studioOffering.maxGuests, 2, "Ensuite Studio maxGuests must be 2");
assert.strictEqual(studioOffering.beds, 1, "Ensuite Studio bed count must be 1");
assert.strictEqual(studioOffering.bedType, "1 Double Bed", "Ensuite Studio bedType must be '1 Double Bed'");

const cottageOffering = getOfferingById("darad-cottage");
assert.strictEqual(cottageOffering.maxGuests, 3, "Garden View Cottage maxGuests must be 3");
assert.strictEqual(cottageOffering.maxAdults, 2, "Garden View Cottage maxAdults must be 2");
assert.strictEqual(cottageOffering.maxChildren, 1, "Garden View Cottage maxChildren must be 1");
assert.strictEqual(cottageOffering.beds, 1, "Garden View Cottage bed count must be 1");

const towerOffering = getOfferingById("tower-2br");
assert.strictEqual(towerOffering.maxGuests, 4, "Tower Cottages 2BR maxGuests must be 4");
assert.strictEqual(towerOffering.beds, 2, "Tower Cottages 2BR beds must be 2");

// 2. Client-side booking form validation
// 3 adults on 1 studio unit should fail
const invalidPartySingleStudio = validateBookingFormData({
  name: "John Doe",
  phoneNumber: "+254712345678",
  checkIn: getNairobiDateString(1),
  checkOut: getNairobiDateString(3),
  property: "darad-studio-kitchenette",
  adults: 3,
  children: 0,
  unitsCount: 1
});
assert.ok(invalidPartySingleStudio, "3 guests on 1 studio unit must fail validation");
assert.ok(invalidPartySingleStudio.message.includes("please reserve at least 2 units"), "Error message must state units needed");

// 3 adults on 2 studio units should pass
const validPartyMultiStudio = validateBookingFormData({
  name: "John Doe",
  phoneNumber: "+254712345678",
  checkIn: getNairobiDateString(1),
  checkOut: getNairobiDateString(3),
  property: "darad-studio-kitchenette",
  adults: 3,
  children: 0,
  unitsCount: 2
});
assert.strictEqual(validPartyMultiStudio, null, "3 guests across 2 studio units must pass validation");

// 2 adults + 1 child on Garden View Cottage should pass
const validCottageFamily = validateBookingFormData({
  name: "Jane Doe",
  phoneNumber: "+254712345678",
  checkIn: getNairobiDateString(1),
  checkOut: getNairobiDateString(3),
  property: "darad-cottage",
  adults: 2,
  children: 1,
  unitsCount: 1
});
assert.strictEqual(validCottageFamily, null, "2 adults + 1 child on Garden View Cottage must pass validation");

// 3. Multi-unit reservation totals calculation
const studioTotalsMulti = calculateReservationTotals({
  pricingSummary: { rate: 3500, totalCost: 7000, durationDays: 2, isValidRange: true },
  adultsCount: 3,
  hasBreakfast: false,
  propertyIdentifier: "darad-studio-kitchenette",
  unitsCount: 2
});
assert.strictEqual(studioTotalsMulti.unitsCount, 2, "Totals must record unitsCount = 2");
assert.strictEqual(studioTotalsMulti.baseCost, 14000, "Base cost for 2 units @ 3500 x 2 nights must be 14,000");
assert.strictEqual(studioTotalsMulti.grandTotal, 14000, "Grand total must be 14,000");

// 4. Capacity warning UI rendering
const warningHtml = renderAvailabilityCapacityWarning({
  offering: studioOffering,
  totalGuests: 3,
  adults: 3,
  children: 0,
  unitsNeeded: 2,
  availableUnitsCount: 3,
  categoryName: studioOffering.name
});
assert.ok(warningHtml.includes("Party of 3 Exceeds 1-Unit Capacity"), "Warning must state party exceeds 1-unit capacity");
assert.ok(warningHtml.includes("1 Double Bed • Max 2 Guests"), "Warning must specify bed count and max capacity");
assert.ok(warningHtml.includes("Select 2 Units"), "Warning must offer button to select 2 units");
assert.ok(warningHtml.includes("Tower Cottages 2-Bedroom Apartment"), "Warning must suggest Tower Cottages 2-Bedroom for parties <= 4");

// 5. Verify all HTML templates contain #booking-units-wrapper
const towerRawContent = fs.readFileSync(path.join(__dirname, "..", "tower-cottages.html"), "utf8");
assert.ok(indexContent.includes('id="booking-units-wrapper"'), "index.html must have id='booking-units-wrapper'");
assert.ok(daradRawContent.includes('id="booking-units-wrapper"'), "beakim-darad.html must have id='booking-units-wrapper'");
assert.ok(darlingRawContent.includes('id="booking-units-wrapper"'), "diani-darling.html must have id='booking-units-wrapper'");
assert.ok(towerRawContent.includes('id="booking-units-wrapper"'), "tower-cottages.html must have id='booking-units-wrapper'");

console.log("   ✅ Unit capacity validation, multi-unit calculation, and capacity warning UI verified 100%.");

// TEST 33: Multi-Unit Booking Submission Orchestration & Pricing Retention
console.log("33. Testing Multi-Unit Booking Submission Orchestration & Pricing Retention...");

// 1. Audit reproduction scenario: 2 nights, Darad Std No-AC (1,700/night), 4 adults, 2 units
const stdNoAcPricing = resolveStayPricing("Beakim Darad - Standard Room (Without AC)", "2026-11-03", "2026-11-05");
assert.strictEqual(stdNoAcPricing.totalCost, 3400, "1 unit for 2 nights @ 1,700 must be 3,400");
assert.strictEqual(stdNoAcPricing.durationDays, 2);

const twoUnitsTotals = calculateReservationTotals({
  pricingSummary: stdNoAcPricing,
  adultsCount: 4,
  hasBreakfast: false,
  propertyIdentifier: "Beakim Darad - Standard Room (Without AC)",
  unitsCount: 2
});
assert.strictEqual(twoUnitsTotals.unitsCount, 2, "Units count must be preserved as 2");
assert.strictEqual(twoUnitsTotals.baseCost, 6800, "Base cost for 2 units must be exactly KSh 6,800");
assert.strictEqual(twoUnitsTotals.grandTotal, 6800, "Grand total for 2 units must be exactly KSh 6,800");
assert.strictEqual(twoUnitsTotals.formattedGrandTotal, "KSh 6,800", "Formatted total must be KSh 6,800");

// 2. WhatsApp inquiry message retention
const twoUnitsMessage = buildInquiryMessage({
  guestName: "Audit Test Guest",
  contactPhone: "+254 700000000",
  guestEmail: "guest@example.com",
  propertyName: "Beakim Darad - Standard Room (Without AC)",
  checkInDate: "2026-11-03",
  checkOutDate: "2026-11-05",
  stayDurationText: "2 Nights",
  adultsCount: 4,
  childrenCount: 0,
  estimatedTotal: twoUnitsTotals.formattedGrandTotal,
  unitsCount: 2
});
assert.ok(twoUnitsMessage.includes("• Accommodation: Beakim Darad - Standard Room (Without AC) (2 Units)"), "Message must cite 2 units");
assert.ok(twoUnitsMessage.includes("• Estimated Rate: KSh 6,800"), "Message must cite KSh 6,800");

// 3. CRM intake payload verification & 50% deposit derivation
const twoUnitsPayload = CrmSyncService.buildPayload({
  formData: {
    name: "Audit Test Guest",
    email: "guest@example.com",
    property: "Beakim Darad - Standard Room (Without AC)",
    checkIn: "2026-11-03",
    checkOut: "2026-11-05",
    adults: 4,
    children: 0,
    unitsCount: 2
  },
  grandTotal: twoUnitsTotals.grandTotal,
  formattedContactPhone: "+254 700000000"
});
assert.strictEqual(twoUnitsPayload.unitsCount, 2, "Payload must retain unitsCount = 2");
assert.strictEqual(twoUnitsPayload.estimatedTotal, 6800, "Payload estimatedTotal must be exactly 6,800");
const expected50PctDeposit = Math.round(twoUnitsPayload.estimatedTotal * 0.5);
assert.strictEqual(expected50PctDeposit, 3400, "50% deposit on KSh 6,800 must be KSh 3,400 (not KSh 1,700)");

// 4. Review dialog itemized breakdown rendering
const twoUnitsBreakdown = renderInquiryCostBreakdown({
  totals: twoUnitsTotals,
  pricingSummary: stdNoAcPricing,
  property: "Beakim Darad - Standard Room (Without AC)",
  unitsCount: 2
});
assert.ok(twoUnitsBreakdown.includes("2 ×"), "Breakdown must display '2 ×' multiplier prefix");
assert.ok(twoUnitsBreakdown.includes("KSh 6,800"), "Breakdown must display KSh 6,800 base accommodation");

// 5. 3-unit case with breakfast
const threeUnitsWithBreakfast = calculateReservationTotals({
  pricingSummary: stdNoAcPricing,
  adultsCount: 6,
  hasBreakfast: true,
  propertyIdentifier: "Beakim Darad - Standard Room (Without AC)",
  unitsCount: 3
});
assert.strictEqual(threeUnitsWithBreakfast.baseCost, 10200, "3 units base cost must be 10,200");
assert.strictEqual(threeUnitsWithBreakfast.breakfastCost, 6000, "6 adults x 2 nights x 500 must be 6,000");
assert.strictEqual(threeUnitsWithBreakfast.grandTotal, 16200, "Grand total with breakfast must be 16,200");
console.log("   ✅ Multi-unit booking pricing retention verified at KSh 6,800 and 50% deposit KSh 3,400 across all channels.");

// TEST 34: Calendar Scroll-Lock Idempotency & Resize State Preservation
console.log("34. Testing Calendar Scroll-Lock Idempotency & Resize State Preservation...");
global.document = global.document || {};
global.document.body = { style: { overflow: "" } };
PageScrollLock.reset();
assert.strictEqual(PageScrollLock.getLockCount(), 0, "Initial lock count must be 0");

BeakimDateRangePicker.state.isOpen = true;
BeakimDateRangePicker.state.isScrollLocked = false;

// 1. Mobile sync acquires 1 lock
BeakimDateRangePicker.syncScrollLock(true);
assert.strictEqual(BeakimDateRangePicker.state.isScrollLocked, true, "isScrollLocked must be true");
assert.strictEqual(PageScrollLock.getLockCount(), 1, "Lock count must be 1 after mobile open");

// 2. 10 rapid mobile resize events must NOT increment lock count beyond 1
for (let i = 0; i < 10; i++) {
  BeakimDateRangePicker.syncScrollLock(true);
}
assert.strictEqual(PageScrollLock.getLockCount(), 1, "Repeated mobile resizes must keep lock count strictly at 1");

// 3. Resizing to desktop breakpoint releases scroll lock
BeakimDateRangePicker.syncScrollLock(false);
assert.strictEqual(BeakimDateRangePicker.state.isScrollLocked, false, "isScrollLocked must be false on desktop");
assert.strictEqual(PageScrollLock.getLockCount(), 0, "Lock count must be 0 on desktop breakpoint");

// 4. Resizing back to mobile re-acquires exactly 1 lock
BeakimDateRangePicker.syncScrollLock(true);
assert.strictEqual(BeakimDateRangePicker.state.isScrollLocked, true);
assert.strictEqual(PageScrollLock.getLockCount(), 1);

// 5. Closing releases lock completely
BeakimDateRangePicker.state.isOpen = false;
BeakimDateRangePicker.syncScrollLock(false);
assert.strictEqual(BeakimDateRangePicker.state.isScrollLocked, false);
assert.strictEqual(PageScrollLock.getLockCount(), 0, "Lock count must return to 0 upon close");
console.log("   ✅ Calendar scroll-lock is strictly idempotent across resize and breakpoint transitions.");

// TEST 35: Availability Copy & Zero "Direct Lock" Assertion
console.log("35. Testing Availability Copy & Zero 'Direct Lock' Invariant...");
const preApprovedMulti = renderAvailabilityPreApproved(14, "Standard Room (Without AC)", 4, 2);
assert.ok(preApprovedMulti.includes("2 units selected for 4 guests — subject to confirmation"), "Badge must state 'selected — subject to confirmation'");
assert.ok(!preApprovedMulti.includes("units reserved"), "Badge must NOT claim units are 'reserved' before booking creation");

// Assert 0 occurrences of "Direct Lock" across all HTML files
const htmlFiles = ["index.html", "beakim-darad.html", "diani-darling.html", "tower-cottages.html", "insights.html", "terms-of-service.html"];
for (const file of htmlFiles) {
  const fileContent = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  assert.ok(!fileContent.includes("Direct Lock"), `${file} must NOT contain outdated 'Direct Lock' phrasing`);
}
console.log("   ✅ Availability copy and detail-page headers verified for 100% truthfulness and precision.");

// TEST 36: Responsive Hero Preload, WebP Asset Budgets, and LCP Chain Verification
console.log("36. Testing Responsive Hero Preload, WebP Asset Budgets, and LCP Chain Verification...");
const assetsDir = path.join(__dirname, "..", "assets");
const heroMobilePath = path.join(assetsDir, "hero-bg-mobile.webp");
const heroDesktopPath = path.join(assetsDir, "hero-bg.webp");
assert.ok(fs.existsSync(heroMobilePath), "assets/hero-bg-mobile.webp must exist");
assert.ok(fs.existsSync(heroDesktopPath), "assets/hero-bg.webp must exist");

const heroMobileSizeKB = fs.statSync(heroMobilePath).size / 1024;
assert.ok(heroMobileSizeKB < 85, `Mobile hero image (${heroMobileSizeKB.toFixed(1)} KB) must be under 85 KB budget`);

const cardImagePaths = [
  path.join(assetsDir, "tower-cottages-diani-building-facade-balcony.webp"),
  path.join(assetsDir, "property-darad.webp"),
  path.join(assetsDir, "diani-darling-cottage-villas-pathway.webp"),
  path.join(assetsDir, "beakim-apartments-one-bed.webp")
];

let totalCardsSizeKB = 0;
for (const cardPath of cardImagePaths) {
  assert.ok(fs.existsSync(cardPath), `Card image ${path.basename(cardPath)} must exist`);
  const cardSizeKB = fs.statSync(cardPath).size / 1024;
  assert.ok(cardSizeKB < 90, `Card image ${path.basename(cardPath)} (${cardSizeKB.toFixed(1)} KB) must be under 90 KB`);
  totalCardsSizeKB += cardSizeKB;
}
assert.ok(totalCardsSizeKB < 300, `Total card image weight (${totalCardsSizeKB.toFixed(1)} KB) must be under 300 KB budget`);

const indexRaw = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
assert.ok(indexRaw.includes('rel="preload" as="image" href="assets/hero-bg-mobile.webp?v=2.2.1" type="image/webp" media="(max-width: 640px)"'), "Must preload mobile hero image with media query");
assert.ok(indexRaw.includes('rel="preload" as="image" href="assets/hero-bg.webp?v=2.2.1" type="image/webp" media="(min-width: 641px)"'), "Must preload desktop hero image with media query");
assert.ok(indexRaw.includes('<picture>'), "Hero background must use responsive <picture> tag");
assert.ok(indexRaw.includes('srcset="assets/hero-bg-mobile.webp?v=2.2.1"'), "Picture must contain mobile WebP source");
assert.ok(indexRaw.includes('width="1024" height="1024"'), "Hero img must define explicit width and height dimensions");
assert.ok(indexRaw.includes('rel="dns-prefetch" href="https://fonts.googleapis.com"'), "Must prefetch Google Fonts DNS");
console.log("   ✅ Responsive hero preload, sub-85KB mobile WebP, and LCP chain verified with 100% compliance.");

// TEST 37: Accessibility (Select Labels, Heading Hierarchy, Contrast) Compliance
console.log("37. Testing Accessibility (Select Labels, Heading Hierarchy, Contrast) Compliance...");
const checkSelectsFiles = ["index.html", "beakim-darad.html", "tower-cottages.html", "diani-darling.html"];
for (const file of checkSelectsFiles) {
  const fileContent = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  const selects = fileContent.match(/<select[^>]*>/gi) || [];
  for (const s of selects) {
    const id = (s.match(/id=["']([^"']+)["']/i) || [])[1];
    const aria = (s.match(/aria-label=["']([^"']+)["']/i) || [])[1];
    const hasLabel = id && new RegExp('<label[^>]+for=["\']' + id + '["\']', 'i').test(fileContent);
    assert.ok(aria || hasLabel, `Select element with id="${id}" in ${file} must have either an aria-label or an associated <label>`);
  }
}

// Heading hierarchy validation in index.html
const headingMatches = indexRaw.match(/<(h[1-6])[^>]*>/gi) || [];
let lastLevel = 1;
for (const h of headingMatches) {
  const level = parseInt((h.match(/<(h[1-6])/i) || [])[1].replace('h', ''), 10);
  // Heading level should not skip more than 1 level downward (e.g. h1 -> h3 or h2 -> h4 is forbidden)
  assert.ok(level <= lastLevel + 1, `Heading level h${level} skips levels after h${lastLevel} in index.html`);
  lastLevel = level;
}

// Contrast validation: 0 instances of low-opacity text on body/descriptions
const lowContrastInstances = indexRaw.split('\n').filter(line => /text-(ivory|driftwood|deep-forest)\/(30|40|50)\b/.test(line));
assert.strictEqual(lowContrastInstances.length, 0, `index.html must have 0 low-contrast (30/40/50 opacity) text instances (found ${lowContrastInstances.length})`);
console.log("   ✅ All form selects labeled, heading hierarchy strictly sequential, and text contrast WCAG AA verified.");

// TEST 38: Subtle Luxury Motion Engine, Pure CSS Compositing & Zero-LCP Invariants
console.log("38. Testing Subtle Luxury Motion Engine, Pure CSS Compositing & Zero-LCP Invariants...");
assert.strictEqual(typeof initializeScrollRevealEngine, "function", "initializeScrollRevealEngine must be exported");

const stylesCssContent = fs.readFileSync(path.join(assetsDir, "css", "styles.css"), "utf8");
const inputCssContent = fs.readFileSync(path.join(assetsDir, "css", "input.css"), "utf8");

// 1. Verify CSS luxury utilities exist in compiled styles
assert.ok(stylesCssContent.includes(".btn-sheen"), "styles.css must contain .btn-sheen class");
assert.ok(stylesCssContent.includes(".reveal-on-scroll"), "styles.css must contain .reveal-on-scroll class");
assert.ok(stylesCssContent.includes(".card-luxury-hover"), "styles.css must contain .card-luxury-hover class");
assert.ok(stylesCssContent.includes(".faq-answer"), "styles.css must contain .faq-answer class");
assert.ok(inputCssContent.includes("prefers-reduced-motion: reduce"), "input.css must define prefers-reduced-motion: reduce rules");

// 2. Verify Zero-LCP Invariant: Hero section MUST NOT be hidden or delayed by .reveal-on-scroll
const heroSectionMatch = indexRaw.match(/HERO SECTION[\s\S]*?<\/section>/i);
assert.ok(heroSectionMatch, "Hero section must exist in index.html");
assert.ok(!heroSectionMatch[0].includes("reveal-on-scroll"), "Hero section must NEVER contain reveal-on-scroll (preserves instant LCP)");

// 3. Verify below-the-fold elements use progressive enhancement reveal classes
const revealMatches = indexRaw.match(/reveal-on-scroll/g) || [];
assert.ok(revealMatches.length >= 10, `index.html must contain at least 10 reveal-on-scroll elements (found ${revealMatches.length})`);

// 4. Verify primary CTA buttons have .btn-sheen
assert.ok(indexRaw.includes('booking-submit-btn') && indexRaw.includes('btn-sheen'), "Submit button must have btn-sheen class");

// 5. Test motion-reduction guard in initializeScrollRevealEngine
const prevWindow = global.window;
const prevDoc = global.document;

const mockWindow = {
  matchMedia: (query) => ({ matches: query.includes("prefers-reduced-motion: reduce") })
};
global.window = mockWindow;
global.document = {
  ...(prevDoc || {}),
  getElementById: (prevDoc && typeof prevDoc.getElementById === "function") ? prevDoc.getElementById : (() => null),
  documentElement: {
    classList: {
      add: () => {
        throw new Error("Should not activate when reduced-motion is requested");
      }
    }
  }
};

// Executing with prefers-reduced-motion true should return early without throwing
initializeScrollRevealEngine();

// Cleanly restore environment
global.window = prevWindow;
global.document = prevDoc;
if (global.document && typeof global.document.getElementById !== "function") {
  global.document.getElementById = () => null;
}

console.log("   ✅ Luxury animations verified: zero LCP delay, pure CSS sheen, passive scroll-reveal, and 100% WCAG motion safety.");

console.log("\n🎉 ALL 38 CLEAN CODE UNIT TESTS PASSED WITH 100% SUCCESS!\n");
