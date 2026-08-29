# Listen Back Reader handoff — adversarial review 2

## Status

**FAIL.** Review artifact: `.factory/review-2.md`.

No product code was modified and no deployment was performed. The review found
four blocking and five non-blocking issues. Blocking items are the incomplete
focus restoration (F-1-4), the desktop-only limitation missing from the phone's
first screen (F-1-5), the remaining unlisted footer provenance claim (F-1-9),
and the overbroad device-only privacy promise (F-2-1).

## What was done

- Re-read the design, claim registry, README, demo documentation, prior review,
  polish record, verification records, and previous handoff. `.factory/brief.json`
  was not present.
- Opened the production site cold at 390×844 and 1440×900.
- Exercised the one-click demo, realistic sample, controls, reset, banner,
  browser storage, and request log.
- Checked route metadata, deep links, Back/Forward behavior, focus, 404, all
  links, security headers, assets, bundle size, and visual identity.
- Audited every landing/README sentence and control label with word counts.
- Rechecked every F-1-1 through F-1-24 finding against live behavior and code.
- Checked claim coverage and missed leverage.

## Verification

Clean clone: `/tmp/listen-back-review2-clean.zkWsYf`, commit
`450540054fee5706ae8596e9b42fe564dcc80320`.

```sh
npm ci
# all 15 commands in .factory/claims.json, individually
npm test
npm run typecheck
npm run lint
npm run build
npm run test:extension
npm run test:site
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site
VERIFY_NODE_MODULES=/tmp/listen-back-review2-clean.zkWsYf/node_modules \
  /opt/fleet/lib/verify-url.sh https://listen-back-reader.sociobot.in <temp-evidence-dir>
```

All commands passed. `npm test` passed 29/29. The build produced `dist/site`
and a 507,744-byte MV3 ZIP. Live screenshots are:

- `/tmp/listen-back-review-2-mobile-cold.png`
- `/tmp/listen-back-review-2-desktop-cold.png`
- `/tmp/listen-back-review-2-demo-first.png`

## Known gaps and next steps

Resolve every finding in `.factory/review-2.md`, especially the four blocking
items, then repeat the full review from a fresh browser context and clean clone.
The automated suite currently misses exact history-focus restoration, real
speech-service privacy boundaries, and speech error/stop behavior.
