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

Deployment/live identity verification will be appended after the work-order
static deployment completes. There are no known product gaps.
