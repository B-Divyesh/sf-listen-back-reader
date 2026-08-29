# Independent verification 5 — FAIL

**Candidate:** `472b611ef743731efaaf3ef3cc1a7f32179054bd`  
**Live URL:** <https://listen-back-reader.sociobot.in>  
**Verified:** 2026-08-29 UTC  
**Decision:** **FAIL — do not release.**

This was a fresh verification from the supplied candidate checkout. Product
source was not changed. This report and `.factory/handoff.md` are the only
verifier changes.

## Release-blocking finding

### High — the place marker does not follow the current sentence in ordinary paragraphs

The researched product is a source-anchored retention aid: it must speak one
sentence at a time **and follow that sentence with a high-visibility focus
marker**. The public page also claims “The extension marks the source sentence.”

Fresh Chromium testing of the exact production MV3 build served a normal
single-paragraph article:

```text
First sentence is brief. Second sentence is the current reading target.
Third sentence closes the paragraph.
```

After explicit injection, `Alt+R`, and two `Alt+Right` steps, the marker labels
correctly changed to each sentence. Its geometry did not:

| Current sentence | Marker rectangle (x, y, width, height) |
| --- | --- |
| First sentence is brief. | `-1, 12, 1290, 26` |
| Second sentence is the current reading target. | `-1, 12, 1290, 26` |
| Third sentence closes the paragraph. | `-1, 12, 1290, 26` |

The paragraph rectangle was `8, 16, 1264, 18`. In other words, the orange
outline is an expanded paragraph outline for every step; it does not move to
or bound the current sentence. This is caused by `entrypoints/content.ts`,
which locates a containing `p`/heading/list element and sizes the marker from
that whole element’s `getBoundingClientRect()`.

Dense web prose commonly has multiple sentences per paragraph. On those pages
the reader cannot use the marker to regain the exact sentence after an
interruption, defeating the product’s distinguishing job. The declared
`@claim:source-marker` regression uses one sentence per paragraph and only
asserts the marker label/border, so it misses this observable failure.

**Required repair:** create a true sentence-range marker (for example, a
wrapped, reversible text range with a positioned overlay for that range), keep
the source DOM usable, and add a production-extension claim regression with
at least three sentences in one wrapping paragraph that asserts the marker’s
visible range/geometry changes for every next/previous step.

## Mandatory first checks

### Claims contract — PASS

`.factory/claims.json` exists and has 14 entries. After `npm ci` (which ran
`wxt prepare`) and before the general suite/build, I ran every exact listed
command individually:

| Claim ID | Result |
| --- | --- |
| `sentence-loop` | PASS |
| `reader-controls` | PASS |
| `local-speech` | PASS |
| `local-text` | PASS |
| `demo-not-saved` | PASS |
| `free-account-free` | PASS |
| `readable-text` | PASS |
| `source-marker` | PASS (insufficient fixture; see blocker) |
| `keyboard-shortcuts` | PASS |
| `protected-pages` | PASS |
| `session-memory` | PASS |
| `active-page-only` | PASS |
| `installable-package` | PASS |
| `no-remote-services` | PASS |

The individual commands use `npm test -- -t @claim:<id>` exactly as declared.
The browser claims open the product’s `/demo` entry point. A passing declared
claim test does not overcome the independently observed false sentence-marker
outcome above.

### Cold first-read and one-click demo — PASS

A cold live root load returned HTTP 200 with no console or page errors. The
first screen plainly says **“Replay each sentence. Keep your place.”**, says it
is **“For readers who lose their place in dense web text.”**, and exposes
**“Try it with sample data”** with **“Hear a sample sentence now.”** alongside.
In plain words: it reads one sentence at a time for people who lose their place
in dense web text; click the sample action first. That action opens `/demo` in
one click.

`/demo` displayed the persistent **“Demo — sample data, nothing is saved”**
banner plus Reset demo and Start for real. At 390px, Next clamped from 3/5 to
5/5, Back clamped to 1/5, Slow supplied rate 0.8 to native speech, Reset
returned to 3/5, and Start for real returned to `/` and removed the banner.

## Quality gates and end-to-end coverage

All available repository gates passed from the candidate checkout:

```text
npm ci                                                        PASS; 251 packages, 0 audit vulnerabilities
npm test                                                      PASS; 25/25
npm run typecheck                                             PASS
npm run lint                                                  PASS
npm run build                                                 PASS; produces dist/site and MV3 ZIP
npm run test:extension                                        PASS; production MV3 Chromium exercise
npm run test:site                                             PASS; local 1440px and 390px
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site
                                                               PASS; live 1440px and 390px
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:deployment
                                                               PASS; live ZIP hash/integrity
/opt/fleet/lib/verify-url.sh https://listen-back-reader.sociobot.in <temp-dir>
                                                               PASS; 831 ms, title/lang/main/alt/buttons/errors
npm audit --omit=dev                                          PASS; 0 vulnerabilities
```

The packaged extension test exercised explicit active-tab injection, a normal
article, source-faithful dense punctuation (`Dr.`, `p.m.`, `U.S.`, and `3.14`),
Alt+R/Alt+Left/Alt+Right, protected `noarchive`/explicit no-copy pages, and
popup target sizes. The independent multi-sentence-paragraph exercise above
is the representative normal-content failure.

There is no product server endpoint, account/sign-in flow, payment flow, AI
path, PWA service worker, backend persistence, or consumer package. Rate-limit,
Entra tenant, service-worker update, concurrency, and consumer-install checks
therefore do not apply.

## Live privacy, accessibility, deployment, and performance evidence

- Live Playwright checks at desktop and 390px found no horizontal overflow,
  console/page errors, or serious/critical axe-core 4.11 violations on `/`,
  `/demo`, `/privacy`, `/terms`, and the real 404. Each has one `main`, one
  `h1`, a title, `lang="en"`, and image alternatives. Keyboard route focus and
  back/forward focus restoration passed; reduced-motion scroll behavior is
  `auto`; visible controls meet the 44px target check.
- In a fresh live 390px demo context, request capture saw only this origin:
  document, self-hosted JS/CSS, and self-hosted hero image. `localStorage`,
  `sessionStorage`, and IndexedDB were empty after demo use. Source inspection
  found no runtime client, tracking, account, billing, upload, or analytics
  implementation; native browser speech is the only speech path.
- The live landing JS, CSS, responsive hero, favicon, and Apple icon are
  byte-identical to the candidate. Live extension ZIP is HTTP 200,
  `application/zip`, `Content-Disposition: attachment`, archive-valid, and
  byte-identical to the candidate at SHA-256
  `fd9797232c07f60c69d74ae3108d52888b5ed963610632df56e9a4f1b073c557`.
  This confirms the prior deployment-only missing-ZIP failure is repaired.
- Built landing JS is 203,409 bytes raw / 63,882 bytes gzip; CSS is 7,994 raw
  / 2,603 bytes gzip; mobile hero is 50,696 bytes. These meet the stated static
  budgets. HTML revalidates in 30 seconds, hashed JS is immutable for one year,
  and the ZIP is `no-cache`.
- Responses include HSTS, `X-Content-Type-Options: nosniff`, strict-origin
  referrer policy, and a same-origin CSP. `/`, `/demo`, `/privacy`, `/terms`,
  `/404.html`, `/robots.txt`, `/sitemap.xml`, the download, and the external
  Param Factory link all returned 200; an unknown product route returned 404.

### Low — framing policy required by the site contract is absent

The live CSP is `default-src 'self'; ...; connect-src 'self';` and has no
`frame-ancestors` directive. The site-structure contract calls for
`frame-ancestors` as a response header (not a CSP meta element). This static,
no-account site has no sensitive account state, so it is not the release
decision; add an appropriate response-header directive (such as
`frame-ancestors 'none'`) during the marker repair.

## Severity summary

| Severity | Finding |
| --- | --- |
| High / release blocker | The marker outlines the containing paragraph, not the current sentence, so the core source-anchored place cue fails on ordinary multi-sentence paragraphs. |
| Low | CSP response lacks the required `frame-ancestors` policy. |
