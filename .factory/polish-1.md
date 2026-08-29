# Polish round 1 evidence

Candidate `21776f06f917254d616ff0706bc8dedc32e189e2` was repaired in
`ef38b1f820341e2c165f7daf3cff8aadef8aa8f5` and deployed to
https://listen-back-reader.sociobot.in on 2026-08-29 UTC.

| finding | change made | evidence |
| --- | --- | --- |
| F-1-1 | Replaced synthetic copy with an original city-library report; added visible **Read highlighted sentence** controls above the article. | `src/demo.browser.test.ts`; live [mobile demo](https://listen-back-reader.sociobot.in/?demo=1); `/tmp/listen-back-live-demo-390.png` |
| F-1-2 | Initial reader position now uses the selected sentence, otherwise the sentence nearest the viewport centre. | `@claim:source-marker`, `scripts/verify-extension.mjs` midpoint fixture |
| F-1-3 | Header uses `/#how`; SPA navigation returns home and focuses the How it works heading. | `scripts/verify-site.mjs`; live `/demo?demo=1`, `/privacy`, `/terms` |
| F-1-4 | History entries now retain scroll and focus state; pop navigation restores them without scrolling focus into view. | `scripts/verify-site.mjs` back/forward checks |
| F-1-5 | Landing and README now state desktop Chromium-only support and the extract → extensions → Developer mode → Load unpacked path. | `@claim:desktop-chromium-install`; live home screenshot `/tmp/listen-back-live-home-1440.png` |
| F-1-6 | Each SPA route updates title, description, canonical, OG, and Twitter fields; 404 has non-indexed static metadata. | `scripts/verify-site.mjs`; live `/demo?demo=1`, `/privacy`, `/terms`, `/missing-page` |
| F-1-7 | Static 404 now has the standard navigation and complete footer. | `scripts/verify-site.mjs`; `/tmp/listen-back-live-404.png` |
| F-1-8 | Popup now has the `Read one sentence` H1. | `scripts/verify-extension.mjs`; `npm run test:extension` |
| F-1-9 | Removed the untestable public “Original” provenance claim while retaining provenance records in design documentation. | `rg 'Original' src public README.md`; full claim-map test |
| F-1-10 | Removed the clean-checkout outcome promise from README; documented concrete commands instead. | clean clone `/tmp/listen-back-clean.33bvyZ`; `npm ci` and full suite pass |
| F-1-11 | Narrowed build documentation to output locations; the tested installable-package claim remains. | `@claim:installable-package`; `npm run build` |
| F-1-12 | Removed the unlisted release-hash marketing assertion; deployment verification remains an operator gate. | `npm run deploy:site`; `npm run test:deployment` |
| F-1-13 | Rewrote hero kicker to name reading one sentence at a time. | live `/`; copy audit |
| F-1-14 | Replaced “until it lands” with “until you understand it.” | live `/`; copy audit |
| F-1-15 | Rewrote “three steady steps” as “three steps.” | live `/#how`; copy audit |
| F-1-16 | Replaced the source-page slogan with a concrete article-text statement. | live `/`; copy audit |
| F-1-17 | Rewrote social description in plain language and made route metadata specific. | `scripts/verify-site.mjs`; live route head checks |
| F-1-18 | Removed “local-first” from README. | README copy audit |
| F-1-19 | Rewrote demo explanation around separate sample data rather than memory implementation. | README and `.factory/demo.md` |
| F-1-20 | Removed the overlong release sentence and split installation directions into short steps. | `.factory/copy-audit.md` |
| F-1-21 | Replaced ambiguous **Start for real** with **Install the extension**, which lands at installation instructions. | `src/demo.browser.test.ts`; live `?demo=1` |
| F-1-22 | Replaced 404 brand-lore kicker with **Page not found**. | live `/missing-page`; screenshot path above |
| F-1-23 | Rewrote the 404 H1 as **We could not find this page.** | live `/missing-page`; `scripts/verify-site.mjs` |
| F-1-24 | Rewrote 404 recovery copy as a direct home-page instruction. | live `/missing-page`; `scripts/verify-site.mjs` |

All 15 claim commands listed in `.factory/claims.json` passed individually from
the clean clone. The full clean-clone suite passed: 29 tests, typecheck, lint,
build, packaged-extension browser test, and site accessibility/privacy/offline
test. Production deployment verification passed with the ZIP response and hash
`8deebcb03b8f32e2e5eefe76be8e4c7546673850b49b16c1e89d25e8eae08c28`.
