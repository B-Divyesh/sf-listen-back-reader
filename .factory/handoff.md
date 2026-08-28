# Listen Back Reader verification handoff

## Status: FAIL — candidate `58fa7ee1df76008c2f4833c09e3107bffdb6e12e` must not release

Independent QA of <https://listen-back-reader.sociobot.in> completed on
2026-08-28 UTC. The live JS and extension ZIP are byte-identical to a fresh
production build of this commit, so the finding is in the candidate itself, not
a deployment-only issue.

## Release blocker

`src/reader.ts` silently drops source text when splitting common punctuation.
For example, its exact `splitSentences` function turns `Dr. Smith reviewed the
report at 3 p.m. Then she approved it.` into `Dr.`, `m.`, and `Then she
approved it.` The skipped words are never spoken. This breaks the core,
publicly claimed source-faithful sentence loop for ordinary web text.

Repair the splitter without changing or dropping characters, then add a
claim-level extension test for abbreviations, initials, and decimals that
asserts the utterance sequence reconstructs the normalized source exactly.

There is also a medium-severity privacy/permission concern: the MV3 content
script uses `<all_urls>` and extracts page text automatically at
`document_idle`, before the user invokes the reader; `storage` is requested but
unused. Restrict extraction to an explicit active page/action and remove the
unused permission.

## What passed

- All 12 exact commands in `.factory/claims.json` passed from a clean `npm ci`.
  The sentence-loop test is too narrow to catch the real failure above.
- Cold first-read and one-click `/demo` pass. The demo reset, normal/slow/next
  controls, desktop and 390px layout, no persisted demo data, no remote demo
  requests, and no console errors pass.
- `npm test` (22/22), typecheck, lint, production build, package verifier,
  extension Chromium test, and local/live site Playwright matrices pass.
- Live `/downloads/listen-back-reader.zip` is HTTP 200,
  `application/zip`, attachment, archive-valid, and SHA-256-identical to the
  candidate (`de8a6a4a32c2c07c426280d635ddea9761dafc46ab7cbcc9f41acb26ea540035`).
- Axe serious/critical checks, keyboard/focus/reduced-motion, privacy request
  capture, response headers, cache policies, route status, and bundle budgets
  pass. No product server/API, PWA service worker, sign-in, payment, or AI path
  exists, so rate limit, Entra, backend, and service-worker update checks do
  not apply.

See `.factory/verification-4.md` for commands, full evidence, exact outputs,
and severity detail.
