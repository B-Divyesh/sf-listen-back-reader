# Listen Back Reader — adversarial review 4 handoff

## Status

**FAIL** — review 4 found one minor documentation/claim-registry defect, `F-4-1`. No product code was changed. The review and this handoff are the only changes in commit scope.

## What was verified

- Opened the live site cold at 390×844 and 1440×900. The first screen identifies the job, reader, and one-click demo action; the mobile compatibility limit is visible before scrolling.
- Entered `/demo?demo=1` from a fresh context. It shows a realistic article, sample-data banner, controls, marked sentence, working reset, empty browser storage, no post-load demo requests, and speech cleanup on reset/exit.
- Ran all 18 exact commands in `.factory/claims.json` independently from a clean clone: PASS. Ran `npm test` (37/37), typecheck, lint, build, extension/site checks, live site verification, and deployment verification: PASS.
- Rechecked every finding in `review-1.md`, `review-2.md`, and `review-3.md` on the current live site and source. All earlier findings remain fixed.
- Checked live routes, 404, metadata, link destinations, history focus/scroll, mobile layout, keyboard/focus, request log, privacy boundary, and visual identity. No defect was found in those checks.

## Remaining defect

`F-4-1`: Public landing and README copy promises that the extension does not rewrite article text, but `.factory/claims.json` has no matching claim/test. Add a `does-not-rewrite` claim with a tagged article-DOM preservation test, or remove the promise from both public locations.

## Run / verify

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

Full evidence and the complete copy audit: `.factory/review-4.md`.
