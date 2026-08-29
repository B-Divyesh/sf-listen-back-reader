# Listen Back Reader — polish round 3 handoff

## Release status

**PASS** — all findings in `.factory/review-1.md`, `.factory/review-2.md`, and
`.factory/review-3.md` are resolved in the deployed release.

Application changes are in `06a37fca61300182956ff5156d5fb293c843ba5d` and
`6792e79`, both pushed to `main`. The production static site was deployed
through the configured Azure Static Web Apps work order to
<https://listen-back-reader.sociobot.in> on 2026-08-29 UTC.

## What changed

- The one-click `/demo?demo=1` sample now starts on sentence 1. Its highlighted
  sentence, counter, and read control fit in the 390×844 first viewport.
- Reset demo and Install the extension cancel active browser speech before the
  sample is reset or discarded. Unmount cleanup protects direct route changes.
- The demo exit action is again named **Install the extension**, accurately
  describing its `/#install` destination.
- Param Factory footer links now visibly and accessibly disclose that they open
  an external site, including on the static 404.
- The `mobile-demo` claim now tests the complete visible result plus reset and
  exit cleanup. Site verification enforces the same live behavior.
- Catalog copy is verb-first and under 120 characters. Demo, README, claims,
  and copy-audit documentation match the released behavior.

`.factory/brief.json` is absent; the available design, demo, claims, review,
and polish records were used as the product scope and acceptance sources.

## Verification

Final clean clone: `/tmp/listen-back-reader-polish3-final.RoJPHL` at `6792e79`.

```text
npm ci                                      PASS — 251 packages, 0 vulnerabilities
18 exact claims.json commands, individually PASS
npm test                                    PASS — 37/37
npm run typecheck                           PASS
npm run lint                                PASS
npm run build                               PASS — dist/site and 508,230-byte MV3 ZIP
npm run test:extension                      PASS — packaged MV3 in Chromium
npm run test:site                           PASS — routing, axe, mobile, privacy, offline
npm audit --omit=dev                        PASS — 0 vulnerabilities
```

The 18 claim commands were each run separately, exactly as declared in
`.factory/claims.json`; the final log records `ALL_CLAIMS_PASS`.

Live post-deploy evidence:

```text
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site
PASS — 1440×900 + 390×844, metadata, history/focus, axe, mobile demo,
       reset/exit cancellation, external cue, privacy, offline shell

VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:deployment
PASS — HTTP 200, CSP frame policy, ZIP headers/integrity, byte-identical archive

/opt/fleet/lib/verify-url.sh https://listen-back-reader.sociobot.in
PASS — 744 ms; title/lang/H1/main/alt/control checks and console clean
```

The deployed extension ZIP SHA-256 is
`3dbd2fb7fe03dd01a7164e19e0192ed3d8e0a35caf6736b17bca3c2054ecf90a`.

Live Lighthouse mobile results: Performance 100, Accessibility 100, Best
Practices 100, SEO 100; FCP 1.3 s, LCP 1.4 s, CLS 0, TBT 0 ms.

## Evidence

- Full finding-by-finding mapping: `.factory/polish-3.md`.
- Local and live screenshots, URL report, and Lighthouse JSON:
  `.factory/evidence/polish-3/`.
- Live mobile first-demo screenshot:
  `.factory/evidence/polish-3/live/demo-mobile-first.png`.

## Known gaps and next steps

No known product gaps. No follow-up is required.
