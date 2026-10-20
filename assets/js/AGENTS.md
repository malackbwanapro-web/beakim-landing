# Beakim Landing - Client Scripts Domain (`assets/js/`)

## 1. Purpose & Ownership
- **Scope:** Public client-side JavaScript for interactive UI widgets, dynamic stay pricing computation, gallery lightboxes, WhatsApp inquiry formatting, and background sync to Beakim CRM.
- **Key Modules Owned:**
  - `main.js`: Main client orchestrator, booking form serialization, date pickers, honeypot extraction, WhatsApp URL generation, review modal, pure `calculateReservationTotals` engine, and non-blocking CRM boundary adapter (`CrmSyncService`).
  - `catalog.js`: Single Source of Truth for verified property offerings, nightly/monthly rates, room amenities, and unit inventories.
- **Boundaries & Invariants:**
  - **Non-Blocking Background Delivery:** `CrmSyncService.sendInquiry` must execute asynchronously with an AbortController timeout (`APP_CONFIG.CRM.SYNC_TIMEOUT_MS: 3500`). Network delays or offline states must NEVER block the visitor from viewing the review modal or proceeding to WhatsApp.
  - **No Magic Numbers:** Centralized configurations are strictly frozen under `APP_CONFIG` (`CONTACT`, `SOCIAL`, `RATES`, `CRM`, `UI`, `TIME`, `DEFAULTS`). Official social channels (Instagram, Facebook, X, TikTok, YouTube) are centrally configured in `APP_CONFIG.SOCIAL`.
  - **CommonJS Test Compatibility:** All pure functions and boundary services are exported conditionally at the bottom of `main.js` for zero-dependency Node.js unit tests.

---

## 2. Local Contracts & Rules
- **CRM Sync Protocol:** Submissions POST to `getCrmPublicEndpoint()`, resolving `http://localhost:3005/api/public/inquiries` in local development and `https://beakim-crm.vercel.app/api/public/inquiries` in production.
- **Anti-Spam:** Honeypot field (`website_hp`) must be submitted alongside form values.
- **2-Column Reservation Command Center:** Interactive residence cards (`.residence-card`), curated stay preferences (early SGR bag drop, gated parking, local taxi driver meet & greet), and authentic paid breakfast add-on for Diani Darling (KSh 1,000/person/day) with real-time live price recalculation (`selectResidenceCard()`, `handleDateOrAddonChange()`). Deployed site-wide across `index.html`, `tower-cottages.html`, `diani-darling.html`, and `beakim-darad.html` with property-specific tailoring.
- **Ergonomics & A11y:** Full keyboard navigation support for residence radio cards via `handleResidenceCardKeydown()` (`Enter` and `Space`), and async submission locking on `#booking-submit-btn` with `aria-busy="true"` and `active:scale-[0.98]` tactile press feedback.

---

## 3. Work Guidance & Verification
- **Unit Tests:** `node test/clean_code.test.js`

---

## 4. Child Docs Index
*(Leaf directory — no further child domains)*
