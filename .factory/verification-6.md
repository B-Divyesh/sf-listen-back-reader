# Independent verification 6 — PASS

**Candidate:** `21776f06f917254d616ff0706bc8dedc32e189e2`  
**Live URL:** <https://listen-back-reader.sociobot.in>  
**Verified:** 2026-08-29 UTC  
**Decision:** **PASS — release candidate accepted.**

This was a fresh verification in a clean checkout. Product code was not
modified. This report and the handoff are verifier documentation only.

## Mandatory first checks

`.factory/claims.json` exists and contains 14 claims. After `npm ci`, and
before general tests/build, I ran every declared command individually as
`npm test -- -t @claim:<id>`. All passed: `sentence-loop`,
`reader-controls`, `local-speech`, `local-text`, `demo-not-saved`,
`free-account-free`, `readable-text`, `source-marker`, `keyboard-shortcuts`,
`protected-pages`, `session-memory`, `active-page-only`,
`installable-package`, and `no-remote-services`.

A cold live load at both 1440px and 390px plainly says what it does — “Replay
each sentence. Keep your place.” — who it is for — “For readers who lose their
place in dense web text.” — and what to click: “Try it with sample data,” with
“Hear a sample sentence now.” alongside. That link opens `/demo` in one click.
The persistent demo banner says “Demo — sample data, nothing is saved” and
offers Reset demo and Start for real. Independent interaction advanced the
sample from 3/5 to 4/5 and enabled slow speech. After use, localStorage,
sessionStorage, and IndexedDB were empty.

## Local candidate gates — PASS

| Check | Result |
| --- | --- |
| `npm ci` | PASS; WXT prepare completed |
| `npm test` | PASS; 26/26 tests |
| `npm run typecheck` / `npm run lint` | PASS |
| `npm run build` | PASS; `dist/site/` and valid 507,002-byte MV3 ZIP |
| `npm run test:extension` | PASS; production Chromium extension flow |
| `npm run test:site` | PASS; local 1440px and 390px |
| `npm audit --omit=dev` | PASS; 0 vulnerabilities |

The production-extension exercise verifies explicit activation; the exact
browser-range marker on every sentence of a wrapping three-sentence paragraph
forward and back; source punctuation including `Dr.`, `p.m.`, `U.S.`, and
`3.14`; protected pages; keyboard controls; and popup target size.

## Live deployment, privacy, accessibility, and performance — PASS

- `VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site`
  passed at 1440px and 390px: routes, one main/h1, title/lang/alt text, no
  overflow, keyboard/history focus, 44px targets, reduced motion, loaded-shell
  offline navigation, console/page errors, request origins, and axe findings.
- Independent fresh Playwright QA likewise found no console/page errors, no
  serious/critical axe-core 4.11 findings, and no third-party request. The
  demo loaded four same-origin requests only. The keyboard focus ring is a
  visible 3px solid `rgb(173, 100, 0)` outline.
- The request log, CSP, source, and MV3 manifest confirm no analytics,
  accounts, billing, upload, remote speech, or host permission. Permissions
  are only `activeTab` and `scripting`; no static content script is present.
- `npm run test:deployment` passed against live. The extension download was
  HTTP 200, `application/zip`, an attachment, archive-valid, and byte-identical
  to local SHA-256
  `378e387bbc3434b9458fc1c15d17f66ab70530061086f3ce0b83a1a961678ae6`.
  The live JS, CSS, and mobile hero also byte-match the candidate build.
- `/`, `/demo`, `/privacy`, `/terms`, `/404.html`, `/robots.txt`, and
  `/sitemap.xml` returned 200; an unknown route returned 404. HTML uses
  30-second revalidation, hashed JS one-year immutable caching, ZIP `no-cache`,
  and responses include HSTS, `nosniff`, strict-origin referrer policy, CSP,
  and `frame-ancestors 'none'`.
- Production JS is 203,409 bytes raw / 64,000 gzip; CSS 7,994 / 2,590 gzip;
  mobile hero 50,696 bytes. Fresh mobile Lighthouse 12.8.2: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; LCP 1.38 s, CLS 0,
  TBT 47.5 ms.

There is no backend, sign-in, payment, server-side endpoint, service worker,
PWA persistence, or library/CLI consumer artifact. Rate-limit/429, Entra,
concurrency, service-worker update, and consumer-install checks do not apply.

## Defects by severity

None found.
