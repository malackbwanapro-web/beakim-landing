# Antigravity handover — Beakim mobile review candidate 2.2.4

Prepared 2 November 2026. **Implemented and locally verified; not deployed.**

## Start here

- Original project: `C:\Users\Malik\Desktop\beakim-landing`.
- Review implementation: `C:\Users\Malik\Documents\Codex\2026-11-02\analyze-this-website-for-premium-and\work\beakim-mobile`.
- Deliverables: `C:\Users\Malik\Documents\Codex\2026-11-02\analyze-this-website-for-premium-and\outputs`.
- The approved proposal authorized an isolated implementation/preview before deployment. Desktop writes were restricted in this session. **The original project has not been edited.** All 22 captured baseline text files still matched the Desktop source at packaging time. Recheck the supplied manifest before applying because another agent may subsequently change the project.
- No production deployment, live inquiry submission, payment, staff change, CRM source modification or database change was performed. Small CRM library/API copies in the review directory support existing tests only. Do not deploy this partial workspace as a complete application.

The practical mobile usability changes are ready for review. **The speed target is not met.** Do not describe this release as 10/10, launch-certified, or as proving real-device accessibility/Core Web Vitals.

## Implemented behavior

### Booking navigation

Each booking page now has `#booking-entry` on the form column, including Diani Darling's cottage/conference mode tabs. Booking CTAs go there instead of the long benefits introduction. The original `#booking` section remains intact. Incoming legacy `#booking` and `#booking-form` URLs resolve to the same entry point through JavaScript.

`resolveLocalAnchor` compares origin, normalized page path and query string before interception. It supports clean paths, `.html` aliases and homepage `/index.html`. Cross-page links such as `/#booking-entry` on a property page retain native navigation. Modified clicks, other browsing targets, downloads and skip-to-main links preserve native behavior. Malformed encoded hashes are safely ignored.

Every existing programmatic smooth-scroll call now uses `scrollToPageTarget` / `getPreferredScrollBehavior`. Reduced motion selects `auto`. Initial deep links use immediate positioning and one correction after `document.fonts.ready`; pointer, touch, wheel or keyboard activity cancels that correction. Base CSS scrolling is `auto`, preventing an initial link from continuing toward an offset made stale by font swaps. No field is auto-focused and no keyboard is intentionally opened.

On the homepage at 390px, the old CTA left the form about 1,318px below the viewport top; the new destination puts the form around 125px from the top, below the approximately 77px header. Exact dimensions vary with fonts and viewport.

### Mobile controls and fixed bars

- Text/number/email/phone inputs, selects and textareas in `#booking-entry` use 16px text and a 48px minimum height below 768px. Hidden compatibility selects and native checkbox/radio sizing are excluded where appropriate.
- Unit steppers have at least 44px width / 48px height. Contact-method labels and primary form/date/mode controls have 48px minimum heights. FAQ tabs and calendar close/month navigation have 44px minimum targets. Individual calendar day cells keep their seven-column layout.
- `.site-header` / `.site-contact-dock` provide stable measurement hooks. `ResizeObserver` updates CSS height variables, with CSS fallbacks and a resize fallback. Heights refresh synchronously before anchor scrolling, so closing an expanded menu does not leave its former height as the anchor offset.
- Mobile body padding and document scroll padding clear the actual contact dock. Footer `pb-28` was replaced by the existing ordinary footer spacing plus body clearance. The measured dock already includes its safe-area padding: **never add the safe-area inset twice**. Desktop body clearance remains zero.
- Existing reveal, sheen and hover animations remain. The hero and fixed-bar blur experiments were reverted after inadequate measured benefit.

### Calendar rotation

`isCalendarModalViewport` selects modal mode when width is below 640px **or height below 600px**, using constants in `APP_CONFIG.CALENDAR`. Previously, rotating a phone into a short landscape viewport could move the calendar back into an inline dropdown outside the visible area. It now remains a viewport modal with an internally scrolling card. Wider short windows intentionally use the same mode.

The existing idempotent scroll-lock lifecycle and date/month state are retained. A 740×360 test preserved December navigation, kept the card within the viewport, and restored both body scrolling and trigger focus on close.

### Fonts and cache keys

Inter and Playfair Display are self-hosted as official Google Fonts WOFF2 subsets. Inter normal covers 200–700; Playfair normal covers 400–700 and italic covers 400. All 15 upstream unicode subsets, both SIL OFL licenses, source URLs and SHA-256 hashes are included in `assets/fonts`. A normal English page requests three Latin faces, not all 15 files. No font preloads were added.

`@font-face` declarations live in `assets/css/input.css`, retain `font-display: swap`, and use relative paths to `../fonts`. Google Fonts head links were removed. Ship fonts with the compiled stylesheet. Dropping the fonts while keeping the new CSS causes fallback typography.

Changed CSS and main.js references use `?v=2.2.4` across HTML pages, including previously unversioned references. Unchanged image/catalog versions remain 2.2.3. `package.json` adds `test:mobile` without changing dependencies. Applicable AGENTS.md contracts were updated; `assets/fonts/AGENTS.md` is new.

## Files and review package

`Beakim-Mobile-2.2.4-Review.zip` contains **changed files only**, under `changed-files/`, plus the manifest and handover. It is not a complete deployment bundle. `Beakim-Mobile-2.2.4.patch` is a text review diff; binary WOFF2 files are provided in the ZIP and are not represented in that patch.

`Beakim-Mobile-Changes.json` lists each original and candidate SHA-256. The manifest is authoritative for the exact file list. Photography, catalog/rates, CRM source, API contracts, deposit policy, analytics and deployment configuration were not changed.

The principal source changes are HTML entry anchors/head font links, `assets/js/main.js`, `assets/css/input.css`, generated `assets/css/styles.css`, font assets/licenses, the two test files, package script and agent documentation.

## Verification completed

- Existing clean-code suite: **39 groups passed** after replacing obsolete Google-hosted-font assertions with real WOFF2 signature/checksum/license and `font-display: swap` checks. Other assertions remain intact.
- New `test/mobile_ux.test.js`: behavioral cases for cross-page/origin/query/alias links, malformed hashes, reduced-motion scroll options, short-landscape calendar mode and two-room pricing at the actual review/payload boundary. It sends no requests.
- UI review at 360px: four adults → select two standard rooms → two nights → KSh 6,800. Breakfast adds KSh 4,000 and review shows KSh 10,800. Closed the modal without clicking Confirm & Submit. Pure-function/VM tests verify matching CRM payload totals and units.
- 320px: hero wrapping, full-width CTAs, form navigation and calendar opening; no horizontal page overflow. Contact actions measure 48px high.
- 360px: multi-room warning, unit selection and review dialog with pinned actions/internal scrolling.
- 390px: menu open/close and booking destination; visible fields measure 16px / ≥48px; dock clearance.
- 430px: Diani Darling legacy booking link and conference controls; visible text/select fields measure 16px / ≥48px; conference form is inside the entry wrapper.
- 740×360: calendar remains modal, selected month survives rotation, internal overflow works, close unlocks page scroll and restores trigger focus.
- 1280px: desktop appearance retained, no horizontal page overflow and body bottom padding is zero.
- Font files deliberately unavailable on a separate localhost preview: fallback typography remains readable at 390px without horizontal overflow.
- Existing failure-state/calendar/reduced-motion assertions pass. Reduced-motion helper was checked with both media-query results. This does not substitute for testing OS reduced motion on real devices.

Screenshots and machine-readable timing results are in `outputs/mobile-evidence`. The review fixture uses an invented name/number. No guest data is included.

**Not verified:** physical Android/iPhone Safari; software-keyboard opening/focus visibility; real notch safe-area behavior; actual 200% browser/text zoom (the browser automation shortcut did not establish a verified zoom change); production compression/cache/CDN behavior; live CRM receipt/delivery/allocation; real-user field INP/LCP. Do these before calling mobile readiness complete. Responsive Windows Chrome viewports are not physical-device tests.

## Performance evidence and decisions

Lighthouse 12.8.2, three fresh mobile runs per phase, simulated throttling, 412×823/DPR 1.75, RTT 150ms, throughput 1638.4Kbps and 4× CPU slowdown. Baseline and candidate use separate local HTTP ports with the same server family. These servers do not reproduce Vercel compression, edge caching, internet latency or regional conditions. External-font requests make the baseline network more variable. Samples are too small to establish statistical significance.

| Metric | Baseline median | Final median |
|---|---:|---:|
| Performance score | 75 | 76 |
| LCP | 5,503.8ms | 5,250.4ms |
| FCP | 2,583.3ms | 2,415.9ms |
| TBT | 103.5ms | 89.0ms |
| CLS | 0.0013 | 0.0006 |

Baseline LCP range: 4,691–5,755ms. Final: 5,246–5,261ms. Approximate median LCP reduction: **4.6%**, below the proposed ≤3s or ≥20% improvement gate. Do not present this local comparison as a production speed guarantee.

- Hero filter/single-gradient candidate: median 5,659.5ms; reverted.
- Self-hosted fonts: median 5,288.5ms; retained for eliminating the external stylesheet/origin chain, with a modest measured improvement. In one observed baseline trace, fonts completed around 1.7–1.85s; final local same-origin font requests completed around 0.26s. Those are observed trace timings, not the simulated headline LCP and not comparable internet delivery guarantees.
- Removing header/dock blur: median 5,257.9ms versus the font candidate's 5,288.5ms, insufficient evidence of benefit; reverted.
- Essential date, form, pricing and reveal initialization remain immediate. No speculative JS deferral was applied.
- Critical-CSS extraction was not applied. Local diagnostics flag the blocking stylesheet (about 66KB uncompressed) and hero rendering delay. The next performance branch should test generated critical CSS against a compressed staging preview, with complete header/dock/hero/font/focus coverage and no-JS/fast-scroll checks. Do not simply make all CSS asynchronous. This performance work remains open.

Raw baseline/final Lighthouse JSON, selected traces and screenshots stay in the workspace's `work/` directory. Summary data and final report JSON are included with the evidence. No production score has been reissued for this candidate.

## Apply and continue safely

1. Read root and child AGENTS.md in the original project. Inspect current Git status; preserve all existing work. Compare each target with `before_sha256` in the manifest. If any target differs, merge its changes rather than overwriting it. New files must not overwrite unrelated files.
2. Make a branch/backup of the original current state. Review the text patch, then apply only manifest-listed files from `changed-files/`, including all fonts/licenses and source CSS. Do not copy the test database, scratch servers, audit-tool node_modules, or partial CRM test-support directory.
3. Build in the project root with its normal dependencies: `npm.cmd run build`. In this isolated copy, the existing Desktop installation's Tailwind 3.4.17 CLI was invoked directly, with the working directory set to the review root. **Tailwind content globs are relative to the working directory: building from the wrong directory can strip utilities.** Never edit styles.css by hand.
4. Run `npm.cmd run test:mobile`. Run the existing suite with `TEST_DB_PATH` and `TEST_BACKUP_DIR` pointing to disposable paths outside the real CRM store. Node 24.19.0 was used here. The suite uses copied CRM libraries and seeds its own test database; never point it at guest data.
5. Review on real phones and complete the unverified checks above. Then obtain the separate deployment approval required by the original proposal. Do not submit invented production inquiries; verify intake/delivery/allocation in an authorized staging CRM.
6. After an authorized preview deployment, run at least three comparable cold mobile/desktop audits with actual compressed headers. Investigate the remaining rendering/stylesheet bottleneck, then validate field metrics over time.

For local visual review, `work/preview_server.py` serves clean HTML aliases on `http://127.0.0.1:8876/`. Start it from this workspace with `python work/preview_server.py` if the earlier process has stopped. A simple static server can also serve explicit `.html` URLs. Availability correctly shows its honest unavailable fallback when no local CRM is running; that is not evidence of a production CRM failure.

## Rollback

Restore the prior HTML, source/compiled CSS, main.js, package/test/docs together from the branch/backup. HTML with removed Google Fonts links requires the local-font CSS/assets; old font delivery requires the old head links. Avoid mixing releases. New font files can remain unused during a rollback; remove them only after confirming no retained CSS references them. Do not revert unrelated CRM or agent changes.
