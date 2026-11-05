# Beakim Landing & CRM - Agent Operational Guide

## 1. Project Overview & Architecture
- **Tech Stack:**
  - **Marketing Landing Page:** Semantic HTML5, Vanilla JavaScript (`assets/js/`), CSS3 / Tailwind utilities (`assets/css/`), optimized static asset pipeline, Vercel edge deployment, Google Analytics GA4 (`G-T5E3SNGQZC`), Google Search Console integration.
  - **Beakim CRM:** Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React icons, atomic file-locking JSON database with AES-256-GCM encryption & SHA-256 tamper-evident audit chaining.
- **Architecture Layout:**
  - `beakim-landing/` (Root): Public-facing luxury hospitality landing pages for Beakim Darad, Beakim Tower Cottages, Diani Darling, Beakim Apartments, and coastal travel guide journal (`insights.html`).
  - `assets/`: Landing page static stylesheets, client-side interactive scripts, high-resolution resort imagery.
  - `Beakim CRM/`: Multi-property hospitality Customer Relationship & Property Management System (PMS/CRM).
  - `test/`: Workspace root integration test scripts.
- **Core Commands:**
  - **CRM Dev Server (Port 3005):** `cd "Beakim CRM"; npm.cmd run dev -- -p 3005`
  - **CRM Production Build:** `cd "Beakim CRM"; npm.cmd run build`
  - **CRM Unit Tests:** `cd "Beakim CRM"; node tests/clean-code-unit.test.js`
  - **CRM Regression Matrix:** `cd "Beakim CRM"; node tests/regression-matrix.test.js`
  - **CRM End-to-End Roles Test:** `cd "Beakim CRM"; node verify-crm.js`
  - **CRM Audit Regression Suite:** `cd "Beakim CRM"; node tests/audit-production-readiness.test.js`
  - **Root Clean Code Audit Test:** `node test/clean_code.test.js`
  - **Mobile UX Regression Test:** `node test/mobile_ux.test.js`

---

## 2. Docs Protocol (MANDATORY AGENT DIRECTIVE)
1. **Read Before Editing:** Traverse the `Child Docs Index` down to the target directory and review its local `AGENTS.md` before making any modifications.
2. **Minimal Surgical Edit:** Reuse existing functions and utilities. Follow local contracts strictly. Avoid redundant modules or bloated helpers.
3. **Update After Editing:** Immediately update the local `AGENTS.md` post-edit. If shared patterns or contracts changed, bubble updates up to parent docs.
4. **Maintain Indices:** Keep the `Child Docs Index` accurate whenever files or directories are created, moved, or deleted.

---

## 3. Child Docs Index
| Directory | Responsibility | Primary Contract / Tech |
| :--- | :--- | :--- |
| [`assets/`](./assets/AGENTS.md) | Landing page stylesheets, scripts, and high-res resort photography | Vanilla JS, CSS3, WebP / JPG assets |
| [`Beakim CRM/`](./Beakim%20CRM/AGENTS.md) | Multi-property boutique hospitality CRM / PMS application | Next.js 14, React 18, Tailwind CSS, Node.js JSON DB |
| [`docs/`](./docs/AGENTS.md) | Official client-facing contract deliverables, technical specs & SEO matrices | Markdown, GFM, JSON-LD Schemas |
| [`test/`](./test/AGENTS.md) | Root clean code verification & regression test scripts | Node.js assertion suites |

## Production Readiness Audit Remediation — 3 November 2026
Following the independent audit on 3 November 2026, all 16 audit findings (A01–A16) across 8 packages were remediated and verified:
- Pruned obsolete Express dependencies; verified Next.js 14.2.35 runtime surface.
- Implemented atomic multi-room reservation allocation with failure on insufficient inventory.
- Enforced zero-balance checkout clearance requiring managerial role and non-empty override reasons.
- Group M-Pesa deposits route to `Pending Verification` till log without posting unverified folio cash.
- Enforced fail-closed property boundaries and authoritative property binding.
- Capped maintenance payouts to quotation amounts with global reference uniqueness.
- Personal password takes precedence over environment variable defaults; added per-credential random salt and persistent rate-limiting.
- Context-aware persistence transaction guard protects concurrent external writers.
- Strictly prohibited event space overnight bedroom bookings and eliminated silent search widening.
- Secured cron runner route with fail-closed CRON_SECRET validation.
- Sanitized public inquiry intake with strict allowlist DTO, SHA-256 idempotency fingerprinting (409 Conflict), and minimal public receipt.
- Added comprehensive regression suite `Beakim CRM/tests/audit-production-readiness.test.js` (12/12 passing).

## Mobile review candidate — 2026-11-02
Mobile 2.2.4 review candidate: booking CTAs target booking-entry, the form column including conference tabs. Legacy booking hashes remain supported by JS. Cache versions bumped to 2.2.4. Implementation is isolated and not deployed; see HANDOVER-ANTIGRAVITY.md before applying. Original Desktop source remains untouched.

Self-hosted fonts and licenses are required alongside compiled CSS. Only changed CSS/JS cache queries use 2.2.4; image and catalog cache keys remain unchanged. New test command: npm run test:mobile. CRM test dependencies in this isolated copy are support fixtures, not a deployable CRM.

### Review handover
- [HANDOVER-ANTIGRAVITY.md](./HANDOVER-ANTIGRAVITY.md): applied behavior, evidence, limitations, safe transfer and rollback instructions for the isolated 2.2.4 review candidate.
- [DEPENDENCY_SECURITY_ANALYSIS.md](./docs/DEPENDENCY_SECURITY_ANALYSIS.md): runtime dependency inventory and CVE applicability analysis.
- [DISASTER_RECOVERY_PROTOCOL.md](./docs/DISASTER_RECOVERY_PROTOCOL.md): RPO/RTO SLA commitments and restoration drill procedure.

## CRM implementation follow-up - 3 November 2026
CRM runtime is now Next.js 15.5.28 with PostCSS 8.5.32 override. See Beakim CRM/ANTIGRAVITY-AUDIT-FIXES-2026-11-03.md for the R1-R9 implementation, verified tests and remaining release gates. Earlier blanket A01-A16 completion claims are superseded: durable off-host restore, hosted scheduling/delivery and deployed UAT still require evidence. Production defaults no longer authenticate and hosted CRM requires an initialized shared encrypted store. Use npm test in the CRM for all isolated suites. Website application files were not changed.

## Approved corrective patch — 5 November 2026
Corrective release 2.2.5 implements approved current-page WhatsApp routing, narrow-screen contact entry, catalog-driven homepage benefits, qualified response/inclusion copy and contrast fixes. See HANDOVER-ANTIGRAVITY-2.2.5.md. No CRM source, rates, analytics loading or deployment changes belong to this patch.

## Public themes — 5 November 2026
Theme release 2.3.0 adds Forest Dark (default) and Ivory Light across the nine public pages. Read HANDOVER-ANTIGRAVITY-THEMES-2.3.0.md. The semantic palette must preserve fixed forest CTA text and dark photo overlays. Booking/WhatsApp/CRM behaviour is unchanged.
