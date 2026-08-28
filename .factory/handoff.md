# Listen Back Reader repair handoff

## Status

Release-blocking findings from verifier report commit
`366d026cdb424b16c383694bceba771e4b731a60` against candidate
`0b77d7e150c620c0c4ec48151e1f261f1a590cdf` are repaired. The production site
and downloadable extension are deployed at
https://listen-back-reader.sociobot.in.

## Repairs

- The static deployment now includes the MV3 ZIP and gives `/downloads/*`
  explicit attachment/cache headers. The build fails if the ZIP, manifest, or
  compiled landing-page link is missing.
- `npm ci` now runs canonical `wxt prepare`. Every claim test therefore runs
  from a clean checkout before a build. Each claim owns one Playwright test
  that opens a fresh `/demo` context and observes the promised result.
- All content-script entry paths use one protected-page policy. Popup messages,
  browser commands, `Alt+R`, and arrow shortcuts refuse `noarchive`, `nocache`,
  `nosnippet`, `data-listen-back-no-copy`, and `data-no-copy` pages.
- Route headings are programmatically focusable and receive focus after click,
  Back, and Forward navigation.
- Popup controls and visible site controls meet the 44px touch-target baseline.
- Known SPA routes are explicit rewrites. Unknown paths use `404.html` and an
  actual HTTP 404 response.
- WXT and its React module were upgraded. `npm audit --omit=dev` reports zero
  vulnerabilities.

## Verification evidence — 2026-08-28 UTC

Clean install and claims, before any build:

```text
npm ci                                      PASS; WXT 0.21.4 types generated
npm test -- -t @claim:sentence-loop        PASS; 1 browser claim test
npm test -- -t @claim:local-speech         PASS; 1 browser claim test
npm test -- -t @claim:local-text           PASS; 1 browser claim test
npm test -- -t @claim:demo-not-saved       PASS; 1 browser claim test
```

Complete local gates:

```text
npm test                 PASS; 13/13 tests in 3 files
npm run typecheck        PASS
npm run lint             PASS
npm run build            PASS; dist/site and verified MV3 ZIP created
npm run test:extension   PASS; unpacked production extension in Chromium
npm run test:site        PASS; 1440px and 390px browser matrix
npm audit --omit=dev     PASS; 0 vulnerabilities
```

The extension browser test confirms normal shortcuts mark and advance source
sentences. It also confirms `Alt+R` creates no marker on both `noarchive` and
explicit no-copy fixtures, and measures every popup button at 44px or taller.

The site browser matrix covers keyboard route focus and Back navigation, one
`h1` and `main`, titles, `lang`, image alternatives, horizontal overflow,
same-origin-only requests, empty demo storage, reduced motion, 44px targets,
loaded-shell offline navigation, and axe 4.11 with zero serious/critical issues
on `/`, `/demo`, `/privacy`, `/terms`, and the 404 page.

Mobile Lighthouse against the production build:

```text
Performance 99 · Accessibility 100 · Best Practices 100 · SEO 100
LCP 2.1 s · CLS 0 · TBT 0 ms
Initial JS 63.81 KB gzip · CSS 2.59 KB gzip · hero 140.12 KB
```

## Live identity and response policy

Deployed to Azure Static Web App `sf-listen-back-reader` (`production`) using
`dist/site`. Post-deploy checks on the custom domain returned:

```text
200 text/html        /, /demo, /privacy, /terms
200 application/zip /downloads/listen-back-reader.zip
404 text/html        /definitely-missing-release-check
ZIP SHA-256          39a54411c645a72cba2e82db9ab7da1bd95b38760e6b8f2731290f154d46b6c9
JS SHA-256           03fe64688f593b8e88b009b59c08b8ca1d26c0b20e783f181e7ec7fe8fa4d953
```

Both live hashes matched local release files byte for byte. The live ZIP was
downloaded, extracted, and passed `npm run test:extension`. The live browser
matrix passed at 1440px and 390px. HSTS, CSP, `nosniff`, and strict-origin
referrer headers are present. Hashed assets cache immutable for one year; HTML
revalidates after 30 seconds; the ZIP caches for one hour.

No API, account, payment, analytics, AI call, or remote product service exists,
so backend rate-limit and AI response-policy tests do not apply. The product
does not claim offline reload and intentionally has no service worker; the
installed extension has no runtime network dependency, and the loaded site
shell was tested offline. Browser-store auto-update is outside this sideloaded
ZIP artifact; the short HTML/ZIP cache policies expose release updates.

## Known gaps

None release-blocking. Store publication and signing are outside this static,
sideloaded browser-extension work order.
