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
    EMAIL: "info@beakimhospitality.com"
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

  getTelephoneUrl() {
    return `tel:+${APP_CONFIG.CONTACT.PHONE_RAW}`;
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
    if (propertyIdentifier.includes("Without AC")) {
      rate = 2000;
    } else if (propertyIdentifier.includes("Deluxe Studio") && propertyIdentifier.includes("Darad")) {
      rate = 3000;
    } else if (propertyIdentifier.includes("1-Bedroom Cottage") && propertyIdentifier.includes("Darad")) {
      rate = 4000;
    } else if (propertyIdentifier.includes("Diani Darling")) {
      rate = 5000;
    } else if (propertyIdentifier.includes("1-Bedroom") && propertyIdentifier.includes("Apartment")) {
      rate = 15000;
      isMonthly = true;
    } else if (propertyIdentifier.includes("2-Bedroom") && propertyIdentifier.includes("Apartment")) {
      rate = 25000;
      isMonthly = true;
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
function buildInquiryMessage({ guestName, contactPhone, guestEmail, propertyName, checkInDate, checkOutDate, stayDurationText, adultsCount, childrenCount, estimatedTotal, selectedAddons = [], specialRequests = "" }) {
  const emailLine = guestEmail ? `• Email: ${guestEmail}\n` : "";
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
 * Backward-compatible alias for cottage-specific booking forms.
 */
function handleCottageSubmit(event) {
  return handleBookingSubmit(event);
}

/**
 * Resolves the Beakim CRM public intake API base endpoint based on active runtime hostname.
 */
function getCrmPublicEndpoint() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:3005/api/public/inquiries";
    }
  }
  return "https://beakim-crm.vercel.app/api/public/inquiries";
}

/**
 * Maps property name or dropdown selection to authoritative CRM propertyId.
 */
function resolvePropertyIdFromSelection(selection) {
  const str = String(selection || "").toLowerCase();
  if (str.includes("tower")) return "prop-4";
  if (str.includes("darling")) return "prop-3";
  if (str.includes("darad")) return "prop-2";
  if (str.includes("apartment")) return "prop-1";
  return "prop-2";
}

/**
 * Transmits website booking inquiry asynchronously to Beakim CRM in background.
 * Guaranteed non-blocking with 3.5s timeout so WhatsApp modal is never delayed.
 */
async function syncInquiryToCrm(inquiryPayload) {
  try {
    const endpoint = getCrmPublicEndpoint();
    let controller = null;
    let timeoutId = null;

    if (typeof AbortController !== "undefined") {
      controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 3500);
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
      const data = await response.json();
      return data;
    }
  } catch (err) {
    // Non-fatal: Guest continues to WhatsApp without interruption
  }
  return null;
}

/**
 * Primary booking inquiry form submit handler.
 * Validates, serializes, transmits background sync to CRM, and displays WhatsApp review modal.
 */
function handleBookingSubmit(event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  const submitBtn = event && event.target && typeof event.target.querySelector === "function"
    ? event.target.querySelector('button[type="submit"]')
    : document.querySelector('#booking-form button[type="submit"], #btn-submit-booking');

  if (submitBtn && submitBtn.disabled) return;

  const formData = extractBookingFormData();
  const validationError = validateBookingFormData(formData);
  if (validationError) {
    if (typeof showToast === "function") {
      showToast(validationError.message, 4500);
    } else {
      alert(validationError.message);
    }
    if (validationError.fieldElement && typeof validationError.fieldElement.focus === "function") {
      validationError.fieldElement.focus();
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-busy", "true");
    submitBtn.classList.add("opacity-75", "cursor-wait");
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.removeAttribute("aria-busy");
      submitBtn.classList.remove("opacity-75", "cursor-wait");
    }, 1800);
  }

  const pricingSummary = resolveStayPricing(formData.property, formData.checkIn, formData.checkOut);
  const normalizedPhone = normalizeKenyanPhoneNumber(formData.countryCode, formData.phoneNumber);
  const formattedContactPhone = `${formData.countryCode} ${normalizedPhone}`;
  const totalGuests = formData.adults + formData.children;

  let breakfastTotal = 0;
  if (formData.hasBreakfast && pricingSummary.durationDays > 0) {
    breakfastTotal = 1000 * formData.adults * pricingSummary.durationDays;
  }
  const grandTotal = pricingSummary.totalCost + breakfastTotal;
  const formattedGrandTotal = pricingSummary.isValidRange ? `KSh ${grandTotal.toLocaleString()}` : pricingSummary.formattedTotal;

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
    estimatedTotal: formattedGrandTotal,
    selectedAddons: formData.selectedAddons || [],
    specialRequests: formData.specialRequests || ""
  });

  const whatsappUrl = CommunicationService.buildWhatsAppUrl(messageText);

  // Background non-blocking sync directly to Beakim CRM
  const inquiryPayload = {
    guestName: formData.name,
    guestPhone: formattedContactPhone,
    guestEmail: formData.email,
    propertyName: formData.property,
    propertyId: resolvePropertyIdFromSelection(formData.property),
    unitPreference: formData.property,
    checkInDate: formData.checkIn,
    checkOutDate: formData.checkOut,
    adults: formData.adults,
    children: formData.children,
    estimatedTotal: grandTotal || 0,
    selectedAddons: formData.selectedAddons || [],
    specialRequests: formData.specialRequests || "",
    channel: "website_whatsapp",
    sourceUrl: typeof window !== "undefined" ? window.location.href : "",
    hp_field: formData.honeypot || ""
  };
  syncInquiryToCrm(inquiryPayload);

  showInquiryReviewModal({
    name: formData.name,
    phone: formattedContactPhone,
    property: formData.property,
    dates: `${formData.checkIn} to ${formData.checkOut} (${pricingSummary.durationText})`,
    guests: `${totalGuests} (${formData.adults} Adults, ${formData.children} Children)`,
    estimatedTotal: formattedGrandTotal,
    selectedAddons: formData.selectedAddons || [],
    whatsappUrl,
    messageText
  });
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

  // Curated Add-ons extraction
  const breakfastCheckbox = document.getElementById("addon-breakfast");
  const bagDropCheckbox = document.getElementById("addon-bag-drop");
  const parkingCheckbox = document.getElementById("addon-parking");
  const taxiCheckbox = document.getElementById("addon-taxi");

  const selectedAddons = [];
  const durationDays = calculateDateDifferenceInDays(checkInElement ? checkInElement.value : "", checkOutElement ? checkOutElement.value : "");
  const validNights = durationDays > 0 ? durationDays : 1;

  if (breakfastCheckbox && breakfastCheckbox.checked) {
    const breakfastTotal = 1000 * adultsCount * validNights;
    selectedAddons.push(`Chef-Prepared Coastal Breakfast: ${adultsCount} Guest(s) × ${validNights} Night(s) (+KSh ${breakfastTotal.toLocaleString()})`);
  }
  if (bagDropCheckbox && bagDropCheckbox.checked) {
    selectedAddons.push("Early SGR / Flight Bag Drop (Complimentary)");
  }
  if (parkingCheckbox && parkingCheckbox.checked) {
    selectedAddons.push("Reserved Gated Compound Parking (Complimentary)");
  }
  if (taxiCheckbox && taxiCheckbox.checked) {
    selectedAddons.push("SGR / Airport Taxi Driver Coordination (Direct Local Rate)");
  }

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
    hasBreakfast: breakfastCheckbox ? breakfastCheckbox.checked : false,
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
 * Selects an interactive residence card in the 2-column booking form.
 */
function selectResidenceCard(propertyValue, cardElement) {
  if (typeof document === "undefined") return;
  const propertySelectElement = document.getElementById("booking-property");
  if (propertySelectElement) {
    let matchedIndex = -1;
    for (let i = 0; i < propertySelectElement.options.length; i++) {
      const opt = propertySelectElement.options[i];
      if (opt.value === propertyValue || opt.value.toLowerCase().includes(propertyValue.toLowerCase()) || propertyValue.toLowerCase().includes(opt.value.toLowerCase())) {
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

  const allCards = document.querySelectorAll(".residence-card");
  allCards.forEach(card => {
    card.classList.remove("border-2", "border-champagne", "bg-champagne/10");
    card.classList.add("border", "border-deep-forest/15", "bg-white");
    card.setAttribute("aria-checked", "false");
    const radio = card.querySelector(".residence-radio");
    if (radio) {
      radio.classList.remove("border-champagne", "bg-champagne");
      radio.classList.add("border-deep-forest/30", "bg-transparent");
      const dot = radio.querySelector("div");
      if (dot) dot.classList.add("opacity-0");
    }
  });

  if (cardElement) {
    cardElement.classList.remove("border", "border-deep-forest/15", "bg-white");
    cardElement.classList.add("border-2", "border-champagne", "bg-champagne/10");
    cardElement.setAttribute("aria-checked", "true");
    const activeRadio = cardElement.querySelector(".residence-radio");
    if (activeRadio) {
      activeRadio.classList.remove("border-deep-forest/30", "bg-transparent");
      activeRadio.classList.add("border-champagne", "bg-champagne");
      const dot = activeRadio.querySelector("div");
      if (dot) dot.classList.remove("opacity-0");
    }
  }

  const breakfastCard = document.getElementById("addon-card-breakfast");
  const isDianiDarling = propertyValue.toLowerCase().includes("darling");
  if (breakfastCard) {
    if (isDianiDarling) {
      breakfastCard.classList.remove("opacity-60");
      breakfastCard.classList.add("border-champagne/50");
    } else {
      breakfastCard.classList.add("opacity-60");
      breakfastCard.classList.remove("border-champagne/50");
    }
  }

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
  const durationDays = pricingSummary.durationDays > 0 ? pricingSummary.durationDays : 0;

  let breakfastTotal = 0;
  const breakfastRow = document.getElementById("summary-breakfast-row");
  const breakfastCostElem = document.getElementById("summary-breakfast-cost");

  if (breakfastCheckbox && breakfastCheckbox.checked && durationDays > 0) {
    breakfastTotal = 1000 * adultsCount * durationDays;
    if (breakfastRow) breakfastRow.classList.remove("hidden");
    if (breakfastCostElem) breakfastCostElem.textContent = `+KSh ${breakfastTotal.toLocaleString()}`;
  } else {
    if (breakfastRow) breakfastRow.classList.add("hidden");
  }

  const finalTotal = pricingSummary.totalCost + breakfastTotal;
  const formattedFinalTotal = pricingSummary.isValidRange ? `KSh ${finalTotal.toLocaleString()}` : pricingSummary.formattedTotal;

  renderPriceSummary({
    ...pricingSummary,
    totalCost: finalTotal,
    formattedTotal: formattedFinalTotal
  });
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
function showToast(messageText, durationMs = 3500) {
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
  document.body.style.overflow = "hidden";
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
    document.body.style.overflow = "hidden";
  }
}

function closeLightbox() {
  const modalElement = document.getElementById("lightbox-modal");
  if (modalElement && !modalElement.classList.contains("hidden")) {
    modalElement.classList.add("hidden");
    modalElement.classList.remove("flex");
    modalElement.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }
}

function showInquiryReviewModal(inquirySummary) {
  let modalElement = document.getElementById("inquiry-review-modal");
  if (!modalElement) {
    modalElement = document.createElement("div");
    modalElement.id = "inquiry-review-modal";
    modalElement.className = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm";
    modalElement.setAttribute("role", "dialog");
    modalElement.setAttribute("aria-modal", "true");
    modalElement.setAttribute("aria-labelledby", "inquiry-modal-title");
    document.body.appendChild(modalElement);
  }

  modalElement.innerHTML = `
    <div class="bg-deep-forest border border-champagne/30 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 text-ivory shadow-2xl relative">
      <button type="button" onclick="closeInquiryModal()" 
              class="absolute top-4 right-4 text-ivory/60 hover:text-champagne text-2xl transition"
              aria-label="Close booking review modal">&times;</button>
      
      <div class="text-center space-y-2">
        <span class="text-xs font-semibold tracking-widest text-champagne uppercase">Booking Inquiry Ready</span>
        <h3 id="inquiry-modal-title" class="font-display text-2xl font-bold text-ivory">Send Your Inquiry</h3>
        <p class="text-xs text-ivory/70">Review your stay details below. Your reservation request will open directly in WhatsApp for prompt confirmation by our management team.</p>
      </div>

      <div class="bg-canopy/60 rounded-xl p-4 border border-champagne/15 text-xs space-y-2 font-mono">
        <div class="flex justify-between"><span class="text-ivory/60">Guest:</span><span class="font-semibold text-ivory">${inquirySummary.name}</span></div>
        <div class="flex justify-between"><span class="text-ivory/60">Phone:</span><span class="font-semibold text-ivory">${inquirySummary.phone}</span></div>
        <div class="flex justify-between"><span class="text-ivory/60">Property:</span><span class="font-semibold text-champagne">${inquirySummary.property}</span></div>
        <div class="flex justify-between"><span class="text-ivory/60">Dates:</span><span class="text-ivory">${inquirySummary.dates}</span></div>
        <div class="flex justify-between"><span class="text-ivory/60">Guests:</span><span class="text-ivory">${inquirySummary.guests}</span></div>
        ${inquirySummary.estimatedTotal ? `<div class="flex justify-between border-t border-champagne/15 pt-2"><span class="text-ivory/60">Est. Total:</span><span class="font-bold text-champagne text-sm">${inquirySummary.estimatedTotal}</span></div>` : ""}
      </div>

      <div class="space-y-3">
        <a href="${inquirySummary.whatsappUrl}" target="_blank" rel="noopener noreferrer"
           class="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 px-6 rounded-lg font-semibold tracking-wider uppercase transition duration-300 shadow-xl flex items-center justify-center gap-2 text-xs md:text-sm">
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436.002 9.858-4.384 9.86-9.768.001-2.61-1.013-5.064-2.855-6.909C16.438 2.083 13.99 1.07 11.4 1.07 5.969 1.07 1.547 5.456 1.545 10.842c-.001 1.597.424 3.156 1.233 4.544L1.78 20.58l5.228-1.378c-.138-.077-.257-.15-.361-.208z" />
          </svg>
          Continue to WhatsApp
        </a>

        <div class="flex gap-2">
          <button type="button" onclick="copyInquiryDetails('${encodeURIComponent(inquirySummary.messageText)}')"
                  class="flex-1 bg-deep-forest/80 border border-champagne/20 hover:border-champagne text-ivory/80 hover:text-champagne py-2.5 rounded text-xs transition">
            📋 Copy Details
          </button>
          <a href="${CommunicationService.getTelephoneUrl()}"
             class="flex-1 text-center bg-deep-forest/80 border border-champagne/20 hover:border-champagne text-ivory/80 hover:text-champagne py-2.5 rounded text-xs transition">
            📞 Call Reservations
          </a>
        </div>
      </div>
    </div>
  `;

  modalElement.classList.remove("hidden");
  modalElement.classList.add("flex");
}

function closeInquiryModal() {
  const modalElement = document.getElementById("inquiry-review-modal");
  if (modalElement) {
    modalElement.classList.add("hidden");
    modalElement.classList.remove("flex");
  }
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

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
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
  });
}

// ── 9. MODULE EXPORTS (COMMONJS FOR ZERO-DEPENDENCY UNIT TESTS) ──

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    APP_CONFIG,
    CommunicationService,
    getNairobiDateString,
    calculateDateDifferenceInDays,
    isPastDate,
    isInvalidDateRange,
    normalizeKenyanPhoneNumber,
    resolveStayPricing,
    buildInquiryMessage,
    extractBookingFormData,
    validateBookingFormData,
    getCrmPublicEndpoint,
    resolvePropertyIdFromSelection,
    syncInquiryToCrm,
    handleResidenceCardKeydown
  };
}
