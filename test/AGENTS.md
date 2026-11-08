# Workspace Integration Tests Domain

## 1. Purpose & Ownership
- **Scope:** Root integration and clean code verification suites across the workspace.
- **Key Files Owned:**
  - `clean_code.test.js`: Root-level clean code audit suite verifying naming, SRP, layer boundaries, commercial policies, accessible calendar elements, booking failure recovery, responsive hero preloads, image budgets, form a11y, subtle luxury animation invariants, reduced-motion layout preservation, stagger delay custom properties, WCAG AA form contrast, and exclusive FAQ accordion behavior across 40 automated unit assertions (100% pass rate).
- **Boundaries & Invariants:**
  - Must execute independently without requiring a running server.

---

## 2. Local Contracts & Rules
- **Execution:** Node.js native test runner or assertion modules.

---

## 3. Work Guidance & Verification
- **Run Tests:** `node test/clean_code.test.js`

---

## 4. Child Docs Index
*(Leaf directory — no further child domains)*

mobile_ux.test.js checks same-page vs cross-page/query URL behavior, reduced-motion scrolling, short-landscape calendar mode and 2-room/2-night review + CRM payload totals (KSh 6,800; KSh 10,800 with breakfast). It sends no inquiries. Run node test/mobile_ux.test.js or npm run test:mobile.

Test 36 now validates actual WOFF2 signatures, source manifest checksums and included SIL licenses; the obsolete Google Fonts DNS assertion was replaced because fonts are self-hosted.
Test 39 now checks same-origin font delivery and font-display: swap instead of the obsolete external stylesheet preload requirement.

## Approved corrective patch — 5 November 2026
Corrective 2.2.5 regressions cover page-based WhatsApp routes, unchanged Tower telephone, static footer agreement, saved messages, inquiry/receipt/failure helpers, property benefits and measured contrast. Run mobile_ux.test.js and contact_routing.test.js without a CRM. The existing clean_code suite needs disposable TEST_DB_PATH and TEST_BACKUP_DIR paths; never use live guest storage.

- contact_routing.test.js: current-page WhatsApp mapping, static footer consistency, saved text preservation, receipt/failure links, pricing boundary, catalog benefit truth and contrast ratios. npm run test:contact. The older availability-copy assertion now requires a typical desk-hours response rather than an unconditional confirmation promise.

Local Lighthouse additionally exposed an existing dock visible-label/accessibility-name mismatch. Dock aria-labels now include their visible wording; no telephone targets changed.

## Public themes — 5 November 2026
Theme tests must cover early bootstrap, saved/invalid/blocked storage, cross-tab changes, switch state and retained form values. Existing color-selector fixtures now use semantic roles; original price, honesty, calendar and routing assertions remain. Use disposable DB/backup paths for the full suite.

- theme.test.js: nine-page bootstrap/controller/storage/budget regressions. Run npm run test:theme.
