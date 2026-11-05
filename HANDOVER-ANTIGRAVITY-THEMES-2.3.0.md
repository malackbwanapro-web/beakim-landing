# Beakim public themes — 2.3.0

Approved by Malik; implemented 5 November 2026. Applied locally to `C:\Users\Malik\Desktop\beakim-landing`. No commit, production deployment, external inquiry, message or payment was made. This note supersedes older isolated-copy status notes for this theme release only. Keep the corrective 2.2.5 behavior intact.

## Appearance and preference

- Forest Dark remains the default for visitors without a valid saved preference. Ivory Light uses warm ivory/limestone surfaces, forest text and accessible bronze accents.
- Nine public pages: homepage, Tower Cottages, Beakim Darad, Diani Darling, Beakim Apartments, Insights, Privacy, Terms and 404. CRM, admincrm and internal SEO matrix are outside this change.
- Header switch: desktop sun/moon capsule; mobile 44px icon control. Below 480px booking/home labels are shortened visually while accessible names remain descriptive. The reserved slot prevents layout movement when the controller initializes.
- `assets/js/theme.js` owns `data-theme`, switch state, browser theme-color and the `beakim-theme` localStorage key only. Values are `dark` and `light`. Invalid/blocked/missing storage falls back to dark. Storage exceptions are caught; switching still works without persistence. Cross-tab preference changes synchronize. There is no automatic system-theme override.
- Early inline bootstrap runs before CSS to apply saved preference. Keep it aligned with theme.js defaults and color metadata. The switch is hidden until initialized; page content remains usable if JS fails.
- Semantic Tailwind colors in tailwind.config.js reference CSS variables in assets/css/input.css. Keep fixed forest text on gold/white buttons fixed. `theme-photo` restores dark tokens inside photo overlays and the gallery; these intentionally remain cinematic in Light. Existing pale booking forms keep native light controls through `theme-form-paper`.
- Calendar middle-range ink and light weekday labels were corrected for readability. Light hover shadows are softer. Reduced-motion disables the toggle animation.

## Files and build

The nine HTML pages use CSS/main/theme cache version 2.3.0. Existing image, font and catalog cache versions remain unchanged. Main.js changes translate generated UI color classes and selectors to semantic roles; booking logic and payload structure are unchanged. No dependencies were added.

Edit input.css and tailwind.config.js, then run `npm run build` from the project root. Never hand-edit generated styles.css. Publish HTML, compiled CSS, main.js and theme.js as one consistent release. The browser preference is appearance-only and must never affect reservation data or analytics consent.

New test command: `npm run test:theme`. Ownership notes are updated in root/assets/js/assets/css/test AGENTS.md. Existing tests use semantic role classes; their price, availability, motion and routing assertions remain.

## Verification performed

- All 39 clean-code test groups pass with disposable TEST_DB_PATH and TEST_BACKUP_DIR in the isolated review copy, using copied CRM support code without live data.
- Mobile UX, contact routing and new theme tests pass. New tests cover all nine pages, bootstrap order, saved/invalid/blocked storage, metadata, switch state, cross-tab synchronization, booking-state isolation and compressed JS budget.
- Local Lighthouse 12.8.2 homepage accessibility: Dark 100 / Light 100. Reports are in the workspace evidence folder. This automated score is not a complete WCAG certification.
- Browser checks: 320px navigation across all nine pages in both themes, 390px calendar, 430px Diani and 1280px desktop; no DOM horizontal overflow in the checked states. Short-landscape calendar locking/closing, keyboard Space/Enter toggle, navigation persistence and cross-tab synchronization verified.
- Entered local fixture booking details, changed guest/unit/breakfast choices, switched themes, and opened review. Names/phone and KSh 6,800 / KSh 10,800 multi-unit totals remained intact. No confirmation/submission sent. Photo gallery retains its dark backdrop.
- WhatsApp remains page-based: home/Tower/Darad/general → 254750864119; Diani Darling → 254119237439. Telephone links remain independent.
- New controller plus bootstrap approximately 873 bytes gzip; compiled CSS increases approximately 1,792 bytes gzip. No new image/font/network dependency. These are payload measurements, not a promise of production LCP or Core Web Vitals.

The local Light Lighthouse fixture served the same candidate with a forced saved-light bootstrap solely for fresh audit profiles. No production query parameter, server override or fixture is included in the release. Local CRM availability was unavailable, so the honest request-to-confirm fallback was exercised; no live CRM end-to-end claim is made.

Desktop browser screenshot capture intermittently timed out or clipped the emulated viewport incorrectly. DOM width checks and working visual captures were used together; do not treat the clipped capture as evidence of a website overflow defect.

## Release review and limitations

Before production promotion, review both themes on an actual iPhone and Android, including keyboard, browser zoom, safe areas, landscape calendar and booking review. Recheck deployed cache consistency and run production PageSpeed after deployment. Local automated accessibility and emulation do not establish real-device usability or field speed. CRM code, configuration, database, rates and form submissions were outside scope.

## Safe rollback

Workspace `work/theme-rollback-2.3.0` contains exact pre-theme originals for replaced files. `outputs/Beakim-Themes-2.3.0-Changes.json` lists before/after SHA-256 values; application-result.json records local application. Restore the complete theme bundle together, retaining the pre-existing 2.2.5 corrective patch. Remove new theme.js/theme.test.js/handover only if unchanged since this application; merge subsequent agent edits instead of overwriting them. No unrelated or CRM paths were included.

Workspace review copy and tool fixtures are not deployable CRM projects. Do not copy them wholesale over the Desktop project; use the changed-file manifest or the already-applied original source.
