/**
 * Beakim Hospitality Group - Main JavaScript Module
 * Clean, accessible, unified module for Lightbox, Navigation, Tabs, and Inquiry Engine.
 * Refactored according to Clean Code standards:
 * - Single Responsibility Principle (SRP)
 * - The Stepdown Rule (Newspaper Metaphor)
 * - Zero Magic Literals (Centralized APP_CONFIG)
 * - Intention-Revealing Identifiers & Predicates
 * - Dedicated CommunicationService Boundary Adapter
 * - Pure, Unit-Testable Domain Logic
 */

// ── 1. CONFIGURATION & DOMAIN CONSTANTS (ZERO MAGIC LITERALS) ──

const APP_CONFIG = Object.freeze({
  CONTACT: Object.freeze({
    PHONE_RAW: "254750864119",
    DARLING_WHATSAPP_RAW: "254119237439",
    PHONE_FORMATTED: "+254 750 864 119",
    DEFAULT_COUNTRY_CODE: "+254",
    CANONICAL_EMAIL: "info@beakimhospitalitygroup.co.ke",
    EMAIL: "info@beakimhospitalitygroup.co.ke"
  }),
  SOCIAL: Object.freeze({
    INSTAGRAM: "https://www.instagram.com/beakimhospitalitygroup/",
    FACEBOOK: "https://web.facebook.com/beakimhospitalitygroup",
    X: "https://x.com/BeakimGroup",
    TIKTOK: "https://www.tiktok.com/@beakimhospitalitygroup",
    YOUTUBE: "https://www.youtube.com/@BeakimHospitalityGroup"
  }),
  RATES: Object.freeze({
    BREAKFAST_PER_PERSON_PER_DAY: 1000,
    FALLBACK_NIGHTLY_RATE: 2500,
    MONTHLY_APPROXIMATION_DAYS: 30
  }),
  CRM: Object.freeze({
    SYNC_TIMEOUT_MS: 4500,
    LOCAL_ENDPOINT: "http://localhost:3005/api/public/inquiries",
    PRODUCTION_ENDPOINT: "https://crm.beakimhospitalitygroup.co.ke/api/public/inquiries",
    LOCAL_AVAILABILITY_ENDPOINT: "http://localhost:3005/api/public/availability",
    PRODUCTION_AVAILABILITY_ENDPOINT: "https://crm.beakimhospitalitygroup.co.ke/api/public/availability",
    DEFAULT_CHANNEL: "website_whatsapp"
  }),
  UI: Object.freeze({
    BUTTON_COOLDOWN_MS: 1800,
    DEFAULT_TOAST_DURATION_MS: 3500,
    VALIDATION_TOAST_DURATION_MS: 4500
  }),
  TIME: Object.freeze({
    IANA_TIMEZONE: "Africa/Nairobi",
    HOURS_OFFSET_UTC: 3,
    MS_PER_HOUR: 3600000,
    MS_PER_DAY: 86400000,
    DAYS_PER_MONTH: 30
  }),
  DEFAULTS: Object.freeze({
    ADULTS_COUNT: 2,
    CHILDREN_COUNT: 0,
    FALLBACK_PROPERTY_NAME: "Beakim Hospitality",
    FALLBACK_NIGHTLY_RATE: 2500
  }),
  CALENDAR: Object.freeze({
    MODAL_BREAKPOINT_WIDTH: 640,
    MODAL_BREAKPOINT_HEIGHT: 600,
    WEEKDAY_NAMES_FULL: Object.freeze(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]),
    WEEKDAY_NAMES_SHORT: Object.freeze(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]),
    WEEKDAY_HEADER_LABELS: Object.freeze(["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]),
    MONTH_NAMES_SHORT: Object.freeze(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]),
    MONTH_NAMES_FULL: Object.freeze([
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]),
    AUTO_CLOSE_DELAY_MS: 350,
    DEFAULT_STAY_NIGHTS: 2,
    LONG_STAY_PRESET_DAYS: 5,
    HOLIDAY_PRESET_DAYS: 7
  })
});

// ── 2. BOUNDARY SERVICES (THIRD-PARTY PROTOCOLS) ──

/** WhatsApp follows the current page, never the selected residence. */
function resolveWhatsAppPhone(pathname) {
  const path = typeof pathname === "string" ? pathname :
    (typeof window !== "undefined" && window.location ? window.location.pathname : "/");
  const page = normalizePagePath(path.split(/[?#]/)[0].toLowerCase());
  return page === "/diani-darling" ? APP_CONFIG.CONTACT.DARLING_WHATSAPP_RAW : APP_CONFIG.CONTACT.PHONE_RAW;
}

function initializeWhatsAppRouting() {
  if (typeof document === "undefined") return;
  const phone = resolveWhatsAppPhone();
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(anchor => {
    const url = new URL(anchor.href);
    url.pathname = `/${phone}`;
    anchor.href = url.toString();
  });
}

function getInquiryWhatsAppUrl(inquirySummary) {
  let message = inquirySummary.messageText || "";
  if (!message && inquirySummary.whatsappUrl) {
    try { message = new URL(inquirySummary.whatsappUrl).searchParams.get("text") || ""; }
    catch (_) { /* Build a safe current-page URL even for an invalid saved link. */ }
  }
  return CommunicationService.buildWhatsAppUrl(message);
}

const CommunicationService = Object.freeze({
  buildWhatsAppUrl(messageText, targetPhoneNumber = resolveWhatsAppPhone()) {
    const searchParams = new URLSearchParams();
    searchParams.set("text", messageText);
    const cleanPhone = String(targetPhoneNumber || "").replace(/[^\d]/g, "") || resolveWhatsAppPhone();
    return `https://wa.me/${cleanPhone}?${searchParams.toString()}`;
  },

  getWhatsAppUrl(messageText, targetPhoneNumber = resolveWhatsAppPhone()) {
    return this.buildWhatsAppUrl(messageText, targetPhoneNumber);
  },

  getTelephoneUrl(targetPhoneNumber = APP_CONFIG.CONTACT.PHONE_RAW) {
    const cleanPhone = String(targetPhoneNumber || "").replace(/[^\d]/g, "") || APP_CONFIG.CONTACT.PHONE_RAW;
    return `tel:+${cleanPhone}`;
  },

  getEmailUrl(subject = "Stay Inquiry") {
    return `mailto:${APP_CONFIG.CONTACT.CANONICAL_EMAIL}?subject=${encodeURIComponent(subject)}`;
  }
});

const SafeStorageService = Object.freeze({
  getJson(key, defaultValue = null) {
    if (typeof localStorage === "undefined") return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (storageError) {
      if (typeof console !== "undefined" && typeof console.debug === "function") {
        console.debug("[SafeStorageService] Read error for key:", key, storageError);
      }
      return defaultValue;
    }
  },

  setJson(key, value) {
    if (typeof localStorage === "undefined") return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (storageError) {
      if (typeof console !== "undefined" && typeof console.debug === "function") {
        console.debug("[SafeStorageService] Write error for key:", key, storageError);
      }
      return false;
    }
  }
});

const CrmSyncService = Object.freeze({
  resolveEndpoint() {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        return APP_CONFIG.CRM.LOCAL_ENDPOINT;
      }
    }
    return APP_CONFIG.CRM.PRODUCTION_ENDPOINT;
  },

  resolveAvailabilityEndpoint() {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        return APP_CONFIG.CRM.LOCAL_AVAILABILITY_ENDPOINT;
      }
    }
    return APP_CONFIG.CRM.PRODUCTION_AVAILABILITY_ENDPOINT;
  },

  resolvePropertyId(selection) {
    const str = String(selection || "").toLowerCase();
    if (str.includes("tower")) return "prop-4";
    if (str.includes("darling")) return "prop-3";
    if (str.includes("darad")) return "prop-2";
    if (str.includes("apartment")) return "prop-1";
    return "prop-2";
  },

  buildPayload({ formData, grandTotal, formattedContactPhone }) {
    const isTestMode = isDemoModeActive();
    const offering = typeof getOfferingById === "function" ? getOfferingById(formData.property) : null;
    const offeringId = offering ? offering.id : "";
    const idempotencyKey = "IDEMP-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);

    return {
      idempotencyKey,
      guestName: formData.name,
      guestPhone: formattedContactPhone,
      guestEmail: formData.email,
      propertyName: formData.property,
      propertyId: this.resolvePropertyId(formData.property),
      offeringId,
      unitPreference: formData.property,
      checkInDate: formData.checkIn,
      checkOutDate: formData.checkOut,
      adults: formData.adults,
      children: formData.children,
      unitsCount: formData.unitsCount || 1,
      estimatedTotal: grandTotal || 0,
      selectedAddons: formData.selectedAddons || [],
      specialRequests: formData.specialRequests || "",
      preferredContactMethod: formData.preferredContactMethod || "WhatsApp / Text",
      channel: APP_CONFIG.CRM.DEFAULT_CHANNEL,
      sourceUrl: typeof window !== "undefined" ? window.location.href : "",
      hp_field: formData.honeypot || "",
      isTest: isTestMode
    };
  },

  async checkAvailability({ propertyId, checkInDate, checkOutDate, offeringId, adults, children, unitsCount = 1 }) {
    if (!checkInDate || !checkOutDate) return null;
    try {
      const baseEndpoint = this.resolveAvailabilityEndpoint();
      const url = new URL(baseEndpoint);
      if (propertyId) url.searchParams.set("propertyId", propertyId);
      if (offeringId) url.searchParams.set("offeringId", offeringId);
      if (adults) url.searchParams.set("adults", String(adults));
      if (children) url.searchParams.set("children", String(children));
      if (unitsCount) url.searchParams.set("units", String(unitsCount));
      url.searchParams.set("checkIn", checkInDate);
      url.searchParams.set("checkOut", checkOutDate);

      let controller = null;
      let timeoutId = null;

      if (typeof AbortController !== "undefined") {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.CRM.SYNC_TIMEOUT_MS);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        signal: controller ? controller.signal : undefined
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (response && response.ok) {
        return await response.json();
      }
    } catch (err) {
      if (typeof console !== "undefined" && typeof console.debug === "function") {
        console.debug("[CrmSyncService] Availability check bypassed:", err && err.message);
      }
    }
    return null;
  },

  async sendInquiry(inquiryPayload) {
    try {
      const endpoint = this.resolveEndpoint();
      let controller = null;
      let timeoutId = null;

      if (typeof AbortController !== "undefined") {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.CRM.SYNC_TIMEOUT_MS);
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(inquiryPayload),
        signal: controller ? controller.signal : undefined
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (response && response.ok) {
        return await response.json();
      }
    } catch (err) {
      if (typeof console !== "undefined" && typeof console.debug === "function") {
        console.debug("[CrmSyncService] Non-blocking intake sync bypassed:", err && err.message);
      }
    }
    return null;
  }
});

let activeScrollLockCount = 0;

const PageScrollLock = Object.freeze({
  getLockCount() {
    return activeScrollLockCount;
  },

  lock() {
    if (typeof document === "undefined" || !document.body) return;
    activeScrollLockCount += 1;
    if (activeScrollLockCount === 1) {
      document.body.style.overflow = "hidden";
    }
  },

  unlock() {
    if (typeof document === "undefined" || !document.body) return;
    activeScrollLockCount = Math.max(0, activeScrollLockCount - 1);
    if (activeScrollLockCount === 0) {
      document.body.style.overflow = "";
    }
  },

  reset() {
    activeScrollLockCount = 0;
    if (typeof document !== "undefined" && document.body) {
      document.body.style.overflow = "";
    }
  }
});

// ── 3. PURE DOMAIN & UTILITY FUNCTIONS (PORTABLE & TESTABLE) ──

/**
 * Predicate checking whether demo/testing mode is enabled via URL search parameters.
 */
function isDemoModeActive(searchQueryString = (typeof window !== "undefined" && window.location ? window.location.search : "")) {
  if (!searchQueryString) return false;
  return (
    searchQueryString.includes("demo=true") ||
    searchQueryString.includes("test=true") ||
    searchQueryString.includes("demo=1") ||
    searchQueryString.includes("test=1")
  );
}

/**
 * Returns an ISO date string (YYYY-MM-DD) computed in the Africa/Nairobi timezone (UTC+3).
 */
function getNairobiDateString(offsetDays = 0) {
  const currentMoment = new Date();
  const utcMilliseconds = currentMoment.getTime() + (currentMoment.getTimezoneOffset() * 60000);
  const nairobiMilliseconds = utcMilliseconds + (APP_CONFIG.TIME.HOURS_OFFSET_UTC * APP_CONFIG.TIME.MS_PER_HOUR);
  const nairobiDate = new Date(nairobiMilliseconds);
  nairobiDate.setDate(nairobiDate.getDate() + offsetDays);
  return nairobiDate.toISOString().split("T")[0];
}

/**
 * Calculates calendar day difference between two YYYY-MM-DD date strings.
 */
function calculateDateDifferenceInDays(startDateString, endDateString) {
  if (!startDateString || !endDateString) return 0;
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);
  const differenceMilliseconds = endDate.getTime() - startDate.getTime();
  return Math.ceil(differenceMilliseconds / APP_CONFIG.TIME.MS_PER_DAY);
}

/**
 * Predicate checking if a given date string is chronologically before a reference date.
 */
function isPastDate(dateString, referenceTodayString = getNairobiDateString(0)) {
  return dateString < referenceTodayString;
}

/**
 * Predicate checking if the end date is on or before the start date.
 */
function isInvalidDateRange(startDateString, endDateString) {
  if (!startDateString || !endDateString) return true;
  return new Date(endDateString) <= new Date(startDateString);
}

/**
 * Formats a number with leading zero padding for standard two-digit representations (e.g., month or day).
 */
function formatTwoDigitNumber(numericValue) {
  return String(numericValue).padStart(2, "0");
}

/**
 * Predicate checking if a target date string falls strictly between start and end dates.
 */
function isDateBetween(targetDateString, startDateString, endDateString) {
  if (!targetDateString || !startDateString || !endDateString) return false;
  return targetDateString > startDateString && targetDateString < endDateString;
}

/**
 * Normalizes phone numbers: strips non-digits and removes Kenyan leading zero when code is +254.
 */
function normalizeKenyanPhoneNumber(countryCode, rawPhoneNumber) {
  if (!rawPhoneNumber) return "";
  let digitsOnly = rawPhoneNumber.replace(/[^\d]/g, "");
  if (countryCode === APP_CONFIG.CONTACT.DEFAULT_COUNTRY_CODE && digitsOnly.startsWith("0")) {
    digitsOnly = digitsOnly.substring(1);
  }
  return digitsOnly;
}

/**
 * Resolves per-person daily breakfast rate based on property capabilities.
 * Single Source of Truth: Beakim Darad = KSh 500/day, Diani Darling = KSh 1,000/day, Self-Catering = KSh 0.
 */
function resolveBreakfastRate(propertyIdentifier) {
  if (!propertyIdentifier) return 1000;
  const normalized = String(propertyIdentifier).toLowerCase();
  if (normalized.includes("darad")) return 500;
  if (normalized.includes("darling")) return 1000;
  if (normalized.includes("tower") || normalized.includes("apartment")) return 0;

  // Cross-reference official catalog offerings if catalog helper is loaded
  if (typeof getOfferingById === "function") {
    const offering = getOfferingById(propertyIdentifier);
    if (offering && typeof offering.propertyBreakfastRate === "number") {
      return offering.propertyBreakfastRate;
    }
    if (offering && offering.propertyId) {
      if (offering.propertyId.includes("darad")) return 500;
      if (offering.propertyId.includes("darling")) return 1000;
      if (offering.propertyId.includes("tower") || offering.propertyId.includes("apartment")) return 0;
    }
  }

  // Keyword fallback for specific property room titles
  if (normalized.includes("superior") || normalized.includes("standard") || normalized.includes("kitchenette") || normalized.includes("garden view cottage")) {
    return 500; // All exclusive to Beakim Darad
  }
  if (normalized.includes("deluxe studio")) {
    return 1000; // Exclusive to Diani Darling Cottages
  }

  return 1000;
}

/**
 * Pure domain function computing stay pricing plus ancillary add-ons.
 */
function calculateReservationTotals({ pricingSummary, adultsCount = 1, hasBreakfast = false, propertyIdentifier = null, unitsCount = 1 }) {
  const durationDays = pricingSummary && pricingSummary.durationDays > 0 ? pricingSummary.durationDays : 0;
  const singleUnitCost = pricingSummary
    ? (typeof pricingSummary.totalCost === "number"
        ? pricingSummary.totalCost
        : ((Number(pricingSummary.basePricePerNight || pricingSummary.rate) || 0) * durationDays))
    : 0;
  const units = Math.max(1, parseInt(unitsCount, 10) || 1);
  const baseCost = singleUnitCost * units;
  const formattedBaseCost = `KSh ${baseCost.toLocaleString()}`;
  const propId = propertyIdentifier || (pricingSummary && (pricingSummary.propertyId || pricingSummary.propertyName || pricingSummary.unitDisplayName));
  const breakfastRate = resolveBreakfastRate(propId);
  const breakfastCost = (hasBreakfast && durationDays > 0 && breakfastRate > 0)
    ? breakfastRate * adultsCount * durationDays
    : 0;
  const formattedBreakfastCost = breakfastCost > 0 ? `+KSh ${breakfastCost.toLocaleString()}` : "+KSh 0";
  const grandTotal = baseCost + breakfastCost;
  const isValid = Boolean(pricingSummary && pricingSummary.isValidRange);
  const formattedGrandTotal = isValid
    ? `KSh ${grandTotal.toLocaleString()}`
    : (pricingSummary ? pricingSummary.formattedTotal : "Invalid Dates");

  return {
    baseCost,
    formattedBaseCost,
    breakfastRate,
    breakfastCost,
    formattedBreakfastCost,
    grandTotal,
    formattedGrandTotal,
    durationDays,
    adultsCount,
    unitsCount: units,
    hasBreakfast,
    isValid
  };
}

const PROPERTY_RATE_CATALOG_FALLBACK = Object.freeze([
  { matcher: (id) => id.includes("Standard") && id.includes("Without AC"), rate: 1700, isMonthly: false },
  { matcher: (id) => id.includes("Standard") && id.includes("With AC"), rate: 2300, isMonthly: false },
  { matcher: (id) => id.includes("Superior") && id.includes("Darad"), rate: 3000, isMonthly: false },
  { matcher: (id) => id.includes("Studio") && id.includes("Kitchenette"), rate: 3000, isMonthly: false },
  { matcher: (id) => id.includes("Cottage") && id.includes("Darad"), rate: 4000, isMonthly: false },
  { matcher: (id) => id.includes("Diani Darling"), rate: 5000, isMonthly: false },
  { matcher: (id) => id.includes("Tower"), rate: 2500, isMonthly: false },
  { matcher: (id) => id.includes("Apartment") && id.includes("Short"), rate: 5000, isMonthly: false },
  { matcher: (id) => id.includes("Apartment"), rate: 75000, isMonthly: true }
]);

/**
 * Computes stay pricing and formatted summary metrics based on catalog offerings or fallback rules.
 */
function resolveStayPricing(propertyOrOfferingId, checkInDateString, checkOutDateString) {
  let offering = null;
  if (typeof getOfferingById === "function") {
    offering = getOfferingById(propertyOrOfferingId);
  }

  let rate = APP_CONFIG.DEFAULTS.FALLBACK_NIGHTLY_RATE;
  let isMonthly = false;
  let unitDisplayName = propertyOrOfferingId || APP_CONFIG.DEFAULTS.FALLBACK_PROPERTY_NAME;

  if (offering) {
    rate = offering.rate;
    isMonthly = (offering.stayType === "monthly");
    unitDisplayName = offering.name;
  } else {
    const propertyIdentifier = String(propertyOrOfferingId);
    const matchedRule = PROPERTY_RATE_CATALOG_FALLBACK.find(rule => rule.matcher(propertyIdentifier));
    if (matchedRule) {
      rate = matchedRule.rate;
      isMonthly = matchedRule.isMonthly;
    }
  }

  const rateBasisText = isMonthly ? `KSh ${rate.toLocaleString()} / mo` : `KSh ${rate.toLocaleString()} / night`;

  const propertyId = offering ? (offering.propertyId || offering.id) : String(propertyOrOfferingId);
  const propertyName = offering ? offering.propertyName : String(propertyOrOfferingId);

  if (!checkInDateString || !checkOutDateString) {
    return {
      propertyId,
      propertyName,
      rate,
      isMonthly,
      unitDisplayName,
      rateBasisText,
      durationDays: 0,
      durationText: isMonthly ? "1 Month (Min)" : "1 Night",
      totalCost: rate,
      formattedTotal: `KSh ${rate.toLocaleString()}`,
      isValidRange: true
    };
  }

  const durationDays = calculateDateDifferenceInDays(checkInDateString, checkOutDateString);
  if (durationDays <= 0) {
    return {
      propertyId,
      propertyName,
      rate,
      isMonthly,
      unitDisplayName,
      rateBasisText,
      durationDays: 0,
      durationText: "Invalid Dates",
      totalCost: 0,
      formattedTotal: "Check-out must be after check-in",
      isValidRange: false
    };
  }

  let durationText = "";
  let totalCost = 0;

  if (isMonthly) {
    const approximateMonths = Math.max(1, Math.round(durationDays / APP_CONFIG.TIME.DAYS_PER_MONTH));
    totalCost = rate * approximateMonths;
    durationText = `${durationDays} Days (~${approximateMonths} Mo)`;
  } else {
    totalCost = rate * durationDays;
    durationText = `${durationDays} ${durationDays === 1 ? "Night" : "Nights"}`;
  }

  return {
    propertyId,
    propertyName,
    rate,
    isMonthly,
    unitDisplayName,
    rateBasisText,
    durationDays,
    durationText,
    totalCost,
    formattedTotal: `KSh ${totalCost.toLocaleString()}`,
    isValidRange: true
  };
}

/**
 * Builds standard plain-text WhatsApp stay inquiry message with structured formatting.
 */
function buildInquiryMessage({ guestName, contactPhone, guestEmail, propertyName, checkInDate, checkOutDate, stayDurationText, adultsCount, childrenCount, estimatedTotal, selectedAddons = [], specialRequests = "", preferredContactMethod = "", unitsCount = 1 }) {
  const emailLine = guestEmail ? `• Email: ${guestEmail}\n` : "";
  const preferredChannelLine = preferredContactMethod ? `• Preferred Contact: ${preferredContactMethod}\n` : "";
  const childrenText = childrenCount > 0 ? `, ${childrenCount} Child(ren)` : "";
  const unitsText = unitsCount > 1 ? ` (${unitsCount} Units)` : "";
  const estimatedRateLine = estimatedTotal ? `• Estimated Rate: ${estimatedTotal}\n` : "";

  let addonsBlock = "";
  if (selectedAddons && selectedAddons.length > 0) {
    addonsBlock = `\n• Selected Add-Ons & Preferences:\n` + selectedAddons.map(item => `  - ${item}`).join("\n") + "\n";
  }

  const specialRequestsBlock = specialRequests ? `\n• Special Requests / Notes: ${specialRequests}\n` : "";

  return (
    `🌴 BEAKIM HOSPITALITY - STAY INQUIRY 🌴\n\n` +
    `• Guest Name: ${guestName}\n` +
    `• Contact: ${contactPhone}\n` +
    emailLine +
    preferredChannelLine +
    `• Accommodation: ${propertyName}${unitsText}\n` +
    `• Check-In: ${checkInDate}\n` +
    `• Check-Out: ${checkOutDate} (${stayDurationText})\n` +
    `• Guests: ${adultsCount} Adult(s)${childrenText}\n` +
    estimatedRateLine +
    addonsBlock +
    specialRequestsBlock +
    `\nHello! Please confirm availability and reservation procedures for these dates. Thank you!`
  );
}

// ── 4. HIGH-LEVEL FORM COORDINATORS (STEPDOWN RULE) ──

/**
 * Resolves the Beakim CRM public intake API base endpoint based on active runtime hostname.
 */
function getCrmPublicEndpoint() {
  return CrmSyncService.resolveEndpoint();
}

/**
 * Maps property name or dropdown selection to authoritative CRM propertyId.
 */
function resolvePropertyIdFromSelection(selection) {
  return CrmSyncService.resolvePropertyId(selection);
}

/**
 * Transmits website booking inquiry asynchronously to Beakim CRM in background.
 * Guaranteed non-blocking with 3.5s timeout so WhatsApp modal is never delayed.
 */
async function syncInquiryToCrm(inquiryPayload) {
  return CrmSyncService.sendInquiry(inquiryPayload);
}

/**
 * Backward-compatible alias for cottage-specific booking forms.
 */
function handleCottageSubmit(event) {
  return handleBookingSubmit(event);
}

function extractSubmitButton(event) {
  if (event && event.target && typeof event.target.querySelector === "function") {
    return event.target.querySelector('button[type="submit"]');
  }
  if (typeof document !== "undefined") {
    return document.querySelector('#booking-form button[type="submit"], #btn-submit-booking');
  }
  return null;
}

function temporarilyLockSubmitButton(submitButton) {
  if (!submitButton) return;
  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  submitButton.classList.add("opacity-75", "cursor-wait");
  setTimeout(() => {
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
    submitButton.classList.remove("opacity-75", "cursor-wait");
  }, APP_CONFIG.UI.BUTTON_COOLDOWN_MS);
}

function handleValidationFailure(validationError) {
  if (typeof showToast === "function") {
    showToast(validationError.message, APP_CONFIG.UI.VALIDATION_TOAST_DURATION_MS);
  } else {
    alert(validationError.message);
  }
  if (validationError.fieldElement && typeof validationError.fieldElement.focus === "function") {
    validationError.fieldElement.focus();
  }
}

function processValidBookingSubmission(formData) {
  const pricingSummary = resolveStayPricing(formData.property, formData.checkIn, formData.checkOut);
  const normalizedPhone = normalizeKenyanPhoneNumber(formData.countryCode, formData.phoneNumber);
  const formattedContactPhone = `${formData.countryCode} ${normalizedPhone}`;
  const totalGuests = formData.adults + formData.children;
  const unitsCount = Math.max(1, parseInt(formData.unitsCount, 10) || 1);

  const totals = calculateReservationTotals({
    pricingSummary,
    adultsCount: formData.adults,
    hasBreakfast: formData.hasBreakfast,
    propertyIdentifier: formData.property,
    unitsCount
  });

  const preferredContactMethod = formData.preferredContactMethod || "WhatsApp / Text";

  const messageText = buildInquiryMessage({
    guestName: formData.name,
    contactPhone: formattedContactPhone,
    guestEmail: formData.email,
    propertyName: formData.property,
    checkInDate: formData.checkIn,
    checkOutDate: formData.checkOut,
    stayDurationText: pricingSummary.durationText,
    adultsCount: formData.adults,
    childrenCount: formData.children,
    estimatedTotal: totals.formattedGrandTotal,
    selectedAddons: formData.selectedAddons || [],
    specialRequests: formData.specialRequests || "",
    preferredContactMethod,
    unitsCount
  });

  const whatsappUrl = CommunicationService.buildWhatsAppUrl(messageText);

  const inquiryPayload = CrmSyncService.buildPayload({
    formData: {
      ...formData,
      unitsCount
    },
    grandTotal: totals.grandTotal,
    formattedContactPhone
  });

  showInquiryReviewModal({
    formData: {
      ...formData,
      unitsCount
    },
    inquiryPayload,
    name: formData.name,
    phone: formattedContactPhone,
    email: formData.email,
    property: formData.property,
    dates: `${formData.checkIn} to ${formData.checkOut} (${pricingSummary.durationText})`,
    guests: `${totalGuests} (${formData.adults} Adults, ${formData.children} Children)`,
    unitsCount,
    estimatedTotal: totals.formattedGrandTotal,
    selectedAddons: formData.selectedAddons || [],
    specialRequests: formData.specialRequests || "",
    preferredContactMethod,
    whatsappUrl,
    messageText,
    pricingSummary,
    totals
  });
}

/**
 * Primary booking inquiry form submit handler (<20 lines SRP orchestrator).
 */
function handleBookingSubmit(event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  const submitBtn = extractSubmitButton(event);
  if (submitBtn && submitBtn.disabled) return;

  const formData = extractBookingFormData();
  const validationError = validateBookingFormData(formData);
  if (validationError) {
    handleValidationFailure(validationError);
    return;
  }

  temporarilyLockSubmitButton(submitBtn);
  processValidBookingSubmission(formData);
}

/**
 * Extracts structured add-ons and complimentary preferences.
 */
function extractSelectedAddons({ adultsCount, validNights, breakfastChecked, propertyIdentifier = null }) {
  const selectedAddons = [];
  const breakfastRate = resolveBreakfastRate(propertyIdentifier);
  if (breakfastChecked && breakfastRate > 0) {
    const breakfastTotal = breakfastRate * adultsCount * validNights;
    selectedAddons.push(`Chef-Prepared Coastal Breakfast: ${adultsCount} Guest(s) × ${validNights} Night(s) (+KSh ${breakfastTotal.toLocaleString()})`);
  }

  const standardAddonMap = [
    { id: "addon-kitchen", label: "Self-Catering Cooking Setup (Complimentary)" },
    { id: "addon-ground-floor", label: "Ground Floor / Garden Access Preference (Complimentary)" }
  ];

  if (typeof document !== "undefined") {
    standardAddonMap.forEach(({ id, label }) => {
      const checkbox = document.getElementById(id);
      if (checkbox && checkbox.checked) selectedAddons.push(label);
    });

    document.querySelectorAll('input[type="checkbox"][data-addon-name]:checked').forEach(checkboxElement => {
      const customName = checkboxElement.getAttribute("data-addon-name");
      if (customName && !selectedAddons.includes(customName)) {
        selectedAddons.push(customName);
      }
    });
  }

  return selectedAddons;
}

/**
 * Extracts form field values from the active document.
 */
function extractBookingFormData() {
  const nameElement = document.getElementById("guest-name");
  const emailElement = document.getElementById("guest-email");
  const codeElement = document.getElementById("country-code") || document.getElementById("guest-phone-code");
  const phoneElement = document.getElementById("guest-phone-number");
  const propertyElement = document.getElementById("booking-property");
  const checkInElement = document.getElementById("check-in");
  const checkOutElement = document.getElementById("check-out");
  const adultsElement = document.getElementById("guests-adults");
  const childrenElement = document.getElementById("guests-children");
  const numGuestsElement = document.getElementById("num-guests");
  const specialRequestsElement = document.getElementById("guest-special-requests");

  let propertyValue = propertyElement ? propertyElement.value : "";
  if (!propertyValue && typeof window !== "undefined") {
    const currentPath = window.location.pathname.toLowerCase();
    if (currentPath.includes("darad")) propertyValue = "Beakim Darad";
    else if (currentPath.includes("tower")) propertyValue = "Tower Cottages";
    else if (currentPath.includes("darling")) propertyValue = "Diani Darling Cottages";
    else if (currentPath.includes("apartment")) propertyValue = "Beakim Apartments";
    else propertyValue = APP_CONFIG.DEFAULTS.FALLBACK_PROPERTY_NAME;
  }

  let adultsCount = APP_CONFIG.DEFAULTS.ADULTS_COUNT;
  let childrenCount = APP_CONFIG.DEFAULTS.CHILDREN_COUNT;

  if (adultsElement) adultsCount = parseInt(adultsElement.value, 10) || APP_CONFIG.DEFAULTS.ADULTS_COUNT;
  else if (numGuestsElement) adultsCount = parseInt(numGuestsElement.value, 10) || APP_CONFIG.DEFAULTS.ADULTS_COUNT;

  if (childrenElement) childrenCount = parseInt(childrenElement.value, 10) || APP_CONFIG.DEFAULTS.CHILDREN_COUNT;

  const honeypotElement = typeof document !== "undefined" ? document.getElementById("website_hp") : null;
  const breakfastCheckbox = typeof document !== "undefined" ? document.getElementById("addon-breakfast") : null;
  const breakfastChecked = Boolean(breakfastCheckbox && breakfastCheckbox.checked);

  const contactRadio = typeof document !== "undefined" ? document.querySelector('input[name="preferred-contact"]:checked') : null;
  const preferredContactMethod = contactRadio ? contactRadio.value : "WhatsApp / Text";

  const durationDays = calculateDateDifferenceInDays(checkInElement ? checkInElement.value : "", checkOutElement ? checkOutElement.value : "");
  const validNights = durationDays > 0 ? durationDays : 1;

  const unitsCount = typeof getBookingUnitsCount === "function" ? getBookingUnitsCount() : 1;
  const selectedAddons = extractSelectedAddons({ adultsCount, validNights, breakfastChecked, propertyIdentifier: propertyValue });

  return {
    name: nameElement ? nameElement.value.trim() : "",
    email: emailElement ? emailElement.value.trim() : "",
    countryCode: codeElement ? codeElement.value.trim() : APP_CONFIG.CONTACT.DEFAULT_COUNTRY_CODE,
    phoneNumber: phoneElement ? phoneElement.value.trim() : "",
    property: propertyValue,
    checkIn: checkInElement ? checkInElement.value : "",
    checkOut: checkOutElement ? checkOutElement.value : "",
    adults: adultsCount,
    children: childrenCount,
    unitsCount,
    specialRequests: specialRequestsElement ? specialRequestsElement.value.trim() : "",
    selectedAddons,
    hasBreakfast: breakfastChecked,
    preferredContactMethod,
    honeypot: honeypotElement ? honeypotElement.value.trim() : "",
    nameElement,
    phoneElement,
    checkInElement,
    checkOutElement
  };
}

/**
 * Validates booking form data and returns first validation error or null.
 */
function validateBookingFormData(data) {
  if (!data.name) {
    return { message: "Please enter your full name.", fieldElement: data.nameElement };
  }
  if (!data.phoneNumber) {
    return { message: "Please enter your phone number.", fieldElement: data.phoneElement };
  }
  if (!data.checkIn || !data.checkOut) {
    return { message: "Please select both Check-In and Check-Out dates.", fieldElement: data.checkInElement };
  }
  if (isInvalidDateRange(data.checkIn, data.checkOut)) {
    return { message: "Check-Out date must be strictly after Check-In date.", fieldElement: data.checkOutElement };
  }
  if (isPastDate(data.checkIn, getNairobiDateString(0))) {
    return { message: "Check-In date cannot be in the past.", fieldElement: data.checkInElement };
  }

  // Combined party-size capacity check against room maximum and units count
  const offering = typeof getOfferingById === "function" ? getOfferingById(data.property) : null;
  const unitsCount = Math.max(1, parseInt(data.unitsCount, 10) || 1);
  if (offering) {
    const maxGuestsPerUnit = offering.maxGuests || 2;
    const maxAdultsPerUnit = offering.maxAdults || 2;
    const totalGuests = (Number(data.adults) || 0) + (Number(data.children) || 0);
    const totalAdults = Number(data.adults) || 0;
    const totalMaxGuests = maxGuestsPerUnit * unitsCount;
    const totalMaxAdults = maxAdultsPerUnit * unitsCount;

    if (totalAdults > totalMaxAdults || totalGuests > totalMaxGuests) {
      const unitsNeeded = Math.max(Math.ceil(totalAdults / maxAdultsPerUnit), Math.ceil(totalGuests / maxGuestsPerUnit));
      return {
        message: `${offering.name} accommodates up to ${maxGuestsPerUnit} guests (you selected ${totalGuests}) per unit (${offering.bedType || '1 Bed'}). For your party of ${totalGuests} guests, please reserve at least ${unitsNeeded} units.`,
        fieldElement: document.getElementById("guests-adults") || data.phoneElement
      };
    }
  }

  return null;
}

/**
 * Synchronizes the hidden/desktop property dropdown to match residence selection.
 */
function syncPropertyDropdown(propertyValue) {
  const propertySelectElement = document.getElementById("booking-property");
  if (!propertySelectElement) return;

  const normalizedTarget = propertyValue.toLowerCase();
  let matchedIndex = -1;
  for (let i = 0; i < propertySelectElement.options.length; i++) {
    const optValue = propertySelectElement.options[i].value.toLowerCase();
    if (optValue === normalizedTarget || optValue.includes(normalizedTarget) || normalizedTarget.includes(optValue)) {
      matchedIndex = i;
      break;
    }
  }

  if (matchedIndex >= 0) {
    propertySelectElement.selectedIndex = matchedIndex;
  } else {
    propertySelectElement.value = propertyValue;
  }
}

/**
 * Updates visual selection styling on residence radio cards.
 */
function syncResidenceCardsStyling(selectedCardElement) {
  const allCards = document.querySelectorAll(".residence-card");
  allCards.forEach(card => {
    const isSelected = card === selectedCardElement;
    card.classList.toggle("border-2", isSelected);
    card.classList.toggle("border-line-accent", isSelected);
    card.classList.toggle("bg-champagne/10", isSelected);
    card.classList.toggle("border", !isSelected);
    card.classList.toggle("border-deep-forest/15", !isSelected);
    card.classList.toggle("bg-white", !isSelected);
    card.setAttribute("aria-checked", isSelected ? "true" : "false");

    const radio = card.querySelector(".residence-radio");
    if (radio) {
      radio.classList.toggle("border-line-accent", isSelected);
      radio.classList.toggle("bg-champagne", isSelected);
      radio.classList.toggle("border-deep-forest/30", !isSelected);
      radio.classList.toggle("bg-transparent", !isSelected);

      const dot = radio.querySelector("div");
      if (dot) {
        dot.classList.toggle("opacity-0", !isSelected);
      }
    }
  });
}

/**
 * Toggles breakfast add-on availability and updates dynamic rate per property.
 */
function syncBreakfastAddonCard(propertyValue) {
  const breakfastCard = document.getElementById("addon-card-breakfast");
  const preferencesSection = document.getElementById("booking-step-preferences");
  const guestStepBadge = document.getElementById("booking-step-guest-badge");
  const breakfastCheckbox = document.getElementById("addon-breakfast");

  const normalized = String(propertyValue || "").toLowerCase();
  const isBreakfastEligible = normalized.includes("darling") || normalized.includes("darad");

  if (breakfastCard) {
    breakfastCard.classList.toggle("hidden", !isBreakfastEligible);
    breakfastCard.classList.toggle("flex", isBreakfastEligible);
    breakfastCard.classList.toggle("border-line-accent/50", isBreakfastEligible);
  }

  if (breakfastCheckbox) {
    if (!isBreakfastEligible) {
      breakfastCheckbox.checked = false;
      breakfastCheckbox.disabled = true;
    } else {
      breakfastCheckbox.disabled = false;
    }
  }

  // If the preferences step only holds breakfast, toggle the entire step container
  if (preferencesSection) {
    preferencesSection.classList.toggle("hidden", !isBreakfastEligible);
  }

  // Dynamically update Step 3 badge to 2 if preferences step is hidden
  if (guestStepBadge) {
    guestStepBadge.textContent = isBreakfastEligible ? "3" : "2";
  }

  if (breakfastCard && isBreakfastEligible) {
    const priceBadge = (typeof document !== "undefined" && document.getElementById("addon-breakfast-price-badge")) ||
                       breakfastCard.querySelector("#addon-breakfast-price-badge") ||
                       breakfastCard.querySelector(".addon-price, .text-ink-gold, [class*='7A5B20']") ||
                       breakfastCard.querySelector(".text-ink-gold:not(input)");
    if (priceBadge) {
      if (normalized.includes("darad")) {
        priceBadge.textContent = "+KSh 500 / person / day";
      } else if (normalized.includes("darling")) {
        priceBadge.textContent = "+KSh 1,000 / person / day";
      }
    }

    const descElem = (typeof document !== "undefined" && document.getElementById("addon-breakfast-description")) ||
                     breakfastCard.querySelector("#addon-breakfast-description") ||
                     breakfastCard.querySelector(".text-stone-600, .text-ink-accent");
    if (descElem) {
      if (normalized.includes("darling")) {
        descElem.textContent = "Fresh tropical fruits, eggs made to order, Swahili mahamri, and hot tea/coffee delivered to your verandah.";
      } else if (normalized.includes("darad")) {
        descElem.textContent = "Fresh coastal tropical fruits, eggs made to order, Swahili mahamri, and hot tea/coffee served poolside.";
      }
    }
  }
}

/**
 * Toggles visibility of the Beakim Darad room category sub-selector container.
 */
function toggleDaradRoomSelector(isDaradSelected) {
  if (typeof document === "undefined") return;
  const container = document.getElementById("darad-room-selector-container");
  if (!container) return;
  container.classList.toggle("hidden", !isDaradSelected);
  container.classList.toggle("block", isDaradSelected);
}

/**
 * Updates visual selection styling on Beakim Darad room category cards.
 */
function syncDaradRoomTiersStyling(selectedRoomCardElement) {
  if (typeof document === "undefined") return;
  const allDaradCards = document.querySelectorAll(".darad-room-card");
  allDaradCards.forEach(card => {
    const isSelected = card === selectedRoomCardElement;
    card.classList.toggle("border-2", isSelected);
    card.classList.toggle("border-line-accent", isSelected);
    card.classList.toggle("bg-champagne/10", isSelected);
    card.classList.toggle("border", !isSelected);
    card.classList.toggle("border-deep-forest/15", !isSelected);
    card.classList.toggle("bg-white", !isSelected);
    card.setAttribute("aria-checked", isSelected ? "true" : "false");

    const radio = card.querySelector(".darad-room-radio");
    if (radio) {
      radio.classList.toggle("border-line-accent", isSelected);
      radio.classList.toggle("bg-champagne", isSelected);
      radio.classList.toggle("border-deep-forest/30", !isSelected);
      radio.classList.toggle("bg-transparent", !isSelected);

      const dot = radio.querySelector("div");
      if (dot) {
        dot.classList.toggle("opacity-0", !isSelected);
      }
    }
  });
}

/**
 * Selects a specific room category for Beakim Darad.
 */
function selectDaradRoomTier(roomValue, roomCardElement) {
  if (typeof document === "undefined") return;
  syncDaradRoomTiersStyling(roomCardElement);
  syncPropertyDropdown(roomValue);

  // Update dynamic subtitle / badge on the Beakim Darad property card if present
  const daradRateLabel = document.getElementById("darad-property-rate-label");
  if (daradRateLabel && roomCardElement) {
    const priceText = roomCardElement.querySelector(".darad-room-price, .text-ink-gold, [class*='7A5B20']")?.textContent || "";
    const nameText = roomCardElement.querySelector(".font-display")?.textContent || "";
    daradRateLabel.textContent = `Selected: ${nameText} (${priceText.trim()})`;
  }

  // Ensure Beakim Darad property card has active card styling if called directly
  const daradPropertyCard = document.querySelector('.residence-card[data-is-darad="true"]') ||
                            document.querySelector('.residence-card[data-value*="Darad"]');
  if (daradPropertyCard) {
    syncResidenceCardsStyling(daradPropertyCard);
  }

  syncBreakfastAddonCard(roomValue);
  handleDateOrAddonChange();
}

/**
 * Handles keyboard navigation (Enter / Space) for accessible Darad room cards.
 */
function handleDaradRoomKeydown(event, roomValue, roomCardElement) {
  if (!event) return;
  if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
    event.preventDefault();
    selectDaradRoomTier(roomValue, roomCardElement);
  }
}

/**
 * Selects an interactive residence card in the 2-column booking form (<15 lines SRP orchestrator).
 */
function selectResidenceCard(propertyValue, cardElement) {
  if (typeof document === "undefined") return;
  const isDarad = String(propertyValue || "").toLowerCase().includes("darad");
  toggleDaradRoomSelector(isDarad);

  let targetValue = propertyValue;
  if (isDarad) {
    // If a Darad room was already selected in the sub-selector, sync with that room's value!
    const activeDaradCard = document.querySelector('.darad-room-card[aria-checked="true"]');
    if (activeDaradCard && activeDaradCard.getAttribute("data-value")) {
      targetValue = activeDaradCard.getAttribute("data-value");
    }
  }

  syncPropertyDropdown(targetValue);
  syncResidenceCardsStyling(cardElement);
  syncBreakfastAddonCard(targetValue);
  handleDateOrAddonChange();
}

/**
 * Handles keyboard navigation (Enter / Space) for accessible residence cards.
 */
function handleResidenceCardKeydown(event, propertyValue, cardElement) {
  if (!event) return;
  if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
    event.preventDefault();
    selectResidenceCard(propertyValue, cardElement);
  }
}

/**
 * Retrieves the current user-requested unit count from the DOM or defaults to 1.
 */
function getBookingUnitsCount() {
  if (typeof document === "undefined") return 1;
  const input = document.getElementById("booking-units-count");
  if (!input) return 1;
  const val = parseInt(input.value, 10);
  return isNaN(val) || val < 1 ? 1 : val;
}

/**
 * Dynamically updates requested units count and triggers stay recalculation.
 */
function setBookingUnitsCount(count) {
  if (typeof document === "undefined") return;
  const input = document.getElementById("booking-units-count");
  const wrapper = document.getElementById("booking-units-wrapper");
  const parsed = Math.max(1, parseInt(count, 10) || 1);
  if (input) input.value = String(parsed);
  if (wrapper) {
    if (parsed > 1) {
      wrapper.classList.remove("hidden");
    }
  }
  handleDateOrAddonChange();
}

/**
 * Increments or decrements requested unit count.
 */
function adjustBookingUnits(delta) {
  const current = getBookingUnitsCount();
  const next = Math.max(1, Math.min(10, current + delta));
  setBookingUnitsCount(next);
}

/**
 * Convenience helper to switch property to Tower Cottages 2-Bedroom Apartment.
 */
function selectTowerCottages2Br() {
  if (typeof document === "undefined") return;
  const towerCard = document.querySelector('.residence-card[data-value*="Tower"]');
  if (towerCard && typeof selectResidenceCard === "function") {
    selectResidenceCard("Tower Cottages - 2-Bedroom Apartment", towerCard);
    setBookingUnitsCount(1);
  } else {
    syncPropertyDropdown("Tower Cottages - 2-Bedroom Apartment");
    setBookingUnitsCount(1);
  }
}

/**
 * Triggered on date, guest, or add-on checkbox changes to recalculate live totals.
 */
/** Resolve visible benefits from the same catalog as the booking controls. */
function resolveBookingBenefits(propertyValue, catalog = typeof BEAKIM_CATALOG !== "undefined" ? BEAKIM_CATALOG : null) {
  const selection = String(propertyValue || "").toLowerCase();
  const property = catalog && Object.values(catalog).find(item =>
    selection.includes(item.id) || selection.includes(item.name.toLowerCase()));
  if (!property) return {
    poolTitle: "Property Amenities", poolDescription: "Amenities depend on your selected property and room category.",
    showBreakfast: false, breakfastDescription: ""
  };
  const pools = Number.isFinite(property.pools) ? property.pools : null;
  const hasPool = pools !== null ? pools > 0 : (property.offerings || []).some(offering =>
    (offering.amenities || []).some(amenity => /\bpool\b/i.test(amenity)));
  const poolTitle = hasPool ? (pools ? `${pools} Swimming ${pools === 1 ? "Pool" : "Pools"} & Tropical Gardens` : "Swimming Pool & Tropical Gardens") :
    (pools === 0 ? "Self-Catering Family Space" : "Property Amenities");
  return {
    poolTitle,
    poolDescription: hasPool ? `Pool access at ${property.name}; air conditioning depends on your selected room category.` :
      (pools === 0 ? "A private kitchenette and space for your family. No swimming pool at this property." :
        "Amenities depend on your selected property and room category."),
    showBreakfast: property.breakfastRate > 0,
    breakfastDescription: property.breakfastRate > 0 ?
      `Optional breakfast at ${property.name}: KSh ${property.breakfastRate.toLocaleString()} per person/day.` : ""
  };
}

function syncBookingBenefits(propertyValue) {
  const benefits = resolveBookingBenefits(propertyValue);
  const textTargets = {
    "booking-pool-benefit-title": benefits.poolTitle,
    "booking-pool-benefit-description": benefits.poolDescription,
    "booking-breakfast-benefit-description": benefits.breakfastDescription
  };
  Object.entries(textTargets).forEach(([id, text]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  });
  const breakfastRow = document.getElementById("booking-breakfast-benefit");
  if (breakfastRow) breakfastRow.classList.toggle("hidden", !benefits.showBreakfast);
}

function handleDateOrAddonChange() {
  const propertyElement = document.getElementById("booking-property");
  const checkInElement = document.getElementById("check-in");
  const checkOutElement = document.getElementById("check-out");
  const adultsElement = document.getElementById("guests-adults") || document.getElementById("num-guests");
  const childrenElement = document.getElementById("guests-children");
  const breakfastCheckbox = document.getElementById("addon-breakfast");

  if (!propertyElement) return;

  const propertyValue = propertyElement.value;
  syncBookingBenefits(propertyValue);
  const checkInDate = checkInElement ? checkInElement.value : "";
  const checkOutDate = checkOutElement ? checkOutElement.value : "";
  const adultsCount = adultsElement ? parseInt(adultsElement.value, 10) || 2 : 2;
  const childrenCount = childrenElement ? parseInt(childrenElement.value, 10) || 0 : 0;
  const totalGuests = adultsCount + childrenCount;

  // Auto-sync units count visibility if total guests exceed single unit capacity
  const offering = typeof getOfferingById === "function" ? getOfferingById(propertyValue) : null;
  const maxGuests = offering && offering.maxGuests ? offering.maxGuests : 2;
  const maxAdults = offering && offering.maxAdults ? offering.maxAdults : 2;
  const unitsNeeded = Math.max(Math.ceil(adultsCount / maxAdults), Math.ceil(totalGuests / maxGuests));
  const unitsWrapper = document.getElementById("booking-units-wrapper");
  const unitsGuidanceText = document.getElementById("booking-units-guidance-text");

  let unitsCount = getBookingUnitsCount();
  if (unitsNeeded > 1 && unitsWrapper) {
    unitsWrapper.classList.remove("hidden");
    if (unitsGuidanceText) {
      unitsGuidanceText.textContent = `${unitsNeeded} units needed for ${totalGuests} guests (${offering ? offering.bedType || '1 Bed' : '1 Bed'})`;
    }
  }

  const pricingSummary = resolveStayPricing(propertyValue, checkInDate, checkOutDate);
  const totals = calculateReservationTotals({
    pricingSummary,
    adultsCount,
    hasBreakfast: Boolean(breakfastCheckbox && breakfastCheckbox.checked),
    propertyIdentifier: propertyValue,
    unitsCount
  });

  const breakfastRow = document.getElementById("summary-breakfast-row");
  const breakfastCostElem = document.getElementById("summary-breakfast-cost");
  const breakfastLabelElem = document.getElementById("summary-breakfast-label");

  if (totals.breakfastCost > 0) {
    if (breakfastRow) breakfastRow.classList.remove("hidden");
    if (breakfastCostElem) breakfastCostElem.textContent = `+KSh ${totals.breakfastCost.toLocaleString()}`;
    if (breakfastLabelElem && totals.breakfastRate > 0) {
      breakfastLabelElem.textContent = `🍳 Coastal Breakfast Add-on (@ KSh ${totals.breakfastRate.toLocaleString()}/person/day):`;
    }
  } else {
    if (breakfastRow) breakfastRow.classList.add("hidden");
  }

  renderPriceSummary({
    ...pricingSummary,
    totalCost: totals.grandTotal,
    formattedTotal: totals.formattedGrandTotal
  });

  triggerLiveAvailabilityCheck();
}

/**
 * Updates dynamic price summary indicators in the booking interface.
 */
function updatePriceCalculation() {
  handleDateOrAddonChange();
}

/**
 * Renders price summary object into target DOM elements.
 */
function renderPriceSummary(summary) {
  const summaryUnitElement = document.getElementById("summary-unit-name");
  const summaryRateElement = document.getElementById("summary-rate");
  const summaryNightsElement = document.getElementById("summary-nights");
  const summaryTotalElement = document.getElementById("summary-total");

  const unitsCount = typeof getBookingUnitsCount === "function" ? getBookingUnitsCount() : 1;
  const unitPrefix = unitsCount > 1 ? `${unitsCount} x ` : "";
  const rateSuffix = unitsCount > 1 ? ` (${unitsCount} units)` : "";

  if (summaryUnitElement) summaryUnitElement.textContent = `${unitPrefix}${summary.unitDisplayName}`;
  if (summaryRateElement) summaryRateElement.textContent = `${summary.rateBasisText}${rateSuffix}`;
  if (summaryNightsElement) summaryNightsElement.textContent = summary.durationText;
  if (summaryTotalElement) summaryTotalElement.textContent = summary.formattedTotal;
}

// ── 5. ACCESSIBLE MODALS, TOASTS & UNIVERSAL LIGHTBOX MODULE ──

let lastFocusedElement = null;
let currentGalleryImages = [];
let currentGalleryIndex = 0;

/**
 * Transient champagne-accented toast notification.
 */
function showToast(messageText, durationMs = APP_CONFIG.UI.DEFAULT_TOAST_DURATION_MS) {
  if (typeof document === "undefined") return;

  let toastElement = document.getElementById("beakim-toast");
  if (!toastElement) {
    toastElement = document.createElement("div");
    toastElement.id = "beakim-toast";
    toastElement.className = "fixed bottom-8 left-0 right-0 mx-auto w-fit max-w-[90vw] z-[100] transition-all duration-300 transform opacity-0 pointer-events-none translate-y-4";
    toastElement.innerHTML = `
      <div class="bg-canvas/95 border border-line-accent/40 backdrop-blur-md text-ink-main px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-xs md:text-sm font-medium">
        <span class="text-ink-gold text-base font-bold">✓</span>
        <span id="beakim-toast-text"></span>
      </div>
    `;
    document.body.appendChild(toastElement);
  }

  const textElement = document.getElementById("beakim-toast-text");
  if (textElement) textElement.textContent = messageText;

  // Animate in
  toastElement.classList.remove("opacity-0", "pointer-events-none", "translate-y-4");
  toastElement.classList.add("opacity-100", "translate-y-0");

  if (toastElement._timeoutId) clearTimeout(toastElement._timeoutId);
  toastElement._timeoutId = setTimeout(() => {
    toastElement.classList.remove("opacity-100", "translate-y-0");
    toastElement.classList.add("opacity-0", "pointer-events-none", "translate-y-4");
  }, durationMs);
}

/**
 * Ensures a high-end, accessible full-screen Lightbox dialog exists in the DOM.
 */
function ensureLightboxModal() {
  let modalElement = document.getElementById("lightbox-modal");
  if (!modalElement) {
    modalElement = document.createElement("div");
    modalElement.id = "lightbox-modal";
    modalElement.setAttribute("role", "dialog");
    modalElement.setAttribute("aria-modal", "true");
    modalElement.setAttribute("aria-labelledby", "lightbox-title");
    modalElement.className = "theme-photo fixed inset-0 z-50 bg-black/95 backdrop-blur-md hidden items-center justify-center p-4 select-none";
    modalElement.innerHTML = `
      <!-- Close Button -->
      <button type="button" id="lightbox-close-btn" onclick="closeLightbox()"
              class="absolute top-5 right-5 z-20 text-muted-70 hover:text-ink-gold bg-black/50 hover:bg-black/80 rounded-full w-12 h-12 flex items-center justify-center text-3xl font-light transition duration-300"
              aria-label="Close photo gallery">&times;</button>

      <!-- Previous Arrow Button -->
      <button type="button" id="lightbox-prev-btn" onclick="navigateLightbox(-1)"
              class="absolute left-3 md:left-6 z-20 text-ink-main/80 hover:text-ink-gold bg-black/50 hover:bg-canvas/90 border border-line-accent/20 rounded-full w-12 h-12 flex items-center justify-center text-2xl transition duration-300 transform active:scale-90"
              aria-label="Previous photograph">‹</button>

      <!-- Next Arrow Button -->
      <button type="button" id="lightbox-next-btn" onclick="navigateLightbox(1)"
              class="absolute right-3 md:right-6 z-20 text-ink-main/80 hover:text-ink-gold bg-black/50 hover:bg-canvas/90 border border-line-accent/20 rounded-full w-12 h-12 flex items-center justify-center text-2xl transition duration-300 transform active:scale-90"
              aria-label="Next photograph">›</button>

      <!-- Photo Display Container -->
      <div class="relative max-w-5xl w-full flex flex-col items-center justify-center max-h-[92vh] space-y-3" onclick="event.stopPropagation()">
        <!-- Counter Badge -->
        <div class="flex items-center gap-2">
          <span id="lightbox-counter" class="bg-canvas/90 border border-line-accent/30 text-ink-gold text-[11px] font-semibold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-lg"></span>
        </div>

        <!-- Image -->
        <div class="relative overflow-hidden rounded-xl border border-line-accent/20 shadow-2xl bg-canvas/50 flex items-center justify-center max-h-[75vh]">
          <img id="lightbox-img" src="" alt="Property photograph" class="max-h-[75vh] w-auto max-w-full object-contain transition-all duration-300" />
        </div>

        <!-- Caption -->
        <div class="text-center px-4 max-w-2xl">
          <h4 id="lightbox-title" class="font-display text-base md:text-lg text-ink-main font-semibold"></h4>
          <p id="lightbox-desc" class="text-xs text-muted-70 mt-0.5 line-clamp-2"></p>
        </div>
      </div>
    `;
    modalElement.addEventListener("click", (e) => {
      if (e.target === modalElement) closeLightbox();
    });
    document.body.appendChild(modalElement);
  }
  return modalElement;
}

/**
 * Collects and wires all gallery photos in the document for instant Lightbox viewing.
 */
function collectGalleryImages() {
  if (typeof document === "undefined") return;
  const galleryNodes = document.querySelectorAll(".columns-1 img, [data-gallery] img, .gallery-item img");
  currentGalleryImages = Array.from(galleryNodes).map((imageElement, galleryIndex) => {
    const card = imageElement.closest(".group") || imageElement.parentElement;
    const titleElement = card ? card.querySelector(".text-ink-gold.uppercase, h3, h4") : null;
    const descriptionElement = card ? card.querySelector("p") : null;

    imageElement.style.cursor = "zoom-in";
    imageElement.setAttribute("role", "button");
    imageElement.setAttribute("tabindex", "0");
    imageElement.setAttribute("aria-label", `View full photo: ${imageElement.alt || "Gallery image"}`);

    if (!imageElement._lightboxBound) {
      imageElement._lightboxBound = true;
      imageElement.addEventListener("click", () => openGalleryLightbox(galleryIndex));
      imageElement.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openGalleryLightbox(galleryIndex);
        }
      });
    }

    return {
      src: imageElement.getAttribute("src") || imageElement.src,
      alt: imageElement.getAttribute("alt") || "Property photograph",
      title: titleElement ? titleElement.textContent.trim() : (imageElement.getAttribute("alt") || "Property Photograph"),
      desc: descriptionElement ? descriptionElement.textContent.trim() : ""
    };
  });
}

function openGalleryLightbox(index) {
  if (!currentGalleryImages.length) {
    collectGalleryImages();
  }
  if (!currentGalleryImages.length) return;

  currentGalleryIndex = (index + currentGalleryImages.length) % currentGalleryImages.length;
  const item = currentGalleryImages[currentGalleryIndex];

  const modalElement = ensureLightboxModal();
  const imageElement = document.getElementById("lightbox-img");
  const captionElement = document.getElementById("lightbox-title");
  const descElement = document.getElementById("lightbox-desc");
  const counterElement = document.getElementById("lightbox-counter");
  const closeButton = document.getElementById("lightbox-close-btn");
  const prevButton = document.getElementById("lightbox-prev-btn");
  const nextButton = document.getElementById("lightbox-next-btn");

  lastFocusedElement = document.activeElement;
  imageElement.src = item.src;
  imageElement.alt = item.alt;

  if (captionElement) captionElement.textContent = item.title;
  if (descElement) descElement.textContent = item.desc;
  if (counterElement) counterElement.textContent = `Photo ${currentGalleryIndex + 1} of ${currentGalleryImages.length}`;

  if (prevButton) prevButton.style.display = currentGalleryImages.length > 1 ? "flex" : "none";
  if (nextButton) nextButton.style.display = currentGalleryImages.length > 1 ? "flex" : "none";

  modalElement.classList.remove("hidden");
  modalElement.classList.add("flex");
  modalElement.setAttribute("aria-hidden", "false");

  if (closeButton) closeButton.focus();
  PageScrollLock.lock();
}

function navigateLightbox(step) {
  if (!currentGalleryImages.length) return;
  openGalleryLightbox(currentGalleryIndex + step);
}

function openLightbox(sourceUrl, captionText) {
  if (!currentGalleryImages.length) collectGalleryImages();
  const foundIndex = currentGalleryImages.findIndex(img => img.src.includes(sourceUrl) || (sourceUrl && sourceUrl.includes(img.src)));
  if (foundIndex !== -1) {
    openGalleryLightbox(foundIndex);
  } else {
    const modalElement = ensureLightboxModal();
    const imageElement = document.getElementById("lightbox-img");
    const captionElement = document.getElementById("lightbox-title");
    const descElement = document.getElementById("lightbox-desc");
    const counterElement = document.getElementById("lightbox-counter");
    if (imageElement) {
      imageElement.src = sourceUrl;
      imageElement.alt = captionText || "Property photograph";
    }
    if (captionElement) captionElement.textContent = captionText || "";
    if (descElement) descElement.textContent = "";
    if (counterElement) counterElement.textContent = "Photo";
    modalElement.classList.remove("hidden");
    modalElement.classList.add("flex");
    modalElement.setAttribute("aria-hidden", "false");
    PageScrollLock.lock();
  }
}

function closeLightbox() {
  const modalElement = document.getElementById("lightbox-modal");
  if (modalElement && !modalElement.classList.contains("hidden")) {
    modalElement.classList.add("hidden");
    modalElement.classList.remove("flex");
    modalElement.setAttribute("aria-hidden", "true");
    PageScrollLock.unlock();

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }
}

let availabilityDebounceTimer = null;

/**
 * Evaluates live real-time unit availability for selected property and stay dates.
 */
function renderAvailabilityLoading() {
  return `
    <div class="flex items-center gap-2 p-2.5 rounded-xl bg-champagne/10 border border-line-accent/30 text-deep-forest text-xs animate-pulse">
      <span class="w-2 h-2 rounded-full bg-champagne animate-ping"></span>
      <span class="font-medium">Checking live occupancy for your stay dates...</span>
    </div>
  `;
}

function renderAvailabilityPreApproved(unitsCount, categoryName, totalGuests = 0, reservedUnits = 1) {
  const unitsText = unitsCount !== undefined && unitsCount > 0 ? ` (${unitsCount} unit${unitsCount === 1 ? '' : 's'} available to request)` : '';
  const categoryLabel = categoryName ? `${categoryName} ` : "Dates ";
  const multiUnitNotice = reservedUnits > 1 ? ` • ${reservedUnits} units selected for ${totalGuests} guests — subject to confirmation` : '';
  return `
    <div class="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs shadow-sm">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-status-emerald-600 font-bold">✓</span>
        <span class="font-semibold">${categoryLabel}Available to Request${unitsText}${multiUnitNotice}</span>
        <span class="text-emerald-700/80 hidden sm:inline">• Direct host reservation</span>
      </div>
      <span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-800">Available</span>
    </div>
  `;
}

function renderAvailabilityCapacityWarning({ offering, totalGuests, adults, children, unitsNeeded, availableUnitsCount, categoryName }) {
  const name = offering ? offering.name : (categoryName || "Selected Residence");
  const bedType = offering && offering.bedType ? offering.bedType : "1 Bed";
  const maxGuests = offering && offering.maxGuests ? offering.maxGuests : 2;
  const singleRate = offering && offering.rate ? offering.rate : 3000;
  const unitsText = availableUnitsCount !== undefined ? `• ${availableUnitsCount} unit${availableUnitsCount === 1 ? '' : 's'} available to request` : "";
  const multiRate = (singleRate * unitsNeeded).toLocaleString();

  const isDaradOrDarling = offering && offering.id && (offering.id.includes("darad") || offering.id.includes("darling"));
  const showTowerSuggestion = isDaradOrDarling && totalGuests <= 4;

  return `
    <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs shadow-sm space-y-2.5">
      <div class="flex items-start gap-2.5">
        <span class="text-status-amber-600 text-base font-bold shrink-0">⚠️</span>
        <div class="space-y-1">
          <span class="font-bold block text-deep-forest text-xs sm:text-sm">
            Party of ${totalGuests} Exceeds 1-Unit Capacity (${bedType} • Max ${maxGuests} Guests)
          </span>
          <p class="text-stone-700 text-[11px] leading-snug">
            <strong>${name}</strong> features ${bedType} and accommodates up to <strong>${maxGuests} guests</strong> per unit. For your party of <strong>${totalGuests} guests</strong> (${adults} Adults${children > 0 ? `, ${children} Children` : ""}), please reserve at least <strong>${unitsNeeded} units</strong>.
          </p>
        </div>
      </div>
      <div class="pt-2 border-t border-amber-200/80 flex items-center justify-between flex-wrap gap-2">
        <span class="text-[11px] font-semibold text-emerald-800">
          ✓ ${unitsNeeded} units needed ${unitsText}
        </span>
        <button type="button" onclick="setBookingUnitsCount(${unitsNeeded})" class="bg-canvas hover:bg-forest-dark text-ink-gold text-[11px] font-bold px-3.5 py-1.5 rounded-lg transition shadow-sm cursor-pointer">
          Select ${unitsNeeded} Units (KSh ${multiRate} / night)
        </button>
      </div>
      ${showTowerSuggestion ? `
      <div class="pt-1.5 border-t border-amber-200/50 text-[11px] text-stone-700">
        💡 <strong>Prefer 1 accommodation for everyone?</strong> Explore our <a href="javascript:void(0)" onclick="selectTowerCottages2Br()" class="text-[#7A5B20] font-bold underline hover:text-champagne-light">Tower Cottages 2-Bedroom Apartment</a> (2 bedrooms, fits 4 guests for KSh 2,500/night).
      </div>
      ` : ""}
    </div>
  `;
}

function renderAvailabilityUnknown() {
  return `
    <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs shadow-sm">
      <div class="flex items-center gap-2">
        <span class="text-ink-gold font-bold">ℹ️</span>
        <span class="font-medium">We couldn't check live availability (Live sync unavailable). Send a request and our team typically responds within 15–30 mins during desk hours (8AM–8PM EAT).</span>
      </div>
      <span class="text-[10px] font-bold uppercase tracking-wider bg-slate-200/80 px-2 py-0.5 rounded text-slate-700">Request to Confirm</span>
    </div>
  `;
}

function renderAvailabilityHighDemand(unitsCount, categoryName) {
  const label = categoryName ? `${categoryName} ` : "";
  return `
    <div class="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-300/80 text-amber-900 text-xs shadow-sm">
      <div class="flex items-center gap-2">
        <span class="text-status-amber-600 font-bold">⚠️</span>
        <span class="font-bold">High Demand: Only ${unitsCount} ${label}unit${unitsCount === 1 ? '' : 's'} remaining!</span>
      </div>
      <span class="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded text-amber-900">Limited Availability</span>
    </div>
  `;
}

function renderAvailabilitySoldOut() {
  return `
    <div class="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900 text-xs shadow-sm">
      <div class="flex items-center gap-2">
        <span class="text-rose-600 font-bold">⚠️</span>
        <span class="font-medium">All units booked for these exact dates. Submit inquiry to be placed on priority standby or explore alternative dates.</span>
      </div>
    </div>
  `;
}

let availabilityCheckSequenceId = 0;

/**
 * Evaluates live real-time unit availability for selected property and stay dates.
 */
async function triggerLiveAvailabilityCheck() {
  if (typeof document === "undefined") return;
  const container = document.getElementById("availability-status-container");
  if (!container) return;

  // Invalidate any pending work and bump sequence ID immediately before any check
  if (availabilityDebounceTimer) clearTimeout(availabilityDebounceTimer);
  const currentSequence = ++availabilityCheckSequenceId;

  const checkInElement = document.getElementById("check-in");
  const checkOutElement = document.getElementById("check-out");
  const propertyElement = document.getElementById("booking-property");
  const adultsElement = document.getElementById("guests-adults") || document.getElementById("num-guests");
  const childrenElement = document.getElementById("guests-children");

  const checkIn = checkInElement ? checkInElement.value : "";
  const checkOut = checkOutElement ? checkOutElement.value : "";
  const property = propertyElement ? propertyElement.value : "";
  const adults = adultsElement ? adultsElement.value : "2";
  const children = childrenElement ? childrenElement.value : "0";

  const parsedAdults = parseInt(adults, 10) || 1;
  const parsedChildren = parseInt(children, 10) || 0;
  const totalGuests = parsedAdults + parsedChildren;

  const propertyId = CrmSyncService.resolvePropertyId(property);
  const offering = typeof getOfferingById === "function" ? getOfferingById(property) : null;
  const offeringId = offering ? offering.id : "";
  const offeringName = offering ? offering.name : "";

  const maxGuests = offering && offering.maxGuests ? offering.maxGuests : 2;
  const maxAdults = offering && offering.maxAdults ? offering.maxAdults : 2;
  const unitsNeeded = Math.max(Math.ceil(parsedAdults / maxAdults), Math.ceil(totalGuests / maxGuests));
  const currentUnits = typeof getBookingUnitsCount === "function" ? getBookingUnitsCount() : 1;

  // Enforce immediate client-side capacity check: party size exceeds single-unit capacity
  if (unitsNeeded > 1 && currentUnits < unitsNeeded) {
    container.innerHTML = renderAvailabilityCapacityWarning({
      offering,
      totalGuests,
      adults: parsedAdults,
      children: parsedChildren,
      unitsNeeded,
      availableUnitsCount: undefined,
      categoryName: offeringName
    });
    return;
  }

  if (!checkIn || !checkOut || isInvalidDateRange(checkIn, checkOut) || isPastDate(checkIn, getNairobiDateString(0))) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = renderAvailabilityLoading();

  availabilityDebounceTimer = setTimeout(async () => {
    const result = await CrmSyncService.checkAvailability({
      propertyId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      offeringId,
      adults: parsedAdults,
      children: parsedChildren,
      unitsCount: currentUnits
    });
    // Guard against stale asynchronous responses
    if (currentSequence !== availabilityCheckSequenceId) return;

    if (!result) {
      container.innerHTML = renderAvailabilityUnknown();
      return;
    }

    if (result.status === "capacity_exceeded") {
      container.innerHTML = renderAvailabilityCapacityWarning({
        offering,
        totalGuests,
        adults: parsedAdults,
        children: parsedChildren,
        unitsNeeded: result.unitsNeeded || unitsNeeded,
        availableUnitsCount: result.availableUnitsCount,
        categoryName: offeringName || result.categoryName
      });
      return;
    }

    if (result.status === "insufficient_units") {
      container.innerHTML = `
        <div class="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs shadow-sm space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-status-amber-600 font-bold">⚠️</span>
            <span class="font-bold">Only ${result.availableUnitsCount || 0} unit${(result.availableUnitsCount || 0) === 1 ? '' : 's'} available (Requested: ${result.requestedUnits || currentUnits})</span>
          </div>
          <p class="text-[11px] text-stone-700">We cannot accommodate ${currentUnits} separate units for these exact dates. Please adjust unit count or submit inquiry for custom accommodation arrangement.</p>
        </div>
      `;
      return;
    }

    if (result.isAvailable) {
      const unitsCount = result.availableUnitsCount !== undefined ? result.availableUnitsCount : result.availableCount;
      const categoryLabel = offeringName || result.categoryName || "";
      const isLimited = (result.status === "limited") || (unitsCount !== undefined && unitsCount > 0 && unitsCount <= 2);
      container.innerHTML = isLimited
        ? renderAvailabilityHighDemand(unitsCount, categoryLabel)
        : renderAvailabilityPreApproved(unitsCount, categoryLabel, totalGuests, currentUnits);
    } else {
      container.innerHTML = renderAvailabilitySoldOut();
    }
  }, 250);
}

let currentActiveInquiry = null;
let isInquirySubmissionInFlight = false;

function trackBookingFunnelEvent(eventName, eventParams = {}) {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      const safeParams = { ...eventParams };
      delete safeParams.guestName;
      delete safeParams.name;
      delete safeParams.guestPhone;
      delete safeParams.phone;
      delete safeParams.guestEmail;
      delete safeParams.email;
      window.gtag("event", eventName, safeParams);
    }
  } catch (_) {
    // Non-blocking telemetry
  }
}

function setInquirySubmissionBusy(isBusy) {
  const submitButton = document.getElementById("confirm-submit-inquiry-btn");
  if (!submitButton) return;
  submitButton.disabled = isBusy;
  if (isBusy) {
    submitButton.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-deep-forest inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Securing Reservation Inquiry...</span>
    `;
  } else {
    submitButton.innerHTML = `<span>✓ Confirm &amp; Submit Reservation Inquiry</span>`;
  }
}

function generateFallbackInquiryId() {
  const dateStamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `WB-OFFLINE-${dateStamp}-${randomDigits}`;
}

function persistPendingOfflineInquiry(inquiryId, inquiryPayload) {
  const OFFLINE_STORAGE_KEY = "beakim_pending_inquiries";
  const queuedInquiries = SafeStorageService.getJson(OFFLINE_STORAGE_KEY, []);
  queuedInquiries.push({
    id: inquiryId,
    payload: inquiryPayload,
    timestamp: new Date().toISOString()
  });
  SafeStorageService.setJson(OFFLINE_STORAGE_KEY, queuedInquiries);
}

async function dispatchInquirySubmission(inquiryPayload) {
  try {
    const result = await CrmSyncService.sendInquiry(inquiryPayload);
    if (result && result.inquiry && result.inquiry.id) {
      return result.inquiry.id;
    }
    if (result && result.id) {
      return result.id;
    }
  } catch (syncError) {
    if (typeof console !== "undefined" && typeof console.debug === "function") {
      console.debug("[CRM Intake] Server sync exception:", syncError);
    }
  }
  return null;
}

async function confirmAndSubmitInquiry() {
  if (!currentActiveInquiry) return;
  if (isInquirySubmissionInFlight) return;
  isInquirySubmissionInFlight = true;
  setInquirySubmissionBusy(true);

  try {
    const inquiryId = await dispatchInquirySubmission(currentActiveInquiry.inquiryPayload);

    if (!inquiryId) {
      // Dispatch failed or network unreachable. Preserve draft locally with offline marker
      const draftId = generateFallbackInquiryId();
      persistPendingOfflineInquiry(draftId, currentActiveInquiry.inquiryPayload);
      setInquirySubmissionBusy(false);
      renderInquiryNetworkFailure(currentActiveInquiry);
      return;
    }

    try {
      renderInquirySuccessReceipt(currentActiveInquiry, inquiryId);
      trackBookingFunnelEvent("inquiry_submitted", {
        property_name: currentActiveInquiry.property,
        inquiry_id: inquiryId
      });
    } catch (renderError) {
      if (typeof console !== "undefined" && typeof console.error === "function") {
        console.error("[Inquiry Receipt] Render error:", renderError);
      }
      setInquirySubmissionBusy(false);
    }
  } finally {
    isInquirySubmissionInFlight = false;
  }
}

function renderInquiryNetworkFailure(inquirySummary) {
  const modalElement = document.getElementById("inquiry-review-modal");
  if (!modalElement) return;

  const messageText = inquirySummary.messageText || "";
  const whatsappUrl = getInquiryWhatsAppUrl(inquirySummary);
  const telephoneUrl = CommunicationService.getTelephoneUrl();

  modalElement.innerHTML = `
    <div class="bg-canvas border border-amber-500/40 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-ink-main shadow-2xl relative my-auto">
      <!-- Zone 1: Pinned Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-amber-500/20 bg-canvas/95 shrink-0">
        <div class="flex items-center gap-3 text-left">
          <div class="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-status-amber-400 text-lg font-bold shrink-0 shadow-md">
            ⚠️
          </div>
          <div>
            <span class="text-[10px] font-bold tracking-widest text-status-amber-400 uppercase block">Connection Timeout</span>
            <h3 class="font-display text-lg sm:text-xl font-bold text-ink-main leading-tight">Temporary Network Interruption</h3>
          </div>
        </div>
        <button type="button" onclick="closeInquiryModal()" 
                class="w-9 h-9 rounded-full bg-tint/10 hover:bg-champagne text-ink-main hover:text-deep-forest flex items-center justify-center text-xl font-bold transition shrink-0 cursor-pointer"
                aria-label="Close modal" title="Close (Esc)">&times;</button>
      </div>

      <!-- Zone 2: Content Body -->
      <div class="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-left">
        <div class="bg-raised/70 rounded-xl p-4 border border-amber-500/25 text-xs space-y-2.5">
          <p class="text-ink-main/90 leading-relaxed text-xs">
            We experienced a brief connection hiccup reaching our reservation desk server. <strong>Your selected dates and booking inquiry details are completely intact.</strong>
          </p>
          <p class="text-status-amber-300 font-semibold text-xs">
            You can retry instant submission below, or send your pre-filled inquiry directly to our reservation manager via WhatsApp.
          </p>
        </div>

        <div class="bg-canvas/80 rounded-xl p-3.5 border border-line-accent/20 text-xs space-y-1.5 font-mono text-ink-main/80">
          <div class="text-[11px] text-ink-gold font-bold uppercase tracking-wider font-sans mb-1">Your Reservation Details:</div>
          <div>Property: <strong class="text-ink-strong">${inquirySummary.property}</strong></div>
          ${inquirySummary.unitsCount && inquirySummary.unitsCount > 1 ? `<div>Residences: <strong class="text-ink-gold">${inquirySummary.unitsCount} Units</strong></div>` : ""}
          <div>Dates: <strong class="text-ink-strong">${inquirySummary.dates}</strong></div>
          <div>Guests: <strong class="text-ink-strong">${inquirySummary.guests}</strong></div>
          <div>Estimated Total: <strong class="text-ink-gold font-sans font-bold">${inquirySummary.estimatedTotal}</strong></div>
        </div>
      </div>

      <!-- Zone 3: Pinned Action Buttons -->
      <div class="px-5 py-4 border-t border-line-accent/20 bg-dialog-footer space-y-2.5 shrink-0">
        <button type="button" id="confirm-submit-inquiry-btn" onclick="confirmAndSubmitInquiry()"
                class="w-full bg-champagne hover:bg-champagne/90 text-deep-forest py-3 px-5 rounded-xl font-bold tracking-wider uppercase transition duration-300 shadow-xl flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-[0.99]">
          <span>🔄</span>
          <span>Retry Server Submission</span>
        </button>

        <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer"
           class="w-full whatsapp-action bg-[#25D366] hover:bg-[#20ba5a] text-ink-strong py-3 px-5 rounded-xl font-bold tracking-wider uppercase transition duration-300 shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm">
          <span>💬</span>
          <span>Send via WhatsApp Now</span>
        </a>

        <div class="flex gap-2">
          <button type="button" onclick="closeInquiryModal()"
                  class="flex-1 bg-canvas/80 border border-line-accent/25 hover:border-line-accent text-ink-main/80 hover:text-ink-gold py-2.5 rounded-lg text-xs font-medium transition cursor-pointer">
            Edit Details
          </button>
          <a href="${telephoneUrl}"
             class="flex-1 text-center bg-canvas/80 border border-line-accent/25 hover:border-line-accent text-ink-main/80 hover:text-ink-gold py-2.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1">
            📞 Call Desk Direct
          </a>
        </div>
      </div>
    </div>
  `;
  return modalElement.innerHTML;
}

function renderInquirySuccessReceipt(inquirySummary, inquiryId) {
  const modalElement = document.getElementById("inquiry-review-modal");
  if (!modalElement) return;

  const preferredContact = inquirySummary.preferredContactMethod || "WhatsApp / Text";
  const channelIcon = preferredContact.includes("WhatsApp") ? "💬" :
                      preferredContact.includes("Phone") ? "📞" : "✉️";

  modalElement.innerHTML = `
    <div class="bg-canvas border border-line-accent/40 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-ink-main shadow-2xl relative my-auto">
      <!-- Zone 1: Pinned Header (Always Visible) -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-line-accent/20 bg-canvas/95 shrink-0">
        <div class="flex items-center gap-3 text-left">
          <div class="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-status-emerald-400 text-lg font-bold shrink-0 shadow-md">
            ✓
          </div>
          <div>
            <span class="text-[10px] font-bold tracking-widest text-status-emerald-400 uppercase block">Step 2 of 2 • Reservation Request Submitted</span>
            <h3 class="font-display text-lg sm:text-xl font-bold text-ink-main leading-tight">Inquiry Received — Awaiting Staff Confirmation</h3>
          </div>
        </div>
        <button type="button" onclick="closeInquiryModal()" 
                class="w-9 h-9 rounded-full bg-tint/10 hover:bg-champagne text-ink-main hover:text-deep-forest flex items-center justify-center text-xl font-bold transition shrink-0 cursor-pointer"
                aria-label="Close booking receipt modal" title="Close (Esc)">&times;</button>
      </div>

      <!-- Zone 2: Scrollable Content Body -->
      <div class="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-left">
        <div class="flex items-center justify-between bg-raised/80 border border-line-accent/30 px-4 py-2 rounded-xl text-xs font-mono text-ink-gold">
          <span>Reference ID: <strong class="text-ink-strong">${inquiryId}</strong></span>
          <button type="button" onclick="copyInquiryDetails('${inquiryId}')" class="hover:text-ink-strong transition inline-flex items-center gap-1 text-[11px] font-sans font-semibold bg-canvas/60 px-2.5 py-1 rounded border border-line-accent/20 cursor-pointer" title="Copy Reference ID">📋 Copy ID</button>
        </div>

        <!-- SLA Guidance Box -->
        <div class="bg-raised/70 rounded-xl p-4 border border-line-accent/20 text-xs space-y-2.5">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="text-ink-gold font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              ⏱️ Desk Response (8:00 AM – 8:00 PM EAT)
            </span>
            <span class="text-[10px] bg-success-panel/60 text-status-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-500/30">Priority Desk Queue</span>
          </div>
          <p class="text-ink-main/90 leading-relaxed text-xs">
            Our reservation desk (8:00 AM – 8:00 PM EAT) will review your dates for <strong class="text-ink-gold">${inquirySummary.property}</strong> and reach out via <strong class="text-ink-strong">${channelIcon} ${preferredContact}</strong> typically within <strong class="text-ink-gold">15–30 minutes during desk hours</strong> (8AM–8PM EAT; 24/7 on-call dispatch coverage) to confirm availability and provide your 50% reservation deposit link.
          </p>
          <div class="border-t border-line-accent/15 pt-2.5 space-y-1 text-[11px] text-muted-70">
            <div class="flex justify-between gap-2"><span class="text-muted-50">Stay Dates:</span> <span class="text-ink-main font-medium text-right">${inquirySummary.dates}</span></div>
            <div class="flex justify-between gap-2"><span class="text-muted-50">Guest:</span> <span class="text-ink-main font-medium text-right">${inquirySummary.name} (${inquirySummary.phone})</span></div>
            ${inquirySummary.unitsCount && inquirySummary.unitsCount > 1 ? `<div class="flex justify-between gap-2"><span class="text-muted-50">Residences:</span> <span class="text-ink-gold font-bold text-right">${inquirySummary.unitsCount} Units</span></div>` : ""}
            ${inquirySummary.estimatedTotal ? `<div class="flex justify-between gap-2 pt-1 border-t border-line-accent/10"><span class="text-muted-50">Estimated Total:</span> <span class="text-ink-gold font-bold text-right">${inquirySummary.estimatedTotal}</span></div>` : ""}
          </div>
        </div>
      </div>

      <!-- Zone 3: Pinned Footer Actions (Always Visible) -->
      <div class="px-5 py-4 border-t border-line-accent/20 bg-dialog-footer space-y-2.5 shrink-0">
        <!-- Direct Instant WhatsApp Send Action -->
        <a href="${getInquiryWhatsAppUrl(inquirySummary)}" target="_blank" rel="noopener noreferrer"
           class="w-full whatsapp-action bg-[#25D366] hover:bg-[#128C7E] text-ink-strong py-3.5 px-5 rounded-xl font-bold tracking-wider uppercase transition duration-300 shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-[0.99]">
          <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436.002 9.858-4.384 9.86-9.768.001-2.61-1.013-5.064-2.855-6.909C16.438 2.083 13.99 1.07 11.4 1.07 5.969 1.07 1.547 5.456 1.545 10.842c-.001 1.597.424 3.156 1.233 4.544L1.78 20.58l5.228-1.378c-.138-.077-.257-.15-.361-.208z" />
          </svg>
          <span>💬 Send via WhatsApp Now (Instant)</span>
        </a>

        <div class="flex gap-2">
          <button type="button" onclick="copyInquiryDetails('${encodeURIComponent(inquirySummary.messageText)}')"
                  class="flex-1 bg-canvas/80 border border-line-accent/25 hover:border-line-accent text-ink-main/80 hover:text-ink-gold py-2.5 rounded-lg text-xs font-medium transition cursor-pointer">
            📋 Copy Details
          </button>
          <button type="button" onclick="closeInquiryModal()"
                  class="flex-1 bg-champagne text-deep-forest hover:bg-champagne/90 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow cursor-pointer">
            Done / Close ✕
          </button>
        </div>
      </div>
    </div>
  `;
  return modalElement.innerHTML;
}

/**
 * Pure presenter function rendering accessible, transparent itemized stay cost breakdown.
 */
function renderInquiryCostBreakdown(inquirySummary) {
  const totals = inquirySummary.totals || {};
  const pricing = inquirySummary.pricingSummary || {};
  const unitsCount = totals.unitsCount || (inquirySummary.formData ? inquirySummary.formData.unitsCount : (inquirySummary.unitsCount || 1)) || 1;

  const rawUnitName = pricing.unitDisplayName || inquirySummary.property || "Selected Residence";
  const unitPrefix = unitsCount > 1 ? `${unitsCount} × ` : "";
  const unitName = `${unitPrefix}${rawUnitName}`;
  const durationText = pricing.durationText || "1 Stay";
  const rateBasisText = pricing.rateBasisText || "";
  const unitsMultiplierText = unitsCount > 1 ? ` (${unitsCount} Units)` : "";
  const rateLineSubtitle = rateBasisText ? `${durationText} × ${rateBasisText}${unitsMultiplierText}` : durationText;
  const baseCostFormatted = totals.formattedBaseCost || (pricing.totalCost ? `KSh ${pricing.totalCost.toLocaleString()}` : (inquirySummary.estimatedTotal || "KSh 0"));

  const hasBreakfast = Boolean(totals.breakfastCost && totals.breakfastCost > 0);
  const adultsCount = totals.adultsCount || (inquirySummary.formData ? inquirySummary.formData.adults : 1);
  const nightsCount = totals.durationDays || pricing.durationDays || 1;
  const breakfastCostFormatted = totals.formattedBreakfastCost || `+KSh ${(totals.breakfastCost || 0).toLocaleString()}`;

  // Filter complimentary add-ons (those not breakfast)
  const complimentaryList = (inquirySummary.selectedAddons || []).filter(item => !item.toLowerCase().includes("breakfast"));

  return `
    <div class="bg-dialog-inset border border-line-accent/30 rounded-xl p-3.5 sm:p-4 space-y-2.5 font-sans">
      <div class="flex items-center justify-between pb-2 border-b border-line-accent/20">
        <span class="text-[11px] font-bold text-ink-gold uppercase tracking-wider flex items-center gap-1.5">
          <span>🧾</span> Itemized Stay Breakdown
        </span>
        <span class="text-[10px] text-muted-60 font-sans">Transparent Direct Pricing</span>
      </div>

      <!-- Line Item 1: Base Accommodation -->
      <div class="flex justify-between items-start gap-3 text-xs">
        <div class="space-y-0.5 min-w-0">
          <span class="font-semibold text-ink-main block truncate">${unitName}</span>
          <span class="text-[11px] text-muted-60 block">${rateLineSubtitle}</span>
        </div>
        <span class="font-mono font-bold text-ink-main shrink-0">${baseCostFormatted}</span>
      </div>

      <!-- Line Item 2: Breakfast Add-on (if selected) -->
      ${hasBreakfast ? `
      <div class="flex justify-between items-start gap-3 text-xs pt-2 border-t border-line-accent/10">
        <div class="space-y-0.5">
          <span class="font-semibold text-status-emerald-400 block">🍳 Chef-Prepared Coastal Breakfast</span>
          <span class="text-[11px] text-muted-60 block">${adultsCount} Guest(s) × ${nightsCount} Night(s) @ KSh ${(totals.breakfastRate || resolveBreakfastRate(inquirySummary.property)).toLocaleString()} / day</span>
        </div>
        <span class="font-mono font-bold text-status-emerald-400 shrink-0">${breakfastCostFormatted}</span>
      </div>
      ` : ""}

      <!-- Line Item 3: Complimentary Amenities (if selected) -->
      ${complimentaryList.map(item => `
      <div class="flex justify-between items-center gap-3 text-xs pt-1.5 border-t border-line-accent/10">
        <span class="text-ink-main/80 text-[11px] flex items-center gap-1">
          <span class="text-status-emerald-400 font-bold">✓</span> ${item.replace(/\s*\(Complimentary\)/i, "")}
        </span>
        <span class="text-[9px] font-bold uppercase tracking-wider text-ink-gold bg-champagne/15 px-2 py-0.5 rounded border border-line-accent/30 shrink-0">FREE (KSh 0)</span>
      </div>
      `).join("")}

      <!-- Line Item 4: Platform Fee / Commission -->
      <div class="flex justify-between items-center gap-3 text-xs pt-1.5 border-t border-line-accent/10">
        <span class="text-muted-60 text-[11px]">Direct Host Rate • Booking Commission</span>
        <span class="text-[11px] font-semibold text-status-emerald-400 shrink-0">Zero Extra Fees</span>
      </div>

      <!-- Total Row -->
      <div class="flex justify-between items-center gap-3 pt-3 border-t-2 border-line-accent/35 mt-1">
        <div>
          <span class="font-bold text-ink-main text-xs sm:text-sm block">Total Estimated Amount</span>
          <span class="text-[10px] text-muted-60 block">🔒 No payment right now • Pay 50% deposit upon host confirmation</span>
        </div>
        <span class="font-display font-bold text-ink-gold text-base sm:text-lg text-right shrink-0">${inquirySummary.estimatedTotal}</span>
      </div>

      <!-- Deposit & Cancellation Policy Notice -->
      <div class="pt-2 border-t border-line-accent/15 text-[11px] text-muted-70 space-y-1">
        <div class="flex items-center justify-between text-ink-gold/90 font-medium">
          <span>Deposit Policy:</span>
          <span>50% deposit required to confirm stay</span>
        </div>
        <p class="text-[10px] text-ink-main/55 leading-relaxed">
          Cancellation: 100% refund (&gt;7 days before check-in, minus 3.5% fee); 50% refund (2–7 days); non-refundable (&lt;48 hours).
        </p>
      </div>
    </div>
  `;
}

function showInquiryReviewModal(inquirySummary) {
  currentActiveInquiry = inquirySummary;
  let modalElement = document.getElementById("inquiry-review-modal");
  if (!modalElement) {
    modalElement = document.createElement("div");
    modalElement.id = "inquiry-review-modal";
    modalElement.setAttribute("role", "dialog");
    modalElement.setAttribute("aria-modal", "true");
    modalElement.setAttribute("aria-labelledby", "inquiry-modal-title");
    document.body.appendChild(modalElement);
  }
  modalElement.className = "fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto overscroll-contain";

  const channelIcon = inquirySummary.preferredContactMethod.includes("WhatsApp") ? "💬" :
                      inquirySummary.preferredContactMethod.includes("Phone") ? "📞" : "✉️";

  modalElement.innerHTML = `
    <div class="bg-canvas border border-line-accent/35 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-ink-main shadow-2xl relative my-auto">
      <!-- Zone 1: Pinned Header (Always Visible) -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-line-accent/20 bg-canvas/95 shrink-0">
        <div>
          <span class="text-[10px] font-bold tracking-widest text-ink-gold uppercase block">Step 2 of 2 • Direct Reservation</span>
          <h3 id="inquiry-modal-title" class="font-display text-lg sm:text-xl font-bold text-ink-main leading-tight">Review &amp; Confirm Your Stay</h3>
        </div>
        <button type="button" onclick="closeInquiryModal()" 
                class="w-9 h-9 rounded-full bg-tint/10 hover:bg-champagne text-ink-main hover:text-deep-forest flex items-center justify-center text-xl font-bold transition shrink-0 cursor-pointer"
                aria-label="Close booking review modal" title="Close (Esc)">&times;</button>
      </div>

      <!-- Zone 2: Scrollable Summary Body -->
      <div class="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
        <p class="text-xs text-ink-main/75 leading-relaxed">
          Please verify your reservation details below. Confirming logs your request directly with our central reservations desk (<strong class="text-ink-gold">typically 15–30 min during desk hours, 8AM–8PM EAT</strong>).
        </p>

        <!-- Primary Guest & Stay Itinerary -->
        <div class="bg-raised/60 rounded-xl p-4 border border-line-accent/20 text-xs space-y-2 font-mono">
          <div class="flex justify-between gap-3"><span class="text-muted-60 shrink-0">Guest Name:</span><span class="font-semibold text-ink-main font-sans text-right">${inquirySummary.name}</span></div>
          <div class="flex justify-between gap-3"><span class="text-muted-60 shrink-0">Contact Phone:</span><span class="font-semibold text-ink-main font-sans text-right">${inquirySummary.phone}</span></div>
          ${inquirySummary.email ? `<div class="flex justify-between gap-3"><span class="text-muted-60 shrink-0">Email:</span><span class="text-ink-main font-sans text-right break-all">${inquirySummary.email}</span></div>` : ""}
          <div class="flex justify-between gap-3"><span class="text-muted-60 shrink-0">Contact Via:</span><span class="font-semibold text-ink-gold font-sans text-right">${channelIcon} ${inquirySummary.preferredContactMethod}</span></div>
          <div class="flex justify-between gap-3 pt-1.5 border-t border-line-accent/10"><span class="text-muted-60 shrink-0">Residence:</span><span class="font-semibold text-ink-gold font-sans text-right">${inquirySummary.property}</span></div>
          <div class="flex justify-between gap-3"><span class="text-muted-60 shrink-0">Stay Dates:</span><span class="text-ink-main font-sans text-right">${inquirySummary.dates}</span></div>
          <div class="flex justify-between gap-3"><span class="text-muted-60 shrink-0">Guests:</span><span class="text-ink-main font-sans text-right">${inquirySummary.guests}</span></div>
          ${inquirySummary.unitsCount && inquirySummary.unitsCount > 1 ? `<div class="flex justify-between gap-3"><span class="text-muted-60 shrink-0">Residences:</span><span class="font-semibold text-ink-gold font-sans text-right">${inquirySummary.unitsCount} Units</span></div>` : ""}
          ${inquirySummary.specialRequests ? `<div class="flex justify-between gap-3 pt-1.5 border-t border-line-accent/10"><span class="text-muted-60 shrink-0">Arrival Notes:</span><span class="text-ink-main font-sans italic text-right">${inquirySummary.specialRequests}</span></div>` : ""}
        </div>

        <!-- Transparent Itemized Cost Breakdown -->
        ${renderInquiryCostBreakdown(inquirySummary)}
      </div>

      <!-- Zone 3: Pinned Footer Actions (Always Visible) -->
      <div class="px-5 py-4 border-t border-line-accent/20 bg-dialog-footer space-y-2.5 shrink-0">
        <button type="button" id="confirm-submit-inquiry-btn" onclick="confirmAndSubmitInquiry()"
                class="w-full bg-champagne hover:bg-champagne/90 text-deep-forest py-3.5 px-5 rounded-xl font-bold tracking-wider uppercase transition duration-300 shadow-xl flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-[0.99]">
          <span class="text-base">✓</span>
          <span>Confirm &amp; Submit Reservation Inquiry</span>
        </button>

        <div class="flex gap-2">
          <button type="button" onclick="closeInquiryModal()"
                  class="flex-1 bg-canvas/80 border border-line-accent/25 hover:border-line-accent text-ink-main/80 hover:text-ink-gold py-2.5 rounded-lg text-xs font-medium transition cursor-pointer">
            ← Edit Details
          </button>
          <a href="${CommunicationService.getTelephoneUrl()}"
             class="flex-1 text-center bg-canvas/80 border border-line-accent/25 hover:border-line-accent text-ink-main/80 hover:text-ink-gold py-2.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1">
            📞 Call Desk Direct
          </a>
        </div>
      </div>
    </div>
  `;

  modalElement.classList.remove("hidden");
  modalElement.classList.add("flex");
  PageScrollLock.lock();
}

function closeInquiryModal() {
  const modalElement = document.getElementById("inquiry-review-modal");
  if (modalElement) {
    modalElement.classList.add("hidden");
    modalElement.classList.remove("flex");
  }
  PageScrollLock.unlock();
}

function copyInquiryDetails(encodedMessageText) {
  const plainText = decodeURIComponent(encodedMessageText);
  if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    navigator.clipboard.writeText(plainText).then(() => {
      showToast("Inquiry details copied to clipboard!");
    }).catch(() => {
      showToast("Reference details: " + plainText);
    });
  } else {
    showToast("Reference details: " + plainText);
  }
}

// ── 6. NAVIGATION & TAB SWITCHERS ──

function toggleMobileMenu() {
  const menuElement = document.getElementById("mobile-menu");
  const buttonElement = document.getElementById("mobile-menu-btn");
  if (menuElement) {
    const isCurrentlyExpanded = !menuElement.classList.contains("hidden");
    if (isCurrentlyExpanded) {
      menuElement.classList.add("hidden");
      if (buttonElement) buttonElement.setAttribute("aria-expanded", "false");
    } else {
      menuElement.classList.remove("hidden");
      if (buttonElement) buttonElement.setAttribute("aria-expanded", "true");
    }
  }
}

function closeMobileMenu() {
  const menuElement = document.getElementById("mobile-menu");
  const buttonElement = document.getElementById("mobile-menu-btn");
  if (menuElement && !menuElement.classList.contains("hidden")) {
    menuElement.classList.add("hidden");
    if (buttonElement) buttonElement.setAttribute("aria-expanded", "false");
  }
}

function switchFaqTab(selectedTabId) {
  document.querySelectorAll(".faq-panel").forEach(panel => panel.classList.add("hidden"));
  document.querySelectorAll(".faq-tab-btn").forEach(button => {
    button.classList.remove("bg-champagne", "text-deep-forest", "shadow-lg");
    button.classList.add("bg-canvas/60", "text-muted-70", "border", "border-line-accent/20");
    button.setAttribute("aria-selected", "false");
  });

  const targetPanel = document.getElementById(selectedTabId);
  if (targetPanel) targetPanel.classList.remove("hidden");

  const targetButton = document.getElementById("btn-" + selectedTabId);
  if (targetButton) {
    targetButton.classList.remove("bg-canvas/60", "text-muted-70", "border", "border-line-accent/20");
    targetButton.classList.add("bg-champagne", "text-deep-forest", "shadow-lg");
    targetButton.setAttribute("aria-selected", "true");
  }
}

function switchTab(selectedTabId) {
  document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.add("hidden"));
  const targetPanel = document.getElementById(selectedTabId);
  if (targetPanel) targetPanel.classList.remove("hidden");

  document.querySelectorAll(".tab-btn").forEach(button => {
    button.classList.remove("bg-canvas", "text-ink-gold", "border-line-accent/30");
    button.classList.add("bg-canvas/40", "text-muted-60", "border-transparent");
    button.setAttribute("aria-selected", "false");
  });

  const targetButton = document.getElementById("btn-" + selectedTabId);
  if (targetButton) {
    targetButton.classList.remove("bg-canvas/40", "text-muted-60", "border-transparent");
    targetButton.classList.add("bg-canvas", "text-ink-gold", "border-line-accent/30");
    targetButton.setAttribute("aria-selected", "true");
  }
}

function selectUnit(unitIdentifier) {
  const propertySelectElement = document.getElementById("booking-property");
  if (propertySelectElement) {
    let matchedIndex = -1;
    for (let i = 0; i < propertySelectElement.options.length; i++) {
      const optionElement = propertySelectElement.options[i];
      if (optionElement.value === unitIdentifier || optionElement.value.toLowerCase().includes(unitIdentifier.toLowerCase()) || unitIdentifier.toLowerCase().includes(optionElement.value.toLowerCase())) {
        matchedIndex = i;
        break;
      }
    }
    if (matchedIndex >= 0) {
      propertySelectElement.selectedIndex = matchedIndex;
    } else {
      propertySelectElement.value = unitIdentifier;
    }
  }

  const allCards = document.querySelectorAll(".residence-card");
  let matchedCard = null;
  allCards.forEach(card => {
    const val = card.getAttribute("data-value") || "";
    if (val === unitIdentifier || val.toLowerCase().includes(unitIdentifier.toLowerCase()) || unitIdentifier.toLowerCase().includes(val.toLowerCase())) {
      matchedCard = card;
    }
  });

  syncBreakfastAddonCard(propertyValue);

  if (matchedCard && typeof selectResidenceCard === "function") {
    selectResidenceCard(unitIdentifier, matchedCard);
  } else {
    updatePriceCalculation();
  }

  const bookingSection = getBookingScrollTarget();
  if (bookingSection) {
    scrollToPageTarget(bookingSection);
  }
}

function selectProperty(propertyName) {
  const propertySelectElement = document.getElementById("booking-property");
  if (!propertySelectElement) return;

  for (let index = 0; index < propertySelectElement.options.length; index++) {
    const option = propertySelectElement.options[index];
    if (option.text.includes(propertyName) || option.value.includes(propertyName)) {
      propertySelectElement.selectedIndex = index;
      break;
    }
  }

  const selectedVal = propertySelectElement.value;
  const allCards = document.querySelectorAll(".residence-card");
  let matchedCard = null;
  allCards.forEach(card => {
    const val = card.getAttribute("data-value") || "";
    if (val.toLowerCase().includes(propertyName.toLowerCase()) || propertyName.toLowerCase().includes(val.toLowerCase())) {
      matchedCard = card;
    }
  });

  syncBreakfastAddonCard(propertyValue);

  if (matchedCard && typeof selectResidenceCard === "function") {
    selectResidenceCard(selectedVal, matchedCard);
  } else {
    if (propertyName.includes("Tower")) switchTab("tab-tower");
    else if (propertyName.includes("Darad")) switchTab("tab-darad");
    else if (propertyName.includes("Darling")) switchTab("tab-darling");
    else if (propertyName.includes("Apartment")) switchTab("tab-beakim");
    updatePriceCalculation();
  }

  const bookingSection = getBookingScrollTarget();
  if (bookingSection) {
    scrollToPageTarget(bookingSection);
  }
}

function handlePropertyChange() {
  const propertySelectElement = document.getElementById("booking-property");
  if (!propertySelectElement) return;
  const propertyValue = propertySelectElement.value;

  const allCards = document.querySelectorAll(".residence-card");
  let matchedCard = null;
  allCards.forEach(card => {
    const val = card.getAttribute("data-value") || "";
    if (val === propertyValue || val.toLowerCase().includes(propertyValue.toLowerCase()) || propertyValue.toLowerCase().includes(val.toLowerCase())) {
      matchedCard = card;
    }
  });

  syncBreakfastAddonCard(propertyValue);

  if (matchedCard && typeof selectResidenceCard === "function") {
    selectResidenceCard(propertyValue, matchedCard);
  } else {
    if (propertyValue.includes("Tower")) switchTab("tab-tower");
    else if (propertyValue.includes("Darad")) switchTab("tab-darad");
    else if (propertyValue.includes("Darling")) switchTab("tab-darling");
    else if (propertyValue.includes("Apartment")) switchTab("tab-beakim");
    updatePriceCalculation();
  }
}

// ── 7. ACCESSIBILITY LISTENERS & MODAL FOCUS TRAPPING ──

if (typeof document !== "undefined") {
  document.addEventListener("click", function(e) {
    const lightboxModal = document.getElementById("lightbox-modal");
    if (lightboxModal && !lightboxModal.classList.contains("hidden") && e.target === lightboxModal) {
      closeLightbox();
    }
    const inquiryModal = document.getElementById("inquiry-review-modal");
    if (inquiryModal && !inquiryModal.classList.contains("hidden") && e.target === inquiryModal) {
      closeInquiryModal();
    }
  });

  document.addEventListener("keydown", function(e) {
    if (e.target && e.target.classList && e.target.classList.contains("residence-card")) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.target.click();
        return;
      }
    }

    const lightboxModal = document.getElementById("lightbox-modal");
    if (lightboxModal && !lightboxModal.classList.contains("hidden")) {
      if (e.key === "Escape") {
        closeLightbox();
        return;
      }
      if (e.key === "ArrowLeft") {
        navigateLightbox(-1);
        return;
      }
      if (e.key === "ArrowRight") {
        navigateLightbox(1);
        return;
      }
    }

    if (e.key === "Escape") {
      closeLightbox();
      closeMobileMenu();
      closeInquiryModal();
      return;
    }

    const activeModal = [document.getElementById("lightbox-modal"), document.getElementById("inquiry-review-modal")]
      .find(modal => modal && !modal.classList.contains("hidden"));

    if (activeModal && e.key === 'Tab') {
      const focusableElements = Array.from(
        activeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter(element => !element.disabled && element.offsetParent !== null);

      if (focusableElements.length === 0) return;
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  });
}

// ── 8. DOM INITIALIZATION WORKFLOW ──

/**
 * BeakimDateRangePicker
 * High-performance, zero-dependency luxury date range picker.
 */
const BeakimDateRangePicker = {
  state: {
    checkIn: null,     // "YYYY-MM-DD"
    checkOut: null,    // "YYYY-MM-DD"
    hoverDate: null,   // "YYYY-MM-DD"
    currentMonth: 0,   // 0-11
    currentYear: 2026,
    isOpen: false,
    isScrollLocked: false,
    step: "check-in"   // "check-in" or "check-out"
  },

  formatDisplayDate(dateString) {
    if (!dateString) return "Select Date";
    const [year, month, day] = dateString.split("-").map(Number);
    const dateObject = new Date(year, month - 1, day);
    const weekdayName = APP_CONFIG.CALENDAR.WEEKDAY_NAMES_SHORT[dateObject.getDay()];
    const monthName = APP_CONFIG.CALENDAR.MONTH_NAMES_SHORT[month - 1];
    return `${weekdayName}, ${day} ${monthName} ${year}`;
  },

  formatShortDisplayDate(dateString) {
    if (!dateString) return "Select Date";
    const [year, month, day] = dateString.split("-").map(Number);
    const dateObject = new Date(year, month - 1, day);
    const weekdayName = APP_CONFIG.CALENDAR.WEEKDAY_NAMES_SHORT[dateObject.getDay()];
    const monthName = APP_CONFIG.CALENDAR.MONTH_NAMES_SHORT[month - 1];
    return `${weekdayName}, ${day} ${monthName}`;
  },

  init() {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const trigger = document.getElementById("booking-date-range-trigger");
    const checkInInput = document.getElementById("check-in");
    const checkOutInput = document.getElementById("check-out");
    if (!trigger || !checkInInput || !checkOutInput) return;

    // Set initial dates if empty
    const tomorrow = getNairobiDateString(1);
    const dayAfter = getNairobiDateString(3); // 2 nights default luxury stay

    this.state.checkIn = checkInInput.value || tomorrow;
    this.state.checkOut = checkOutInput.value || dayAfter;
    checkInInput.value = this.state.checkIn;
    checkOutInput.value = this.state.checkOut;

    // Initialize calendar view to check-in date
    const [initialYear, initialMonth] = this.state.checkIn.split("-").map(Number);
    this.state.currentYear = initialYear;
    this.state.currentMonth = initialMonth - 1;

    this.updateTriggerDisplay();

    // Trigger click
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      this.toggle();
    });

    // Keyboard navigation on trigger
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.toggle();
      } else if (event.key === "Escape" && this.state.isOpen) {
        this.close();
      }
    });

    // Global click listener to close popover
    const popover = document.getElementById("beakim-calendar-popover");
    if (popover) {
      this.originalParent = popover.parentElement;
      popover.addEventListener("click", (event) => {
        // If clicked on backdrop overlay outside calendar card, close popover
        if (event.target === popover) {
          this.close();
          return;
        }
        event.stopPropagation();
      });
    }

    document.addEventListener("click", (event) => {
      if (!this.state.isOpen) return;
      const currentPopover = document.getElementById("beakim-calendar-popover");
      if (!currentPopover) return;

      // Ignore clicks on trigger or inside trigger
      if (trigger && (trigger === event.target || trigger.contains(event.target))) return;

      // Ignore clicks inside popover
      if (currentPopover === event.target || currentPopover.contains(event.target)) return;

      // Ignore detached nodes from innerHTML re-renders
      if (!document.body.contains(event.target)) return;

      this.close();
    });

    // Escape listener
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.state.isOpen) {
        this.close();
      }
    });

    // Window resize handler to reposition correctly between mobile viewport modal and desktop dropdown
    window.addEventListener("resize", () => {
      if (this.state.isOpen) {
        this.reposition();
      }
    });
  },

  syncScrollLock(isMobile) {
    if (this.state.isOpen && isMobile) {
      if (!this.state.isScrollLocked) {
        if (typeof PageScrollLock !== "undefined" && typeof PageScrollLock.lock === "function") {
          PageScrollLock.lock();
        }
        this.state.isScrollLocked = true;
      }
    } else {
      if (this.state.isScrollLocked) {
        if (typeof PageScrollLock !== "undefined" && typeof PageScrollLock.unlock === "function") {
          PageScrollLock.unlock();
        }
        this.state.isScrollLocked = false;
      }
    }
  },

  reposition() {
    if (!this.state.isOpen) return;
    const popover = document.getElementById("beakim-calendar-popover");
    if (!popover) return;

    const isMobile = isCalendarModalViewport();
    if (isMobile) {
      if (popover.parentElement !== document.body) {
        document.body.appendChild(popover);
      }
      popover.className = "cal-modal-open";
    } else {
      if (this.originalParent && popover.parentElement !== this.originalParent) {
        this.originalParent.appendChild(popover);
      }
      popover.className = "cal-inline-open";
    }

    this.syncScrollLock(isMobile);
    this.render();
  },

  updateTriggerDisplay() {
    const displayIn = document.getElementById("display-check-in");
    const displayOut = document.getElementById("display-check-out");
    const nightsBadge = document.getElementById("display-nights-badge");
    const checkInInput = document.getElementById("check-in");
    const checkOutInput = document.getElementById("check-out");

    if (checkInInput) checkInInput.value = this.state.checkIn || "";
    if (checkOutInput) checkOutInput.value = this.state.checkOut || "";

    if (displayIn) {
      displayIn.textContent = this.formatShortDisplayDate(this.state.checkIn);
    }
    if (displayOut) {
      displayOut.textContent = this.formatShortDisplayDate(this.state.checkOut);
    }

    if (nightsBadge) {
      if (this.state.checkIn && this.state.checkOut) {
        const nights = calculateDateDifferenceInDays(this.state.checkIn, this.state.checkOut);
        nightsBadge.textContent = nights > 0 ? `${nights} Night${nights > 1 ? "s" : ""}` : "1 Night";
      } else if (this.state.checkIn) {
        nightsBadge.textContent = "Select Check-Out";
      } else {
        nightsBadge.textContent = "Dates of Stay";
      }
    }
  },

  toggle() {
    if (this.state.isOpen) this.close();
    else this.open();
  },

  open() {
    const popover = document.getElementById("beakim-calendar-popover");
    if (!popover) return;
    this.state.isOpen = true;
    this.state.step = "check-in";

    const isMobile = isCalendarModalViewport();
    if (isMobile) {
      if (popover.parentElement !== document.body) {
        document.body.appendChild(popover);
      }
      popover.className = "cal-modal-open";
    } else {
      if (this.originalParent && popover.parentElement !== this.originalParent) {
        this.originalParent.appendChild(popover);
      }
      popover.className = "cal-inline-open";
    }

    this.syncScrollLock(isMobile);

    popover.setAttribute("role", "dialog");
    popover.setAttribute("aria-modal", "true");
    popover.setAttribute("aria-label", "Dates of Stay Selector");

    const trigger = document.getElementById("booking-date-range-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
    this.render();

    setTimeout(() => {
      const closeBtn = document.getElementById("cal-close-btn");
      if (closeBtn && typeof closeBtn.focus === "function") {
        closeBtn.focus();
      }
    }, 50);
  },

  close() {
    const popover = document.getElementById("beakim-calendar-popover");
    if (!popover) return;
    this.state.isOpen = false;
    popover.className = "hidden";

    this.syncScrollLock(false);

    const trigger = document.getElementById("booking-date-range-trigger");
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
      if (typeof trigger.focus === "function") {
        trigger.focus();
      }
    }
  },

  prevMonth() {
    const today = getNairobiDateString(0);
    const [todayYear, todayMonth] = today.split("-").map(Number);
    // Disallow navigating before current month
    if (this.state.currentYear === todayYear && this.state.currentMonth <= todayMonth - 1) return;

    this.state.currentMonth--;
    if (this.state.currentMonth < 0) {
      this.state.currentMonth = 11;
      this.state.currentYear--;
    }
    this.render();
    const prevBtn = document.getElementById("cal-prev-month-btn");
    if (prevBtn && typeof prevBtn.focus === "function") prevBtn.focus();
  },

  nextMonth() {
    this.state.currentMonth++;
    if (this.state.currentMonth > 11) {
      this.state.currentMonth = 0;
      this.state.currentYear++;
    }
    this.render();
    const nextBtn = document.getElementById("cal-next-month-btn");
    if (nextBtn && typeof nextBtn.focus === "function") nextBtn.focus();
  },

  applyPreset(presetType) {
    const today = getNairobiDateString(0);
    const [currentYear, currentMonth, currentDay] = today.split("-").map(Number);
    const baseDate = new Date(currentYear, currentMonth - 1, currentDay);

    const startDate = new Date(baseDate);
    let stayNights = APP_CONFIG.CALENDAR.DEFAULT_STAY_NIGHTS;

    if (presetType === "weekend") {
      const dayOfWeek = startDate.getDay(); // 0 is Sun, 5 is Fri
      const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
      startDate.setDate(startDate.getDate() + (daysUntilFriday === 0 ? 0 : daysUntilFriday));
      stayNights = APP_CONFIG.CALENDAR.DEFAULT_STAY_NIGHTS; // Fri to Sun
    } else if (presetType === "5days") {
      startDate.setDate(startDate.getDate() + 1); // tomorrow
      stayNights = APP_CONFIG.CALENDAR.LONG_STAY_PRESET_DAYS;
    } else if (presetType === "7days") {
      startDate.setDate(startDate.getDate() + 1); // tomorrow
      stayNights = APP_CONFIG.CALENDAR.HOLIDAY_PRESET_DAYS;
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + stayNights);

    this.state.checkIn = `${startDate.getFullYear()}-${formatTwoDigitNumber(startDate.getMonth() + 1)}-${formatTwoDigitNumber(startDate.getDate())}`;
    this.state.checkOut = `${endDate.getFullYear()}-${formatTwoDigitNumber(endDate.getMonth() + 1)}-${formatTwoDigitNumber(endDate.getDate())}`;
    this.state.step = "check-in";

    this.updateTriggerDisplay();
    this.render();
    if (typeof handleDateOrAddonChange === "function") handleDateOrAddonChange();
  },

  selectDate(dateString, event) {
    if (event && typeof event.stopPropagation === "function") {
      event.stopPropagation();
    }
    const today = getNairobiDateString(0);
    if (isPastDate(dateString, today)) return; // Ignore past dates

    if (this.state.step === "check-in" || !this.state.checkIn) {
      this.state.checkIn = dateString;
      this.state.checkOut = null;
      this.state.step = "check-out";
      this.updateTriggerDisplay();
      this.render();
    } else if (this.state.step === "check-out") {
      if (dateString <= this.state.checkIn) {
        this.state.checkIn = dateString;
        this.state.checkOut = null;
        this.state.step = "check-out";
        this.updateTriggerDisplay();
      } else {
        this.state.checkOut = dateString;
        this.state.step = "check-in";
        this.updateTriggerDisplay();
        if (typeof handleDateOrAddonChange === "function") handleDateOrAddonChange();
        setTimeout(() => {
          this.close();
        }, APP_CONFIG.CALENDAR.AUTO_CLOSE_DELAY_MS);
      }
      this.render();
    }
  },

  onHoverDate(dateString) {
    if (this.state.step === "check-out" && this.state.checkIn && dateString > this.state.checkIn) {
      this.state.hoverDate = dateString;
      this.renderRangeHighlights();
    }
  },

  renderRangeHighlights() {
    if (typeof document === "undefined") return;
    const calendarCells = document.querySelectorAll("[data-cal-date]");
    calendarCells.forEach(cellElement => {
      const cellDateString = cellElement.getAttribute("data-cal-date");
      if (!cellDateString) return;
      if (this.state.checkIn && this.state.hoverDate && !this.state.checkOut) {
        if (cellDateString > this.state.checkIn && cellDateString < this.state.hoverDate) {
          cellElement.classList.add("cal-range-hover");
        } else {
          cellElement.classList.remove("cal-range-hover");
        }
      }
    });
  },

  buildStatusGuidanceHtml() {
    if (this.state.step === "check-out" && this.state.checkIn) {
      return `Check-In: <span class="text-ink-gold font-bold">${this.formatShortDisplayDate(this.state.checkIn)}</span> • Select Check-Out Date`;
    }
    if (this.state.checkIn && this.state.checkOut) {
      const nights = calculateDateDifferenceInDays(this.state.checkIn, this.state.checkOut);
      return `<span class="text-ink-gold font-bold">${nights} Night${nights > 1 ? "s" : ""}</span> (${this.formatShortDisplayDate(this.state.checkIn)} → ${this.formatShortDisplayDate(this.state.checkOut)})`;
    }
    return "Select Check-In Date";
  },

  buildCalendarPresetsHtml() {
    return `
      <div class="flex flex-wrap items-center gap-1.5 text-[11px]">
        <button type="button" onclick="BeakimDateRangePicker.applyPreset('weekend')" class="px-2.5 py-1 rounded-full bg-raised/80 border border-line-accent/25 text-ink-gold hover:bg-champagne hover:text-deep-forest transition font-medium">Weekend (2 Nights)</button>
        <button type="button" onclick="BeakimDateRangePicker.applyPreset('5days')" class="px-2.5 py-1 rounded-full bg-raised/80 border border-line-accent/25 text-ink-gold hover:bg-champagne hover:text-deep-forest transition font-medium">5-Day Stay</button>
        <button type="button" onclick="BeakimDateRangePicker.applyPreset('7days')" class="px-2.5 py-1 rounded-full bg-raised/80 border border-line-accent/25 text-ink-gold hover:bg-champagne hover:text-deep-forest transition font-medium">7-Night Holiday</button>
      </div>
    `;
  },

  buildCalendarMonthNavHtml(monthName, year, isAtMinMonth) {
    const prevButtonClasses = isAtMinMonth
      ? 'disabled class="p-1 text-ink-main/20 cursor-not-allowed"'
      : 'class="p-1 text-ink-gold hover:text-ink-main transition"';

    return `
      <div class="flex items-center justify-between px-1 pt-1">
        <button type="button" id="cal-prev-month-btn" onclick="BeakimDateRangePicker.prevMonth()" ${prevButtonClasses} aria-label="Previous Month">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span class="text-sm font-bold text-ink-main font-display tracking-wide">${monthName} ${year}</span>
        <button type="button" id="cal-next-month-btn" onclick="BeakimDateRangePicker.nextMonth()" class="p-1 text-ink-gold hover:text-ink-main transition" aria-label="Next Month">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    `;
  },

  buildCalendarDayCellHtml({ dayNumber, dateString, isPast, isCheckIn, isCheckOut, isMidRange }) {
    const [year, month, day] = dateString.split("-").map(Number);
    const dateObject = new Date(year, month - 1, day);
    const weekdayName = (APP_CONFIG.CALENDAR.WEEKDAY_NAMES_FULL && APP_CONFIG.CALENDAR.WEEKDAY_NAMES_FULL[dateObject.getDay()]) ||
                        APP_CONFIG.CALENDAR.WEEKDAY_NAMES_SHORT[dateObject.getDay()];
    const monthName = APP_CONFIG.CALENDAR.MONTH_NAMES_FULL[month - 1];
    const fullDateLabel = `${weekdayName}, ${day} ${monthName} ${year}`;

    let cellClasses = "h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center text-xs sm:text-sm font-medium transition cursor-pointer select-none cal-day-cell border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne ";
    let extraAttrs = `data-cal-date="${dateString}" aria-label="${fullDateLabel}" onclick="event.stopPropagation(); BeakimDateRangePicker.selectDate('${dateString}', event)" onmouseenter="BeakimDateRangePicker.onHoverDate('${dateString}')"`;

    if (isPast) {
      cellClasses += "text-ink-main/20 cursor-not-allowed ";
      extraAttrs = `data-cal-date="${dateString}" aria-label="${fullDateLabel} (Unavailable, past date)" disabled aria-disabled="true"`;
    } else if (isCheckIn && isCheckOut) {
      cellClasses += "cal-range-start cal-range-end shadow-md scale-105 ";
      extraAttrs += ` aria-pressed="true"`;
    } else if (isCheckIn) {
      cellClasses += "cal-range-start shadow-md ";
      extraAttrs += ` aria-pressed="true"`;
    } else if (isCheckOut) {
      cellClasses += "cal-range-end shadow-md ";
      extraAttrs += ` aria-pressed="true"`;
    } else if (isMidRange) {
      cellClasses += "cal-range-mid ";
      extraAttrs += ` aria-pressed="true"`;
    } else {
      cellClasses += "text-ink-main hover:bg-champagne/20 rounded-full ";
      extraAttrs += ` aria-pressed="false"`;
    }

    return `<button type="button" class="${cellClasses}" ${extraAttrs}>${dayNumber}</button>`;
  },

  buildCalendarDaysGridHtml(year, monthNumber, checkInDate, checkOutDate, todayDate) {
    const firstDayIndex = new Date(year, monthNumber, 1).getDay();
    const daysInMonth = new Date(year, monthNumber + 1, 0).getDate();

    let gridHtml = "";
    for (let index = 0; index < firstDayIndex; index++) {
      gridHtml += `<div class="h-9 w-9 sm:h-10 sm:w-10" aria-hidden="true"></div>`;
    }

    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
      const dateString = `${year}-${formatTwoDigitNumber(monthNumber + 1)}-${formatTwoDigitNumber(dayNumber)}`;
      const isPast = isPastDate(dateString, todayDate);
      const isCheckIn = dateString === checkInDate;
      const isCheckOut = dateString === checkOutDate;
      const isMidRange = isDateBetween(dateString, checkInDate, checkOutDate);

      gridHtml += this.buildCalendarDayCellHtml({
        dayNumber,
        dateString,
        isPast,
        isCheckIn,
        isCheckOut,
        isMidRange
      });
    }

    const headerCols = APP_CONFIG.CALENDAR.WEEKDAY_HEADER_LABELS.map(label => `<div>${label}</div>`).join("");

    return `
      <div class="space-y-1">
        <div class="grid grid-cols-7 text-center text-[11px] font-bold text-ink-gold/70 pb-1">
          ${headerCols}
        </div>
        <div class="grid grid-cols-7 gap-y-1 text-center items-center justify-items-center">
          ${gridHtml}
        </div>
      </div>
    `;
  },

  buildCalendarFooterHtml() {
    return `
      <div class="flex items-center justify-between pt-2 border-t border-line-accent/15 text-xs">
        <button type="button" onclick="BeakimDateRangePicker.reset()" class="text-muted-60 hover:text-ink-gold transition underline underline-offset-2 text-[11px]">Clear Dates</button>
        <button type="button" onclick="BeakimDateRangePicker.applyAndClose()" class="bg-champagne hover:bg-driftwood text-deep-forest font-bold px-4 py-1.5 rounded-lg transition shadow-md text-xs active:scale-95">Apply Dates ✓</button>
      </div>
    `;
  },

  render() {
    const popover = document.getElementById("beakim-calendar-popover");
    if (!popover) return;

    const monthName = APP_CONFIG.CALENDAR.MONTH_NAMES_FULL[this.state.currentMonth];
    const year = this.state.currentYear;
    const todayDate = getNairobiDateString(0);
    const [todayYear, todayMonth] = todayDate.split("-").map(Number);
    const isAtMinMonth = (year === todayYear && this.state.currentMonth <= todayMonth - 1);

    const statusGuidanceHtml = this.buildStatusGuidanceHtml();
    const presetsHtml = this.buildCalendarPresetsHtml();
    const monthNavHtml = this.buildCalendarMonthNavHtml(monthName, year, isAtMinMonth);
    const daysGridHtml = this.buildCalendarDaysGridHtml(year, this.state.currentMonth, this.state.checkIn, this.state.checkOut, todayDate);
    const footerHtml = this.buildCalendarFooterHtml();

    popover.innerHTML = `
      <div class="cal-modal-card bg-canvas border border-line-accent/30 rounded-2xl shadow-2xl p-4 sm:p-5 w-full max-w-sm sm:max-w-md text-ink-main flex flex-col space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-line-accent/15">
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-ink-gold flex items-center gap-1.5">
              <span>📅</span> Dates of Stay
            </h4>
            <p class="text-[11px] text-muted-70 pt-0.5">${statusGuidanceHtml}</p>
          </div>
          <button type="button" id="cal-close-btn" onclick="BeakimDateRangePicker.close()" class="w-7 h-7 rounded-full bg-canvas/80 hover:bg-champagne/20 text-muted-70 hover:text-ink-gold flex items-center justify-center transition text-sm cursor-pointer" aria-label="Close date picker">✕</button>
        </div>

        <!-- Quick Presets -->
        ${presetsHtml}

        <!-- Month Navigation -->
        ${monthNavHtml}

        <!-- Days Grid -->
        ${daysGridHtml}

        <!-- Action Footer -->
        ${footerHtml}
      </div>
    `;
  },

  reset() {
    const tomorrow = getNairobiDateString(1);
    const dayAfter = getNairobiDateString(3);
    this.state.checkIn = tomorrow;
    this.state.checkOut = dayAfter;
    this.state.step = "check-in";
    this.updateTriggerDisplay();
    this.render();
    if (typeof handleDateOrAddonChange === "function") handleDateOrAddonChange();
  },

  applyAndClose() {
    this.updateTriggerDisplay();
    if (typeof handleDateOrAddonChange === "function") handleDateOrAddonChange();
    this.close();
  }
};

if (typeof window !== "undefined") {
  window.BeakimDateRangePicker = BeakimDateRangePicker;
}

function initializeDatePickers(checkInInput, checkOutInput) {
  const todayDateString = getNairobiDateString(0);
  const tomorrowDateString = getNairobiDateString(1);
  const dayAfterDateString = getNairobiDateString(3); // 2-night default luxury stay

  if (checkInInput) {
    checkInInput.min = todayDateString;
    if (!checkInInput.value) checkInInput.value = tomorrowDateString;
    checkInInput.addEventListener("change", () => {
      if (checkOutInput && checkOutInput.value <= checkInInput.value) {
        const nextDayDate = new Date(checkInInput.value);
        nextDayDate.setDate(nextDayDate.getDate() + 1);
        checkOutInput.value = nextDayDate.toISOString().split("T")[0];
      }
      updatePriceCalculation();
    });
  }

  if (checkOutInput) {
    checkOutInput.min = tomorrowDateString;
    if (!checkOutInput.value) checkOutInput.value = dayAfterDateString;
    checkOutInput.addEventListener("change", updatePriceCalculation);
  }

  // Initialize luxury date range calendar
  BeakimDateRangePicker.init();
}

function initializeBookingPreFill() {
  if (typeof window === "undefined") return;
  const urlParams = new URLSearchParams(window.location.search);
  const requestedProperty = urlParams.get("property") || urlParams.get("unit");
  const propertySelect = document.getElementById("booking-property");

  if (requestedProperty && propertySelect) {
    const cleanReq = requestedProperty.toLowerCase();
    for (let i = 0; i < propertySelect.options.length; i++) {
      const optionElement = propertySelect.options[i];
      if (optionElement.value.toLowerCase().includes(cleanReq)) {
        propertySelect.selectedIndex = i;
        handlePropertyChange();
        break;
      }
    }
  }
}

function bindBookingForms() {
  const bookingForms = document.querySelectorAll("form");
  bookingForms.forEach(form => {
    const isBookingForm = form.id.includes("booking") ||
                          form.id.includes("cottage") ||
                          form.id.includes("property") ||
                          Boolean(form.querySelector("#check-in"));
    if (isBookingForm) {
      form.removeAttribute("onsubmit");
      form.addEventListener("submit", handleBookingSubmit);
    }
  });
}

/** Keep native navigation for other pages, queries, origins and modified clicks. */
function isCalendarModalViewport(width, height) {
  if (typeof width !== "number") width = typeof window !== "undefined" ? window.innerWidth : Infinity;
  if (typeof height !== "number") height = typeof window !== "undefined" ? window.innerHeight : Infinity;
  return width < APP_CONFIG.CALENDAR.MODAL_BREAKPOINT_WIDTH || height < APP_CONFIG.CALENDAR.MODAL_BREAKPOINT_HEIGHT;
}

function normalizePagePath(pathname) {
  return pathname.replace(/\/index(?:\.html)?\/?$/, "/").replace(/\.html$/, "").replace(/\/$/, "") || "/";
}

function resolveLocalAnchor(href, currentHref) {
  try {
    const current = new URL(currentHref);
    const destination = new URL(href, current);
    if (destination.origin !== current.origin || destination.search !== current.search ||
        normalizePagePath(destination.pathname) !== normalizePagePath(current.pathname)) return null;
    return destination.hash ? decodeURIComponent(destination.hash.slice(1)) : null;
  } catch (_) {
    return null;
  }
}

function getPreferredScrollBehavior() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function getBookingScrollTarget() {
  return document.getElementById("booking-entry") || document.getElementById("booking-form") || document.getElementById("booking");
}

function getAnchorTarget(targetId) {
  return ["booking", "booking-form", "booking-entry"].includes(targetId)
    ? getBookingScrollTarget() : document.getElementById(targetId);
}

function scrollToPageTarget(target, behavior = getPreferredScrollBehavior()) {
  if (typeof document !== "undefined") updateMobileChromeClearance();
  if (target) target.scrollIntoView({ behavior, block: "start" });
}

/** Height includes safe-area padding: do not add env(safe-area-inset-bottom) twice. */
function updateMobileChromeClearance() {
  const header = document.querySelector(".site-header");
  const dock = document.querySelector(".site-contact-dock");
  if (header) document.documentElement.style.setProperty("--site-header-height", `${Math.ceil(header.getBoundingClientRect().height)}px`);
  if (dock) document.documentElement.style.setProperty("--contact-dock-height", `${Math.ceil(dock.getBoundingClientRect().height)}px`);
}

function initializeMobileChromeClearance() {
  const header = document.querySelector(".site-header");
  const dock = document.querySelector(".site-contact-dock");
  updateMobileChromeClearance();
  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(updateMobileChromeClearance);
    if (header) observer.observe(header);
    if (dock) observer.observe(dock);
  } else {
    window.addEventListener("resize", updateMobileChromeClearance, { passive: true });
  }
}

function cleanHashFromUrl() {
  if (typeof window === "undefined" || !window.location.hash) return;
  const targetId = resolveLocalAnchor(window.location.href, window.location.href);
  const target = targetId && getAnchorTarget(targetId);
  if (!target) return;
  // Initial deep links settle instantly; font swaps must not leave a stale offset.
  scrollToPageTarget(target, "auto");
  if (document.fonts && document.fonts.ready) {
    let interrupted = false;
    const interrupt = () => { interrupted = true; };
    const events = ["pointerdown", "touchstart", "wheel", "keydown"];
    events.forEach(type => window.addEventListener(type, interrupt, { once: true, passive: true }));
    document.fonts.ready.then(() => {
      events.forEach(type => window.removeEventListener(type, interrupt));
      if (!interrupted && target.isConnected) scrollToPageTarget(target, "auto");
    });
  }
  if (typeof history !== "undefined" && history.replaceState) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

function initializeCleanHashScrolling() {
  if (typeof document === "undefined") return;
  cleanHashFromUrl();
  document.querySelectorAll('a[href*="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(event) {
      if (event.defaultPrevented || event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
          this.hasAttribute("download") || (this.target && this.target !== "_self")) return;
      const targetId = resolveLocalAnchor(this.getAttribute("href"), window.location.href);
      if (targetId === "main-content") return; // Keep native skip-link focus navigation.
      const target = targetId && getAnchorTarget(targetId);
      if (!target) return;
      event.preventDefault();
      scrollToPageTarget(target);
      if (typeof history !== "undefined" && history.replaceState) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    });
  });
}

function initializeDemoModeBanner() {
  if (typeof window === "undefined" || !isDemoModeActive()) return;

  const banner = document.createElement("div");
  banner.id = "demo-mode-badge";
  banner.setAttribute("role", "status");
  banner.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:9999;background:#0f172a;color:#fcd34d;border:1px solid #f59e0b;padding:8px 14px;border-radius:10px;font-family:sans-serif;font-size:12px;font-weight:600;display:flex;align-items:center;gap:8px;box-shadow:0 8px 24px rgba(0,0,0,0.5);";
  banner.innerHTML = '<span>🧪 Demo / Test Mode Active</span> <a href="' + window.location.pathname + '" style="color:#94a3b8;margin-left:8px;text-decoration:underline;font-size:11px;">Exit</a>';
  document.body.appendChild(banner);
}

/**
 * Switches between Cottage Stay mode and Conference Booking mode on Diani Darling.
 */
function switchBookingMode(mode) {
  if (typeof document === "undefined") return;
  const isConference = mode === "conference";
  
  const cottageForm = document.getElementById("booking-form");
  const conferenceContainer = document.getElementById("conference-form-container");
  const tabBtnCottage = document.getElementById("tab-btn-cottage");
  const tabBtnConference = document.getElementById("tab-btn-conference");

  if (cottageForm) cottageForm.classList.toggle("hidden", isConference);
  if (conferenceContainer) conferenceContainer.classList.toggle("hidden", !isConference);

  if (tabBtnCottage) {
    tabBtnCottage.classList.toggle("bg-canvas", !isConference);
    tabBtnCottage.classList.toggle("text-ink-gold", !isConference);
    tabBtnCottage.classList.toggle("shadow-md", !isConference);
    tabBtnCottage.classList.toggle("text-deep-forest/70", isConference);
  }

  if (tabBtnConference) {
    tabBtnConference.classList.toggle("bg-canvas", isConference);
    tabBtnConference.classList.toggle("text-ink-gold", isConference);
    tabBtnConference.classList.toggle("shadow-md", isConference);
    tabBtnConference.classList.toggle("text-deep-forest/70", !isConference);
  }

  if (isConference) {
    updateConferenceCalculation();
  }
}

function toggleRadioIndicator(radioElement, isSelected) {
  if (!radioElement) return;
  radioElement.classList.toggle("border-line-accent", isSelected);
  radioElement.classList.toggle("bg-champagne", isSelected);
  radioElement.classList.toggle("border-deep-forest/30", !isSelected);
  radioElement.classList.toggle("bg-transparent", !isSelected);
  const dotElement = radioElement.querySelector("div");
  if (dotElement) {
    dotElement.classList.toggle("opacity-0", !isSelected);
  }
}

/**
 * Resolves conference package details from the official catalog.
 */
function resolveConferencePackage(isFullDay) {
  const darlingCatalog = (typeof BEAKIM_CATALOG !== "undefined" && BEAKIM_CATALOG["diani-darling"]) ? BEAKIM_CATALOG["diani-darling"] : null;
  const packages = darlingCatalog && Array.isArray(darlingCatalog.conferencePackages) ? darlingCatalog.conferencePackages : [];
  if (isFullDay) {
    return packages.find(pkg => pkg.id === "darling-conf-full-day") || {
      id: "darling-conf-full-day",
      name: "Full Day Conference Package with Lunch",
      rate: 3000
    };
  }
  return packages.find(pkg => pkg.id === "darling-conf-half-day") || {
    id: "darling-conf-half-day",
    name: "Half Day Standard Conference Package",
    rate: 1500
  };
}

/**
 * Selects a conference package card and switches view to conference booking.
 */
function selectConferencePackage(packageIdentifier) {
  if (typeof document === "undefined") return;
  switchBookingMode("conference");
  
  const halfDayCard = document.getElementById("conf-pkg-card-half-day");
  const fullDayCard = document.getElementById("conf-pkg-card-full-day");
  const sessionSelect = document.getElementById("conf-session");

  const isFullDay = packageIdentifier === "full-day";

  if (halfDayCard && fullDayCard) {
    halfDayCard.classList.toggle("border-2", !isFullDay);
    halfDayCard.classList.toggle("border-line-accent", !isFullDay);
    halfDayCard.classList.toggle("bg-champagne/10", !isFullDay);
    halfDayCard.classList.toggle("border-deep-forest/15", isFullDay);
    halfDayCard.classList.toggle("bg-white", isFullDay);
    halfDayCard.setAttribute("aria-checked", !isFullDay ? "true" : "false");

    fullDayCard.classList.toggle("border-2", isFullDay);
    fullDayCard.classList.toggle("border-line-accent", isFullDay);
    fullDayCard.classList.toggle("bg-champagne/10", isFullDay);
    fullDayCard.classList.toggle("border-deep-forest/15", !isFullDay);
    fullDayCard.classList.toggle("bg-white", !isFullDay);
    fullDayCard.setAttribute("aria-checked", isFullDay ? "true" : "false");

    const halfRadio = halfDayCard.querySelector(".conf-radio");
    const fullRadio = fullDayCard.querySelector(".conf-radio");
    toggleRadioIndicator(halfRadio, !isFullDay);
    toggleRadioIndicator(fullRadio, isFullDay);
  }

  if (sessionSelect) {
    sessionSelect.value = isFullDay 
      ? "Full Day (8:00 AM – 5:00 PM)" 
      : "Half Day Morning (8:00 AM – 12:00 PM)";
  }

  const bookingAnchor = getBookingScrollTarget();
  if (bookingAnchor) {
    scrollToPageTarget(bookingAnchor);
  }

  updateConferenceCalculation();
}

/**
 * Calculates dynamic conference package cost based on selected package and delegates count.
 */
function updateConferenceCalculation() {
  if (typeof document === "undefined") return;
  const fullDayCard = document.getElementById("conf-pkg-card-full-day");
  const isFullDay = Boolean(fullDayCard && fullDayCard.getAttribute("aria-checked") === "true");
  
  const delegatesInput = document.getElementById("conf-delegates");
  let delegates = parseInt(delegatesInput?.value || "20", 10);
  if (isNaN(delegates) || delegates < 1) delegates = 1;
  if (delegates > 60) delegates = 60;

  const selectedPackage = resolveConferencePackage(isFullDay);
  const ratePerPerson = selectedPackage.rate;
  const packageName = selectedPackage.name;
  const totalCost = delegates * ratePerPerson;

  const packageNameElement = document.getElementById("conf-summary-pkg");
  const rateElement = document.getElementById("conf-summary-rate");
  const delegatesElement = document.getElementById("conf-summary-delegates");
  const totalElement = document.getElementById("conf-summary-total");

  if (packageNameElement) packageNameElement.textContent = packageName;
  if (rateElement) rateElement.textContent = `KSh ${ratePerPerson.toLocaleString()} / person`;
  if (delegatesElement) delegatesElement.textContent = `${delegates} Delegates`;
  if (totalElement) totalElement.textContent = `KSh ${totalCost.toLocaleString()}`;

  return {
    isFullDay,
    delegates,
    ratePerPerson,
    packageName,
    totalCost
  };
}

/**
 * Pure builder function for conference WhatsApp RFP text.
 */
function buildConferenceRfpMessage({ packageName, eventDate, session, delegates, orgName, coordinator, estimatedCost, bundleCottages, notes }) {
  return [
    `*NEW CONFERENCE RESERVATION INQUIRY*`,
    `🏢 *Venue:* Beakim Diani Darling (Conference Hall - 60 Pax)`,
    `📋 *Package:* ${packageName}`,
    `📅 *Event Date:* ${eventDate}`,
    `⏰ *Session:* ${session}`,
    `👥 *Delegates:* ${delegates} People (Max 60)`,
    `🏛️ *Organization:* ${orgName}`,
    `👤 *Coordinator:* ${coordinator}`,
    `💰 *Estimated Total:* KSh ${estimatedCost}`,
    bundleCottages ? `🛌 *Accommodation:* Also requesting overnight cottages` : ``,
    notes && notes !== "None" ? `📝 *Special Requests:* ${notes}` : ``,
    `\n_Sent via Beakim Hospitality Group Direct Portal_`
  ].filter(Boolean).join("\n");
}

/**
 * Generates formatted WhatsApp conference RFP link and opens chat with Diani Darling reception.
 */
function handleConferenceWhatsAppRFP(event) {
  if (event && typeof event.preventDefault === "function") event.preventDefault();
  if (typeof document === "undefined") return;

  const fullDayCard = document.getElementById("conf-pkg-card-full-day");
  const isFullDay = Boolean(fullDayCard && fullDayCard.getAttribute("aria-checked") === "true");
  const selectedPackage = resolveConferencePackage(isFullDay);
  const packageName = `${selectedPackage.name} (KSh ${selectedPackage.rate.toLocaleString()}/person)`;

  const dateInput = document.getElementById("conf-date");
  const sessionSelect = document.getElementById("conf-session");
  const delegatesInput = document.getElementById("conf-delegates");
  const orgInput = document.getElementById("conf-org-name");
  const coordinatorInput = document.getElementById("conf-coord-name");
  const notesInput = document.getElementById("conf-notes");
  const bundleCottages = Boolean(document.getElementById("conf-bundle-cottages")?.checked);

  const eventDate = dateInput?.value || "To Be Confirmed";
  const session = sessionSelect?.value || "Full Day (8:00 AM – 5:00 PM)";
  const delegates = delegatesInput?.value || "20";
  const orgName = orgInput?.value?.trim() || "Private Group";
  const coordinator = coordinatorInput?.value?.trim() || "Coordinator";
  const notes = notesInput?.value?.trim() || "None";
  const estimatedCost = (parseInt(delegates, 10) * selectedPackage.rate).toLocaleString();

  const messageText = buildConferenceRfpMessage({
    packageName,
    eventDate,
    session,
    delegates,
    orgName,
    coordinator,
    estimatedCost,
    bundleCottages,
    notes
  });

  const whatsappUrl = CommunicationService.buildWhatsAppUrl(messageText);
  if (typeof window !== "undefined" && typeof window.open === "function") {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }
}

function initializeConciergeHesitationEngine() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const whatsappBtn = document.querySelector('[data-comm-action="whatsapp"]');
  const phoneBtn = document.querySelector('[data-comm-action="phone"]');
  if (!whatsappBtn && !phoneBtn) return;

  const IDLE_HESITATION_MS = 8000;
  let idleTimer = null;
  let isPulsing = false;

  function activateGlow() {
    if (isPulsing) return;
    isPulsing = true;
    if (whatsappBtn) whatsappBtn.classList.add("hesitation-pulse-whatsapp");
    if (phoneBtn) phoneBtn.classList.add("hesitation-pulse-phone");
  }

  function resetHesitationTimer() {
    if (isPulsing) {
      isPulsing = false;
      if (whatsappBtn) whatsappBtn.classList.remove("hesitation-pulse-whatsapp");
      if (phoneBtn) phoneBtn.classList.remove("hesitation-pulse-phone");
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(activateGlow, IDLE_HESITATION_MS);
  }

  const passiveOpts = { passive: true };
  ["mousemove", "scroll", "keydown", "touchstart", "pointerdown"].forEach(evt => {
    window.addEventListener(evt, resetHesitationTimer, passiveOpts);
  });

  idleTimer = setTimeout(activateGlow, IDLE_HESITATION_MS);
}

/**
 * Zero-overhead, passive scroll-reveal engine for luxury below-the-fold elements.
 * Adheres strictly to WCAG 2.1 AAA prefers-reduced-motion.
 * Never delays above-the-fold hero elements.
 * Unobserves target immediately upon entry to consume 0 CPU cycles.
 */
function initializeScrollRevealEngine() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // 1. Accessibility Guard: if user requests reduced motion, do not activate animations
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  // 2. Browser feature check: fallback gracefully if IntersectionObserver is unsupported
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const revealElements = document.querySelectorAll(".reveal-on-scroll");
  if (!revealElements || revealElements.length === 0) return;

  // Activate CSS progressive enhancement
  document.documentElement.classList.add("js-reveal-active");

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -40px 0px",
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        // Immediate unobserve to free resources completely
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    initializeMobileChromeClearance();
    initializeWhatsAppRouting();
    initializeDemoModeBanner();
    const checkInInput = document.getElementById("check-in");
    const checkOutInput = document.getElementById("check-out");
    initializeDatePickers(checkInInput, checkOutInput);

    const propertyInput = document.getElementById("booking-property");
    if (propertyInput) {
      propertyInput.addEventListener("change", handlePropertyChange);
    }

    bindBookingForms();
    initializeBookingPreFill();
    collectGalleryImages();
    updatePriceCalculation();
    initializeCleanHashScrolling();
    initializeConciergeHesitationEngine();
    initializeScrollRevealEngine();
  });
}

// ── 9. MODULE EXPORTS (COMMONJS FOR ZERO-DEPENDENCY UNIT TESTS) ──

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    APP_CONFIG,
    CommunicationService,
    resolveWhatsAppPhone,
    getInquiryWhatsAppUrl,
    resolveBookingBenefits,
    syncBookingBenefits,
    CrmSyncService,
    PageScrollLock,
    getNairobiDateString,
    calculateDateDifferenceInDays,
    isPastDate,
    isInvalidDateRange,
    formatTwoDigitNumber,
    isDateBetween,
    normalizeKenyanPhoneNumber,
    resolveBreakfastRate,
    calculateReservationTotals,
    resolveStayPricing,
    buildInquiryMessage,
    extractSelectedAddons,
    extractBookingFormData,
    validateBookingFormData,
    syncPropertyDropdown,
    syncResidenceCardsStyling,
    syncBreakfastAddonCard,
    selectDaradRoomTier,
    handleDaradRoomKeydown,
    toggleDaradRoomSelector,
    syncDaradRoomTiersStyling,
    switchBookingMode,
    selectConferencePackage,
    updateConferenceCalculation,
    handleConferenceWhatsAppRFP,
    getCrmPublicEndpoint,
    resolvePropertyIdFromSelection,
    syncInquiryToCrm,
    handleResidenceCardKeydown,
    isCalendarModalViewport,
    normalizePagePath,
    resolveLocalAnchor,
    getPreferredScrollBehavior,
    scrollToPageTarget,
    initializeMobileChromeClearance,
    cleanHashFromUrl,
    initializeCleanHashScrolling,
    triggerLiveAvailabilityCheck,
    confirmAndSubmitInquiry,
    renderInquirySuccessReceipt,
    initializeConciergeHesitationEngine,
    initializeScrollRevealEngine,
    renderInquiryNetworkFailure,
    renderInquiryCostBreakdown,
    BeakimDateRangePicker,
    SafeStorageService,
    isDemoModeActive,
    resolveConferencePackage,
    buildConferenceRfpMessage,
    renderAvailabilityLoading,
    renderAvailabilityUnknown,
    renderAvailabilityPreApproved,
    renderAvailabilityHighDemand,
    renderAvailabilitySoldOut,
    renderAvailabilityCapacityWarning,
    getBookingUnitsCount,
    setBookingUnitsCount,
    adjustBookingUnits,
    selectTowerCottages2Br,
    processValidBookingSubmission,
    showInquiryReviewModal,
    generateFallbackInquiryId,
    trackBookingFunnelEvent
  };
}
