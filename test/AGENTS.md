# Workspace Integration Tests Domain

## 1. Purpose & Ownership
- **Scope:** Root integration and clean code verification suites across the workspace.
- **Key Files Owned:**
  - `clean_code.test.js`: Root-level clean code audit suite verifying naming, SRP, layer boundaries, commercial policies, accessible calendar elements, booking failure recovery, responsive hero preloads, image budgets, and form a11y across 37 automated unit assertions (100% pass rate).
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
