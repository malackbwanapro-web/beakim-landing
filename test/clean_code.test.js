/**
 * Clean Code Automated Unit Test Suite
 * Zero-dependency unit tests running natively under Node.js assert.
 */

const assert = require("assert");
const {
  APP_CONFIG,
  CommunicationService,
  getNairobiDateString,
  calculateDateDifferenceInDays,
  isPastDate,
  isInvalidDateRange,
  normalizeKenyanPhoneNumber,
  resolveStayPricing,
  buildInquiryMessage,
  validateBookingFormData
} = require("../assets/js/main.js");

const { BEAKIM_CATALOG, getOfferingById } = require("../assets/js/catalog.js");

// Mock global catalog lookup for testing environment
global.getOfferingById = getOfferingById;

console.log("🧪 RUNNING CLEAN CODE UNIT TEST SUITE...\n");

// TEST 1: APP_CONFIG Immutability & Values
console.log("1. Testing APP_CONFIG Immutability & Values...");
assert.strictEqual(APP_CONFIG.CONTACT.PHONE_RAW, "254746938529");
assert.strictEqual(APP_CONFIG.CONTACT.DEFAULT_COUNTRY_CODE, "+254");
assert.strictEqual(Object.isFrozen(APP_CONFIG), true);
assert.strictEqual(Object.isFrozen(APP_CONFIG.CONTACT), true);
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

console.log("\n🎉 ALL CLEAN CODE UNIT TESTS PASSED WITH 100% SUCCESS!\n");
