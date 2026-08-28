# Independent verification 2 — FAIL

**Candidate:** `9c085b07181711bf970de7364dd0053bb428c33c`  
**Live URL:** https://listen-back-reader.sociobot.in  
**Verified:** 2026-08-28 UTC  
**Decision:** **FAIL — do not release.**

This is a fresh verification after `.factory/verification.md`. Product source was not modified.

## Critical release blocker — live extension download is missing

The primary production install link, **Download extension zip**, requests
`https://listen-back-reader.sociobot.in/downloads/listen-back-reader.zip`.
Fresh checks returned **HTTP 404**, `text/html`, 2,219 bytes. A crawl of every
same-origin landing-page link found that this is the only dead product link.

The candidate does build a valid 455,959-byte MV3 archive at
`dist/site/downloads/listen-back-reader.zip`; `unzip -t` passed and the archive
extracted to a clean temporary extension directory passed
`EXTENSION_PATH=<extracted-directory> npm run test:extension`. Live JS, CSS,
and hero bytes match the candidate, but the ZIP was not deployed. A visitor
therefore cannot install the browser extension or complete the real job.

**Required remediation:** deploy `dist/site/downloads/listen-back-reader.zip`
and verify the public URL is HTTP 200 with archive content type and a matching
byte hash before re-verification.

## First-read gate — PASS

In a cold browser at the live root, the first screen says “Replay each
sentence. Keep your place.” It says it is for “readers who lose their place in
dense web text,” and shows “Try it with sample data” with “Hear a sample
sentence now.” adjacent. Plain reading: it replays a sentence to retain place;
it is for readers of dense web text; click the sample action first. The action
opens `/demo` in one click.

## Claim contract — PASS

After `npm ci` from this clean checkout (which ran `wxt prepare`), every test
listed in `.factory/claims.json` was run before the general suite:

| Claim | Exact command | Result |
| --- | --- | --- |
| Reads one source sentence at a time | `npm test -- -t @claim:sentence-loop` | PASS |
| Uses your browser's voice | `npm test -- -t @claim:local-speech` | PASS |
| Text stays on your device | `npm test -- -t @claim:local-text` | PASS |
| Demo sample data is not saved | `npm test -- -t @claim:demo-not-saved` | PASS |

Each command ran one browser test. The full suite then passed: 13/13 tests in
3 files.

## Local gates and installed-extension test — PASS

```text
npm ci                              PASS
npm test                            PASS; 13/13
npm run typecheck                   PASS
npm run lint                        PASS
npm run build                       PASS; extension, site, ZIP, package check
npm run test:extension              PASS
npm run test:site                   PASS; local build at 1440px and 390px
VERIFY_BASE_URL=... npm run test:site PASS; deployed site at 1440px and 390px
EXTENSION_PATH=<unzipped ZIP> npm run test:extension PASS
npm audit --omit=dev                PASS; 0 vulnerabilities
```

The packaged MV3 test confirms normal keyboard shortcuts mark and advance
sentences, protected `noarchive` and explicit `data-no-copy` pages remain
untouched, and popup controls are at least 44px. Native SpeechSynthesis is the
only speech path; source inspection and browser request capture found no
runtime fetch, API, analytics, account, payment, or cloud-text path. There is
no server-side product endpoint, sign-in, or PWA service worker; rate limiting,
identity, and offline-reload checks are not applicable.

## Live demo, accessibility, and privacy — PASS

Fresh desktop (1440px) and mobile (390px) `/demo` tests observed native speech
receiving the active sentence. Slow used rate 0.8. Repeated Next clamped at
5/5 and repeated Back at 1/5; Reset restored 3/5; Start for real returned home.
`localStorage`, `sessionStorage`, and IndexedDB were empty; all requests were
same-origin; console/page errors were empty.

At both widths there was no horizontal overflow, reduced motion computed
`scroll-behavior: auto`, and keyboard focus had a 3px outline. The repository's
Playwright axe-core 4.11 integration found zero serious/critical findings on
`/`, `/demo`, `/privacy`, `/terms`, and the 404 route. All had one `main`, one
`h1`, a title, `lang="en"`, and image alternatives; back/forward route focus
passed.

## Deployment identity, budgets, and response policy

Candidate and live files match exactly:

```text
index-EC0Dh6U9.js   03fe64688f593b8e88b009b59c08b8ca1d26c0b20e783f181e7ec7fe8fa4d953
index-krtQxORq.css  1a08342531dd4726649b3048a169f961d99f5db2522fec727fa42a133766a345
hero.webp           e095ebb290f097292b7cef009fe0f0331266db62a5e6431e2612b4c8aff4295f
```

The expected ZIP hash is
`00ac297509c9507c8719139006535692031aea822b587171b13db37bb1a9da52`,
but no live comparison is possible because the URL is 404. Main JS is 63.81 KB
gzip, CSS 2.59 KB gzip, and hero 140,122 bytes: within budget. The live root
has HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and
a same-origin CSP. Hashed JS caches immutable for one year; HTML revalidates
after 30 seconds. No third-party fonts, scripts, or requests were observed.

## Severity summary

| Severity | Finding |
| --- | --- |
| Critical | Live `Download extension zip` is HTTP 404; the extension cannot be installed from production. |
| High/Medium/Low | No additional findings in this verification. |

