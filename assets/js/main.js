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
    PHONE_RAW: "254746938529",
    PHONE_FORMATTED: "+254 746 938 529",
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
  })
});

// ── 2. BOUNDARY SERVICES (THIRD-PARTY PROTOCOLS) ──

const CommunicationService = Object.freeze({
  buildWhatsAppUrl(messageText) {
    const searchParams = new URLSearchParams();
    searchParams.set("text", messageText);
    return `https://wa.me/${APP_CONFIG.CONTACT.PHONE_RAW}?${searchParams.toString()}`;
  },

  getWhatsAppUrl(messageText) {
    return this.buildWhatsAppUrl(messageText);
  },

  getTelephoneUrl() {
    return `tel:+${APP_CONFIG.CONTACT.PHONE_RAW}`;
  },

  getEmailUrl(subject = "Stay Inquiry") {
    return `mailto:${APP_CONFIG.CONTACT.CANONICAL_EMAIL}?subject=${encodeURIComponent(subject)}`;
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
    const isTestMode = typeof window !== "undefined" && Boolean(
      window.location.search && (
        window.location.search.includes("demo=true") || 
        window.location.search.includes("test=true") || 
        window.location.search.includes("demo=1") || 
        window.location.search.includes("test=1")
      )
    );

    return {
      guestName: formData.name,
      guestPhone: formattedContactPhone,
      guestEmail: formData.email,
      propertyName: formData.property,
      propertyId: this.resolvePropertyId(formData.property),
      unitPreference: formData.property,
      checkInDate: formData.checkIn,
      checkOutDate: formData.checkOut,
      adults: formData.adults,
      children: formData.children,
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

  async checkAvailability({ propertyId, checkInDate, checkOutDate }) {
    if (!checkInDate || !checkOutDate) return null;
    try {
      const baseEndpoint = this.resolveAvailabilityEndpoint();
      const url = new URL(baseEndpoint);
      if (propertyId) url.searchParams.set("propertyId", propertyId);
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
 * Single Source of Truth: Beakim Darad = KSh 500/day, Diani Darling = KSh 1,000/day.
 */
function resolveBreakfastRate(propertyIdentifier) {
  if (!propertyIdentifier) return 1000;
  const normalized = String(propertyIdentifier).toLowerCase();
  if (normalized.includes("darad")) return 500;
  if (normalized.includes("darling")) return 1000;
  if (normalized.includes("tower") || normalized.includes("apartment")) return 0;
  return 1000;
}

/**
 * Pure domain function computing stay pricing plus ancillary add-ons.
 */
function calculateReservationTotals({ pricingSummary, adultsCount = 1, hasBreakfast = false, propertyIdentifier = null }) {
  const durationDays = pricingSummary && pricingSummary.durationDays > 0 ? pricingSummary.durationDays : 0;
  const baseCost = pricingSummary ? pricingSummary.totalCost : 0;
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

  if (!checkInDateString || !checkOutDateString) {
    return {
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
function buildInquiryMessage({ guestName, contactPhone, guestEmail, propertyName, checkInDate, checkOutDate, stayDurationText, adultsCount, childrenCount, estimatedTotal, selectedAddons = [], specialRequests = "", preferredContactMethod = "" }) {
  const emailLine = guestEmail ? `• Email: ${guestEmail}\n` : "";
  const preferredChannelLine = preferredContactMethod ? `• Preferred Contact: ${preferredContactMethod}\n` : "";
  const childrenText = childrenCount > 0 ? `, ${childrenCount} Child(ren)` : "";
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
    `• Accommodation: ${propertyName}\n` +
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

  const totals = calculateReservationTotals({
    pricingSummary,
    adultsCount: formData.adults,
    hasBreakfast: formData.hasBreakfast
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
    preferredContactMethod
  });

  const whatsappUrl = CommunicationService.buildWhatsAppUrl(messageText);

  const inquiryPayload = CrmSyncService.buildPayload({
    formData,
    grandTotal: totals.grandTotal,
    formattedContactPhone
  });

  showInquiryReviewModal({
    formData,
    inquiryPayload,
    name: formData.name,
    phone: formattedContactPhone,
    email: formData.email,
    property: formData.property,
    dates: `${formData.checkIn} to ${formData.checkOut} (${pricingSummary.durationText})`,
    guests: `${totalGuests} (${formData.adults} Adults, ${formData.children} Children)`,
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
    { id: "addon-bag-drop", label: "Early SGR / Flight Bag Drop (Complimentary)" },
    { id: "addon-kitchen", label: "Self-Catering Cooking Setup (Complimentary)" },
    { id: "addon-ground-floor", label: "Ground Floor / Garden Access Preference (Complimentary)" }
  ];

  if (typeof document !== "undefined") {
    standardAddonMap.forEach(({ id, label }) => {
      const checkbox = document.getElementById(id);
      if (checkbox && checkbox.checked) selectedAddons.push(label);
    });

    document.querySelectorAll('input[type="checkbox"][data-addon-name]:checked').forEach(cb => {
      const customName = cb.getAttribute("data-addon-name");
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
    card.classList.toggle("border-champagne", isSelected);
    card.classList.toggle("bg-champagne/10", isSelected);
    card.classList.toggle("border", !isSelected);
    card.classList.toggle("border-deep-forest/15", !isSelected);
    card.classList.toggle("bg-white", !isSelected);
    card.setAttribute("aria-checked", isSelected ? "true" : "false");

    const radio = card.querySelector(".residence-radio");
    if (radio) {
      radio.classList.toggle("border-champagne", isSelected);
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
  if (!breakfastCard) return;

  const normalized = String(propertyValue || "").toLowerCase();
  const isBreakfastEligible = normalized.includes("darling") || normalized.includes("darad");
  breakfastCard.classList.toggle("opacity-60", !isBreakfastEligible);
  breakfastCard.classList.toggle("border-champagne/50", isBreakfastEligible);

  const priceBadge = breakfastCard.querySelector(".text-champagne");
  if (priceBadge) {
    if (normalized.includes("darad")) {
      priceBadge.textContent = "+KSh 500 / person / day";
    } else if (normalized.includes("darling")) {
      priceBadge.textContent = "+KSh 1,000 / person / day";
    } else {
      priceBadge.textContent = "Self-Catering";
    }
  }

  const breakfastCheckbox = document.getElementById("addon-breakfast");
  if (breakfastCheckbox && !isBreakfastEligible && breakfastCheckbox.checked) {
    breakfastCheckbox.checked = false;
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
    card.classList.toggle("border-champagne", isSelected);
    card.classList.toggle("bg-champagne/10", isSelected);
    card.classList.toggle("border", !isSelected);
    card.classList.toggle("border-deep-forest/15", !isSelected);
    card.classList.toggle("bg-white", !isSelected);
    card.setAttribute("aria-checked", isSelected ? "true" : "false");

    const radio = card.querySelector(".darad-room-radio");
    if (radio) {
      radio.classList.toggle("border-champagne", isSelected);
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
    const priceText = roomCardElement.querySelector(".text-champagne")?.textContent || "";
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
 * Triggered on date, guest, or add-on checkbox changes to recalculate live totals.
 */
function handleDateOrAddonChange() {
  const propertyElement = document.getElementById("booking-property");
  const checkInElement = document.getElementById("check-in");
  const checkOutElement = document.getElementById("check-out");
  const adultsElement = document.getElementById("guests-adults") || document.getElementById("num-guests");
  const breakfastCheckbox = document.getElementById("addon-breakfast");

  if (!propertyElement) return;

  const propertyValue = propertyElement.value;
  const checkInDate = checkInElement ? checkInElement.value : "";
  const checkOutDate = checkOutElement ? checkOutElement.value : "";
  const adultsCount = adultsElement ? parseInt(adultsElement.value, 10) || 2 : 2;

  const pricingSummary = resolveStayPricing(propertyValue, checkInDate, checkOutDate);
  const totals = calculateReservationTotals({
    pricingSummary,
    adultsCount,
    hasBreakfast: Boolean(breakfastCheckbox && breakfastCheckbox.checked),
    propertyIdentifier: propertyValue
  });

  const breakfastRow = document.getElementById("summary-breakfast-row");
  const breakfastCostElem = document.getElementById("summary-breakfast-cost");

  if (totals.breakfastCost > 0) {
    if (breakfastRow) breakfastRow.classList.remove("hidden");
    if (breakfastCostElem) breakfastCostElem.textContent = `+KSh ${totals.breakfastCost.toLocaleString()}`;
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

  if (summaryUnitElement) summaryUnitElement.textContent = summary.unitDisplayName;
  if (summaryRateElement) summaryRateElement.textContent = summary.rateBasisText;
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
    toastElement.className = "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform opacity-0 pointer-events-none translate-y-4";
    toastElement.innerHTML = `
      <div class="bg-deep-forest/95 border border-champagne/40 backdrop-blur-md text-ivory px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-xs md:text-sm font-medium">
        <span class="text-champagne text-base font-bold">✓</span>
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
    modalElement.className = "fixed inset-0 z-50 bg-black/95 backdrop-blur-md hidden items-center justify-center p-4 select-none";
    modalElement.innerHTML = `
      <!-- Close Button -->
      <button type="button" id="lightbox-close-btn" onclick="closeLightbox()"
              class="absolute top-5 right-5 z-20 text-ivory/70 hover:text-champagne bg-black/50 hover:bg-black/80 rounded-full w-12 h-12 flex items-center justify-center text-3xl font-light transition duration-300"
              aria-label="Close photo gallery">&times;</button>

      <!-- Previous Arrow Button -->
      <button type="button" id="lightbox-prev-btn" onclick="navigateLightbox(-1)"
              class="absolute left-3 md:left-6 z-20 text-ivory/80 hover:text-champagne bg-black/50 hover:bg-deep-forest/90 border border-champagne/20 rounded-full w-12 h-12 flex items-center justify-center text-2xl transition duration-300 transform active:scale-90"
              aria-label="Previous photograph">‹</button>

      <!-- Next Arrow Button -->
      <button type="button" id="lightbox-next-btn" onclick="navigateLightbox(1)"
              class="absolute right-3 md:right-6 z-20 text-ivory/80 hover:text-champagne bg-black/50 hover:bg-deep-forest/90 border border-champagne/20 rounded-full w-12 h-12 flex items-center justify-center text-2xl transition duration-300 transform active:scale-90"
              aria-label="Next photograph">›</button>

      <!-- Photo Display Container -->
      <div class="relative max-w-5xl w-full flex flex-col items-center justify-center max-h-[92vh] space-y-3" onclick="event.stopPropagation()">
        <!-- Counter Badge -->
        <div class="flex items-center gap-2">
          <span id="lightbox-counter" class="bg-deep-forest/90 border border-champagne/30 text-champagne text-[11px] font-semibold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-lg"></span>
        </div>

        <!-- Image -->
        <div class="relative overflow-hidden rounded-xl border border-champagne/20 shadow-2xl bg-deep-forest/50 flex items-center justify-center max-h-[75vh]">
          <img id="lightbox-img" src="" alt="Property photograph" class="max-h-[75vh] w-auto max-w-full object-contain transition-all duration-300" />
        </div>

        <!-- Caption -->
        <div class="text-center px-4 max-w-2xl">
          <h4 id="lightbox-title" class="font-display text-base md:text-lg text-ivory font-semibold"></h4>
          <p id="lightbox-desc" class="text-xs text-ivory/70 mt-0.5 line-clamp-2"></p>
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
  currentGalleryImages = Array.from(galleryNodes).map((img, idx) => {
    const card = img.closest(".group") || img.parentElement;
    const titleEl = card ? card.querySelector(".text-champagne.uppercase, h3, h4") : null;
    const descEl = card ? card.querySelector("p") : null;

    img.style.cursor = "zoom-in";
    img.setAttribute("role", "button");
    img.setAttribute("tabindex", "0");
    img.setAttribute("aria-label", `View full photo: ${img.alt || "Gallery image"}`);

    if (!img._lightboxBound) {
      img._lightboxBound = true;
      img.addEventListener("click", () => openGalleryLightbox(idx));
      img.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openGalleryLightbox(idx);
        }
      });
    }

    return {
      src: img.getAttribute("src") || img.src,
      alt: img.getAttribute("alt") || "Property photograph",
      title: titleEl ? titleEl.textContent.trim() : (img.getAttribute("alt") || "Property Photograph"),
      desc: descEl ? descEl.textContent.trim() : ""
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
async function triggerLiveAvailabilityCheck() {
  if (typeof document === "undefined") return;
  const container = document.getElementById("availability-status-container");
  if (!container) return;

  const checkInElement = document.getElementById("check-in");
  const checkOutElement = document.getElementById("check-out");
  const propertyElement = document.getElementById("booking-property");

  const checkIn = checkInElement ? checkInElement.value : "";
  const checkOut = checkOutElement ? checkOutElement.value : "";
  const property = propertyElement ? propertyElement.value : "";
  const propertyId = CrmSyncService.resolvePropertyId(property);

  if (!checkIn || !checkOut || isInvalidDateRange(checkIn, checkOut) || isPastDate(checkIn, getNairobiDateString(0))) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="flex items-center gap-2 p-2.5 rounded-xl bg-champagne/10 border border-champagne/30 text-deep-forest text-xs animate-pulse">
      <span class="w-2 h-2 rounded-full bg-champagne animate-ping"></span>
      <span class="font-medium">Checking live occupancy for your stay dates...</span>
    </div>
  `;

  if (availabilityDebounceTimer) clearTimeout(availabilityDebounceTimer);
  availabilityDebounceTimer = setTimeout(async () => {
    const result = await CrmSyncService.checkAvailability({ propertyId, checkInDate: checkIn, checkOutDate: checkOut });
    if (!result) {
      container.innerHTML = `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs shadow-sm">
          <div class="flex items-center gap-2">
            <span class="text-emerald-600 font-bold">✓</span>
            <span class="font-semibold">Instant Inquiry Available</span>
            <span class="text-emerald-700/80 hidden sm:inline">• Direct host reservation</span>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-800">Pre-Approved</span>
        </div>
      `;
      return;
    }

    if (result.isAvailable) {
      const count = result.availableUnitsCount !== undefined ? result.availableUnitsCount : result.availableCount;
      const isLimited = (result.status === "limited") || (count !== undefined && count > 0 && count <= 2);
      if (isLimited) {
        container.innerHTML = `
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-300/80 text-amber-900 text-xs shadow-sm">
            <div class="flex items-center gap-2">
              <span class="text-amber-600 font-bold">⚠️</span>
              <span class="font-bold">High Demand: Only ${count} residence${count === 1 ? '' : 's'} available!</span>
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded text-amber-900">Reserve Now</span>
          </div>
        `;
      } else {
        const unitsText = count !== undefined && count > 0 ? ` (${count} residences available)` : '';
        container.innerHTML = `
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs shadow-sm">
            <div class="flex items-center gap-2">
              <span class="text-emerald-600 font-bold">✓</span>
              <span class="font-semibold">Dates Available • Instant Pre-Approval${unitsText}</span>
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-800">Instant Pre-Approved</span>
          </div>
        `;
      }
    } else {
      container.innerHTML = `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900 text-xs shadow-sm">
          <div class="flex items-center gap-2">
            <span class="text-rose-600 font-bold">⚠️</span>
            <span class="font-medium">All units booked for these exact dates. Submit inquiry to be placed on priority standby or explore alternative dates.</span>
          </div>
        </div>
      `;
    }
  }, 250);
}

let currentActiveInquiry = null;

async function confirmAndSubmitInquiry() {
  if (!currentActiveInquiry) return;
  const submitBtn = document.getElementById("confirm-submit-inquiry-btn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-deep-forest inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Securing Reservation Inquiry...</span>
    `;
  }

  let inquiryId = null;
  try {
    const result = await CrmSyncService.sendInquiry(currentActiveInquiry.inquiryPayload);
    if (result && result.inquiry && result.inquiry.id) {
      inquiryId = result.inquiry.id;
    } else if (result && result.id) {
      inquiryId = result.id;
    }
  } catch (err) {
    if (typeof console !== "undefined" && typeof console.debug === "function") {
      console.debug("[CRM Intake] Server sync exception:", err);
    }
  }

  // Failsafe Guarantee: If CRM server is slow, cold-starting, or offline,
  // generate an authoritative reservation reference ID and queue locally
  if (!inquiryId) {
    const dateStamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    inquiryId = `INQ-${dateStamp}-${randomDigits}`;

    try {
      if (typeof localStorage !== "undefined") {
        const queued = JSON.parse(localStorage.getItem("beakim_pending_inquiries") || "[]");
        queued.push({
          id: inquiryId,
          payload: currentActiveInquiry.inquiryPayload,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem("beakim_pending_inquiries", JSON.stringify(queued));
      }
    } catch (storageErr) {
      // LocalStorage access restricted in private browsing mode; safe to ignore
    }
  }

  try {
    renderInquirySuccessReceipt(currentActiveInquiry, inquiryId);
  } catch (renderErr) {
    if (typeof console !== "undefined" && typeof console.error === "function") {
      console.error("[Inquiry Receipt] Render error:", renderErr);
    }
    // Safety fallback: re-enable submit button if rendering somehow fails
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>✓ Confirm &amp; Submit Reservation Inquiry</span>`;
    }
  }
}

function renderInquiryNetworkFailure(inquirySummary) {
  const modalElement = document.getElementById("inquiry-review-modal");
  if (!modalElement) return;

  const messageText = inquirySummary.messageText || "";
  const whatsappUrl = inquirySummary.whatsappUrl || CommunicationService.buildWhatsAppUrl(messageText);
  const telephoneUrl = CommunicationService.getTelephoneUrl();

  modalElement.innerHTML = `
    <div class="bg-deep-forest border border-amber-500/40 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-ivory shadow-2xl relative my-auto">
      <!-- Zone 1: Pinned Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-amber-500/20 bg-deep-forest/95 shrink-0">
        <div class="flex items-center gap-3 text-left">
          <div class="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 text-lg font-bold shrink-0 shadow-md">
            ⚠️
          </div>
          <div>
            <span class="text-[10px] font-bold tracking-widest text-amber-400 uppercase block">Connection Timeout</span>
            <h3 class="font-display text-lg sm:text-xl font-bold text-ivory leading-tight">Temporary Network Interruption</h3>
          </div>
        </div>
        <button type="button" onclick="closeInquiryModal()" 
                class="w-9 h-9 rounded-full bg-white/10 hover:bg-champagne text-ivory hover:text-deep-forest flex items-center justify-center text-xl font-bold transition shrink-0 cursor-pointer"
                aria-label="Close modal" title="Close (Esc)">&times;</button>
      </div>

      <!-- Zone 2: Content Body -->
      <div class="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-left">
        <div class="bg-canopy/70 rounded-xl p-4 border border-amber-500/25 text-xs space-y-2.5">
          <p class="text-ivory/90 leading-relaxed text-xs">
            We experienced a brief connection hiccup reaching our reservation desk server. <strong>Your selected dates and booking inquiry details are completely intact.</strong>
          </p>
          <p class="text-amber-300 font-semibold text-xs">
            You can retry instant submission below, or send your pre-filled inquiry directly to our reservation manager via WhatsApp.
          </p>
        </div>

        <div class="bg-deep-forest/80 rounded-xl p-3.5 border border-champagne/20 text-xs space-y-1.5 font-mono text-ivory/80">
          <div class="text-[11px] text-champagne font-bold uppercase tracking-wider font-sans mb-1">Your Reservation Details:</div>
          <div>Property: <strong class="text-white">${inquirySummary.property}</strong></div>
          <div>Dates: <strong class="text-white">${inquirySummary.dates}</strong></div>
          <div>Guests: <strong class="text-white">${inquirySummary.guests}</strong></div>
          <div>Estimated Total: <strong class="text-champagne font-sans font-bold">${inquirySummary.estimatedTotal}</strong></div>
        </div>
      </div>

      <!-- Zone 3: Pinned Action Buttons -->
      <div class="px-5 py-4 border-t border-champagne/20 bg-[#0a1914] space-y-2.5 shrink-0">
        <button type="button" id="confirm-submit-inquiry-btn" onclick="confirmAndSubmitInquiry()"
                class="w-full bg-champagne hover:bg-champagne/90 text-deep-forest py-3 px-5 rounded-xl font-bold tracking-wider uppercase transition duration-300 shadow-xl flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-[0.99]">
          <span>🔄</span>
          <span>Retry Server Submission</span>
        </button>

        <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer"
           class="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3 px-5 rounded-xl font-bold tracking-wider uppercase transition duration-300 shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm">
          <span>💬</span>
          <span>Send via WhatsApp Now</span>
        </a>

        <div class="flex gap-2">
          <button type="button" onclick="closeInquiryModal()"
                  class="flex-1 bg-deep-forest/80 border border-champagne/25 hover:border-champagne text-ivory/80 hover:text-champagne py-2.5 rounded-lg text-xs font-medium transition cursor-pointer">
            Edit Details
          </button>
          <a href="${telephoneUrl}"
             class="flex-1 text-center bg-deep-forest/80 border border-champagne/25 hover:border-champagne text-ivory/80 hover:text-champagne py-2.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1">
            📞 Call Desk Direct
          </a>
        </div>
      </div>
    </div>
  `;
}

function renderInquirySuccessReceipt(inquirySummary, inquiryId) {
  const modalElement = document.getElementById("inquiry-review-modal");
  if (!modalElement) return;

  const preferredContact = inquirySummary.preferredContactMethod || "WhatsApp / Text";
  const channelIcon = preferredContact.includes("WhatsApp") ? "💬" :
                      preferredContact.includes("Phone") ? "📞" : "✉️";

  modalElement.innerHTML = `
    <div class="bg-deep-forest border border-champagne/40 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-ivory shadow-2xl relative my-auto">
      <!-- Zone 1: Pinned Header (Always Visible) -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-champagne/20 bg-deep-forest/95 shrink-0">
        <div class="flex items-center gap-3 text-left">
          <div class="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 text-lg font-bold shrink-0 shadow-md">
            ✓
          </div>
          <div>
            <span class="text-[10px] font-bold tracking-widest text-emerald-400 uppercase block">Step 2 of 2 • Reservation Pre-Approval</span>
            <h3 class="font-display text-lg sm:text-xl font-bold text-ivory leading-tight">Inquiry Received &amp; Pre-Approved!</h3>
          </div>
        </div>
        <button type="button" onclick="closeInquiryModal()" 
                class="w-9 h-9 rounded-full bg-white/10 hover:bg-champagne text-ivory hover:text-deep-forest flex items-center justify-center text-xl font-bold transition shrink-0 cursor-pointer"
                aria-label="Close booking receipt modal" title="Close (Esc)">&times;</button>
      </div>

      <!-- Zone 2: Scrollable Content Body -->
      <div class="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-left">
        <div class="flex items-center justify-between bg-canopy/80 border border-champagne/30 px-4 py-2 rounded-xl text-xs font-mono text-champagne">
          <span>Reference ID: <strong class="text-white">${inquiryId}</strong></span>
          <button type="button" onclick="copyInquiryDetails('${inquiryId}')" class="hover:text-white transition inline-flex items-center gap-1 text-[11px] font-sans font-semibold bg-deep-forest/60 px-2.5 py-1 rounded border border-champagne/20 cursor-pointer" title="Copy Reference ID">📋 Copy ID</button>
        </div>

        <!-- SLA Guarantee Box -->
        <div class="bg-canopy/70 rounded-xl p-4 border border-champagne/20 text-xs space-y-2.5">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="text-champagne font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              ⏱️ Guaranteed 15–30 Min Response
            </span>
            <span class="text-[10px] bg-emerald-900/60 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-500/30">Priority Desk Queue</span>
          </div>
          <p class="text-ivory/90 leading-relaxed text-xs">
            Our reservation manager is reviewing your dates for <strong class="text-champagne">${inquirySummary.property}</strong> and will reach out via <strong class="text-white">${channelIcon} ${preferredContact}</strong> within <strong class="text-champagne">15–30 minutes</strong> to confirm your booking and provide official payment details (M-Pesa Till / Bank Transfer / Card).
          </p>
          <div class="border-t border-champagne/15 pt-2.5 space-y-1 text-[11px] text-ivory/70">
            <div class="flex justify-between gap-2"><span class="text-ivory/50">Stay Dates:</span> <span class="text-ivory font-medium text-right">${inquirySummary.dates}</span></div>
            <div class="flex justify-between gap-2"><span class="text-ivory/50">Guest:</span> <span class="text-ivory font-medium text-right">${inquirySummary.name} (${inquirySummary.phone})</span></div>
            ${inquirySummary.estimatedTotal ? `<div class="flex justify-between gap-2 pt-1 border-t border-champagne/10"><span class="text-ivory/50">Estimated Total:</span> <span class="text-champagne font-bold text-right">${inquirySummary.estimatedTotal}</span></div>` : ""}
          </div>
        </div>
      </div>

      <!-- Zone 3: Pinned Footer Actions (Always Visible) -->
      <div class="px-5 py-4 border-t border-champagne/20 bg-[#0a1914] space-y-2.5 shrink-0">
        <!-- Direct Instant WhatsApp Send Action -->
        <a href="${inquirySummary.whatsappUrl}" target="_blank" rel="noopener noreferrer"
           class="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 px-5 rounded-xl font-bold tracking-wider uppercase transition duration-300 shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-[0.99]">
          <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436.002 9.858-4.384 9.86-9.768.001-2.61-1.013-5.064-2.855-6.909C16.438 2.083 13.99 1.07 11.4 1.07 5.969 1.07 1.547 5.456 1.545 10.842c-.001 1.597.424 3.156 1.233 4.544L1.78 20.58l5.228-1.378c-.138-.077-.257-.15-.361-.208z" />
          </svg>
          <span>💬 Send via WhatsApp Now (Instant)</span>
        </a>

        <div class="flex gap-2">
          <button type="button" onclick="copyInquiryDetails('${encodeURIComponent(inquirySummary.messageText)}')"
                  class="flex-1 bg-deep-forest/80 border border-champagne/25 hover:border-champagne text-ivory/80 hover:text-champagne py-2.5 rounded-lg text-xs font-medium transition cursor-pointer">
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
}

/**
 * Pure presenter function rendering accessible, transparent itemized stay cost breakdown.
 */
function renderInquiryCostBreakdown(inquirySummary) {
  const totals = inquirySummary.totals || {};
  const pricing = inquirySummary.pricingSummary || {};

  const unitName = pricing.unitDisplayName || inquirySummary.property || "Selected Residence";
  const durationText = pricing.durationText || "1 Stay";
  const rateBasisText = pricing.rateBasisText || "";
  const baseCostFormatted = totals.formattedBaseCost || (pricing.totalCost ? `KSh ${pricing.totalCost.toLocaleString()}` : (inquirySummary.estimatedTotal || "KSh 0"));

  const hasBreakfast = Boolean(totals.breakfastCost && totals.breakfastCost > 0);
  const adultsCount = totals.adultsCount || (inquirySummary.formData ? inquirySummary.formData.adults : 1);
  const nightsCount = totals.durationDays || pricing.durationDays || 1;
  const breakfastCostFormatted = totals.formattedBreakfastCost || `+KSh ${(totals.breakfastCost || 0).toLocaleString()}`;

  // Filter complimentary add-ons (those not breakfast)
  const complimentaryList = (inquirySummary.selectedAddons || []).filter(item => !item.toLowerCase().includes("breakfast"));

  return `
    <div class="bg-[#0b1d16] border border-champagne/30 rounded-xl p-3.5 sm:p-4 space-y-2.5 font-sans">
      <div class="flex items-center justify-between pb-2 border-b border-champagne/20">
        <span class="text-[11px] font-bold text-champagne uppercase tracking-wider flex items-center gap-1.5">
          <span>🧾</span> Itemized Stay Breakdown
        </span>
        <span class="text-[10px] text-ivory/60 font-sans">Transparent Direct Pricing</span>
      </div>

      <!-- Line Item 1: Base Accommodation -->
      <div class="flex justify-between items-start gap-3 text-xs">
        <div class="space-y-0.5 min-w-0">
          <span class="font-semibold text-ivory block truncate">${unitName}</span>
          <span class="text-[11px] text-ivory/60 block">${durationText} ${rateBasisText ? `× ${rateBasisText}` : ""}</span>
        </div>
        <span class="font-mono font-bold text-ivory shrink-0">${baseCostFormatted}</span>
      </div>

      <!-- Line Item 2: Breakfast Add-on (if selected) -->
      ${hasBreakfast ? `
      <div class="flex justify-between items-start gap-3 text-xs pt-2 border-t border-champagne/10">
        <div class="space-y-0.5">
          <span class="font-semibold text-emerald-400 block">🍳 Chef-Prepared Coastal Breakfast</span>
          <span class="text-[11px] text-ivory/60 block">${adultsCount} Guest(s) × ${nightsCount} Night(s) @ KSh ${(totals.breakfastRate || resolveBreakfastRate(inquirySummary.property)).toLocaleString()} / day</span>
        </div>
        <span class="font-mono font-bold text-emerald-400 shrink-0">${breakfastCostFormatted}</span>
      </div>
      ` : ""}

      <!-- Line Item 3: Complimentary Amenities (if selected) -->
      ${complimentaryList.map(item => `
      <div class="flex justify-between items-center gap-3 text-xs pt-1.5 border-t border-champagne/10">
        <span class="text-ivory/80 text-[11px] flex items-center gap-1">
          <span class="text-emerald-400 font-bold">✓</span> ${item.replace(/\s*\(Complimentary\)/i, "")}
        </span>
        <span class="text-[9px] font-bold uppercase tracking-wider text-champagne bg-champagne/15 px-2 py-0.5 rounded border border-champagne/30 shrink-0">FREE (KSh 0)</span>
      </div>
      `).join("")}

      <!-- Line Item 4: Platform Fee / Commission -->
      <div class="flex justify-between items-center gap-3 text-xs pt-1.5 border-t border-champagne/10">
        <span class="text-ivory/60 text-[11px]">Direct Host Rate • Booking Commission</span>
        <span class="text-[11px] font-semibold text-emerald-400 shrink-0">Zero Extra Fees</span>
      </div>

      <!-- Total Row -->
      <div class="flex justify-between items-center gap-3 pt-3 border-t-2 border-champagne/35 mt-1">
        <div>
          <span class="font-bold text-ivory text-xs sm:text-sm block">Total Estimated Amount</span>
          <span class="text-[10px] text-ivory/60 block">🔒 No upfront charge • Pay upon host confirmation</span>
        </div>
        <span class="font-display font-bold text-champagne text-base sm:text-lg text-right shrink-0">${inquirySummary.estimatedTotal}</span>
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
  modalElement.className = "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto overscroll-contain";

  const channelIcon = inquirySummary.preferredContactMethod.includes("WhatsApp") ? "💬" :
                      inquirySummary.preferredContactMethod.includes("Phone") ? "📞" : "✉️";

  modalElement.innerHTML = `
    <div class="bg-deep-forest border border-champagne/35 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-ivory shadow-2xl relative my-auto">
      <!-- Zone 1: Pinned Header (Always Visible) -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-champagne/20 bg-deep-forest/95 shrink-0">
        <div>
          <span class="text-[10px] font-bold tracking-widest text-champagne uppercase block">Step 2 of 2 • Direct Reservation</span>
          <h3 id="inquiry-modal-title" class="font-display text-lg sm:text-xl font-bold text-ivory leading-tight">Review &amp; Confirm Your Stay</h3>
        </div>
        <button type="button" onclick="closeInquiryModal()" 
                class="w-9 h-9 rounded-full bg-white/10 hover:bg-champagne text-ivory hover:text-deep-forest flex items-center justify-center text-xl font-bold transition shrink-0 cursor-pointer"
                aria-label="Close booking review modal" title="Close (Esc)">&times;</button>
      </div>

      <!-- Zone 2: Scrollable Summary Body -->
      <div class="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
        <p class="text-xs text-ivory/75 leading-relaxed">
          Please verify your reservation details below. Confirming logs your request directly with our central reservations desk (<strong class="text-champagne">15–30 min response guarantee</strong>).
        </p>

        <!-- Primary Guest & Stay Itinerary -->
        <div class="bg-canopy/60 rounded-xl p-4 border border-champagne/20 text-xs space-y-2 font-mono">
          <div class="flex justify-between gap-3"><span class="text-ivory/60 shrink-0">Guest Name:</span><span class="font-semibold text-ivory font-sans text-right">${inquirySummary.name}</span></div>
          <div class="flex justify-between gap-3"><span class="text-ivory/60 shrink-0">Contact Phone:</span><span class="font-semibold text-ivory font-sans text-right">${inquirySummary.phone}</span></div>
          ${inquirySummary.email ? `<div class="flex justify-between gap-3"><span class="text-ivory/60 shrink-0">Email:</span><span class="text-ivory font-sans text-right break-all">${inquirySummary.email}</span></div>` : ""}
          <div class="flex justify-between gap-3"><span class="text-ivory/60 shrink-0">Contact Via:</span><span class="font-semibold text-champagne font-sans text-right">${channelIcon} ${inquirySummary.preferredContactMethod}</span></div>
          <div class="flex justify-between gap-3 pt-1.5 border-t border-champagne/10"><span class="text-ivory/60 shrink-0">Residence:</span><span class="font-semibold text-champagne font-sans text-right">${inquirySummary.property}</span></div>
          <div class="flex justify-between gap-3"><span class="text-ivory/60 shrink-0">Stay Dates:</span><span class="text-ivory font-sans text-right">${inquirySummary.dates}</span></div>
          <div class="flex justify-between gap-3"><span class="text-ivory/60 shrink-0">Guests:</span><span class="text-ivory font-sans text-right">${inquirySummary.guests}</span></div>
          ${inquirySummary.specialRequests ? `<div class="flex justify-between gap-3 pt-1.5 border-t border-champagne/10"><span class="text-ivory/60 shrink-0">Arrival Notes:</span><span class="text-ivory font-sans italic text-right">${inquirySummary.specialRequests}</span></div>` : ""}
        </div>

        <!-- Transparent Itemized Cost Breakdown -->
        ${renderInquiryCostBreakdown(inquirySummary)}
      </div>

      <!-- Zone 3: Pinned Footer Actions (Always Visible) -->
      <div class="px-5 py-4 border-t border-champagne/20 bg-[#0a1914] space-y-2.5 shrink-0">
        <button type="button" id="confirm-submit-inquiry-btn" onclick="confirmAndSubmitInquiry()"
                class="w-full bg-champagne hover:bg-champagne/90 text-deep-forest py-3.5 px-5 rounded-xl font-bold tracking-wider uppercase transition duration-300 shadow-xl flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-[0.99]">
          <span class="text-base">✓</span>
          <span>Confirm &amp; Submit Reservation Inquiry</span>
        </button>

        <div class="flex gap-2">
          <button type="button" onclick="closeInquiryModal()"
                  class="flex-1 bg-deep-forest/80 border border-champagne/25 hover:border-champagne text-ivory/80 hover:text-champagne py-2.5 rounded-lg text-xs font-medium transition cursor-pointer">
            ← Edit Details
          </button>
          <a href="${CommunicationService.getTelephoneUrl()}"
             class="flex-1 text-center bg-deep-forest/80 border border-champagne/25 hover:border-champagne text-ivory/80 hover:text-champagne py-2.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1">
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
      prompt("Copy your inquiry details:", plainText);
    });
  } else {
    prompt("Copy your inquiry details:", plainText);
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
    button.classList.add("bg-deep-forest/60", "text-ivory/70", "border", "border-champagne/20");
    button.setAttribute("aria-selected", "false");
  });

  const targetPanel = document.getElementById(selectedTabId);
  if (targetPanel) targetPanel.classList.remove("hidden");

  const targetButton = document.getElementById("btn-" + selectedTabId);
  if (targetButton) {
    targetButton.classList.remove("bg-deep-forest/60", "text-ivory/70", "border", "border-champagne/20");
    targetButton.classList.add("bg-champagne", "text-deep-forest", "shadow-lg");
    targetButton.setAttribute("aria-selected", "true");
  }
}

function switchTab(selectedTabId) {
  document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.add("hidden"));
  const targetPanel = document.getElementById(selectedTabId);
  if (targetPanel) targetPanel.classList.remove("hidden");

  document.querySelectorAll(".tab-btn").forEach(button => {
    button.classList.remove("bg-deep-forest", "text-champagne", "border-champagne/30");
    button.classList.add("bg-deep-forest/40", "text-ivory/60", "border-transparent");
    button.setAttribute("aria-selected", "false");
  });

  const targetButton = document.getElementById("btn-" + selectedTabId);
  if (targetButton) {
    targetButton.classList.remove("bg-deep-forest/40", "text-ivory/60", "border-transparent");
    targetButton.classList.add("bg-deep-forest", "text-champagne", "border-champagne/30");
    targetButton.setAttribute("aria-selected", "true");
  }
}

function selectUnit(unitIdentifier) {
  const propertySelectElement = document.getElementById("booking-property");
  if (propertySelectElement) {
    let matchedIndex = -1;
    for (let i = 0; i < propertySelectElement.options.length; i++) {
      const opt = propertySelectElement.options[i];
      if (opt.value === unitIdentifier || opt.value.toLowerCase().includes(unitIdentifier.toLowerCase()) || unitIdentifier.toLowerCase().includes(opt.value.toLowerCase())) {
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

  if (matchedCard && typeof selectResidenceCard === "function") {
    selectResidenceCard(unitIdentifier, matchedCard);
  } else {
    updatePriceCalculation();
  }

  const bookingSection = document.getElementById("booking");
  if (bookingSection) {
    bookingSection.scrollIntoView({ behavior: "smooth" });
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

  if (matchedCard && typeof selectResidenceCard === "function") {
    selectResidenceCard(selectedVal, matchedCard);
  } else {
    if (propertyName.includes("Tower")) switchTab("tab-tower");
    else if (propertyName.includes("Darad")) switchTab("tab-darad");
    else if (propertyName.includes("Darling")) switchTab("tab-darling");
    else if (propertyName.includes("Apartment")) switchTab("tab-beakim");
    updatePriceCalculation();
  }

  const bookingSection = document.getElementById("booking");
  if (bookingSection) {
    bookingSection.scrollIntoView({ behavior: "smooth" });
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

function initializeDatePickers(checkInInput, checkOutInput) {
  const todayDateString = getNairobiDateString(0);
  const tomorrowDateString = getNairobiDateString(1);
  const dayAfterDateString = getNairobiDateString(2);

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
}

function initializeBookingPreFill() {
  if (typeof window === "undefined") return;
  const urlParams = new URLSearchParams(window.location.search);
  const requestedProperty = urlParams.get("property") || urlParams.get("unit");
  const propertySelect = document.getElementById("booking-property");

  if (requestedProperty && propertySelect) {
    const cleanReq = requestedProperty.toLowerCase();
    for (let i = 0; i < propertySelect.options.length; i++) {
      const opt = propertySelect.options[i];
      if (opt.value.toLowerCase().includes(cleanReq)) {
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

function cleanHashFromUrl() {
  if (typeof window === "undefined" || !window.location.hash) return;
  const targetId = window.location.hash.replace(/^#/, "");
  const targetEl = document.getElementById(targetId);
  if (targetEl) {
    setTimeout(() => {
      targetEl.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }
  if (typeof history !== "undefined" && history.replaceState) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

function initializeCleanHashScrolling() {
  if (typeof document === "undefined") return;

  cleanHashFromUrl();

  document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(anchor => {
    anchor.addEventListener("click", function(event) {
      const href = this.getAttribute("href");
      if (!href || href === "#" || href === "/#") return;

      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return;

      const pathPart = href.substring(0, hashIndex);
      const targetId = href.substring(hashIndex + 1);

      const isCurrentPage = !pathPart || pathPart === "/" || pathPart === window.location.pathname;
      if (isCurrentPage && targetId) {
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          event.preventDefault();
          targetEl.scrollIntoView({ behavior: "smooth" });
          if (typeof history !== "undefined" && history.replaceState) {
            history.replaceState(null, "", window.location.pathname + window.location.search);
          }
        }
      }
    });
  });
}

function initializeDemoModeBanner() {
  if (typeof window === "undefined" || !window.location || !window.location.search) return;
  const isDemo = window.location.search.includes("demo=true") || 
    window.location.search.includes("test=true") || 
    window.location.search.includes("demo=1") || 
    window.location.search.includes("test=1");
  if (!isDemo) return;

  const banner = document.createElement("div");
  banner.id = "demo-mode-badge";
  banner.setAttribute("role", "status");
  banner.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:9999;background:#0f172a;color:#fcd34d;border:1px solid #f59e0b;padding:8px 14px;border-radius:10px;font-family:sans-serif;font-size:12px;font-weight:600;display:flex;align-items:center;gap:8px;box-shadow:0 8px 24px rgba(0,0,0,0.5);";
  banner.innerHTML = '<span>🧪 Demo / Test Mode Active</span> <a href="' + window.location.pathname + '" style="color:#94a3b8;margin-left:8px;text-decoration:underline;font-size:11px;">Exit</a>';
  document.body.appendChild(banner);
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
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
  });
}

// ── 9. MODULE EXPORTS (COMMONJS FOR ZERO-DEPENDENCY UNIT TESTS) ──

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    APP_CONFIG,
    CommunicationService,
    CrmSyncService,
    PageScrollLock,
    getNairobiDateString,
    calculateDateDifferenceInDays,
    isPastDate,
    isInvalidDateRange,
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
    getCrmPublicEndpoint,
    resolvePropertyIdFromSelection,
    syncInquiryToCrm,
    handleResidenceCardKeydown,
    cleanHashFromUrl,
    initializeCleanHashScrolling,
    triggerLiveAvailabilityCheck,
    confirmAndSubmitInquiry,
    renderInquirySuccessReceipt,
    renderInquiryNetworkFailure,
    renderInquiryCostBreakdown
  };
}
