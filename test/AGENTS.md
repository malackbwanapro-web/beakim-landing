# Workspace Integration Tests Domain

## 1. Purpose & Ownership
- **Scope:** Root integration and clean code verification suites across the workspace.
- **Key Files Owned:**
  - `clean_code.test.js`: Root-level clean code audit suite verifying naming, SRP, layer boundaries, commercial policies, accessible calendar elements, booking failure recovery, responsive hero preloads, image budgets, form a11y, subtle luxury animation invariants, reduced-motion layout preservation, stagger delay custom properties, and WCAG AA form contrast across 39 automated unit assertions (100% pass rate).
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
