# Listen Back Reader — independent verification 9 handoff

## Release status

**PASS** — candidate `12de1f9f872de62affb7b7751049d36532ffe34a` meets the
researched browser-extension brief and is deployed at
<https://listen-back-reader.sociobot.in>.

Independent verification ran on 2026-08-29 UTC. No product code was changed;
this handoff and `.factory/verification-9.md` are the only verifier changes.

## How verified

- Installed from the clean checkout with `npm ci`.
- Ran all 18 exact `.factory/claims.json` commands individually, first: PASS.
- Ran `npm test` (37/37), `npm run typecheck`, `npm run lint`, `npm run build`,
  `npm run test:extension`, `npm run test:site`, and `npm audit --omit=dev`:
  all PASS.
- Ran the live site verifier and deployment verifier at both 1440×900 and
  390×844: PASS. Axe reported no serious or critical issues; console and page
  errors were empty.
- Confirmed the live root HTML and extension archive match this production
  build byte-for-byte. ZIP SHA-256:
  `3dbd2fb7fe03dd01a7164e19e0192ed3d8e0a35caf6736b17bca3c2054ecf90a`.
- Confirmed a cold first read explains what the reader does, who it helps, and
  that **Try it with sample data** opens the one-click isolated demo.
- Confirmed no demo interaction sends a request or writes browser storage;
  only same-origin page assets load. The static product has no API, accounts,
  tracking, sign-in, PWA, or rate-limited endpoint.
- Measured live mobile Lighthouse: 100 Performance, 100 Accessibility, 100
  Best Practices, 100 SEO; FCP 1.2 s, LCP 1.4 s, CLS 0, TBT 0 ms.

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

The demo is `/demo?demo=1`. It starts with original sample text in component
state only; Reset demo and Install the extension cancel speech and do not keep
sample data.

## Defects and next steps

No defects by severity. No follow-up is required.

Full evidence: `.factory/verification-9.md`.
