# Listen Back Reader repair handoff

## Status: PASS — verifier blockers repaired and deployed

Repair work order `listen-back-reader-repair-3` started from report commit
`34938209d645f7a9b0874296cee4def214391eb4`, which rejected candidate
`e0c2e042deb787f953028250c03ec449a9e46da6`. The repaired product is deployed
at <https://listen-back-reader.sociobot.in> from commits:

- `b97bebd` — make the static-site release include the tested extension;
- `de2d73a` — preload a responsive hero and meet the mobile LCP budget.

## Findings and root-cause repairs

### Production ZIP returned 404

Reproduction proved that `npm run build:site`, the factory's static deployment
entry point, removed `dist/site` and built only the landing shell. The broader
`npm run build` added the extension ZIP afterward, so any normal `build:site`
deployment replaced production with an artifact that lacked `downloads/`.

`build:site` now builds the MV3 extension, builds the site, creates the
reproducible ZIP, and runs the package verifier. `npm run build` delegates to
that complete artifact. A regression test deletes `dist/site`, runs only
`npm run build:site`, then requires a non-empty, valid, linked MV3 archive at
`dist/site/downloads/listen-back-reader.zip`. The deployment command still
publishes that exact directory and refuses success unless the public response
has ZIP/attachment headers, archive integrity, and the identical SHA-256.

### Public claims lacked exact tests

`.factory/claims.json` now lists 13 claims. Each exact command passed
independently, and a policy test requires every declared ID to occur in exactly
one `@claim:<id>` test. New outcome coverage includes replay/slow/back/next,
free account-free access, readable article selection, source marking, all three
keyboard shortcuts, protected-page refusal, memory-only session state, valid
MV3 packaging, and absence of remote/account/analytics runtime code. Existing
speech, local-text, demo-storage, and sentence-loop behavior remains covered.

Public privacy wording was narrowed to match actual extension behavior. The
landing copy audit now includes every rendered prose sentence and has no
sentence over 22 words or banned marketing term.

## Clean local verification — 2026-08-28 UTC

```text
npm ci                 PASS; 251 packages; 0 vulnerabilities
13 claims commands     PASS individually from .factory/claims.json
npm test               PASS; 22/22 tests in 3 files
npm run typecheck      PASS
npm run lint           PASS
npm run build          PASS
npm run verify:package PASS
npm run test:extension PASS; production MV3 loaded in Chromium
npm run test:site      PASS; 1440px and 390px browser matrix
npm audit --omit=dev   PASS; 0 vulnerabilities
```

The site matrix covers `/`, `/demo`, `/privacy`, `/terms`, and the real 404 at
desktop and 390px. It checks title/lang/main/one h1, route focus and browser
history, visible keyboard focus, 44px targets, horizontal overflow, reduced
motion, same-origin-only requests, loaded-shell offline navigation, no console
or page errors, and no serious/critical axe finding. The extension matrix
covers normal replay/advance, source marker movement, protected `noarchive` and
explicit no-copy pages, shortcuts, and popup touch targets.

The final build contains 63.84 KB gzip JavaScript, 2.59 KB gzip CSS, a 50.70 KB
mobile hero, and a 505,941-byte extension ZIP. The ZIP is reproducible and its
SHA-256 is
`de8a6a4a32c2c07c426280d635ddea9761dafc46ab7cbcc9f41acb26ea540035`.

## Deployment and independent live evidence

`npm run deploy:site` deployed `dist/site` to Azure Static Web App
`sf-listen-back-reader` in resource group `sociobot`, production environment.
The command completed its built-in public archive gate.

```text
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:deployment PASS
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site       PASS
EXTENSION_PATH=<extracted public ZIP> npm run test:extension                    PASS
verify-url.sh root                                                               PASS; 602 ms, no errors
@axe-core/cli root, demo, privacy, terms                                         PASS; 0 violations each
```

The public download returns HTTP 200, `application/zip`, and
`Content-Disposition: attachment`. It is byte-identical to the local ZIP above
and passes `unzip -t`. Final live/local identity checks also matched:

| asset | bytes | SHA-256 |
| --- | ---: | --- |
| `assets/index-BaoOjxW6.js` | 203,157 | `781a6f0d2e2fc1a346a3a065f01dc88ccfbf3ef394f83ea3376a0b8a523a4b61` |
| `assets/index-krtQxORq.css` | 7,994 | `1a08342531dd4726649b3048a169f961d99f5db2522fec727fa42a133766a345` |
| `hero-mobile.webp` | 50,696 | `29900e089829b1303ab65848ca58bcb565d64059e1e67de3b349b18af4d8d245` |
| `downloads/listen-back-reader.zip` | 505,941 | `de8a6a4a32c2c07c426280d635ddea9761dafc46ab7cbcc9f41acb26ea540035` |

Production provides HSTS, `nosniff`, strict-origin referrer policy, and the
same-origin CSP. Hashed assets are immutable; the release ZIP uses `no-cache`
so updates cannot retain an older download. The product has no service worker,
backend, product API, sign-in, payment, analytics, AI path, or remote runtime
dependency. Service-worker update, rate-limit, AI-response, and identity-
provider tests are therefore not applicable; loaded-shell offline navigation
and downloaded-extension offline operation were tested instead.

Final mobile Lighthouse: Performance 98, Accessibility 100, Best Practices
100, SEO 100; LCP 2.0 s, CLS 0, TBT 0 ms, Speed Index 1.6 s. The responsive
hero preload fixed the cold-run LCP regression without changing the visual
system.

## Known gaps

None release-blocking. Browser-store signing and publication remain outside
this sideloaded ZIP/static-site artifact class.
