# Polish round 3 evidence

Application repair commits `06a37fca61300182956ff5156d5fb293c843ba5d`
and `6792e79` repair release candidate `dc5a5336554c3452a4ba34d52ddff68cfb762e02`.
They were pushed to `main` and deployed through the configured Azure Static Web
Apps work order on 2026-08-29 UTC.

The final clean clone was `/tmp/listen-back-reader-polish3-final.RoJPHL` at
`6792e79`. It ran every one of the 18 exact commands in
`.factory/claims.json` independently: all passed. Its full suite also passed:
37/37 tests, typecheck, lint, build, packaged-extension browser verification,
site accessibility/privacy/offline verification, and `npm audit --omit=dev`.

The deployed archive has SHA-256
`3dbd2fb7fe03dd01a7164e19e0192ed3d8e0a35caf6736b17bca3c2054ecf90a`.
`npm run test:deployment` proved that the public ZIP is byte-identical to the
final build. Live screenshots and URL checks are in
`.factory/evidence/polish-3/live/`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | The direct demo now starts at sentence 1 and mobile demo spacing leaves the complete marked sentence inside the first viewport. | `@claim:mobile-demo`; [demo mobile screenshot](evidence/polish-3/live/demo-mobile-first.png); live `/demo?demo=1` passed. |
| F-1-2 | Kept selection-first, then viewport-centre, initialization in the production content script. | `@claim:source-marker`; `npm run test:extension`; live `/downloads/listen-back-reader.zip` hash check passed. |
| F-1-3 | Kept real `/#how` navigation from Demo, Privacy, and Terms with heading focus. | `npm run test:site`; live `/demo?demo=1`, `/privacy`, and `/terms` passed. |
| F-1-4 | Kept per-history-entry scroll and stable-control focus restoration, including same-path hash navigation. | `npm run test:site`; live Back/Forward checks passed. |
| F-1-5 | Kept the first-screen desktop-Chromium limitation and complete extract/Load unpacked instructions. | `@claim:desktop-chromium-install`; [home mobile screenshot](evidence/polish-3/live/home-mobile-cold.png); live `/` passed. |
| F-1-6 | Kept route-specific title, description, canonical, Open Graph, and Twitter metadata. | `npm run test:site`; live `/`, `/demo?demo=1`, `/privacy`, `/terms`, and missing route checks passed. |
| F-1-7 | Kept the standard header, navigation, legal links, attribution, and version in the real static 404. | `npm run test:site`; [404 screenshot](evidence/polish-3/live/not-found-desktop.png); live `/missing-polish-3` returned HTTP 404. |
| F-1-8 | Kept the semantic popup H1, “Read one sentence”. | `npm run test:extension`; live ZIP identity check passed. |
| F-1-9 | Kept public artwork-provenance claims removed; provenance remains only in design documentation. | `rg` public-copy audit; `npm test`; live `/` and `/missing-polish-3` passed. |
| F-1-10 | Kept the untestable clean-checkout outcome promise out of README. | clean-clone `npm ci` and full suite; live README source matches deployed product documentation. |
| F-1-11 | Kept README build wording to concrete output locations rather than equivalence claims. | `@claim:installable-package`; live `/downloads/listen-back-reader.zip` passed. |
| F-1-12 | Kept public copy free of the unregistered deployment hash-gate promise. | `npm run test:deployment`; live archive byte-hash check passed. |
| F-1-13 | Kept the literal first-screen label naming one-sentence reading. | copy audit; [home mobile screenshot](evidence/polish-3/live/home-mobile-cold.png); live `/` passed. |
| F-1-14 | Kept “until you understand it” instead of metaphorical wording. | copy audit; live `/` passed. |
| F-1-15 | Kept “Read web text in three steps.” | copy audit; live `/#how` focus check passed. |
| F-1-16 | Kept the source-page slogan removed in favor of literal article-text wording. | copy audit; live `/` passed. |
| F-1-17 | Kept the plain social description naming replay and marking. | `npm run test:site` metadata checks; live `/` passed. |
| F-1-18 | Kept “local-first” out of README and stated the tested Listen Back server boundary. | `@claim:local-text`; live `/privacy` passed. |
| F-1-19 | Kept demo isolation explained in user terms and documented its isolated sample behavior. | `@claim:demo-not-saved`; live `/demo?demo=1` passed. |
| F-1-20 | Re-audited landing, demo, legal, 404, and README copy; no sentence exceeds 22 words. | `.factory/copy-audit.md`; live `/` and `/demo?demo=1` passed. |
| F-1-21 | Replaced the regressed vague exit label with **Install the extension** and preserved the focused `/#install` destination. | `@claim:mobile-demo`; [demo mobile screenshot](evidence/polish-3/live/demo-mobile-first.png); live `/demo?demo=1` passed. |
| F-1-22 | Kept the literal 404 label “Page not found”. | `npm run test:site`; [404 screenshot](evidence/polish-3/live/not-found-desktop.png); live `/missing-polish-3` passed. |
| F-1-23 | Kept the literal 404 H1 “We could not find this page.” | `npm run test:site`; [404 screenshot](evidence/polish-3/live/not-found-desktop.png); live `/missing-polish-3` passed. |
| F-1-24 | Kept direct home-page recovery copy on the static 404. | `npm run test:site`; [404 screenshot](evidence/polish-3/live/not-found-desktop.png); live `/missing-polish-3` passed. |
| F-2-1 | Kept privacy copy narrowed to no Listen Back server; browser voices remain explicitly outside that promise. | `@claim:local-text`; live `/privacy` passed. |
| F-2-2 | Kept the first-screen, tested offline boundary. | `@claim:offline-controls`; [home mobile screenshot](evidence/polish-3/live/home-mobile-cold.png); live `/` passed. |
| F-2-3 | Kept unavailable-speech and utterance-error status messages with restored read controls. | `browser demo sandbox > reports unavailable speech…`; live `/demo?demo=1` passed. |
| F-2-4 | Kept explicit Previous sentence, Next sentence, and speed-result labels. | `browser demo sandbox > reads exactly one source sentence…`; [demo mobile screenshot](evidence/polish-3/live/demo-mobile-first.png); live `/demo?demo=1` passed. |
| F-2-5 | Kept README deployment wording in plain contributor language. | copy audit; clean-clone documentation review passed. |
| F-2-6 | Kept Stop reading in the demo and popup, with real speech cancellation. | `@claim:stop-reading`; `npm run test:extension`; live ZIP identity check passed. |
| F-3-1 | Reset and demo exit now cancel browser speech before state reset/navigation, with unmount cleanup as a second guard. | strengthened `@claim:mobile-demo`; [demo mobile screenshot](evidence/polish-3/live/demo-mobile-first.png); live `/demo?demo=1` reset/exit checks passed. |
| F-3-2 | Added visible and accessible “(external)” cue to Param Factory links on every SPA route and the static 404. | `npm run test:site` and release-policy test; [404 screenshot](evidence/polish-3/live/not-found-desktop.png); live `/` and `/missing-polish-3` passed. |

## Final live checks

- `VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site`:
  PASS at 1440×900 and 390×844, including serious/critical axe checks, touch
  targets, metadata, routing, focus/scroll restoration, privacy, offline
  loaded-shell navigation, demo first viewport, and reset/exit speech cleanup.
- `/opt/fleet/lib/verify-url.sh https://listen-back-reader.sociobot.in`:
  PASS; title, language, single H1, main, alternatives, controls, and console
  checks are clean. Evidence: `evidence/polish-3/live/verify.json`.
- Lighthouse mobile on the live URL: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 1.3 s, LCP 1.4 s, CLS 0, TBT 0 ms. Evidence:
  `evidence/polish-3/live/lighthouse.json`.

No finding of any severity remains unresolved.
