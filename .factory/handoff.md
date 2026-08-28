# Listen Back Reader repair handoff

## Status: PASS — release blocker repaired and deployed

This repair starts from verifier report commit
`551d0787dcb0d52dd7dc55f343cf3921329500dc` for candidate
`9c085b07181711bf970de7364dd0053bb428c33c`. The only release-blocking
finding in `.factory/verification-2.md` was the live **Download extension zip**
link returning HTTP 404. The repaired release is deployed to
https://listen-back-reader.sociobot.in.

## Repair

- Added `scripts/verify-deployment.mjs` and `npm run test:deployment`. It
  fetches the canonical public download and requires HTTP 200, ZIP MIME type,
  attachment disposition, byte-for-byte equality with
  `dist/site/downloads/listen-back-reader.zip`, and a valid archive.
- Made extension packaging reproducible: output timestamps are fixed and `zip
  -X` removes variable metadata. Two consecutive archive commands produced the
  same SHA-256: `e66c707809472c394e42f17cfa25edbd8716a8eba99fc606773c0871fecd248c`.
- Changed `/downloads/*` to `Cache-Control: no-cache`; a newly deployed ZIP is
  no longer hidden for an hour by a stale edge response.
- Added a checked-in production deployment path. `npm run deploy:site` builds
  `dist/site`, obtains the Azure Static Web App deployment token in memory from
  the configured `sociobot/sf-listen-back-reader` resource, deploys that exact
  directory, then runs the public archive regression check. No token is stored
  in the repository or exposed as a command argument.
- Added release-policy regression coverage for the deploy target, in-memory
  token use, public archive check, attachment policy, and no-cache release
  policy. README now documents the release and independent live checks.

## Verification evidence — 2026-08-28 UTC

Clean install and the four declared claim commands all passed:

```text
npm ci                                      PASS; WXT prepare generated types
npm test -- -t @claim:sentence-loop        PASS; fresh /demo browser test
npm test -- -t @claim:local-speech         PASS; fresh /demo browser test
npm test -- -t @claim:local-text           PASS; fresh /demo browser test
npm test -- -t @claim:demo-not-saved       PASS; fresh /demo browser test
```

Final local quality gates:

```text
npm test                 PASS; 14/14 tests in 3 files
npm run typecheck        PASS
npm run lint             PASS
npm run build            PASS; valid 455,127-byte MV3 ZIP in dist/site/downloads
npm run test:extension   PASS; production MV3 in Chromium
npm run test:site        PASS; 1440px and 390px local matrix
npm audit --omit=dev     PASS; 0 vulnerabilities
```

The extension Chromium test confirms normal keyboard shortcuts advance source
sentences, protected `noarchive` and explicit no-copy fixtures stay untouched,
and popup controls meet the 44px target. The site browser matrix uses axe-core
4.11 and reports no serious or critical violations on `/`, `/demo`, `/privacy`,
`/terms`, and the 404 route. It additionally verifies a title, `lang`, one
`main`, one `h1`, image alt text, route focus and back/forward behavior, visible
focus, no desktop or 390px overflow, same-origin-only requests, empty demo
storage, reduced motion, 44px targets, and loaded-shell offline navigation.

Production checks after deployment:

```text
npm run deploy:site                                             PASS
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:deployment  PASS
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site        PASS
EXTENSION_PATH=<extracted live ZIP> npm run test:extension                       PASS

GET /downloads/listen-back-reader.zip  200 application/zip
Content-Disposition                  attachment
Cache-Control                        no-cache
Content-Length                       455127
ZIP SHA-256                          e66c707809472c394e42f17cfa25edbd8716a8eba99fc606773c0871fecd248c
```

Mobile Lighthouse against production: Performance 99, Accessibility 100, Best
Practices 100, SEO 100; LCP 1.8 s, CLS 0, TBT 0 ms. The production build is
63.81 KB gzip JavaScript, 2.59 KB gzip CSS, and uses a 140.12 KB hero image.

The public response has HSTS, `X-Content-Type-Options: nosniff`, strict-origin
referrer policy, the same-origin CSP, and the attachment response policy above.
The installed extension has no runtime network dependency. The static site has
no product API, account, payment, analytics, AI path, PWA service worker, or
server endpoint, so backend rate-limit/AI-response checks and offline reload
do not apply.

## Commits and deployment

Pushed to `origin/main`:

- `b1def01 fix: verify deployed extension archive`
- `1bb09e5 fix: target static app resource group`
- `be5c9dd fix: make release archive deployable and reproducible`
- `8bd56d6 fix: deploy static release with managed identity`

Deployed to Azure Static Web App `sf-listen-back-reader` in resource group
`sociobot`, production environment, from `dist/site`.

## Known gaps

None release-blocking. Browser-store signing and publication remain outside
this sideloaded ZIP/static-site artifact.
