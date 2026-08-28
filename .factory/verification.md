# Independent verification — FAIL

**Candidate:** `0b77d7e150c620c0c4ec48151e1f261f1a590cdf`  
**Live URL:** https://listen-back-reader.sociobot.in  
**Verified:** 2026-08-28 UTC  
**Decision:** **FAIL — do not release.**

## Release blockers

### Critical — live extension download is broken

The primary live installation action, **Download extension zip**, requests
`/downloads/listen-back-reader.zip`. Fresh evidence was `HTTP 404` with a
2400-byte HTML response. The candidate's `npm run build` does generate
`dist/site/downloads/listen-back-reader.zip`, but the deployed URL is not that
file. A normal visitor therefore cannot install the advertised extension.

### High — mandatory clean-clone claim test fails

Following the required first step, I ran `npm ci`, then the exact first listed
claim command before a build or other test:

```text
npm test -- -t @claim:sentence-loop
TSConfckParseError: failed to resolve "extends":"./.wxt/tsconfig.json"
```

`.wxt/tsconfig.json` is absent in a clean clone and only appears after `wxt
build`. A claim command must run from a clean demo entry point; this has an
undocumented build prerequisite. One failing claim is release-blocking.

After `npm run build`, all four listed commands pass, but this does not repair
the clean-clone failure. All four are jsdom helper-unit tests; none opens
`/demo` or observes actual demo storage/network behavior, so they also do not
meet the required claim-sandbox evidence standard.

### High — no-copy protection is bypassed by keyboard shortcuts

I installed the fresh MV3 build and served an article with `<meta
name="robots" content="noarchive">`. The normal message path declines it, but
pressing `Alt+R` created `#listen-back-marker` and started the reading path. The
content script's key handler calls `speak()` without testing `copyRestricted`.
This violates the brief's no-copy requirement and the prior handoff's claim.

## Other defects

### Medium — SPA route focus is wrong

Activating live header Privacy navigated to `/privacy`, but focus stayed on the
old `A` element rather than the new `h1`. The SPA calls `.focus()` on a
non-focusable h1, missing the stated route-focus requirement.

### Medium — shipped popup controls are below touch-target minimum

Popup CSS sets Replay/Slow controls to 36px minimum height and Refresh page to
28px, below the required 44px baseline.

### Medium — visual 404 returns HTTP 200

`/no-such-page` renders a visual 404 but returns the SPA shell with HTTP 200;
`staticwebapp.config.json` has no 404 response override.

### Low — vulnerable build dependency tree

`npm audit --omit=dev` reports 10 issues: 3 critical, 4 high, 2 moderate, and
1 low, chiefly through `wxt` → `web-ext-run`. These are build-tool dependencies,
not observed browser runtime requests, but need remediation before maintenance.

## Passing evidence

### First read and demo

The cold live first screen passes the plain-words/demo gate. It says it
replays sentences for readers who lose their place in dense text and exposes
**Try it with sample data** on the first screen.

At local `/demo`, the persistent banner stated “Demo — sample data, nothing is
saved.” Mocked native speech received exactly the visible sentence; Slow changed
rate 1 to 0.8; Next advanced 3/5 to 4/5; Reset restored 3/5; Start for real
removed the banner and returned home. The demo had empty localStorage and only
same-origin requests. Keyboard focus had a visible 3px outline.

### Build, extension, accessibility, and privacy

- Fresh `npm run build` passed and produced MV3 output, static output, and a
  local ZIP. Static JS was 63.77 KB gzip; CSS 2.56 KB gzip.
- After `wxt build` generated its ignored config, all four claim commands and
  `npm test` passed (5 tests). `npx tsc --noEmit` passed. No lint script exists.
- A fresh installed extension marked and advanced a normal article through the
  content-script command path. The noarchive keyboard failure is the exception.
- Axe 4.11 had zero serious/critical (indeed zero) violations on live `/`,
  `/demo`, `/privacy`, `/terms`, and the visual 404. Each had one h1 and main,
  appropriate title, and no console/page errors. Desktop and 390px mobile had
  no horizontal overflow. Reduced motion yielded `scroll-behavior: auto` and
  no active animations.
- Cold live landing requests were same-origin HTML, JS, CSS, and hero image
  only; no analytics or third-party runtime requests were observed. This static
  product has no product API endpoint, so rate-limit testing is not applicable.

### Deployment identity and policies

The live `assets/index-Dl6VgS39.js` exactly matches the fresh build:

```text
SHA-256 69531f6c4d0b5d873e9ee3e72cf13013fe7db612194e44014f88cbadca4e1c15
size    202970 bytes
```

HTML had HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy,
and a same-origin CSP. The hashed JS was cached immutable for one year. Primary
SPA routes, robots.txt, and sitemap.xml returned 200.

## Required remediation

1. Deploy the ZIP and confirm the public link is a 200 ZIP matching release.
2. Make claim commands work from a clean clone and use one browser `/demo` test
   per claim.
3. Gate keyboard shortcuts on noarchive and explicit no-copy signals.
4. Repair route focus, popup target sizes, HTTP 404 status, and vulnerable
   build dependencies before re-verification.
