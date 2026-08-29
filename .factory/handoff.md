# Listen Back Reader — polish round 2 handoff

## Delivered

Polish round 2 repairs candidate `450540054fee5706ae8596e9b42fe564dcc80320`
against every finding in review rounds 1 and 2. The implementation commit is
`3f10d90b91759bb4e411aa8c67f5070789c094de`.

- Exact focus and scroll restoration now works through route and same-page hash
  history.
- The mobile first screen states the desktop-only install boundary, tested
  offline boundary, exact server privacy boundary, and price/account fact.
- The one-click demo remains isolated and realistic, with read, stop, previous,
  next, speed, reset, and install actions visible at 390px.
- Missing speech and utterance errors now produce actionable live feedback.
- The packaged extension and demo expose a real **Stop reading** action.
- All visible reader controls name their result.
- Public illustration provenance wording was removed; provenance remains in
  `.factory/design.md`.
- Privacy copy and `local-text` now promise only what the product proves.
- README deployment wording, catalog copy, copy audit, claims, demo docs, legal
  routes, metadata, 404, and footer were brought into the same contract.

The dithered ink-and-paper visual system, original artwork, WXT MV3 extension,
and static Azure deployment class are unchanged.

## Verification

Clean clone: `/tmp/listen-back-polish2-clean.5iobU9` at
`3f10d90b91759bb4e411aa8c67f5070789c094de`.

```text
npm ci                         PASS — 251 packages, 0 vulnerabilities
17/17 claim commands           PASS individually
npm test                       PASS — 35/35
npm run typecheck              PASS
npm run lint                   PASS
npm run build                  PASS
npm run test:extension         PASS
npm run test:site              PASS — 1440×900 and 390×844
```

The build produced:

- `dist/site/assets/*.js`: 207.14 KB raw, 65.14 KB gzip
- `dist/site/assets/*.css`: 8.12 KB raw, 2.59 KB gzip
- `public/hero-mobile.webp`: 50.70 KB
- `dist/site/downloads/listen-back-reader.zip`: 507,935 bytes

Accessibility/browser checks include one H1 and main per route, exact history
focus restoration, 44px targets, reduced motion, no mobile overflow, route
metadata, no third-party requests, no console errors, and no serious/critical
axe violations. Packaged-extension checks cover source ranges, midpoint start,
explicit activation, protected pages, popup semantics, stop cancellation, and
offline previous/next controls.

## Deployment and live checks

Deployed with `npm run deploy:site` to
<https://listen-back-reader.sociobot.in> on 2026-08-29 UTC.

- Deployment verification: HTTP 200 site; response-header CSP; downloadable ZIP
  with correct headers, archive integrity, and SHA-256
  `b00afd38c69d749962fe28b9cbf1893e7542d81089993d3881f07a31ad2977b6`.
- Live `npm run test:site`: PASS at desktop and mobile sizes.
- Factory URL verifier: PASS in 912ms with no console errors.
- Live 404: HTTP 404 with designed header/footer, title, canonical, and legal links.
- Mobile cold check: compatibility fact bottom 742px; demo read control bottom
  622px in the 844px viewport.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.4s, FCP 1.3s, CLS 0, TBT 0ms.

Evidence is in `.factory/polish-2.md` and `.factory/evidence/live/`.

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
```

Demo URL: <https://listen-back-reader.sociobot.in/demo?demo=1>.

## Known gaps and next steps

No review finding or acceptance item remains unresolved. Browser and operating
system voices vary and may require a network connection; the product states
that boundary instead of promising offline speech.
