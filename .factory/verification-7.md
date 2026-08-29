# Independent verification 7 — FAIL

**Candidate:** `aa0a0fb1300c9c62662e17fb0d8f9d2716064a1a`  
**Live URL:** <https://listen-back-reader.sociobot.in>  
**Verified:** 2026-08-29 UTC  
**Decision:** **FAIL — do not release.**

This was a fresh independent verification. Product code was not modified. The
live deployment is byte-identical to the candidate build, so these are current
product defects rather than a stale-deployment result.

## Release blockers

### Critical — the extension popup never receives article state

I downloaded the live ZIP, extracted it into a clean directory, and loaded its
production bundles in Chromium. With a valid article tab active and the runtime
reader injected, opening the packaged popup left it at **“Checking this page…”**
after two seconds. It showed neither the sentence count nor article sentence.
A direct `chrome.tabs.sendMessage(... listen-back-get-state ...)` likewise
resolved without a response.

The observed behavior follows the shipped message boundary: the popup awaits
state at `entrypoints/popup/main.tsx:28`, while the content listener at
`entrypoints/content.ts:181-201` returns plain objects from a Chrome event
listener instead of delivering a response through a supported response path.
The authored extension check opens `popup.html` only to inspect its heading,
button strings, and target sizes; it never verifies that the popup reads a real
active article. Consequently, that passing check does not cover the product's
primary popup workflow.

Impact: the principal extension UI does not finish loading or expose the
current sentence. Its visible reading state and control feedback are unusable.

### Critical — ordinary multi-paragraph articles are fused and lose the marker

I exercised the live downloaded extension against valid, minified article HTML
with a heading and three adjacent paragraphs:

```html
<article><h1>Library update</h1><p>First paragraph ends here.</p><p>Second paragraph starts here.</p><p>Third paragraph closes here.</p></article>
```

Instead of four source units or sentences, every replay/next action spoke this
single fused string:

```text
Library updateFirst paragraph ends here.Second paragraph starts here.Third paragraph closes here.
```

No `#listen-back-marker` or sentence-range overlay appeared at any step. On a
second fixture, `<p hidden>Hidden advertising sentence.</p>` was also included
in speech between two visible paragraphs.

This comes from `src/reader.ts:43-45`: `article.textContent` does not insert
separators between adjacent elements and includes hidden descendants. The
source mapper then cannot find the fused segment inside any individual heading
or paragraph. This is ordinary, standards-valid article markup and directly
breaks the brief's source-faithful, visible, one-sentence loop.

The result contradicts the public `sentence-loop`, `readable-text`, and
`source-marker` claims. Their declared tests use only a single plain-text
article or one multi-sentence paragraph, so all pass without covering this
representative structure.

### High — an on-page claim is absent from the claims contract

The first-screen fact **“the demo works on mobile”** has no entry in
`.factory/claims.json` and no exactly mapped `@claim:<id>` test. An untagged
browser test does exercise a 390px demo, and independent QA confirmed it works,
but the claims contract requires every public claim to be listed and mapped to
exactly one tagged test. This is independently release-blocking under the
provided claims acceptance rules.

### Low — demo banner does not provide the required “Start for real” action

The persistent banner correctly says **“Demo — sample data, nothing is
saved”** and provides **Reset demo**, but its other action is **Install the
extension**, not the contract's **Start for real** action. It does leave the
demo and moves to installation, so this is a labeling/contract defect rather
than a broken path.

## Mandatory first checks

### Claims file and declared tests — PASS as authored, but insufficient

`.factory/claims.json` exists and contains 17 entries. After `npm ci`, every
exact listed command ran separately before the general suite. All 17 passed:

`sentence-loop`, `reader-controls`, `local-speech`, `local-text`,
`offline-controls`, `demo-not-saved`, `free-account-free`, `readable-text`,
`source-marker`, `keyboard-shortcuts`, `protected-pages`, `session-memory`,
`active-page-only`, `installable-package`, `no-remote-services`,
`stop-reading`, and `desktop-chromium-install`.

The false positive for ordinary article structure is documented above.

### Cold first-read and one-click demo — PASS

A new Chromium context loaded the live root at 1440×900 with HTTP 200 and no
console or page errors. The first screen plainly answers all three questions:

- What: **“Replay each sentence. Keep your place.”**
- Who: **“For readers who lose their place in dense web text.”**
- First action: **“Try it with sample data”**, followed by **“Open a sample
  article with one sentence marked.”**

The action opened `/demo?demo=1` in one click. The same content and action fit
inside the first 390×844 viewport.

## Local candidate gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 251 packages; audit reported 0 vulnerabilities |
| 17 exact claim commands | PASS individually |
| `npm test` | PASS; 35/35 tests in 3 files |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS; generated `dist/site/` and a valid 507,935-byte MV3 ZIP |
| `npm run test:extension` | PASS as authored; coverage gap described above |
| `npm run test:site` | PASS at 1440px and 390px |
| `VERIFY_BASE_URL=... npm run test:deployment` | PASS; live ZIP matches local build |
| `npm audit --omit=dev` | PASS; 0 vulnerabilities |
| Factory `verify-url.sh` | PASS; 564 ms, title/lang/main/alt/buttons/errors all clean |

The live ZIP was also downloaded, extracted to a clean temporary directory,
and retested with `EXTENSION_PATH=<unpacked-live-zip> npm run test:extension`;
the authored packaged-extension check passed.

## Independent end-to-end evidence

### Live demo — PASS

At both 1440×900 and 390×844:

- initial state was sentence 3/5;
- repeated Next clamped at 5/5 and Previous at 1/5;
- Reset restored 3/5;
- slow speech supplied the visible sentence at rate `0.8`;
- Stop called cancellation and announced **“Reading stopped.”**;
- unavailable speech announced what happened and how to recover; installing a
  test voice in the same context then changed status to **“Reading sentence
  3.”**;
- localStorage, sessionStorage, and IndexedDB remained empty;
- no horizontal overflow or sub-44px visible target was found.

The empty-article fixture produced no speech and protected-page coverage passed
for both `noarchive` and explicit no-copy markup. The popup blocker prevents a
successful user-visible empty-page recovery flow in the shipped popup.

### Accessibility and keyboard — PASS for the site

Live `/`, `/demo`, `/privacy`, `/terms`, and a real 404 were tested at desktop
and 390px. Each had `lang="en"`, one `main`, one `h1`, route-specific title,
image alternatives, no horizontal overflow, and zero axe-core 4.11
serious/critical findings. The unknown route returned HTTP 404.

Keyboard-only navigation reached and activated the demo action. Its focus ring
was a visible 3px solid `rgb(173, 100, 0)` outline with 4px offset. Route/history
focus checks, touch targets, and the skip link passed. With reduced motion, root
scroll behavior was `auto` and the active sentence had zero-second animation
and transition durations.

### Privacy and network — PASS

The cold live root requested only its document, self-hosted JS, self-hosted
CSS, and responsive hero image. The full demo flow made no third-party request
and stored no data. Source and manifest inspection found no runtime `fetch`,
XHR, WebSocket, beacon, analytics, identity, payment, upload, or extension
storage path. The MV3 permissions are only `activeTab` and `scripting`, with no
static content script or host permission.

There is no product backend/API, account flow, payment path, PWA service
worker, or library/CLI consumer. Rate-limit/429, Entra authority, backend
concurrency/persistence, service-worker update, and package-consumer checks are
not applicable.

## Deployment identity, headers, caching, and budgets

The live HTML, JS, CSS, hero files, social image, icons, robots file, sitemap,
and extension ZIP all matched the candidate build byte for byte. Key hashes:

| Artifact | SHA-256 | Size |
| --- | --- | ---: |
| `index-CXseCptP.js` | `ffc36b511dc7976dc7aa3ea1084114f5bfd4da976aa9426314150d7b5d9b327f` | 207,140 B raw / 65,049 B gzip |
| `index-COejNUn-.css` | `fa45eb54ea68f18da4dbd96233a4b8b76a0653fe8213fd7ba3386a31a2b4f6d4` | 8,118 B raw / 2,599 B gzip |
| `hero-mobile.webp` | `29900e089829b1303ab65848ca58bcb565d64059e1e67de3b349b18af4d8d245` | 50,696 B |
| `listen-back-reader.zip` | `b00afd38c69d749962fe28b9cbf1893e7542d81089993d3881f07a31ad2977b6` | 507,935 B |

HTML uses 30-second revalidation; hashed JS/CSS use one-year immutable caching;
the ZIP uses `no-cache`; conditional HTML and asset requests returned 304.
Responses include HSTS, `nosniff`, strict-origin referrer policy, and a
same-origin CSP with `frame-ancestors 'none'`. All crawled internal links and
the Param Factory external link returned 200; the download returned
`application/zip` with attachment disposition.

Lighthouse 12.8.2 mobile results were Performance 100, Accessibility 100, Best
Practices 100, and SEO 100. FCP was 1.2 s, LCP 1.4 s, TBT 0 ms, CLS 0, and total
transfer 118 KiB. Lab INP was not available.

## Required remediation

1. Make Chrome runtime messages return real state/error responses and add an
   installed-extension test that activates an article and asserts the popup's
   sentence count, text, speed, speaking state, and recovery state.
2. Extract ordered **visible** prose with explicit boundaries between block
   elements, and derive speech and source ranges from the same mapping.
3. Add packaged-extension regressions for adjacent minified paragraphs,
   headings plus paragraphs, inline markup, hidden content, and empty content.
4. Add the mobile-demo claim to `.factory/claims.json` with exactly one tagged
   test, or remove that wording.
5. Provide the required **Start for real** demo-banner action/label.

## Defects by severity

| Severity | Finding |
| --- | --- |
| Critical | Extension popup stays on “Checking this page…” and does not receive valid article state. |
| Critical | Ordinary adjacent article blocks are fused into one utterance, hidden text is spoken, and no source marker appears. |
| High | Public “demo works on mobile” claim is missing from `.factory/claims.json`. |
| Low | Demo banner substitutes “Install the extension” for the required “Start for real” action. |
