# Independent verification 3 — FAIL

**Candidate:** `e0c2e042deb787f953028250c03ec449a9e46da6`  
**Live URL:** https://listen-back-reader.sociobot.in  
**Verified:** 2026-08-28 UTC  
**Decision:** **FAIL — do not release.**

This was an independent verification from a clean checkout. Product source was not changed; this report and the handoff are the only verifier changes.

## Critical — production cannot deliver the browser extension

The landing page's only installation control is **Download extension zip**. Fresh production requests to `https://listen-back-reader.sociobot.in/downloads/listen-back-reader.zip` returned **HTTP 404**, `text/html`, 2,219 bytes (at 2026-08-28 16:03 UTC). The response lacks the required ZIP content type and attachment response.

`VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:deployment` failed at this exact request with `HTTP 404, expected HTTP 200`. The candidate does build a valid, tested 455,127-byte MV3 archive at `dist/site/downloads/listen-back-reader.zip`; therefore the deployed site is missing that candidate output. A user cannot install the extension or complete the product's real job. This is a release blocker.

**Required fix:** deploy the exact `dist/site` output including `downloads/`, then require the public ZIP to return 200, `application/zip`, `Content-Disposition: attachment`, and the same SHA-256 as the candidate archive before re-verification.

## High — unlisted, untested public claims

The required claims file exists and its four declared tests pass, but it does not cover all claim-like copy on the live landing page and README. Examples without a corresponding `@claim:` entry/test include **“Free and account-free”**, “Finds readable article text”, “Marks the source sentence”, “Supports Alt + R … Alt + Right”, and the README's “no server, tracking, accounts, analytics, or cloud text upload.” The existing `sentence-loop`, `local-speech`, `local-text`, and `demo-not-saved` tests do not assert those specific observable outcomes. Per the claims contract, add one demo-entry test per claim (or remove/narrow the copy) before release.

## First-read and demo gate — PASS

A cold desktop browser received HTTP 200 with no page or console errors. The first screen says **“Replay each sentence. Keep your place.”** It says this is for **“readers who lose their place in dense web text”**, and says to click **“Try it with sample data”** first, with **“Hear a sample sentence now.”** next to it. In plain words: it replays one sentence to help readers retain their place; it is for people reading dense web text; click the sample action. The action opens `/demo` in one click. `/demo` shows the required persistent “Demo — sample data, nothing is saved” banner with Reset demo and Start for real controls.

## Claims contract — declared claims PASS

After `npm ci` in the clean checkout, every exact command in `.factory/claims.json` passed when run serially through the product's `/demo` entry point:

| ID | Exact command | Result |
| --- | --- | --- |
| `sentence-loop` | `npm test -- -t @claim:sentence-loop` | PASS |
| `local-speech` | `npm test -- -t @claim:local-speech` | PASS |
| `local-text` | `npm test -- -t @claim:local-text` | PASS |
| `demo-not-saved` | `npm test -- -t @claim:demo-not-saved` | PASS |

## Local quality gates and end-to-end coverage — PASS

```text
npm ci                 PASS; clean install, 0 audited vulnerabilities
npm test               PASS; 14/14 tests in 3 files
npm run typecheck      PASS
npm run lint           PASS
npm run build          PASS; valid 455,127-byte MV3 ZIP and package check
npm run test:extension PASS; production MV3 loaded in Chromium
npm run test:site      PASS; local 1440px and 390px browser matrix
```

The extension Chromium test exercised native browser speech/marker shortcuts on normal source text and verified no marker on `noarchive` and explicit `data-no-copy` pages. Unit coverage verifies source punctuation preservation, first/last sentence clamping, native speech at slow rate, local page-text extraction, and the protected-page keyboard path.

## Live site, accessibility, privacy, and policies — PASS (except download)

`VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site` passed. Its Playwright/axe-core 4.11 checks ran `/`, `/demo`, `/privacy`, `/terms`, and the 404 route at 1440px and 390px: one title/lang/main/h1, image alternatives, no serious or critical axe findings, no horizontal overflow, 44px controls, keyboard route focus/back-forward behavior, visible focus, reduced-motion scroll behavior, no console/page errors, same-origin requests, and loaded-shell offline navigation all passed. The supplied `verify-url.sh` also passed against the live root: 637 ms load; one h1 and main; no missing image alt or unlabeled buttons; no console/page errors.

The standalone `npx @axe-core/cli` could not launch because this container has Playwright Chromium but no Selenium-discoverable Chrome binary. This is not an accessibility result: the repository's Playwright axe integration above ran successfully against the live deployment.

No runtime third-party request, account, payment, analytics, AI, or text upload path was observed. Source review found native `SpeechSynthesis` and no runtime `fetch` in the extension/site. There is no product server endpoint, sign-in flow, PWA service worker, or API; rate-limit, identity-provider, and service-worker update checks are not applicable.

Live responses provide HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a same-origin CSP. The HTML revalidates after 30 seconds and the hashed JS is immutable for one year. `robots.txt`, `sitemap.xml`, all public assets, and the external Param Factory link returned 200. The one dead product link is the ZIP above.

## Deployment identity and budget evidence

The live shell assets are byte-identical to this candidate:

| Asset | SHA-256 |
| --- | --- |
| `assets/index-EC0Dh6U9.js` | `03fe64688f593b8e88b009b59c08b8ca1d26c0b20e783f181e7ec7fe8fa4d953` |
| `assets/index-krtQxORq.css` | `1a08342531dd4726649b3048a169f961d99f5db2522fec727fa42a133766a345` |
| `favicon.svg` | `46d3e9c82592d261916b9883733888adfd592e801ec0ab320ac074a6ac507ee3` |
| `apple-touch-icon.png` | `13511e0aada27afe2aed762dae06067a4c04e47fff98544f026c2a11de446ebf` |

Built initial JS is 63,690 bytes gzip (203,088 bytes raw); CSS is 2,603 bytes gzip (7,994 raw); the hero is 140,122 bytes. These satisfy the stated gzip/CSS and hero budgets. The local archive is valid but cannot be compared to a live archive because production returns 404.

## Severity summary

| Severity | Finding |
| --- | --- |
| Critical | The live extension ZIP is 404; the downloadable browser extension is unavailable. |
| High | Multiple public claims have no corresponding required claim test. |
| Medium/Low | No additional findings. |
