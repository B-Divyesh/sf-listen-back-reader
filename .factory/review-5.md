# Adversarial first-read review 5

**Verdict: PASS**

Reviewed 2026-08-29 UTC against
<https://listen-back-reader.sociobot.in> in fresh Chromium contexts at 390×844
and 1440×900. The reviewed checkout was
`ebf43e1c44d67eeb416297c343a72a7890cabb00`. No product code was changed.

There are zero findings of any severity and no untested public claim.
`.factory/brief.json` is absent, so the available scope sources were the live
product, `.factory/design.md`, `.factory/claims.json`, README, all four earlier
reviews, all four polish records, and the existing handoff.

## First screen, before scrolling

The cold first screen answers all three required questions at both viewports.

- **What it does:** a browser extension reads or replays one web sentence at a
  time and keeps the source sentence marked.
- **For whom:** readers who lose their place in dense web text.
- **What to click first:** **Try it with sample data**.

The exact visible text is “A browser extension that reads one sentence at a
time”, “Replay each sentence. Keep your place.”, “For readers who lose their
place in dense web text.”, and “Try it with sample data”. The adjacent result
text says “Open a sample article with one sentence marked.”

At 390×844, the action is at y=386–434 and all four facts end at y=735. The
desktop-only extension limit is therefore visible before scrolling on the
phone. At 1440×900, the same copy, action, facts, and product-specific artwork
are visible. Neither viewport has a blocking first-read failure.

## Findings

None.

## Copy audit

Counts treat hyphenated terms, keyboard shortcuts, URLs, paths, and versions as
one word. Punctuation-only marks are not words. Headings, controls, metadata,
alternative text, and dynamic reader states are included. No sentence exceeds
22 words. No jargon, banned marketing adjective, metaphor, mood heading,
uninformative slogan, inconsistent term, or non-result action was found.

### Landing page and shared interface

| Location | Exact copy | Words | Flag |
| --- | --- | ---: | --- |
| Title | Listen Back Reader — replay one sentence | 6 | — |
| Description | Replay one web sentence at a time while the extension marks your place. | 13 | — |
| Skip link | Skip to main content | 4 | — |
| Wordmark | Listen Back | 2 | — |
| Navigation | Demo | 1 | — |
| Navigation / section label | How it works | 3 | — |
| Navigation / footer link | Privacy | 1 | — |
| Hero label | A browser extension that reads one sentence at a time | 10 | — |
| H1 sentence 1 | Replay each sentence. | 3 | — |
| H1 sentence 2 | Keep your place. | 3 | — |
| Audience | For readers who lose their place in dense web text. | 10 | — |
| Primary action | Try it with sample data | 5 | — |
| Action result | Open a sample article with one sentence marked. | 8 | — |
| Fact | Listen Back does not send article text to a Listen Back server. | 12 | — |
| Fact | Extension controls work offline after an article loads; speech depends on your browser voice. | 14 | — |
| Fact | Free and account-free. | 3 | — |
| Fact | Extension requires desktop Chrome or Chromium; the demo works on mobile. | 11 | — |
| Image alternative | An ink-and-paper illustration of a marked article sentence looping back through sound waves. | 13 | — |
| Image caption | Print-style illustration for Listen Back Reader. | 6 | — |
| Section label | The reader | 2 | — |
| H2 | One sentence stays visible while you listen. | 7 | — |
| Preview | The extension marks the source sentence. | 6 | — |
| Preview | Replay it until you understand it, then move to the next sentence. | 12 | — |
| Reader label | Sample article | 2 | — |
| Counter | Sentence 3 / 5 | 3 | — |
| Button | Previous sentence | 2 | — |
| Button | Read highlighted sentence | 3 | — |
| Button note | Uses your browser voice | 4 | — |
| Dynamic button | Stop reading | 2 | — |
| Button | Next sentence | 2 | — |
| Button | Use 0.8× speed | 3 | — |
| Dynamic button | Use normal speed | 3 | — |
| Dynamic status | Reading sentence 3. | 3 | — |
| Dynamic status | Finished sentence 3. | 3 | — |
| Dynamic status | Reading stopped. | 2 | — |
| Error | Speech is unavailable. | 3 | — |
| Error instruction | Enable a browser voice, then try again. | 7 | — |
| Error | The browser voice could not read this sentence. | 8 | — |
| Sample sentence 1 | On 14 March 2026, Dr. Mira Patel presented the city library's new late-hours plan to the East Ward council. | 19 | — |
| Sample sentence 2 | The pilot keeps the study floor open until 9 p.m. on Tuesdays and Thursdays for six weeks. | 17 | — |
| Sample sentence 3 | Patel said the $2.4 million proposal uses existing staff schedules, not new surveillance software. | 14 | — |
| Sample sentence 4 | The U.S. Census Bureau estimates that 38% of nearby households have no quiet room for study. | 16 | — |
| Sample sentence 5 | Council members will vote after the public comment session on 2 April. | 12 | — |
| H2 | Read web text in three steps. | 6 | — |
| Step heading | Open an article. | 3 | — |
| Step detail | Choose a page with the text you want to hear. | 10 | — |
| Step heading | Read the sentence. | 3 | — |
| Step detail | Listen Back finds readable page text and marks the current sentence. | 11 | — |
| Step heading | Replay or move on. | 4 | — |
| Step detail | Use the popup or Alt + R, Alt + Left, and Alt + Right. | 11 | — |
| Section label | What it does not do | 5 | — |
| H2 sentence 1 | It reads the article. | 4 | — |
| H2 sentence 2 | It does not rewrite it. | 5 | — |
| Limit | Listen Back does not send article text to a Listen Back server, diagnose dyslexia, create voices, or save an account. | 20 | — |
| Limit | It does not read pages that explicitly block copying. | 9 | — |
| Section label | Use it on ordinary web pages | 6 | — |
| H2 | Install the free extension. | 4 | — |
| Compatibility | Desktop Chrome or Chromium only. | 5 | — |
| Install instruction | Download the ZIP and extract it. | 6 | — |
| Install instruction | Open chrome://extensions and enable Developer mode. | 6 | — |
| Install instruction | Choose Load unpacked and select the extracted folder. | 8 | — |
| Download action | Download extension zip | 3 | — |
| Footer | Replay one sentence without losing your place. | 7 | — |
| Footer link | Terms | 1 | — |
| External link | Built by Param Factory (external) | 5 | — |
| Version | v1.0.0 | 1 | — |
| Route live region | Home page | 2 | — |

### Demo-only copy

| Location | Exact copy | Words | Flag |
| --- | --- | ---: | --- |
| Banner | Demo — sample data, nothing is saved. | 6 | — |
| Button | Reset demo | 2 | — |
| Button | Install the extension | 3 | — |
| Section label | Sample article | 2 | — |
| H1 | Read one highlighted sentence. | 4 | — |
| Introduction | Try browser speech on a city library report. | 8 | — |
| Introduction | The sample stays separate from your data. | 8 | — |
| Counter | Sentence 1 / 5 | 3 | — |
| Help | Use the controls above the article to replay, stop, change speed, or move through its sentences. | 16 | — |
| Route live region | Demo page | 2 | — |

### README

Command-only lines are listed as commands rather than prose sentences.

| Location | Exact copy | Words | Flag |
| --- | --- | ---: | --- |
| H1 | Listen Back Reader | 3 | — |
| Lede | Replay one web sentence at a time without losing your place. | 11 | — |
| Introduction | Listen Back Reader is a free browser extension for dyslexic readers and anyone who gets tired while reading dense web text. | 21 | — |
| Introduction | It uses voices already available in your browser. | 8 | — |
| Introduction | Listen Back does not send article text to a Listen Back server. | 12 | — |
| H2 | What it does | 3 | — |
| Bullet | Finds readable article text on the current page. | 8 | — |
| Bullet | Reads one sentence at a time with replay, stop, slower speed, previous, and next. | 14 | — |
| Bullet | Marks the source sentence while it reads. | 7 | — |
| Bullet | Supports Alt + R, Alt + Left, and Alt + Right. | 8 | — |
| Body | The extension reads the active page only after you open its toolbar popup or press Alt + R. | 17 | — |
| Body | It does not request access to every site in advance. | 10 | — |
| Body | It does not rewrite text, make a diagnosis, create a voice, or store an account. | 15 | — |
| Body | Extension controls work offline after an article loads. | 8 | — |
| Body | Speech depends on the voice selected by your browser or operating system. | 12 | — |
| H2 | Try the sample | 3 | — |
| Body | Open `/demo?demo=1` on the deployed site, or `http://localhost:5173/demo?demo=1` while developing. | 10 | — |
| Body | The demo keeps its sample separate and does not read or change your extension data. | 15 | — |
| Body | Use Reset demo to stop any sample speech and start again. | 11 | — |
| Body | Choose Install the extension to leave the sample and open the installation steps. | 13 | — |
| H2 | Install the extension | 3 | — |
| Body | Listen Back Reader runs in desktop Chrome or Chromium. | 9 | — |
| Body | It cannot be installed in mobile Chrome. | 7 | — |
| Step | Download `listen-back-reader.zip` from the site. | 5 | — |
| Step | Extract the ZIP to a folder. | 6 | — |
| Step | Open `chrome://extensions` and enable Developer mode. | 6 | — |
| Step | Choose Load unpacked and select the extracted folder. | 8 | — |
| Body | For a local developer build, run `npm run build:extension` and select `.output/chrome-mv3` in step 4. | 15 | — |
| H2 | Develop, test, and build | 4 | — |
| Command | `npm ci` | command | — |
| Command | `npm run dev` — landing site | command | — |
| Command | `npm run dev:extension` — Chrome extension in development | command | — |
| Command | `npm test` | command | — |
| Command | `npm run typecheck` | command | — |
| Command | `npm run lint` | command | — |
| Command | `npm run build` | command | — |
| Command | `npm run test:extension` | command | — |
| Command | `npm run test:site` | command | — |
| Body | `npm run build:site` writes the static site to `dist/site`. | 9 | — |
| Body | The extension ZIP is at `dist/site/downloads/listen-back-reader.zip`. | 6 | — |
| Body | Deploy the site with the repository's deploy script. | 9 | — |
| Command | `npm run deploy:site` | command | — |
| H2 | Privacy | 1 | — |
| Body | Your browser or operating system provides speech. | 7 | — |
| Body | Some voices may need a network connection. | 7 | — |
| Body | The extension has no Listen Back server, tracking, accounts, or analytics. | 11 | — |
| Body | Read the included privacy page and terms page. | 8 | — |
| H2 | License | 1 | — |
| Link | MIT | 1 | — |

Terminology is consistent: **sentence** is the reading unit, **article text** is
the source, **extension** is the installed product, **demo** is the sample,
**marker/highlight** is the position cue, and **browser voice** is the speech
provider.

## Demo and sandbox

The one-click demo passes from a fresh mobile context.

- **Try it with sample data** opens `/demo?demo=1` in one click.
- The first post-click screen already shows the reader controls, “Sentence 1 /
  5”, and the complete marked first sentence. At 390×844 the banner is fully
  visible at y=106–204, the read control at y=533–598, and the marker at
  y=718–820.
- The five-sentence city-library report contains a named person, dates, `p.m.`,
  `$2.4 million`, `U.S.`, and `38%`. It is realistic sample data.
- The persistent banner says “Demo — sample data, nothing is saved.” and
  exposes **Reset demo** and **Install the extension**.
- Next, slow speech, and read changed the visible state and sent the exact
  second sentence to the controlled browser voice at rate 0.8. Reset restored
  sentence 1, normal speed, the first marker, and cancelled sample speech.
- **Install the extension** cancelled speech, removed the banner, opened
  `/#install`, and focused “Install the free extension.”
- A seeded `real:sentinel` localStorage value remained unchanged through entry,
  interaction, Reset, and exit. Session storage and IndexedDB remained empty.
- After initial page assets loaded, read, next, speed, Reset, and exit made zero
  requests. Initial requests were same-origin only; there was no analytics,
  font CDN, AI gateway, or other third-party request.

Demo state is React component memory and cannot access extension storage. The
live behavior and `@claim:demo-not-saved` test both confirm the sandbox boundary.

## Claims audit

A clean clone was created at `/tmp/listen-back-review5.5wv367/clone` from
`ebf43e1c44d67eeb416297c343a72a7890cabb00`. After `npm ci`, every exact command
listed in `.factory/claims.json` was run independently.

| Claim ID | Result | Evidence |
| --- | --- | --- |
| `sentence-loop` | PASS | One tagged punctuation and exact sentence-sequence test passed. |
| `reader-controls` | PASS | One tagged replay, 0.8 speed, previous, and next test passed. |
| `local-speech` | PASS | The visible demo sentence was passed to `SpeechSynthesisUtterance`. |
| `local-text` | PASS | Post-load reading and navigation generated zero requests. |
| `offline-controls` | PASS | The packaged extension moved its source marker offline without a request. |
| `demo-not-saved` | PASS | Storage remained empty in a fresh demo and requests remained same-origin. |
| `free-account-free` | PASS | The complete sample and download path required no account, billing, or checkout. |
| `readable-text` | PASS | The reader selected article text and excluded navigation/sidebar fixtures. |
| `source-marker` | PASS | Packaged-extension marker ranges matched wrapped source sentences. |
| `does-not-rewrite` | PASS | Source text and exact child markup survived start, next, and stop unchanged. |
| `keyboard-shortcuts` | PASS | Alt+R, Alt+Left, and Alt+Right dispatched the documented actions. |
| `protected-pages` | PASS | The noarchive fixture produced no reader action. |
| `session-memory` | PASS | Runtime state had no local, session, IndexedDB, or extension-storage call. |
| `active-page-only` | PASS | The MV3 build has only `activeTab`/`scripting` and explicit runtime injection. |
| `installable-package` | PASS | The linked ZIP built and contained the expected MV3 manifest. |
| `no-remote-services` | PASS | Shipped runtime/dependencies contain no network client, telemetry, identity, or billing implementation. |
| `stop-reading` | PASS | The packaged extension cancelled current browser speech and left a non-speaking state. |
| `desktop-chromium-install` | PASS | The MV3 package and extracted-folder desktop Chromium instructions passed. |
| `mobile-demo` | PASS | At 390×844 the banner, controls, and complete marker fit; Reset and exit cancelled speech. |

Each ID appears in exactly one tagged test. Every claim-like landing and README
sentence maps to a listed claim. No unlisted or untested claim remains.

## Earlier findings rechecked

Every prior finding was checked against both the current live deployment and
the current source or packaged-extension test. None is unfixed, half-fixed, or
regressed.

| Earlier ID | Current live/code verification |
| --- | --- |
| F-1-1 | One click opens the realistic report; controls and the complete marked sentence fit in the 390×844 first view. |
| F-1-2 | `initialSentence()` uses the selection, then the viewport centre; packaged midpoint and selection checks pass. |
| F-1-3 | Header links use `/#how`; Demo, Privacy, and Terms navigate home and focus `how-heading`. |
| F-1-4 | Per-entry scroll/focus state restores the originating footer or header link on Back/Forward. |
| F-1-5 | The phone first screen discloses desktop Chromium support; install steps include extract and Load unpacked. |
| F-1-6 | Home, Demo, Privacy, Terms, and 404 have route-specific title, description, canonical, OG, and Twitter values. |
| F-1-7 | The real HTTP 404 includes the shared navigation, legal links, factory attribution, version, and home action. |
| F-1-8 | The packaged popup has one main and the H1 “Read one sentence”. |
| F-1-9 | No public illustration-provenance claim remains; provenance stays in `.factory/design.md`. |
| F-1-10 | README gives commands without the former clean-checkout outcome promise. |
| F-1-11 | README states concrete output locations; the downloadable package has its own passing claim. |
| F-1-12 | Public copy makes no deployment hash-gate promise. |
| F-1-13 | The hero label literally names one-sentence reading. |
| F-1-14 | “Until it lands” is absent; preview copy says “until you understand it”. |
| F-1-15 | The section heading is “Read web text in three steps.” |
| F-1-16 | The source-page slogan is absent; literal article-text wording remains. |
| F-1-17 | Social descriptions plainly name replaying and marking, per route. |
| F-1-18 | “Local-first” is absent from README; the precise server boundary is used. |
| F-1-19 | README explains separate demo data without implementation jargon. |
| F-1-20 | The complete current audit above has no sentence over 22 words. |
| F-1-21 | The banner action is “Install the extension” and focuses the installation section. |
| F-1-22 | The 404 label is “Page not found”. |
| F-1-23 | The 404 H1 is “We could not find this page.” |
| F-1-24 | The 404 sentence and action directly name the home page. |
| F-2-1 | Privacy copy is limited to no article-text request to a Listen Back server; browser voice networking is disclosed. |
| F-2-2 | The first screen states the tested offline-control boundary. |
| F-2-3 | Missing and failed speech show actionable live status and restore the read action. |
| F-2-4 | Visible controls name previous sentence, next sentence, stop, and the selected speed. |
| F-2-5 | README says “repository's deploy script”, not internal work-order language. |
| F-2-6 | Demo and popup expose Stop reading; packaged Chromium verification observes cancellation. |
| F-3-1 | Reset, demo exit, and unmount cancel sample speech before reset/navigation. |
| F-3-2 | Every Param Factory footer link visibly and accessibly says “(external)”. |
| F-4-1 | `does-not-rewrite` is registered; its production-content-script test preserves exact source text and markup. |

## Structure, links, access, and visual identity

| Check | Result |
| --- | --- |
| Titles and headings | PASS: every route has the required title pattern, one H1, one main, and ordered headings. |
| Metadata | PASS: route descriptions, canonicals, OG/Twitter fields, favicon, 180×180 apple icon, and 1200×630 OG image are present. |
| Routes and 404 | PASS: `/`, `/demo`, `/privacy`, and `/terms` deep-link with 200; an unknown path returns the designed page with HTTP 404. |
| History and focus | PASS: push navigation focuses the destination H1; Back/Forward restores scroll and stable originating focus. |
| Links | PASS: navigational, download, and external destinations returned 200; all in-page targets exist; the deliberately unknown route remains 404. |
| Header/footer | PASS: the standard wordmark/navigation and Privacy/Terms/factory/version footer appear on every route and the 404. |
| Accessibility | PASS: live local/integration axe found no serious or critical issue; 44px targets, focus rings, alternatives, and reduced motion pass. |
| Console/network | PASS: no console or page errors; no third-party runtime requests. |
| Security | PASS: live CSP is a response header and includes `frame-ancestors 'none'`; nosniff, referrer, and HSTS headers are present. |
| Performance | PASS: built initial JavaScript is 65.21 KB gzip, below the 150 KB and 200 KB limits. |
| Visual identity | PASS: paper, dark ink, vermilion marker, Georgia reading type, halftone texture, offset controls, and original editorial art are product-specific. |

The independent link crawl covered the home, Demo, Privacy, Terms, download,
factory, and in-page destinations. The worker URL verifier reported a 559 ms
load, no console errors, `lang=en`, one H1, one main, no missing alternatives,
and no unlabelled buttons.

## Missed leverage

No AI, import/export, or sync feature is implied by this local,
sentence-by-sentence browser-reading job. Selection/viewport-aware starting,
source marking, replay, speed, stop, keyboard controls, offline controls, and a
real sample cover the expected loop. The runtime contains no provider key,
decorative AI control, or AI/network request.

## Verification summary

```text
npm ci                                      PASS — 251 packages, 0 vulnerabilities
19/19 exact claim commands                  PASS independently
npm test                                    PASS — 38/38
npm run typecheck                           PASS
npm run lint                                PASS
npm run build                               PASS — dist/site and extension ZIP
npm run test:extension                      PASS
npm run test:site                           PASS locally
VERIFY_BASE_URL=... npm run test:site       PASS at 1440×900 and 390×844
VERIFY_BASE_URL=... npm run test:deployment PASS — live/local ZIP hash matched
/opt/fleet/lib/verify-url.sh                 PASS — no console/structure errors
```

The live extension ZIP SHA-256 is
`3dbd2fb7fe03dd01a7164e19e0192ed3d8e0a35caf6736b17bca3c2054ecf90a` and
is byte-identical to the clean-clone build.

## What would make this perfect

Nothing remains to fix in the reviewed scope. Preserve the current claim map,
one-click isolated demo, mobile first-view layout, route/history behavior, and
packaged-extension checks when making future changes.
