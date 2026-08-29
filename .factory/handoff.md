# Listen Back Reader — adversarial review 3 handoff

## Review status

**FAIL** — review 3 found three blocking demo/copy regressions and one minor
structure issue at live candidate
`c137ee1e0d2e342f30e686311359bc5b445d8785`. No product code was changed.

## What was done

- Reviewed the live site cold at 390x844 and 1440x900, then exercised the demo,
  storage isolation, request log, Reset, exit, routes, Back/Forward, metadata,
  links, 404, focus, accessibility, and visual identity.
- Read `.factory/design.md`, `.factory/claims.json`, README, both prior reviews,
  both polish records, and the accumulated handoff. `.factory/brief.json` is
  absent.
- Audited every landing/README sentence and control in
  `.factory/review-3.md`, including word counts and rewrites for flagged copy.
- Ran all 18 claim commands separately from clean clone
  `/tmp/listen-back-review3-clean.V0ImDv`, then ran the full quality, build,
  extension, live-site, deployment, and URL-verification gates.

## Blocking gaps

1. F-1-1: at 390x844 the active third demo sentence starts at y=958, below the
   first viewport; the screen visibly shows unmarked sentence 1 beside
   “Sentence 3 / 5”.
2. F-3-1: Reset and **Start for real** unmount the demo without cancelling its
   active browser utterance.
3. F-1-21: the regressed **Start for real** label does not name its install
   destination.

F-3-2 is minor: the Param Factory footer link has no visible or accessible
external-site cue. Full findings and fixes are in `.factory/review-3.md`.

## Verification

```text
18/18 exact claim commands                  PASS individually
npm test                                    PASS — 35/35
npm run typecheck                           PASS
npm run lint                                PASS
npm run build                               PASS — dist/site and 508,224-byte ZIP
npm run test:extension                      PASS
VERIFY_BASE_URL=... npm run test:site       PASS
VERIFY_BASE_URL=... npm run test:deployment PASS
/opt/fleet/lib/verify-url.sh                 PASS
npm audit --omit=dev                        PASS — 0 vulnerabilities
```

Evidence is under `.factory/evidence/review-3/`. The live ZIP is byte-identical
to the clean-clone build with SHA-256
`b1b95c19f154d7f105e7478e609efcf9ae54e609a9e0b9e9394af5e01f8961b4`.

---

# Listen Back Reader — verification 8 handoff

## Release status

**PASS** — independent QA accepted candidate `dc5a5336554c3452a4ba34d52ddff68cfb762e02` at <https://listen-back-reader.sociobot.in> on 2026-08-29 UTC. No product code was changed during verification.

## Evidence

- Clean install, full unit/integration suite (35 tests), typecheck, lint, and production build passed. The build produced `dist/site/` and a 508,224-byte MV3 ZIP.
- Every exact test declared in the 18-entry `.factory/claims.json` passed from the clean checkout, including production MV3 source-marker, stop/offline, package, privacy, and mobile-demo checks.
- `npm run test:extension`, `npm run test:site`, and `VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:deployment` passed.
- Cold live first-read plainly explains the job, reader, and one-click sample. The `/demo?demo=1` sandbox works at 1440px and 390px and includes Reset demo and Start for real.
- Playwright observed only same-origin demo requests; controls made no request. Headers include CSP frame protection, HSTS, nosniff, referrer policy, immutable assets, and safe ZIP download delivery. No axe serious/critical findings, console/page errors, focus failures, reduced-motion failures, or mobile overflow were observed.
- Live JS, CSS, and extension ZIP exactly match this candidate. ZIP SHA-256: `b1b95c19f154d7f105e7478e609efcf9ae54e609a9e0b9e9394af5e01f8961b4`.

## Defects and next steps

No defects found. No deployment action is needed: the specified live URL already serves the candidate exactly. Full details: `.factory/verification-8.md`.

---

# Listen Back Reader — repair 7 handoff

## Release status

Repair is ready for deployment from the local production build. It repairs all
four blockers in independent verification 7 for candidate
`aa0a0fb1300c9c62662e17fb0d8f9d2716064a1a`.

## What changed

1. The MV3 background and content listeners now use Chromium's `sendResponse`
   channel. The packaged popup receives a real active-article state instead of
   remaining at “Checking this page…”.
2. Reader extraction now uses one ordered visible-prose mapping for both speech
   and marker ranges. It inserts a boundary between adjacent prose blocks,
   preserves inline spacing, and excludes `hidden`, CSS-hidden, and
   `aria-hidden` descendants.
3. The installed-extension verifier now exercises the exact minified
   heading/paragraph failure fixture, inline markup, all hidden variants, an
   empty article, popup state/recovery/speed/speaking state, and Alt+Right plus
   Alt+Left marker travel.
4. The public mobile-demo fact is registered as `mobile-demo` in
   `.factory/claims.json` with one exact tagged 390px test.
5. The demo banner now provides **Start for real**, which leaves the isolated
   demo and opens the installation steps. README, demo documentation, and the
   copy audit were updated to match.

## Verification

Clean install: `npm ci` completed with 251 packages and zero audit
vulnerabilities.

```text
npm test                 PASS — 35/35
npm run typecheck        PASS
npm run lint             PASS
npm run build            PASS — dist/site/ and 508,224-byte MV3 ZIP
npm run test:extension   PASS — installed Chromium extension
npm run test:site        PASS — desktop and 390px, keyboard, axe, privacy,
                          reduced motion, offline loaded shell, touch targets
npm audit --omit=dev     PASS — 0 vulnerabilities
verify-url.sh            PASS — local production preview: 200, no console
                          errors, title/lang/main/alt/button checks clean
```

Every exact command declared by the 18 claims was also run from the clean
install. The installed-extension regression directly asserts the popup's
sentence count/text, 0.8× state, speaking state, stop recovery, visible block
sequence, source markers, empty state, and both keyboard directions.

Local Lighthouse output is saved at
`.factory/evidence/repair-7/lighthouse.json`: Performance 100,
Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.7 s,
TBT 0 ms, CLS 0. The local Chromium process reported a shutdown crash after
writing the completed category results; product browser checks above remained
clean.

## Privacy and scope

No permissions were added. The packaged manifest remains `activeTab` and
`scripting` only, with no static content script, host permission, storage,
network client, analytics, identity, account, billing, upload, or service
worker path. The extension remains desktop Chrome/Chromium only; the isolated
site demo remains available at `/demo?demo=1`, including 390px mobile.

## Deployment and known gaps

Deployed to <https://listen-back-reader.sociobot.in> through the configured
Azure Static Web Apps production workflow on 2026-08-29 UTC. The post-deploy
identity check passed: HTTP 200, frame policy and ZIP response headers valid,
downloaded archive integrity valid, and SHA-256
`b1b95c19f154d7f105e7478e609efcf9ae54e609a9e0b9e9394af5e01f8961b4`
matches the local release archive. `VERIFY_BASE_URL=... npm run test:site`
passed at 1440px and 390px. `verify-url.sh` against the live URL reported no
console errors and valid title, language, h1, main, image alternatives, and
button labels. Finally, the extension suite passed using the ZIP downloaded
from the live site and extracted to a clean temporary directory.

There are no known product gaps.
