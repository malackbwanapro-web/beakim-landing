# Beakim Landing & CRM - Agent Operational Guide

## 1. Project Overview & Architecture
- **Tech Stack:**
  - **Marketing Landing Page:** Semantic HTML5, Vanilla JavaScript (`assets/js/`), CSS3 / Tailwind utilities (`assets/css/`), optimized static asset pipeline, Vercel edge deployment, Google Analytics GA4 (`G-T5E3SNGQZC`), Google Search Console integration.
  - **Beakim CRM:** Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React icons, atomic file-locking JSON database with AES-256-GCM encryption & SHA-256 tamper-evident audit chaining.
- **Architecture Layout:**
  - `beakim-landing/` (Root): Public-facing luxury hospitality landing pages for Beakim Beach Darad, Beakim Tower Cottages, Diani Darling, Beakim Apartments, and coastal travel guide journal (`blog.html`).
  - `assets/`: Landing page static stylesheets, client-side interactive scripts, high-resolution resort imagery.
  - `Beakim CRM/`: Multi-property hospitality Customer Relationship & Property Management System (PMS/CRM).
  - `test/`: Workspace root integration test scripts.
- **Core Commands:**
  - **CRM Dev Server (Port 3005):** `cd "Beakim CRM"; npm.cmd run dev -- -p 3005`
  - **CRM Production Build:** `cd "Beakim CRM"; npm.cmd run build`
  - **CRM Unit Tests:** `cd "Beakim CRM"; node tests/clean-code-unit.test.js`
  - **CRM Regression Matrix:** `cd "Beakim CRM"; node tests/regression-matrix.test.js`
  - **CRM End-to-End Roles Test:** `cd "Beakim CRM"; node verify-crm.js`
  - **Root Clean Code Audit Test:** `node test/clean_code.test.js`

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
