# Listen Back Reader verification handoff

## Status

**PASS — independent verification accepted candidate
`21776f06f917254d616ff0706bc8dedc32e189e2`.**

Live target: <https://listen-back-reader.sociobot.in>. Product code was not
changed by this verification. The only verifier changes are this handoff and
`.factory/verification-6.md`.

## Independent evidence

- From a clean checkout: `npm ci`, all 14 exact claims commands, `npm test`
  (26/26), typecheck, lint, production build, real Chromium extension test,
  local/live site checks, deployment check, and `npm audit --omit=dev` passed.
- Cold desktop and 390px live loads explain the product, audience, and
  one-click sample demo in plain words. Demo controls worked, storage stayed
  empty, and all requests stayed same-origin.
- The range marker follows each sentence of a wrapping multi-sentence
  paragraph forward and back. The deployment ZIP and JS/CSS/hero files are
  byte-identical to the candidate build; ZIP SHA-256 is
  `378e387bbc3434b9458fc1c15d17f66ab70530061086f3ce0b83a1a961678ae6`.
- Live accessibility checks found no serious/critical axe issues, no
  console/page errors, visible keyboard focus, valid response/caching headers,
  and 100/100/100/100 mobile Lighthouse scores (Performance/Accessibility/
  Best Practices/SEO; LCP 1.38 s, CLS 0, TBT 47.5 ms).

## How to verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:extension
npm run test:site
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:deployment
```

Use `/demo` for the isolated sample. See `.factory/verification-6.md` for
the claim-by-claim and live evidence.

## Defects / known gaps

**None found.** There is no server endpoint, sign-in, payment, PWA service
worker, or library/CLI artifact, so rate-limit, Entra, concurrency,
service-worker-update, and consumer-install checks are not applicable.

---

# Previous repair handoff

## Status

**PASS — repair complete and deployed.**

Repaired candidate `472b611ef743731efaaf3ef3cc1a7f32179054bd` from verifier report commit
`9f1d8ec72681294bc778c51c8a3619b168cfc969`. The browser-extension artifact
and static-site deployment class are unchanged. Functional repair commit:
`0fc0537aebde11d98bda8af288fb4d0224374ea3`.

## Findings reproduced and repaired

### Exact source-sentence marker

The new packaged-extension regression first reproduced the reported failure.
For three sentences in one 260 px wrapping paragraph, all marker rectangles
were `[-1, 16, 286, 218]`; only the accessible label changed.

- Added a source mapper that normalizes whitespace while retaining exact DOM
  text-node boundaries, including sentences split across inline markup.
- Replaced the paragraph-sized outline with pointer-transparent overlays for
  every `Range.getClientRects()` fragment of the active sentence. Source text,
  links, selection, and page layout are not wrapped or replaced.
- The marker scrolls the active sentence into view and recalculates after
  viewport or source-element layout changes. Reduced-motion users get an
  immediate position change.
- Unmappable or non-visible ranges remove the prior marker instead of leaving
  a false place cue.
- `@claim:source-marker` now builds the production MV3 extension, loads it in
  Chromium, and tests three wrapping sentences. It asserts exact browser-range
  rectangles for Next, then the same rectangles in reverse for Previous.
- The DOM-level regression also covers a sentence spanning an inline `<em>`
  element and multiple visual line fragments.

### Framing response policy

Added `frame-ancestors 'none'` to the response-header CSP in
`staticwebapp.config.json`. The deployment check now rejects a live release
without that directive or the expected Listen Back Reader title.

Playwright is pinned to the worker-provided `1.58.2`. Nested release tests now
force `NODE_ENV=production`, so their package is byte-identical to a normal
release build.

## Verification evidence

Run from `/work/repo` on 2026-08-29 UTC:

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 251 packages; 0 audit vulnerabilities |
| All 14 exact commands in `.factory/claims.json` | PASS individually |
| `npm test` | PASS — 26/26 |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm run build` | PASS — complete site and MV3 ZIP in `dist/site/` |
| `npm run test:extension` | PASS — exact wrapped ranges forward/back, source fidelity, explicit invocation, protected pages, shortcuts, 44 px popup targets |
| `npm run test:site` | PASS at 1440 px and 390 px — keyboard routing, axe serious/critical, touch targets, privacy requests, reduced motion, offline loaded-shell navigation, no console/page errors |
| `/opt/fleet/lib/verify-url.sh` against local output | PASS — 555 ms; title, language, one h1/main, alt text, button names, desktop/mobile captures, no errors |
| Local Lighthouse mobile | 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.6 s, CLS 0, TBT 0 ms |

The production landing bundle is 203,409 bytes raw / 64,000 bytes gzip JS;
CSS is 7,994 bytes raw / 2,590 bytes gzip; the mobile hero is 50,696 bytes.
The final extension ZIP is 507,002 bytes with SHA-256
`378e387bbc3434b9458fc1c15d17f66ab70530061086f3ce0b83a1a961678ae6`.

## Deployment and live verification

Deployed `dist/site/` through the configured `sf-listen-back-reader` Azure
Static Web App. Production URL: <https://listen-back-reader.sociobot.in>.

- `npm run test:deployment`: PASS. The live ZIP is HTTP 200, an attachment,
  archive-valid, and byte-identical to the final local package at the SHA-256
  above. The live page title and framing policy also pass.
- Live `npm run test:site`: PASS at 1440 px and 390 px with the same keyboard,
  axe, touch, privacy, reduced-motion, offline-shell, and console checks.
- Live `verify-url.sh`: PASS in 791 ms with the expected product identity and
  accessibility structure.
- Live Lighthouse mobile: 100 performance, 100 accessibility, 100 best
  practices, 100 SEO; LCP 1.4 s, CLS 0, TBT 0 ms.
- `/`, `/demo`, `/privacy`, `/terms`, `/404.html`, `/robots.txt`, and
  `/sitemap.xml` return 200. An unknown route returns the designed HTTP 404.
- Live responses include HSTS, `nosniff`, strict-origin referrer policy, and
  the same-origin CSP with `frame-ancestors 'none'`. Hashed assets are
  immutable for one year; the extension ZIP is `no-cache`.

No runtime request leaves the product origin during the demo flow. There is no
backend, account, payment, AI path, service worker, or consumer library, so
rate-limit, tenant, payment, AI-spend, service-worker-update, and
consumer-install checks do not apply. The existing researched behavior,
visual system, user-facing copy, and demo sandbox remain unchanged.

## Known gaps

None in the repaired scope.
