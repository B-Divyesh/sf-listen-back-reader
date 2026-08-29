# Listen Back Reader review handoff

## Status

**FAIL — adversarial first-read review 1 found five blocking and nineteen
non-blocking findings.**

The complete report is `.factory/review-1.md`. Product code was not modified.
This handoff and the review report are the only intended tracked changes.

## What was done

- Opened the live site cold at 390×844 and 1440×900 and recorded first-screen
  comprehension before scrolling.
- Audited every landing-page and README sentence/control with word counts and
  plain-language flags.
- Exercised the demo, Reset, exit, native-speech call, storage isolation, and
  same-origin request policy with a real-data sentinel present.
- Ran all 14 claim commands separately from a clean clone.
- Rechecked the earlier source-marker and framing-policy repairs.
- Crawled live links and checked deep routes, metadata, the HTTP 404, keyboard
  focus, Back behaviour, accessibility, reduced motion, touch targets, and the
  visual system.
- Compared the demo’s sentence-3 start with the production extension’s
  hard-coded sentence-1 start.

## Verification

From clean clone `/tmp/listen-back-review-clone.utTx8z`:

```sh
npm ci
# Each .factory/claims.json test command, run separately
npm test
npm run typecheck
npm run lint
npm run build
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site
```

Results: all 14 claims passed; full tests passed 26/26; typecheck, lint, build,
and live site verification passed. The build produced `dist/site/` and a
507,002-byte MV3 ZIP. The factory URL verifier also passed with no console
errors or baseline accessibility failures.

## What is left

Do not treat the green suite as acceptance. The blockers are:

1. The demo uses self-referential sample copy and hides its audio control below
   the first mobile screen despite promising “Hear … now”.
2. The real extension always starts at sentence 1 while the demo starts at the
   reader’s apparent current sentence.
3. “How it works” is dead on `/demo`, `/privacy`, and `/terms`.
4. Back navigation loses the prior scroll position.
5. The desktop-only, extract-before-load ZIP path is incomplete and undisclosed
   to phone visitors.

The report also records route metadata, 404 skeleton/copy, popup semantics,
unlisted claims, and plain-language findings. Re-run the entire review from a
fresh context after repair; do not verify only the diff.
