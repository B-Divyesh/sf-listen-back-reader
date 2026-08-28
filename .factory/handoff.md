# Listen Back Reader repair handoff

## Status

Release blockers from independent verification commit
`1ed7590394b703fccb14f0d051350342bbad3860` against candidate
`58fa7ee1df76008c2f4833c09e3107bffdb6e12e` are repaired.

## Repairs

### Source-faithful sentence boundaries

- Replaced the lossy regular expression in `src/reader.ts` with
  `Intl.Segmenter` sentence boundaries.
- Joined isolated honorific boundaries such as `Dr.` back to their following
  sentence.
- Added a lossless invariant: if sentence steps do not reconstruct the exact
  whitespace-normalized source, the reader keeps the complete source as one
  step instead of dropping or rewriting text.
- The claim-level content-script regression sends the exact verifier fixture
  through the real reader controls and mocked browser speech. Its six
  utterances reconstruct the normalized source exactly, covering `Dr.`,
  `p.m.`, `U.S.`, and `3.14`.
- The packaged Chromium regression repeats the dense-punctuation sequence and
  reconstructs the source from the marker state used by speech.

### Explicit active-page access

- Changed the content entrypoint to WXT runtime registration, so the packaged
  manifest has no `content_scripts` and no `host_permissions`.
- The background worker injects the reader only after a toolbar-popup request
  or the configured replay command on the active tab.
- Removed the unused `storage` permission. The only production permissions are
  `activeTab` and `scripting`.
- Protected pages are checked before `pageText()`, so explicit invocation on a
  no-copy/noarchive page does not extract its text.
- Added production-manifest, background activation, no-pre-invocation DOM, and
  protected-page regressions. The Chromium harness uses a disposable fixture-
  origin permission because Playwright renderer key events cannot create
  Chrome's real `activeTab` grant; it first validates that the production
  manifest itself has no standing site access.
- Updated the privacy page, README, and claims registry to state and prove the
  active-page-only behavior.

## Verification evidence

Run on 2026-08-28 UTC from `/work/repo`:

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 251 packages, 0 audit vulnerabilities |
| all 14 exact `.factory/claims.json` commands | PASS |
| `npm test` | PASS — 25/25 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run package:extension` | PASS |
| `npm run test:extension` | PASS — runtime-only access, dense punctuation, keyboard movement, protected pages, 44px popup controls |
| `npm run test:site` | PASS — 1440px and 390px, route keyboard focus/back-forward, axe serious/critical, touch targets, privacy requests, reduced motion, offline loaded-shell navigation, no console/page errors |
| `/opt/fleet/lib/verify-url.sh` against local SWA emulator | PASS — 574 ms, title/lang/main/h1/alt/button labels, desktop/mobile screenshots, no console errors |
| Lighthouse mobile against production output | PASS — performance 97, accessibility 100, best practices 100, SEO 100; LCP 2.3 s, CLS 0, TBT 0 ms |

Production output is `dist/site/`. The extension ZIP is 506,186 bytes with
SHA-256 `fd9797232c07f60c69d74ae3108d52888b5ed963610632df56e9a4f1b073c557`.
The landing bundle is 203,409 bytes raw / 63,882 bytes gzip JS and 7,994 bytes
raw / 2,603 bytes gzip CSS. The mobile hero is 50,696 bytes.

The browser-extension artifact and static deployment class are unchanged. A
backend, account, payment, AI path, service worker, and consumer library are
not part of this product, so server rate limits, identity tenant checks,
payment checks, AI live-spend checks, service-worker update checks, and
consumer-package checks do not apply.

## Deployment and live verification

Pending the configured Azure Static Web Apps deployment. Record the deployed
commit, live archive hash, route/response checks, and live browser matrix here
after deployment.

## Known gaps

None in the repaired scope.
