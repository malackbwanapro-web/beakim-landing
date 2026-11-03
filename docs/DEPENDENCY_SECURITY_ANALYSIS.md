# Beakim CRM & Hospitality Architecture: Dependency Security & Posture Analysis

**Document Status:** Production Operational Deliverable (Audit Gate A01 / A10)  
**Date:** November 2026  
**Auditor Finding Reference:** A01, A10  

---

## 1. Executive Summary & Runtime Surface Inventory

Following the production readiness audit conducted on 3 November 2026, the Beakim CRM dependency manifest (`Beakim CRM/package.json`) and locked dependency graph (`Beakim CRM/package-lock.json`) underwent surgical dependency inventory and vulnerability mitigation.

### 1.1 Pruning Obsolete & Dead Server Packages
The repository previously included legacy Express and middleware packages (`express`, `cors`, `body-parser`, `proxy-addr`, `qs`) retained from an early prototyping script (`legacy/server.js`). Because Beakim CRM runs entirely on the **Next.js 14 App Router** (`app/api/*`), these Express dependencies introduced dead surface and reported CVE advisories without providing any runtime function.

- **Actions Executed:**
  - Removed `express` and `cors` from `Beakim CRM/package.json`.
  - Executed `npm prune` and `npm install --package-lock-only`, eliminating 66 transitive packages including `body-parser`, `proxy-addr`, `qs`, `forwarded`, `cookie-signature`.
  - Executed targeted audit remediation for development build dependencies (`source-map-js`, `postcss-selector-parser`).

### 1.2 Current Runtime Dependency Baseline
| Package | Version | Scope | Runtime Exposure & Security Posture |
| :--- | :--- | :--- | :--- |
| `next` | `14.2.35` | Production Core | Next.js App Router (Node.js runtime). Edge deployment on Vercel. Static & server route compilation. Server actions disabled. Middleware restricted to trusted edge headers. |
| `react` / `react-dom` | `18.3.1` | Production UI | React 18 client & server component rendering. Strict Mode enabled in development. |
| `lucide-react` | `^0.460.0` | Production UI | Modern SVG icon component library (zero runtime network surface). |
| `ioredis` | `^5.6.0` | Production Storage | Upstash Redis connection adapter for cloud synchronization with AES-256-GCM payload encryption. |
| `tailwindcss` | `^3.4.1` | Build Pipeline | CSS utility generation (zero runtime attack surface). |

---

## 2. Applicability Analysis of Next.js 14 Advisories

Security notices concerning Next.js 14.x releases (including the May 2026 security release and October 2026 advisories) focus on specific features and attack vectors:
1. **Server Actions Arbitrary Invocation / Prototype Pollution:**
   - *Audit Check:* Does Beakim CRM use Next.js Server Actions (`"use server"` form actions)?
   - *Posture:* **No.** Beakim CRM strictly uses explicit, authoritative Next.js API Routes (`app/api/*`) with JSON payloads, session cookie verification (`lib/auth.js:requireStaffAuth`), and role capability validation (`PERMISSIONS[role]`). Server actions are not exported or utilized.
2. **Next.js Image Optimizer SSRF / DoS:**
   - *Audit Check:* Does Beakim CRM expose unconstrained remote image optimization?
   - *Posture:* **Mitigated.** The landing page and CRM utilize static and self-hosted WebP/JPG assets located in local storage or verified CDN paths. Remote image loader domains are locked down in `next.config.js`.
3. **Draft Mode / Preview Bypass:**
   - *Audit Check:* Is draft mode enabled?
   - *Posture:* **Not in use.** No draft mode bypass cookies or preview endpoints exist in the application.

---

## 3. Vulnerability Mitigation & Upgrade Roadmap

1. **Continuous Verification:** Every release must execute `npm audit --production` and verify that zero critical runtime vulnerabilities exist in active server execution paths.
2. **Automated Lockfile Auditing:** CI/CD pipelines will fail-closed if unpinned dependencies or unverified packages are introduced.
3. **Planned Framework Upgrade:** A scheduled migration track to Next.js 15 LTS will be executed during the scheduled Q1 2027 maintenance window following comprehensive regression testing of React 19 compatibility.
