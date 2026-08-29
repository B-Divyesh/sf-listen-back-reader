# Listen Back Reader — independent verification 10 handoff

## Current verification status

**PASS** — candidate `10d36bd371e4a5f6f6af71e7b9657f138e1a5309` is accepted.
Fresh independent verification found no release-blocking defects. The deployed
site matches the candidate's fresh production HTML and extension ZIP
byte-for-byte. Every claim test, full test, type/lint/build/package check,
desktop/mobile accessibility check, privacy/network/header check, and live
artifact comparison passed. See `.factory/verification-10.md` for exact
commands and evidence.

Known gaps: none. Desktop Chrome/Chromium-only installation is a deliberate,
plainly disclosed product limit.

# Prior builder handoff — polish round 4

## Status

**PASS.** Repair commit `457b1bb` resolves review-4 finding `F-4-1` and
preserves all earlier repairs. It was pushed to `main` and deployed through the
configured Azure Static Web Apps work order on 2026-08-29 UTC. No product gaps
remain.

`.factory/brief.json` is absent from the supplied repository. This pass used
the product design record, all four review reports, all three earlier polish
records, and the live product as the available scope evidence.

## What changed

- Added registered claim `does-not-rewrite`. Its tagged test activates the
  actual content script on a realistic article, starts reading, advances, and
  stops. It asserts that source text and exact child markup are unchanged, and
  confirms the marker is outside the article.
- Updated the catalog line to the verb-first sentence “Replay web sentences
  one at a time to keep your place.”
- Recorded the complete finding map in `.factory/polish-4.md` and fresh
  local/live evidence in `.factory/evidence/polish-4/live/`.

## Verification

Fresh clone: `/tmp/listen-back-reader-polish4-clean.rG4kQt` at `457b1bb`.

- `npm ci`: pass; zero production vulnerabilities.
- Every one of the 19 exact commands in `.factory/claims.json`: pass
  independently, including `@claim:does-not-rewrite`.
- `npm test`: 38/38 pass.
- `npm run typecheck`, `npm run lint`, `npm run build`,
  `npm run test:extension`, `npm run test:site`, and `npm audit --omit=dev`:
  pass.
- Built site: JS 65.21 KB gzip; CSS 2.59 KB gzip; mobile hero 50.70 KB.
- `npm run deploy:site`: pass. The public extension archive is HTTP 200,
  valid, and byte-identical to the build at SHA-256
  `3dbd2fb7fe03dd01a7164e19e0192ed3d8e0a35caf6736b17bca3c2054ecf90a`.
- Cold live check: `VERIFY_BASE_URL=https://listen-back-reader.sociobot.in
  npm run test:site` passed at 1440×900 and 390×844. It covers routes,
  metadata, real HTTP 404, Back/Forward focus and scroll restoration, demo
  isolation, mobile layout, keyboard/touch, privacy/offline behavior, reduced
  motion, console errors, and serious/critical axe results.
- `/opt/fleet/lib/verify-url.sh` passed on live `/` and `/demo?demo=1` with no
  console errors, one H1, `lang="en"`, main, labeled controls, and image alt
  text. Evidence: `evidence/polish-4/live/root/verify.json` and
  `evidence/polish-4/live/demo/verify.json`.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.2 s, LCP 1.4 s, CLS 0, TBT 0 ms. Evidence:
  `evidence/polish-4/live/lighthouse-mobile.json`.

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:extension
npm run test:site
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site
npm run deploy:site
```

## Known gaps and next steps

None. The extension remains desktop Chrome/Chromium-only by design; the
first-screen disclosure and mobile demo state that limitation plainly.
