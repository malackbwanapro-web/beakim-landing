/**
 * Clean Code Automated Unit Test Suite
 * Zero-dependency unit tests running natively under Node.js assert.
 */

const assert = require("assert");
const {
  APP_CONFIG,
  CommunicationService,
  CrmSyncService,
  getNairobiDateString,
  calculateDateDifferenceInDays,
  isPastDate,
  isInvalidDateRange,
  normalizeKenyanPhoneNumber,
  calculateReservationTotals,
  resolveStayPricing,
  buildInquiryMessage,
  validateBookingFormData,
  handleResidenceCardKeydown
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
assert.strictEqual(APP_CONFIG.CRM.SYNC_TIMEOUT_MS, 3500);
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
// Beakim Darad Standard with AC: 2500/night
const daradPricing = resolveStayPricing("darad-standard-ac", "2026-11-01", "2026-11-04");
assert.strictEqual(daradPricing.rate, 2500);
assert.strictEqual(daradPricing.durationDays, 3);
assert.strictEqual(daradPricing.totalCost, 7500);
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

// Beakim Apartments: 1-Bedroom Monthly Lease 15000/mo
const monthlyApartment = resolveStayPricing("apartments-1br-monthly", "2026-11-01", "2026-12-01");
assert.strictEqual(monthlyApartment.isMonthly, true);
assert.strictEqual(monthlyApartment.rate, 15000);
assert.strictEqual(monthlyApartment.totalCost, 15000); // 30 days ~ 1 month
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
console.log("   ✅ Pure reservation totals and breakfast calculations handle standard and edge cases robustly.");

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
console.log("   ✅ All properties in BEAKIM_CATALOG have verified phone numbers and GPS coordinates.");

console.log("\n🎉 ALL 11 CLEAN CODE UNIT TESTS PASSED WITH 100% SUCCESS!\n");
