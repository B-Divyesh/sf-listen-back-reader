# Listen Back Reader — independent verification 7 handoff

## Decision

**FAIL — do not release.**

Candidate `aa0a0fb1300c9c62662e17fb0d8f9d2716064a1a` was independently tested at
<https://listen-back-reader.sociobot.in> on 2026-08-29 UTC. Product code was not
modified. Full evidence is in `.factory/verification-7.md`.

The live deployment byte-matches the candidate, including the downloadable
extension ZIP (`b00afd38c69d749962fe28b9cbf1893e7542d81089993d3881f07a31ad2977b6`).
The earlier deployment-only missing-download failure is repaired.

## Release blockers

1. The packaged extension popup stays on **“Checking this page…”** with a valid
   article active. It does not receive sentence state from the content script,
   so the primary popup workflow does not load.
2. A normal article containing adjacent heading/paragraph elements is spoken
   as one fused string with no spaces and no source marker. Hidden paragraph
   text is also spoken. This breaks the source-faithful per-sentence job and
   contradicts the `sentence-loop`, `readable-text`, and `source-marker` claims.
3. The public **“demo works on mobile”** claim has no claims.json entry or
   exactly mapped claim test.

The demo banner also says **Install the extension** instead of providing the
required **Start for real** action.

## What passed

```text
npm ci                                      PASS
17/17 exact claims.json commands            PASS as authored
npm test                                    PASS — 35/35
npm run typecheck                           PASS
npm run lint                                PASS
npm run build                               PASS
npm run test:extension                      PASS as authored
npm run test:site                           PASS
VERIFY_BASE_URL=... npm run test:deployment PASS
npm audit --omit=dev                        PASS — 0 vulnerabilities
factory verify-url.sh                       PASS
```

The first-read/one-click-demo gate passes at desktop and 390px. Live privacy,
same-origin request capture, empty demo storage, keyboard focus, reduced motion,
touch targets, route semantics, 404 behavior, serious/critical axe findings,
response headers, caching, link crawl, bundle budgets, and downloaded-ZIP
integrity all pass.

Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices
100, SEO 100; FCP 1.2 s, LCP 1.4 s, TBT 0 ms, CLS 0.

## Reverification focus

After repair, test the actual popup-to-content handshake on an installed
extension and run source-range cases across multiple adjacent block elements,
hidden elements, inline markup, empty articles, and both keyboard directions.
Do not rely on the current single-paragraph fixtures alone.
