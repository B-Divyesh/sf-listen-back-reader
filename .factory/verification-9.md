# Independent verification 9 — Listen Back Reader

## Result

**PASS** for candidate `12de1f9f872de62affb7b7751049d36532ffe34a`.

Verified on 2026-08-29 UTC against
<https://listen-back-reader.sociobot.in>. The deployed `index.html` and
extension ZIP are byte-identical to a fresh local production build of this
candidate. There are no open defects.

## Cold first read

Opened the live root page in a new browser context before interaction. It says
that Listen Back replays one web sentence at a time and marks the reader's
place; it is for readers who lose their place in dense web text; and the first
action is **Try it with sample data**, with the result stated beside it: open a
sample article with one sentence marked. The one-click action opens
`/demo?demo=1`. This passes the plain-words and demo-sandbox first-screen gate.

## Required claim gate — run first

After `npm ci`, every command named by `.factory/claims.json` was run
individually, before general product inspection. All 18 passed:

```text
@claim:sentence-loop             PASS
@claim:reader-controls           PASS
@claim:local-speech              PASS
@claim:local-text                PASS
@claim:offline-controls          PASS
@claim:demo-not-saved            PASS
@claim:free-account-free         PASS
@claim:readable-text             PASS
@claim:source-marker             PASS
@claim:keyboard-shortcuts        PASS
@claim:protected-pages           PASS
@claim:session-memory            PASS
@claim:active-page-only          PASS
@claim:installable-package       PASS
@claim:no-remote-services        PASS
@claim:stop-reading              PASS
@claim:desktop-chromium-install  PASS
@claim:mobile-demo               PASS
```

Each was invoked exactly as declared, for example
`npm test -- -t @claim:local-text`. The browser claims use the shipped
`/demo?demo=1` sandbox. `claims.json` exists and maps each public claim to one
test.

## Local release evidence

Fresh dependency install and final successful quality-gate runs:

```text
npm ci                 PASS — 251 packages installed; 0 vulnerabilities
npm test               PASS — 3 files, 37 tests
npm run typecheck      PASS
npm run lint           PASS
npm run build          PASS — dist/site plus 508,230-byte MV3 ZIP
npm run test:extension PASS — production MV3 exercised in Chromium
npm run test:site      PASS — desktop/mobile, axe, focus, privacy, offline shell
npm audit --omit=dev   PASS — 0 vulnerabilities
```

The static-site JavaScript is 64,984 bytes gzip and CSS is 2,600 bytes gzip;
both are within the product budgets. The mobile hero is 50,696 bytes. The
production build has no third-party font or script dependency.

## Live deployment, privacy, and end-to-end evidence

```text
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site
PASS — 1440×900 and 390×844; zero serious/critical axe findings on /,
       /demo, /privacy, /terms and 404; keyboard history/focus, 44px targets,
       reduced motion, loaded-shell offline navigation, and no remote requests.

VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:deployment
PASS — HTTP 200, CSP frame policy, ZIP response headers and archive integrity.

/opt/fleet/lib/verify-url.sh https://listen-back-reader.sociobot.in <temp-dir>
PASS — 671 ms; title, lang=en, one h1, main, image alt and control labels;
       no console or page errors.
```

The deployed ZIP SHA-256 and the local candidate ZIP SHA-256 are both
`3dbd2fb7fe03dd01a7164e19e0192ed3d8e0a35caf6736b17bca3c2054ecf90a`.
The live root HTML also compared byte-for-byte with `dist/site/index.html`.

A cold live-page request log contained only same-origin document, image, JS,
and CSS requests. After the demo loaded, reading, slower speed, previous/next,
stop, reset, and demo exit made no network requests; demo localStorage and
sessionStorage remained empty. The live response sends `connect-src 'self'`,
`frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, and strict-origin
referrer policy. Hashed JS/CSS are immutable for one year; HTML and images use
short revalidation; the extension download is `no-cache` and an attachment.

Manual live exercise confirmed the representative and boundary paths: sentence
1 remains selected on Previous, sentence 5 remains selected after repeated
Next, the visible sentence is passed unchanged to browser speech at 0.8×,
Stop calls speech cancellation, and no-voice recovery says “Speech is
unavailable. Enable a browser voice, then try again.” At 390×844 the demo
banner, counter, all controls, and marked sentence fit in the first viewport.
Keyboard Tab reaches the skip link, navigation, demo action, and controls; the
tested control has a visible `3px` solid focus outline. Reduced-motion CSS
sets scroll behavior to `auto`.

Routes `/`, `/demo?demo=1`, `/privacy`, `/terms`, `robots.txt`, and
`sitemap.xml` return 200; an unknown route returns the designed 404 with HTTP
404. This static product has no service-worker/PWA behavior, server endpoints,
sign-in, billing, or rate-limited API surface, so those checks are not
applicable.

Fresh live Lighthouse mobile results (Chrome/Chromium): Performance 100,
Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.4 s, CLS 0,
TBT 0 ms.

## Defects by severity

None.
