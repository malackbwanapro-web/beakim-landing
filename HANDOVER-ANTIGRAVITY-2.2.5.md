# Antigravity handover — approved frontend patch 2.2.5

Prepared 5 November 2026, Africa/Nairobi. This is the approved corrective implementation following the website audit and the user's explicit WhatsApp routing clarification.

## Current status and locations

- Target project: `C:\Users\Malik\Desktop\beakim-landing`.
- Verified review copy: `C:\Users\Malik\Documents\Codex\2026-11-02\analyze-this-website-for-premium-and\work\beakim-corrective-2.2.5`.
- The approved patch is applied to the target project's local working tree. It is **not committed or deployed**.
- Git was clean before this task. The apply operation checks each original file's baseline SHA-256 before writing and saves rollback copies. `Beakim-Corrective-2.2.5-Changes.json` and `2.2.5-corrective-evidence/application-result.json` record exact paths and checksums.
- This handover supersedes the historical 2.2.4 note that described an isolated, unapplied review copy. The 2.2.4 documentation remains historical evidence, not the current application status.

## User-approved WhatsApp contract

The destination is determined by the **current page**, never by the property selected in a homepage form.

| Page | WhatsApp |
|---|---|
| Homepage | 0750 864 119, matching homepage footer |
| Tower Cottages | 0750 864 119, matching homepage footer |
| Diani Darling | 0119 237 439, matching its own footer |
| Beakim Darad | 0750 864 119, matching its own footer |
| Apartments/general pages | Main-office default, 0750 864 119 |

Telephone targets remain independent. ~~Tower's call number remains 0746 938 529.~~ **Superseded 5 Nov 2026 (owner instruction): Tower call and WhatsApp are both 0750 864 119; its footer is back to a single "Tel / WhatsApp" line.** The generic Insights footer and 404 have also moved to 0750 864 119 (single "Tel / WhatsApp" line); 0746 938 529 is retired site-wide. No calls or WhatsApp messages were sent during verification.

`resolveWhatsAppPhone` uses the current pathname and the existing path normalization helper, supporting clean URLs, `.html` paths, trailing slashes and query/hash inputs. `APP_CONFIG.CONTACT.PHONE_RAW` supplies the main-office number and `DARLING_WHATSAPP_RAW` supplies Diani's destination. Tests compare these with designated footer links; update both configuration and footer if a business number changes.

Static HTML WhatsApp URLs are correct before JavaScript executes. `initializeWhatsAppRouting` aligns existing WhatsApp anchors on DOMContentLoaded while preserving their query/message parameters. `CommunicationService.buildWhatsAppUrl` uses the page resolver by default. Actual booking and conference callers use that default rather than the selected accommodation's telephone number.

`getInquiryWhatsAppUrl` rebuilds receipt/failure helpers for the current page while retaining `messageText`, or recovering the text parameter from a saved link when necessary. This prevents a saved old contact URL from overriding the current page's destination. Pricing, inquiry payloads, idempotency, submission timing and the CRM endpoint contract are unchanged.

## Mobile phone/contact layout

Shared `phone-contact-row` hooks replace the fixed 144px dial-code allocation on mobile:

- Below 768px: 104px dial-code column plus a flexible phone field.
- Below 360px: country selector and phone input stack at full available width.
- Below 360px: preferred-contact labels also stack so their radio buttons and wording remain readable.
- Existing 16px input text, minimum 48px field heights, autocomplete, inputmode and labels are retained.

Browser measurements on the homepage: at 320px both stacked phone controls are approximately 231px wide; at 360px the selector is 104px and the phone field approximately 159px. A full sample nine-digit local number is visible at 320px. Equivalent hooks exist on the property booking pages. This is Windows Chrome responsive verification, not a claim that a real mobile software keyboard has been tested.

## Truthful benefits, inclusions and response copy

The homepage benefits column now follows the selected residence through `resolveBookingBenefits` / `syncBookingBenefits`, called by the existing price/date update path. Darad shows its two pools, Tower explicitly states that it has no swimming pool and hides the breakfast benefit, and Diani shows pool access and KSh 1,000/person/day optional breakfast. Switching residence on the homepage does **not** change its WhatsApp destination.

Catalog nuance: Diani has a Swimming Pool offering amenity but no numeric `pools` field. The resolver distinguishes an absent count from explicit zero; it must not treat missing data as proof of no pool. No catalog/rate data was changed. Pool counts are shown only where explicitly supplied; otherwise a confirmed pool amenity yields unnumbered wording. Unknown amenities get a generic statement.

The generic AC description now says AC depends on the selected room category. Diani's ambiguous All-Inclusive rate wording was replaced with KSh 5,000 per cottage/night, self-catering and optional KSh 1,000/person/day breakfast. The hero keeps the main rate prominent with a compact secondary inclusion line so the mobile booking CTA remains visible. The detailed price badge carries the same inclusions.

Unqualified 15–30 minute guarantees now describe a **typical response during 8AM–8PM EAT desk hours**, including form reassurance, unknown-availability messaging, review and receipt copy. Failure states still tell the truth and offer retry/call/WhatsApp. No false success state was added.

## Contrast and accessible names

Green WhatsApp actions use dark forest text/icons instead of white. The semantic `whatsapp-action` class applies to green action buttons, including dynamically rendered helpers, not plain footer text links. The hover/focus green is explicitly controlled so an old darker hover utility cannot lower contrast.

Measured text contrast pairs:

| Pair | Ratio |
|---|---:|
| Forest text / WhatsApp green #25D366 | 8.33:1 |
| Forest text / hover/focus green #1EBE5D | 6.75:1 |
| Forest text / gold benefits background | 5.94:1 |
| Driftwood FAQ label / canopy background | 5.91:1 |

The gold-section paragraph uses opaque forest text and the FAQ label uses driftwood. A rendered accessibility check also exposed an existing Call Us label/name mismatch. Dock accessible names now include the visible Call Us / Call Reception wording; telephone destinations were not changed.

## Files and build

Exact changed paths are in the manifest. Main changes are public HTML, `assets/js/main.js`, `assets/css/input.css`, compiled `assets/css/styles.css`, `package.json` (new test script), relevant AGENTS.md files and `test/contact_routing.test.js`. One existing clean-code assertion was updated to require qualified response copy instead of an unconditional confirmation promise. Existing honesty assertions were retained.

Changed CSS/main.js references use `?v=2.2.5`. Image, catalog and font assets are unchanged. Source CSS is authoritative; styles.css was rebuilt with the existing Tailwind 3.4.17 CLI, with the working directory set to the review project. Use `npm.cmd run build` in the target root for subsequent builds. No dependencies were installed or changed.

CRM source, guest data, rates, availability API implementation, analytics loading and deployment configuration were not changed. The review copy contains test-support CRM source and public asset snapshots; do not deploy that scratch copy wholesale. The actual Desktop project is the application source to continue from.

## Verification completed

- Baseline and final root clean-code suites: all 39 groups passed.
- `npm.cmd run test:mobile`: passed existing navigation/reduced-motion/calendar/quote cases.
- `npm.cmd run test:contact`: passed page/alias routes; designated-footer consistency; static destinations; saved message recovery; actual receipt/failure HTML; page-based submission-to-review routing even when another property is selected; unchanged KSh 6,800 two-room payload; catalog benefits; and contrast ratios. No HTTP inquiries or messages are sent by this test.
- Browser: homepage selecting Tower hides breakfast and explicitly reports no pool; selecting Diani shows its pool amenity and optional breakfast while retaining homepage WhatsApp 0750 864 119.
- Browser: Tower route/phone/footer distinction, Diani `.html` WhatsApp and conference links, and Darad destination all match the approved mapping.
- Browser: 320/360/390/430px checks plus 1280px desktop; no horizontal document overflow in measured views. Form text is 16px; narrow phone entry is readable. Desktop body dock padding remains zero.
- Browser: calendar remains modal in 740×360 landscape; closing restores scrolling and trigger focus.
- Final local Lighthouse 12.8.2 accessibility score: **100**, with no audits returning score zero in that run. This does not establish full manual WCAG compliance or predict a deployed PageSpeed result.

Evidence and screenshots are in `outputs/2.2.5-corrective-evidence` in the Codex workspace. No production inquiry, WhatsApp message, phone call or payment was made.

The full clean-code suite writes test fixtures through CRM libraries. It was run only against copied source with `TEST_DB_PATH` and `TEST_BACKUP_DIR` set to disposable paths under this workspace. When rerunning it, always set those variables outside actual guest storage. The standalone mobile/contact suites require no CRM database.

## Remaining checks and continuation

Production deployment requires its separate approval. After deploying, confirm all four WhatsApp routes and repeat mobile accessibility checks against the hosted site. Test real Android Chrome/iPhone Safari, software keyboard reachability, notch safe areas, reduced motion and verified zoom. Use authorized staging for full inquiry receipt/delivery/allocation verification.

Image compression and analytics-loading experiments were explicitly deferred to a separate measured performance pass. This patch does not claim to solve the previous 3.36–4.36s mobile LCP range or guarantee 90+ performance. Preserve the existing pricing, CRM honesty, page-based routing and mobile fixes during that work.

## Rollback

Before application, original versions of changed files are saved under `work/corrective-rollback-2.2.5`. Restore only the manifest-listed files from that snapshot as a consistent HTML/JS/source-CSS/compiled-CSS set. New files have `before_sha256: null`; remove them only if they are still unmodified and you intend to roll this patch back. Do not revert unrelated work that Antigravity or the user adds later. No commit or deployment was performed by this task.
