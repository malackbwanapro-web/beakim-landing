# Beakim Landing - Client Scripts Domain (`assets/js/`)

## 1. Purpose & Ownership
- **Scope:** Public client-side JavaScript for interactive UI widgets, dynamic stay pricing computation, gallery lightboxes, WhatsApp inquiry formatting, and background sync to Beakim CRM.
- **Key Modules Owned:**
  - `main.js`: Main client orchestrator, booking form serialization, date pickers, honeypot extraction, WhatsApp URL generation, review modal, pure `calculateReservationTotals` engine, and non-blocking CRM boundary adapter (`CrmSyncService`).
  - `catalog.js`: Single Source of Truth for verified property offerings, nightly/monthly rates, room amenities, and unit inventories.
- **Boundaries & Invariants:**
  - **Non-Blocking Background Delivery:** `CrmSyncService.sendInquiry` executes asynchronously with an AbortController timeout (`APP_CONFIG.CRM.SYNC_TIMEOUT_MS: 4500`). Network delays, cold starts, or offline states must NEVER block the visitor: client issues a Reservation Pre-Approval reference ID (`INQ-YYMMDD-XXXX`), backs up to `localStorage`, and displays the confirmation receipt with guaranteed 15–30 min SLA.
  - **No Magic Numbers:** Centralized configurations are strictly frozen under `APP_CONFIG` (`CONTACT`, `SOCIAL`, `RATES`, `CRM`, `UI`, `TIME`, `DEFAULTS`). Official social channels (Instagram, Facebook, X, TikTok, YouTube) are centrally configured in `APP_CONFIG.SOCIAL`.
  - **CommonJS Test Compatibility:** All pure functions and boundary services are exported conditionally at the bottom of `main.js` for zero-dependency Node.js unit tests.

---

## 2. Local Contracts & Rules
- **CRM Sync Protocol:** Submissions POST to `getCrmPublicEndpoint()`, resolving `http://localhost:3005/api/public/inquiries` in local development and `https://crm.beakimhospitalitygroup.co.ke/api/public/inquiries` in production. Supports automatic test/demo tagging via URL search parameter `?demo=true` or `?test=true` (payload `isTest: true`) with subtle floating status banner.
- **Frictionless Zero-Leak Booking Intake & Live Availability:**
  - `triggerLiveAvailabilityCheck()`: Real-time debounced date availability checking via `CrmSyncService.checkAvailability({ propertyId, checkInDate, checkOutDate })`, rendering dynamic status badges (`Available`, `High Demand / Limited`, `Sold Out`) in `#availability-status-container`.
  - Preferred Contact Channel selector (`WhatsApp / Text`, `Phone Call`, `Email`) captured in `extractBookingFormData()` and sent to CRM as `preferredContactMethod`.
  - 2-Stage Confirmation Modal: Stage 1 displays summary with `"✓ Confirm & Submit Reservation Inquiry"`. Stage 2 displays an on-site luxury receipt with verified Reference ID (`#INQ-...`), guaranteed 15–30 min response time SLA, and an *optional* WhatsApp helper button that never blocks submission or requires external apps. Both stages use a 3-zone viewport-safe flex container (`max-h-[90vh] flex flex-col`) with a pinned top header (and high-contrast circular `×` close button), scrollable middle body, pinned bottom action footer, and background page scroll lock managed by `PageScrollLock` with reference counting (`lock()`, `unlock()`, `reset()`).
  - **Intake Honesty (Zero False Confirmation):** On network failure, offline state, or server error, `confirmAndSubmitInquiry` NEVER displays a false confirmation receipt. Instead, it renders `renderInquiryNetworkFailure` providing transparent error messaging, an instant retry button (`Retry Reservation Submission`), direct call assistance, and pre-formatted WhatsApp direct fallback with client inquiry details intact (A204).
- **Anti-Spam:** Honeypot field (`website_hp`) must be submitted alongside form values.
- **2-Column Reservation Command Center:** Interactive residence cards (`.residence-card`), curated stay preferences (early SGR bag drop, self-catering kitchen setup, ground-floor preference), and authentic paid breakfast add-on for Diani Darling & Beakim Darad (KSh 1,000/person/day) with real-time live price recalculation decomposed into SRP sub-handlers (`selectResidenceCard()`, `syncPropertyDropdown()`, `syncResidenceCardsStyling()`, `syncBreakfastAddonCard()`, `handleDateOrAddonChange()`). Deployed site-wide across `index.html`, `tower-cottages.html`, `diani-darling.html`, and `beakim-darad.html` with property-specific tailoring.
- **Ergonomics & A11y:** Full keyboard navigation support for residence radio cards via `handleResidenceCardKeydown()` (`Enter` and `Space`), and async submission locking on `#booking-submit-btn` with `aria-busy="true"` and `active:scale-[0.98]` tactile press feedback.

---

## 3. Work Guidance & Verification
- **Unit Tests:** `node test/clean_code.test.js`

---

## 4. Child Docs Index
*(Leaf directory — no further child domains)*
