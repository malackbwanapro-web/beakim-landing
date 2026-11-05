# Beakim Landing - Static Assets Domain

## 1. Purpose & Ownership
- **Scope:** Public marketing landing page static assets, including luxury resort imagery, stylesheets, client JavaScript interactions, and font files.
- **Key Subdirectories Owned:**
  - `css/`: Landing page CSS stylesheets, animations, and typography.
  - `js/`: Client interactive scripts (smooth scrolling, image galleries, booking inquiries).
  - `Beakim Darad Images/`: 43 high-resolution, SEO-optimized WebP resort photographs for Beakim Darad with embedded EXIF GPS coordinates (-4.2825, 39.5890) and copyright metadata.
  - `Tower Cottages Images/`: High-resolution apartment photography for Beakim Tower Cottages.
  - `diani-darling-*.webp`: 33 high-resolution, SEO-optimized WebP photographs for Diani Darling Cottages with embedded EXIF GPS coordinates (-4.288113, 39.581767) and copyright metadata.
- **Boundaries & Invariants:**
  - Assets in this directory are publicly served via CDN/web server. Do NOT place sensitive files or private keys here.
  - Optimize image file sizes (WebP compression, max 2048px, quality ~83) to preserve fast Core Web Vitals (LCP) performance.

---

## 2. Local Contracts & Rules
- **Image Optimization:** Keep hero images optimized and properly dimensioned. Maintain dedicated mobile hero variant (`assets/hero-bg-mobile.webp`, 750w, <85 KiB) alongside desktop master (`assets/hero-bg.webp`) with responsive `<picture>` tags. Residence showcase cards are optimized to 800w (<90 KiB each) to ensure mobile LCP < 2.5s and Speed Index compliance.
- **Styling Rules:** Ensure responsive layout across mobile and desktop breakpoints without layout shift (CLS).
- **Architectural Storytelling:** On property landing pages (e.g. `diani-darling.html`, `tower-cottages.html`), imagery is organized in a chronological 7-stage arrival arc (`#arrival-story`) followed by a secondary masonry catalog (`#photo-catalog`). Every image card uses `.gallery-item` or `[data-gallery]` for full lightbox zoom accessibility.

---

## 3. Work Guidance & Verification
- **Visual Inspection:** Open `index.html` in browser or run a local static HTTP server (`npx serve .`).

---

## 4. Child Docs Index
| Child / Domain | Responsibility | Notes / Tech |
| :--- | :--- | :--- |
| [`fonts/`](./fonts/AGENTS.md) | Self-hosted Inter / Playfair Display WOFF2 subsets and SIL licenses | Maintain sources.json hashes and unicode ranges |
| [`css/`](./css/AGENTS.md) | Landing page CSS stylesheets | CSS3 / Tailwind |
| [`js/`](./js/AGENTS.md) | Client-side interactive scripts | Vanilla JavaScript |
| [`Beakim Darad Images/`](<./Beakim Darad Images/AGENTS.md>) | Beach resort photography | WebP / JPEG |
| [`Tower Cottages Images/`](<./Tower Cottages Images/AGENTS.md>) | Serviced apartment photography | WebP / JPEG |
| [`fit-nation/`](./fit-nation/AGENTS.md) | Fit Nation Kenya convoy case study photography | JPEG Master Photos |

## Mobile review candidate — 2026-11-02
Mobile 2.2.4: shared scroll/navigation and measured mobile chrome contracts are documented in js/AGENTS.md and css/AGENTS.md; no photography, catalog or CRM modifications.

## Approved corrective patch — 5 November 2026
Corrective release 2.2.5 changes HTML/client CSS/JS only. The routing, benefits and narrow-screen contracts are documented in js/AGENTS.md and css/AGENTS.md. Public photography and fonts are unchanged.

## Public themes — 5 November 2026
Public themes use semantic Tailwind variables, a small early preference bootstrap and js/theme.js. No fonts, photography or UI dependencies were added. Read CSS/JS contracts before changing appearance.
