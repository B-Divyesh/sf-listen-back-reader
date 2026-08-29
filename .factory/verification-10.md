# Independent verification 10 — Listen Back Reader

## Result

**PASS** for candidate `10d36bd371e4a5f6f6af71e7b9657f138e1a5309`.

Verified independently on 2026-08-29 UTC against
<https://listen-back-reader.sociobot.in>. A fresh local production build matches
the public deployment byte-for-byte for both `index.html` and the extension ZIP.
The live ZIP SHA-256 is `3dbd2fb7fe03dd01a7164e19e0192ed3d8e0a35caf6736b17bca3c2054ecf90a`.
The reported deployment-only failure is not reproducible.

## Cold first read

In a fresh live browser session, the first screen says “Replay each sentence.
Keep your place.”, identifies readers who lose their place in dense web text,
and presents **Try it with sample data** plus “Open a sample article with one
sentence marked.” The action opens `/demo?demo=1` in one click. PASS.

## Claims gate — run first after `npm ci`

`.factory/claims.json` exists and each of its 19 exact test commands passed.

```text
sentence-loop PASS                 reader-controls PASS
local-speech PASS                  local-text PASS
offline-controls PASS              demo-not-saved PASS
free-account-free PASS             readable-text PASS
source-marker PASS                 does-not-rewrite PASS
keyboard-shortcuts PASS            protected-pages PASS
session-memory PASS                active-page-only PASS
installable-package PASS           no-remote-services PASS
stop-reading PASS                  desktop-chromium-install PASS
mobile-demo PASS
```

The browser-backed claims use `/demo?demo=1` or a fresh production MV3 build as
declared. The full suite also passed: `npm test` — 3 files, **38/38** tests,
exit 0. Landing, demo, legal pages, and README claims were cross-checked with
the manifest; no unlisted reliance claim was found.

## Local quality gates

```text
npm ci                  PASS — 251 packages; no audit vulnerabilities
npm test                PASS — 38/38
npm run typecheck       PASS
npm run lint            PASS
npm run build           PASS — dist/site plus valid 508,230-byte MV3 ZIP
npm run test:extension  PASS — packaged extension exercised in Chromium
npm run test:site       PASS — desktop/mobile, axe, focus, privacy, offline shell
npm audit --omit=dev    PASS — 0 vulnerabilities
```

Fresh static build: JavaScript 65.21 KB gzip, CSS 2.59 KB gzip, mobile hero
50,696 bytes. No remote font or script is shipped.

## Live evidence

`VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site` and
`npm run test:deployment` both pass. The former verifies 1440×900 and 390×844
keyboard/focus/touch/axe/privacy/reduced-motion/offline behavior; the latter
verifies live identity, headers, archive hash, and ZIP integrity.

`verify-url.sh` passed on the live root in 737 ms: title, `lang=en`, one h1,
main, alt text, labels, and zero console/page errors. Live response headers
include HSTS, nosniff, strict referrer policy, `connect-src 'self'`, and
`frame-ancestors 'none'`. Hashed JS is one-year immutable cached; HTML has
30-second revalidation and the ZIP is an attachment with `no-cache`.

Fresh live `/demo?demo=1` manual exercise produced zero action-time network
requests for speed/read/stop/previous/next/reset; localStorage, sessionStorage,
and IndexedDB stayed empty. Repeated Next stays at sentence 5 and Previous at
sentence 1. Removing browser speech gives the explicit recovery message
“Speech is unavailable. Enable a browser voice, then try again.” On 390×844,
the demo banner, reset/install actions, reader controls, and marked sentence
fit in the first viewport. Tab starts at the visible 3px skip-link focus ring.
Fresh axe found zero serious or critical findings.

This static browser extension has no server endpoints, sign-in, billing,
PWA/service worker, persistence service, or library/CLI API. Rate-limit,
Entra, concurrency, PWA update, and consumer package checks are not applicable.
The packaged manifest requests only `activeTab` and `scripting` for explicit
active-page injection.

## Defects by severity

None.
