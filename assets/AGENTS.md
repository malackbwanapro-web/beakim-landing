# Beakim Landing - Static Assets Domain

## 1. Purpose & Ownership
- **Scope:** Public marketing landing page static assets, including luxury resort imagery, stylesheets, client JavaScript interactions, and font files.
- **Key Subdirectories Owned:**
  - `css/`: Landing page CSS stylesheets, animations, and typography.
  - `js/`: Client interactive scripts (smooth scrolling, image galleries, booking inquiries).
  - `Beakim Darad Images/`: 43 high-resolution, SEO-optimized WebP resort photographs for Beakim Beach Darad with embedded EXIF GPS coordinates (-4.2825, 39.5890) and copyright metadata.
  - `Tower Cottages Images/`: High-resolution apartment photography for Beakim Tower Cottages.
  - `diani-darling-*.webp`: 33 high-resolution, SEO-optimized WebP photographs for Diani Darling Cottages with embedded EXIF GPS coordinates (-4.2796, 39.5936) and copyright metadata.
- **Boundaries & Invariants:**
  - Assets in this directory are publicly served via CDN/web server. Do NOT place sensitive files or private keys here.
  - Optimize image file sizes (WebP compression, max 2048px, quality ~83) to preserve fast Core Web Vitals (LCP) performance.

---

## 2. Local Contracts & Rules
- **Image Optimization:** Keep hero images optimized and properly dimensioned.
- **Styling Rules:** Ensure responsive layout across mobile and desktop breakpoints without layout shift (CLS).
- **Architectural Storytelling:** On property landing pages (e.g. `diani-darling.html`, `tower-cottages.html`), imagery is organized in a chronological 7-stage arrival arc (`#arrival-story`) followed by a secondary masonry catalog (`#photo-catalog`). Every image card uses `.gallery-item` or `[data-gallery]` for full lightbox zoom accessibility.

---

## 3. Work Guidance & Verification
- **Visual Inspection:** Open `index.html` in browser or run a local static HTTP server (`npx serve .`).

---

## 4. Child Docs Index
| Child / Domain | Responsibility | Notes / Tech |
| :--- | :--- | :--- |
| [`css/`](./css/AGENTS.md) | Landing page CSS stylesheets | CSS3 / Tailwind |
| [`js/`](./js/AGENTS.md) | Client-side interactive scripts | Vanilla JavaScript |
| [`Beakim Darad Images/`](<./Beakim Darad Images/AGENTS.md>) | Beach resort photography | WebP / JPEG |
| [`Tower Cottages Images/`](<./Tower Cottages Images/AGENTS.md>) | Serviced apartment photography | WebP / JPEG |
