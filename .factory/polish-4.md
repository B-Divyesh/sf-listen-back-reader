# Polish round 4 evidence

Release candidate `12de1f9f872de62affb7b7751049d36532ffe34a` was reviewed at
`431512135bddc08c95e6a9d3b665aa07d7b6457e`. Repair commit `457b1bb` was
pushed to `main` and deployed through the configured Azure Static Web Apps work
order on 2026-08-29 UTC.

The app was cold-opened after deployment at
<https://listen-back-reader.sociobot.in> and
<https://listen-back-reader.sociobot.in/demo?demo=1>. The deployed ZIP is
HTTP 200, valid, and byte-identical to the release build at SHA-256
`3dbd2fb7fe03dd01a7164e19e0192ed3d8e0a35caf6736b17bca3c2054ecf90a`.

Fresh-clone evidence came from
`/tmp/listen-back-reader-polish4-clean.rG4kQt` at `457b1bb`: `npm ci`, every
one of the 19 exact claim commands independently, `npm test` (38/38),
typecheck, lint, build, packaged-extension browser verification, site
accessibility/privacy/offline verification, and `npm audit --omit=dev` all
passed. The live browser suite was rerun with
`VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site`.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Direct demo uses the original city-library report, starts at sentence 1, and keeps controls plus the entire marked sentence in the mobile first view. | `@claim:mobile-demo`; `evidence/polish-4/live/demo/screenshot-mobile.png`; live `/demo?demo=1`. |
| F-1-2 | The packaged content script selects the browser selection first, then the sentence nearest viewport centre. | `@claim:source-marker`; `npm run test:extension`; live ZIP deployment check. |
| F-1-3 | Header links use `/#how`; the router returns home and focuses `how-heading`. | Live `npm run test:site` from Demo, Privacy, and Terms; live `/#how`. |
| F-1-4 | Each history entry stores scroll and stable control focus; pop navigation restores both, including hash history. | Live `npm run test:site` Back/Forward checks at both viewports. |
| F-1-5 | The hero states the desktop Chromium limit before the mobile fold and installation gives extraction and Load unpacked steps. | `@claim:desktop-chromium-install`; `evidence/polish-4/live/root/screenshot-mobile.png`; live `/`. |
| F-1-6 | Demo, legal, and error routes use route-specific title, description, canonical, Open Graph, and Twitter fields. | Live `npm run test:site` route-head checks for `/`, `/demo`, `/privacy`, `/terms`, and 404. |
| F-1-7 | The real 404 has shared navigation, legal links, factory attribution, version, and a home action. | Live `npm run test:site`; `evidence/polish-4/live/not-found-desktop.png`; live `/missing-polish-4` returns 404. |
| F-1-8 | The packaged popup has its `Read one sentence` H1 and main landmark. | `npm run test:extension` packaged-popup accessibility check. |
| F-1-9 | Public illustration provenance copy remains removed; source provenance remains in the private design record. | Public-copy audit; live `/` and `/missing-polish-4` screenshots. |
| F-1-10 | README states runnable commands without promising an unregistered clean-checkout outcome. | Fresh-clone `npm ci` and complete suite pass. |
| F-1-11 | README names concrete build outputs; the real downloadable MV3 archive remains claimed and tested. | `@claim:installable-package`; `npm run build`; live ZIP HTTP 200 check. |
| F-1-12 | Public copy does not promise an unregistered release hash gate; the operator gate remains real. | `npm run deploy:site`; live byte-identical ZIP verification. |
| F-1-13 | First-screen kicker literally states one-sentence reading. | Copy audit; `evidence/polish-4/live/root/screenshot-mobile.png`; live `/`. |
| F-1-14 | Preview uses “until you understand it,” not the former metaphor. | Copy audit; cold live `/` check. |
| F-1-15 | The instruction heading says “Read web text in three steps.” | Copy audit; live `/#how` focus check. |
| F-1-16 | The former source-page slogan remains replaced by a concrete article-text statement. | Copy audit; cold live `/` check. |
| F-1-17 | Social descriptions plainly describe replaying and marking, per route. | Live `npm run test:site` metadata checks. |
| F-1-18 | README avoids “local-first” and names the narrower Listen Back server boundary. | `@claim:local-text`; live `/privacy`. |
| F-1-19 | Demo wording describes separate sample data instead of implementation jargon. | `@claim:demo-not-saved`; live `/demo?demo=1`. |
| F-1-20 | All visitor-facing landing, demo, legal, 404, README, and catalog sentences were re-audited at 22 words or fewer. | `.factory/copy-audit.md`; cold live `/` and `/demo?demo=1`. |
| F-1-21 | Banner action is `Install the extension` and moves focus to installation steps. | `@claim:mobile-demo`; live `npm run test:site`; demo mobile screenshot. |
| F-1-22 | 404 kicker is the literal “Page not found.” | Live `npm run test:site`; `evidence/polish-4/live/not-found-desktop.png`. |
| F-1-23 | 404 H1 is the literal “We could not find this page.” | Live `npm run test:site`; 404 screenshot. |
| F-1-24 | 404 recovery names the home page and exposes a home action. | Live `npm run test:site`; 404 screenshot. |
| F-2-1 | Privacy wording remains limited to no article-text request to a Listen Back server. | `@claim:local-text`; live `/privacy` check. |
| F-2-2 | Hero states the tested offline boundary; loaded extension controls move offline without requests. | `@claim:offline-controls`; `npm run test:extension`; root mobile screenshot. |
| F-2-3 | Demo has polite unavailable/error messages and restores an idle read action. | Demo browser failure-state test; live `/demo?demo=1`. |
| F-2-4 | Reader controls visibly name previous, next, stop, and the selected speed result. | `@claim:reader-controls`; demo mobile screenshot; live demo. |
| F-2-5 | README uses “repository's deploy script” rather than internal deployment jargon. | Copy audit; fresh-clone README review. |
| F-2-6 | Demo and popup expose Stop reading and call browser speech cancellation. | `@claim:stop-reading`; `npm run test:extension`; live demo suite. |
| F-3-1 | Reset, demo exit, and unmount cancel speech before resetting or navigating. | `@claim:mobile-demo`; live `npm run test:site`; live demo check. |
| F-3-2 | All Param Factory links visibly and accessibly identify the external site. | Live `npm run test:site`; root and 404 screenshots. |
| F-4-1 | Registered `does-not-rewrite`; its production-content-script test preserves exact article text and markup through start, next, and stop. | `@claim:does-not-rewrite`; clean-clone claim log; live extension ZIP identity check. |

## Fresh evidence

- Root cold check: `evidence/polish-4/live/root/verify.json` reports 770 ms,
  no console errors, one H1, `lang="en"`, main, no missing alt text, and no
  unlabeled buttons. Screenshots: `root/screenshot-desktop.png` and
  `root/screenshot-mobile.png`.
- Demo cold check: `evidence/polish-4/live/demo/verify.json` reports 1561 ms
  with the same structural, control, and console result. Screenshots:
  `demo/screenshot-desktop.png` and `demo/screenshot-mobile.png`.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.2 s, LCP 1.4 s, CLS 0, and TBT 0 ms. Evidence:
  `evidence/polish-4/live/lighthouse-mobile.json`.
- Fresh build output: JavaScript 65.21 KB gzip, CSS 2.59 KB gzip, and mobile
  hero 50.70 KB. The initial JavaScript budget remains below 150 KB gzip.

No finding of any severity remains unresolved.
