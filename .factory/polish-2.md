# Polish round 2 evidence

Candidate `450540054fee5706ae8596e9b42fe564dcc80320` was repaired in
`3f10d90b91759bb4e411aa8c67f5070789c094de` and deployed to
<https://listen-back-reader.sociobot.in> on 2026-08-29 UTC.

The clean clone was `/tmp/listen-back-polish2-clean.5iobU9`. Each of the 17
commands in `.factory/claims.json` passed individually there before the full
suite. Live screenshots are under `.factory/evidence/live/`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the original city-library report and placed all four explicit reader controls above the article in a two-row mobile layout. | `browser demo sandbox > enters the isolated sample directly...`; `live/demo-mobile-cold.png`; live `/demo?demo=1`, read control bottom `622px` at `390×844`. |
| F-1-2 | Kept selection-first and viewport-centre initial sentence detection in the production content script. | `@claim:source-marker`; `npm run test:extension`; live extension ZIP hash gate. |
| F-1-3 | Kept `/#how` as the real target and routed before focusing `#how-heading`. | `scripts/verify-site.mjs` checks Demo, Privacy, and Terms; live `VERIFY_BASE_URL=... npm run test:site`. |
| F-1-4 | Added stable IDs to restorable controls, saved focus and scroll on `focusin` and `scroll`, and reran restoration for same-path hash history. | `scripts/verify-site.mjs` checks footer Privacy scroll/focus plus `/#how` Back/Forward focus; live site suite passes at both viewports. |
| F-1-5 | Put “Extension requires desktop Chrome or Chromium; the demo works on mobile” in the first-screen facts and retained complete extraction steps. | `@claim:desktop-chromium-install`; `live/home-mobile-cold.png`; live fact bottom `742px` at `390×844`. |
| F-1-6 | Retained route-specific title, description, canonical, OG, and Twitter metadata for every route. | `scripts/verify-site.mjs`; live Privacy/Terms/404 cold checks; `live/privacy-desktop.png`, `live/terms-desktop.png`. |
| F-1-7 | Kept the standard header, navigation, legal links, factory link, and version on the HTTP 404. | Live `/missing-live-check` returned `404`; `live/not-found-desktop.png`; site route test. |
| F-1-8 | Kept the popup H1 “Read one sentence” and its semantic main landmark. | `npm run test:extension` packaged-popup semantic check. |
| F-1-9 | Removed the remaining public illustration-generation sentence from both SPA and static 404 footers. Provenance remains only in `.factory/design.md`. | `rg 'Original|generated for this product|illustration generated' src public README.md` returns no public match; live footer screenshots. |
| F-1-10 | Kept README setup as commands without a clean-checkout outcome promise. | Clean clone `npm ci`, full test, and typecheck pass; claim-map regression. |
| F-1-11 | Kept build documentation limited to output locations and tested the downloadable MV3 artifact. | `@claim:installable-package`; `npm run build`; `scripts/verify-package.mjs`. |
| F-1-12 | Kept release wording free of an unregistered hash-gate claim while retaining the operator verification. | `npm run deploy:site`; live ZIP SHA-256 `b00afd38c69d749962fe28b9cbf1893e7542d81089993d3881f07a31ad2977b6`. |
| F-1-13 | Kept the literal hero label about reading one sentence at a time. | `.factory/copy-audit.md`; `live/home-mobile-cold.png`. |
| F-1-14 | Kept “until you understand it” instead of metaphorical wording. | `.factory/copy-audit.md`; live landing preview. |
| F-1-15 | Kept “Read web text in three steps.” | `.factory/copy-audit.md`; live `/#how`. |
| F-1-16 | Kept the source-page slogan removed and used literal article-text wording. | `.factory/copy-audit.md`; live landing limits. |
| F-1-17 | Kept the plain social description about replaying and marking one sentence. | `scripts/verify-site.mjs` metadata checks; live route suite. |
| F-1-18 | Kept “local-first” out of README and stated the exact server boundary. | `README.md`; `.factory/copy-audit.md`; `@claim:local-text`. |
| F-1-19 | Kept the demo separation wording in user terms and documented its in-memory implementation separately. | `@claim:demo-not-saved`; `.factory/demo.md`; storage remained empty. |
| F-1-20 | Re-audited landing, demo, legal, error, and README copy; the longest line is 20 words. | `.factory/copy-audit.md`; banned-word search returned no matches. |
| F-1-21 | Kept **Install the extension** as the banner exit and focused the install heading on arrival. | `@claim:free-account-free`; live demo banner screenshot; route focus suite. |
| F-1-22 | Kept the 404 kicker “Page not found”. | Live HTTP 404; `live/not-found-desktop.png`. |
| F-1-23 | Kept the 404 H1 “We could not find this page.” | Live HTTP 404 title/H1 check; `live/not-found-desktop.png`. |
| F-1-24 | Kept the direct home-page recovery sentence and action. | Live HTTP 404 screenshot and link crawl in site suite. |
| F-2-1 | Replaced every broad device-residency promise with “Listen Back does not send article text to a Listen Back server.” The test clears requests after load and asserts reading makes none. | `@claim:local-text`; public-copy search finds no “text stays” or “does not leave” promise. |
| F-2-2 | Added the first-screen offline boundary and registered it. The packaged extension moves next and previous while its loaded article context is offline with no request. | `@claim:offline-controls`; `scripts/verify-extension.mjs`; `live/home-mobile-cold.png`. |
| F-2-3 | Added a polite live status, missing-API feedback, utterance `onerror`, exception recovery, and idle-button restoration. | `browser demo sandbox > reports unavailable speech and an utterance error...`; live axe suite. |
| F-2-4 | Replaced Back, Next, and Slow with visible **Previous sentence**, **Next sentence**, and explicit speed actions. | `browser demo sandbox > reads exactly one source sentence...`; `live/demo-mobile-cold.png`. |
| F-2-5 | Replaced factory jargon with “Deploy the site with the repository's deploy script”. | `README.md`; `.factory/copy-audit.md`. |
| F-2-6 | Added **Stop reading** to demo and popup, real `speechSynthesis.cancel()`, end/error state updates, and packaged speaking-state evidence. | `@claim:stop-reading`; unit test `cancels active speech...`; `npm run test:extension`; live demo stop/error tests. |

## Final live evidence

- `VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site`:
  PASS at `1440×900` and `390×844`, including exact focus/scroll history,
  serious/critical axe checks, touch targets, console, privacy, and offline shell.
- `/opt/fleet/lib/verify-url.sh`: PASS, `loadMs=912`, no console errors, one H1,
  `lang=en`, main landmark, no missing alt text, no unlabeled buttons.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.4s, FCP 1.3s, CLS 0, TBT 0ms.
- Build output: JS 65.14 KB gzip; CSS 2.59 KB gzip; mobile hero 50.70 KB;
  extension ZIP 507,935 bytes.
- Cold live routes: `/`, `/demo?demo=1`, `/privacy`, and `/terms` returned 200;
  `/missing-live-check` returned the designed 404.

All findings from review rounds 1 and 2 are resolved. No severity is deferred.
