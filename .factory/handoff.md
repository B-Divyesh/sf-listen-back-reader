# Listen Back Reader handoff — polish round 1

## Status

**PASS.** Repair commit: `ef38b1f820341e2c165f7daf3cff8aadef8aa8f5`.
Deployed: https://listen-back-reader.sociobot.in.

## Delivered

- Repaired every F-1-1 through F-1-24 finding in `.factory/review-1.md`.
- Added the direct isolated demo at `?demo=1` and `/demo?demo=1`, with a
  persistent banner, reset, installation route, and realistic sample article.
- Made the extension begin at selection or viewport position, rather than
  sentence one.
- Repaired metadata, routing, route focus/scroll restoration, mobile header,
  static 404 skeleton, popup heading, installation instructions, and copy.
- Added a desktop Chromium install claim and strengthened packaged browser and
  browser-route checks.

## Exact verification evidence

Fresh clone: `/tmp/listen-back-clean.33bvyZ`.

```sh
npm ci                                      # PASS
# every command in .factory/claims.json    # PASS individually (15/15)
npm test                                    # PASS, 29/29
npm run typecheck                           # PASS
npm run lint                                # PASS
npm run build                               # PASS
npm run test:extension                      # PASS
npm run test:site                           # PASS at 1440×900 and 390×844
```

The site test includes axe serious/critical checks, keyboard/focus/touch checks,
metadata/deep-link checks, same-origin privacy checks, reduced-motion, and
loaded-shell offline navigation. The extension test covers popup semantics,
selection/viewport start, exact source ranges, punctuation, and page policy.

Deployment:

```sh
npm run deploy:site                         # PASS
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site # PASS
```

The live extension ZIP returned HTTP 200, `application/zip`, `attachment`, and
SHA-256 `8deebcb03b8f32e2e5eefe76be8e4c7546673850b49b16c1e89d25e8eae08c28`.
Cold live screenshots were captured at `/tmp/listen-back-live-home-1440.png`,
`/tmp/listen-back-live-demo-390.png`, and `/tmp/listen-back-live-404.png`.

## Run and deploy

Use `npm ci`, then `npm run dev` for the landing site or `npm run dev:extension`
for the MV3 extension. Use `npm test` and `npm run build` before deploy. The
configured deployment command is `npm run deploy:site`.

## Known gaps / next steps

None. The product remains a desktop Chromium MV3 extension by design; mobile
Chrome cannot load unpacked extensions and the site says so plainly.
