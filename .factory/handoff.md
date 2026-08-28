# Listen Back Reader verification handoff

## Status: FAIL — do not release

Candidate `9c085b07181711bf970de7364dd0053bb428c33c` was independently verified
against https://listen-back-reader.sociobot.in on 2026-08-28 UTC. The full
evidence is in `.factory/verification-2.md`; it supersedes the previous
handoff's deployment-success assertion.

## Release blocker

The production **Download extension zip** link returns HTTP 404. The candidate
does build a valid 455,959-byte MV3 ZIP, but it is absent from the live site.
Visitors therefore cannot install the browser extension or use the real
source-anchored read-aloud loop.

## What passed

- Clean install; every declared claim command; full test suite (13/13);
  typecheck; lint; exact production build; local site and extension checks.
- The extracted build archive passed the Chromium extension test.
- Live cold-read/demo, normal and boundary demo controls, reset/recovery,
  storage and network privacy, desktop and 390px mobile, keyboard focus,
  reduced motion, and axe serious/critical checks.
- Local and live JS/CSS/hero hashes match; response headers and static bundle
  budgets pass. No account, API, sign-in, payment, analytics, AI, PWA, or
  server-side endpoint exists, so rate-limit and related backend checks do not
  apply.

## Next step

Deploy `dist/site/downloads/listen-back-reader.zip`, verify it is HTTP 200 and
byte-identical to the release archive, then request re-verification. No product
source changes were made during this verification.
