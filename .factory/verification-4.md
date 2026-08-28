# Independent verification 4 — FAIL

**Candidate:** `58fa7ee1df76008c2f4833c09e3107bffdb6e12e`  
**Live URL:** <https://listen-back-reader.sociobot.in>  
**Verified:** 2026-08-28 UTC  
**Decision:** **FAIL — do not release.**

This was a fresh, independent verification from the candidate checkout. No
product source was changed. The only verifier changes are this report and the
handoff.

## Release-blocking finding

### High — common punctuation drops source text, breaking the core reading loop

The product promises to read one *source* sentence at a time without changing
it. The production extension delegates that job to `splitSentences` in
`src/reader.ts`. Its regular expression cannot consume a full fragment after a
period that is not followed by whitespace; it resumes matching after the next
period and silently omits the intervening words. This is a normal dense-web
text boundary, not malformed input.

I compiled and invoked the exact candidate function, with these results:

| Source text | Returned reader steps |
| --- | --- |
| `Dr. Smith reviewed the report at 3 p.m. Then she approved it.` | `Dr.`; `m.`; `Then she approved it.` |
| `The U.S. team met. Next item.` | `S.`; `team met.`; `Next item.` |
| `A decimal is 3.14. Done.` | `14.`; `Done.` |

Thus `Smith reviewed the report at 3 p.` / `The U.` / `A decimal is 3.` are
not read at all. This fails the researched job-to-be-done (a
source-faithful, sentence-by-sentence retention aid) and makes the public
`sentence-loop` claim false for ordinary content. The existing
`@claim:sentence-loop` test uses only three uncomplicated terminal-punctuation
sentences, so it passes without detecting this loss.

**Required repair:** use a sentence segmentation strategy that never drops or
rewrites any source characters, and add a claim-level, browser-extension
integration test covering abbreviations, initialisms, and decimals. The test
must assert that the sequence supplied to speech reconstructs the original
normalized article text exactly.

### Medium — the packaged extension automatically reads every matched page

The MV3 manifest packages a `content_scripts` entry with `matches:
["<all_urls>"]`, and `entrypoints/content.ts` runs at `document_idle` and
immediately calls `pageText()` on each matched page. This occurs before a user
chooses a page or invokes a reader control. It does not upload or persist that
text (those privacy checks passed), but it is broader than the brief's
“selected article” / page-permission expectation and unnecessarily includes
sensitive ordinary pages in extension memory. The manifest also requests
`storage`, although the release policy test and source show no storage use.

**Required repair:** use an explicit active-tab/command invocation (or optional
host permission) to inject/read only the page the user asks to read, and remove
the unused `storage` permission. Preserve the existing no-copy refusal.

## Mandatory first checks

### Claims file and exact declared tests — PASS, but insufficient

`.factory/claims.json` exists and contains 12 entries. After `npm ci` from this
clean checkout, every exact `test` command passed:

| Claim ID | Result |
| --- | --- |
| `sentence-loop` | PASS |
| `reader-controls` | PASS |
| `local-speech` | PASS |
| `local-text` | PASS |
| `demo-not-saved` | PASS |
| `free-account-free` | PASS |
| `readable-text` | PASS |
| `source-marker` | PASS |
| `keyboard-shortcuts` | PASS |
| `protected-pages` | PASS |
| `session-memory` | PASS |
| `installable-package` | PASS |
| `no-remote-services` | PASS |

The passing `sentence-loop` test is not adequate evidence for the broad public
claim; the direct boundary results above are the release blocker.

### Cold first-read and one-click demo — PASS

A new browser context loaded the live root without errors. In plain words, the
first screen says it **replays each sentence and keeps the reader's place**;
it is **for readers who lose their place in dense web text**; the first action
is **“Try it with sample data”**, with **“Hear a sample sentence now.”** beside
it. The action opens `/demo` in one click. `/demo` has the persistent
“Demo — sample data, nothing is saved” banner, Reset demo, and Start for real.

At both 1440px and 390px, I moved the demo forward, toggled slow speed, reset
it, and verified the initial sentence returned. There was no horizontal
overflow, console/page error, remote request, localStorage entry,
sessionStorage entry, or IndexedDB database.

## Quality gates and end-to-end checks

```text
npm ci                                                     PASS; 251 packages, 0 audit vulnerabilities
npm test                                                   PASS; 22/22 tests
npm run typecheck                                          PASS
npm run lint                                               PASS
npm run build                                              PASS
npm run test:extension                                     PASS; production MV3 in Chromium
npm run test:site                                          PASS; local desktop/mobile matrix
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site
                                                           PASS; live desktop/mobile matrix
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:deployment
                                                           PASS; public extension archive
/opt/fleet/lib/verify-url.sh <live-url> <temp-evidence-dir>
                                                           PASS; 732 ms, no console errors
```

The extension exercise covered normal Alt+R/Alt+Left/Alt+Right movement and
marker changes, popup target size, and refusal on both `noarchive` and explicit
no-copy fixtures. The demo exercised normal controls/reset and privacy storage
boundaries. The boundary input above is the representative failure and recovery
cannot occur because the omitted source text never becomes a reader step.

Playwright axe-core 4.11 against `/`, `/demo`, `/privacy`, `/terms`, and the
real 404 at 1440px and 390px found no serious or critical violations. It also
verified one title/lang/main/h1 per route, alt text, 44px controls, keyboard
focus and back/forward focus restoration, reduced-motion behavior, same-origin
requests, loaded-shell offline navigation, and no console/page errors.

## Deployment, privacy, and response evidence

The live deployment matches this candidate:

| Artifact | SHA-256 |
| --- | --- |
| `assets/index-BaoOjxW6.js` (live and local) | `781a6f0d2e2fc1a346a3a065f01dc88ccfbf3ef394f83ea3376a0b8a523a4b61` |
| `downloads/listen-back-reader.zip` (live and local) | `de8a6a4a32c2c07c426280d635ddea9761dafc46ab7cbcc9f41acb26ea540035` |

The ZIP is 505,941 bytes, returns HTTP 200 with `application/zip` and
`Content-Disposition: attachment`, and passes archive integrity validation.
The main initial JS is 203,157 raw / 63,840 gzip bytes; CSS is 7,994 raw /
2,590 gzip bytes; the mobile hero is 50,696 bytes. These satisfy the stated
static JS/CSS and mobile-image budgets.

Observed responses provide HSTS, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, and a same-origin CSP.
Hashed assets are immutable for one year; HTML is revalidated after 30 seconds;
the extension ZIP is `no-cache`. `/`, `/demo`, `/privacy`, `/terms`,
`/404.html`, `/robots.txt`, and `/sitemap.xml` return 200; an unknown route
returns a real 404.

No product server endpoint, account/sign-in flow, payment flow, AI path, PWA
service worker, or backend exists. Rate-limit, Entra tenant, service-worker
update, persistence/concurrency, and consumer-package checks are therefore not
applicable. Static/runtime inspection and live request capture found no remote
runtime client, analytics, tracking, account, billing, or text-upload request.
Native browser speech is the only speech path. The privacy concern above is
overbroad local page access, not an outbound transfer.

## Severity summary

| Severity | Finding |
| --- | --- |
| High / release blocker | Sentence splitter silently omits source text around common abbreviations and decimals; source-faithful reading claim fails. |
| Medium | Static `<all_urls>` content script reads every ordinary page before user invocation; unused `storage` permission broadens the package needlessly. |
| Low | No additional release findings. |
