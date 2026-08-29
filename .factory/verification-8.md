# Independent verification 8 — PASS

**Candidate:** `dc5a5336554c3452a4ba34d52ddff68cfb762e02`
**Live URL:** <https://listen-back-reader.sociobot.in>
**Verified:** 2026-08-29 UTC

## Release verdict

**PASS.** The deployed site and extension archive match the candidate production build. The real job works end to end: a desktop Chrome/Chromium user can explicitly invoke the extension on the active page, hear/replay one source sentence, change speed, move backward/forward, stop, and see the matching source marker. It is local-first and honours no-copy/noarchive cases.

## Cold first-read and demo

Fresh Chromium showed, in the first screen:

- “Replay each sentence. Keep your place.” — what it does.
- “For readers who lose their place in dense web text.” — who it is for.
- “Try it with sample data” plus “Open a sample article with one sentence marked.” — what to click and what happens.

The CTA is one click to `/demo?demo=1`. At desktop and 390×844 it showed the sample reader and the persistent “Demo — sample data, nothing is saved” banner with **Reset demo** and **Start for real**. Reset left localStorage and sessionStorage empty. The test Chromium has no usable speech voice, so real error recovery was checked: it says “The browser voice could not read this sentence. Enable a browser voice, then try again.” and retains a working read control.

## Claims (required first gate)

`.factory/claims.json` exists and declares 18 claims. From the clean checkout after `npm ci`, every exact declared command `npm test -- -t @claim:<id>` passed in an isolated run:

`sentence-loop`, `reader-controls`, `local-speech`, `local-text`, `offline-controls`, `demo-not-saved`, `free-account-free`, `readable-text`, `source-marker`, `keyboard-shortcuts`, `protected-pages`, `session-memory`, `active-page-only`, `installable-package`, `no-remote-services`, `stop-reading`, `desktop-chromium-install`, and `mobile-demo`.

These include real browser/production-extension checks: loaded MV3 package, source range geometry, Alt+Left/Alt+Right, speech cancellation, offline controls, and demo storage/request behaviour. No unlisted material claims were found in the first screen, README, or privacy copy.

## Local quality gates

```text
npm ci                                      PASS (0 audit vulnerabilities)
npm test                                    PASS (35 tests)
npm run typecheck                           PASS
npm run lint                                PASS
npm run build                               PASS; produced dist/site/
npm run test:extension                      PASS
npm run test:site                           PASS
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:deployment
                                             PASS
```

The production build produced a 508,224-byte MV3 ZIP. Initial JS is 65,063 bytes gzip, CSS 2,599 bytes gzip, and the mobile hero 50,696 bytes.

## Live evidence

- Root, `/privacy`, and `/terms` returned 200; an unknown route returned a real 404.
- Local and live JavaScript SHA-256 both equal `9adbe994936babd3d7ae1d6f55a73d6ac72106048ed391823c6ccc880e78a63b`; CSS both equals `fa45eb54ea68f18da4dbd96233a4b8b76a0653fe8213fd7ba3386a31a2b4f6d4`; ZIP both equals `b1b95c19f154d7f105e7478e609efcf9ae54e609a9e0b9e9394af5e01f8961b4`.
- Live headers include HSTS, nosniff, strict referrer policy, self-only CSP with `frame-ancestors 'none'`, immutable hashed-asset caching, and attachment/no-cache ZIP delivery.
- Playwright’s demo request log contained only same-origin document, hero, JS, CSS, and favicon. Clicking controls made no request. There is no account/sign-in, analytics, upload, server endpoint, or rate allowance to test; MV3 permissions are only `activeTab` and `scripting`.
- Desktop and 390px mobile passed. First keyboard focus is the visible 3px skip-link ring. Keyboard navigation, 44px controls, reduced motion, no mobile overflow, no console/page errors, and no axe serious/critical findings passed.

## Defects

None found. No product code changes were made during this verification.
