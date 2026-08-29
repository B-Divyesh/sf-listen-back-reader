# Adversarial first-read review 3

**Verdict: FAIL**

Reviewed on 2026-08-29 UTC at
<https://listen-back-reader.sociobot.in> in fresh Chromium contexts at 390x844
and 1440x900. The reviewed repository base was
`c137ee1e0d2e342f30e686311359bc5b445d8785`. No product code was changed.

There are three blocking findings and one non-blocking finding. All 18 declared
claim commands pass, but the mobile-demo test does not exercise the result it
claims and therefore misses two observable demo failures.

`.factory/brief.json` is absent. Scope was checked against `.factory/design.md`,
`.factory/claims.json`, the live product, README, and every earlier review,
polish, and handoff record.

## First screen, before scrolling

The cold first screen answers all three required questions at both viewports:

- What does this do? A browser extension reads one web sentence at a time and
  keeps the reader's place marked.
- For whom? Readers who lose their place in dense web text.
- What should I click first? **Try it with sample data**.

The exact text is “A browser extension that reads one sentence at a time”,
“Replay each sentence. Keep your place.”, “For readers who lose their place in
dense web text.”, and “Try it with sample data”. The adjacent explanation says
“Open a sample article with one sentence marked.”

At 390x844, all four facts end at y=742, including the desktop-only limitation.
At 1440x900, the same copy is visible. Cold screenshots are
`.factory/evidence/review-3/cold-mobile.png` and `cold-desktop.png`.

## Findings

### Blocking

#### F-1-1 — The highlighted demo sentence has regressed below the first viewport

**Exact quote/location:** `/demo?demo=1` at 390x844 says “Sentence 3 / 5” and
“Read highlighted sentence”, but the marked sentence is “Patel said the $2.4
million proposal uses existing staff schedules, not new surveillance
software.”

**Evidence:** Immediately after the one landing-page click, the viewport ends at
y=844. The marked sentence occupies y=958–1060 and is not visible. The only
article text visible is the unmarked first sentence at y=742–836. At 1440x900,
only the first 8 pixels of the marked sentence enter the viewport. The mobile
screenshot is `.factory/evidence/review-3/demo-mobile-first.png`.
`src/site.tsx:107` initializes sentence 3, while `src/site.tsx:162` renders the
article after the banner, heading, explanation, and four controls.

**Why this fails:** The first demo screen does not show the product's defining
result: a visible marked sentence. The counter and visible article disagree
about which sentence is active. This is a regression of the realistic,
immediately visible demo required under the original F-1-1, so it is blocking
under the history rule.

**Concrete fix:** Start the demo at sentence 1, or reduce/reorder the demo so the
marked sentence is fully visible at 390x844 without scrolling. Strengthen
`@claim:mobile-demo` to assert that `[aria-current="true"]` is fully inside the
first viewport and remains paired with the visible counter and read control.

#### F-3-1 — Reset and demo exit leave sample speech running

**Exact quote/location:** Demo banner actions “Reset demo” and “Start for real”;
`src/site.tsx:199-200` remounts or removes `ReaderDemo`, but `ReaderDemo` has no
unmount cleanup.

**Evidence:** In a fresh live context with a controlled speech implementation,
starting sentence 3 called `speechSynthesis.cancel()` once before speaking.
Clicking **Reset demo** left the count at one and the sample utterance active,
even though the UI returned to an idle **Read highlighted sentence** state.
Repeating the check with **Start for real** also left the sample utterance active
after navigation to `/#install`. Reset otherwise restored sentence 3 and normal
speed.

**Why this fails:** Reset presents a clean state while old audio continues, and
leaving the sandbox carries a demo side effect into the real-install route. The
required Reset and discard-on-exit behavior is therefore incomplete. A weak or
broken demo is blocking.

**Concrete fix:** Cancel browser speech when `ReaderDemo` unmounts and before
resetting its key. Add a browser test that starts a non-ending utterance, clicks
**Reset demo**, and asserts cancellation and idle status. Repeat that assertion
for **Start for real**.

#### F-1-21 — “Start for real” again fails to name the result

**Exact quote/location:** Demo banner button “Start for real” at
`src/site.tsx:102`; its action at `src/site.tsx:200` opens `/#install`.

**Evidence:** The button itself does not say that it leaves the demo and opens
desktop installation instructions. The explanation exists only in README. This
same non-result label was F-1-21 in review 1, was replaced during polish 1, and
was later reintroduced.

**Why this fails:** A first-time visitor cannot tell whether the action copies
sample state, creates an account, starts reading a real page, or opens install
steps. This is a regressed earlier finding and is blocking under the history
rule.

**Concrete fix:** Use **Install the extension**. If the prescribed phrase must
remain, use **Start for real — install extension** so the visible button names
its result.

### Non-blocking

#### F-3-2 — The external footer link has no visible or accessible external-site cue

**Exact quote/location:** “Built by Param Factory” links to
`https://sociobot.in` at `src/site.tsx:93` and in `public/404.html`. It has
`rel="external"`, but its accessible name is only “Built by Param Factory”.

**Why this fails:** The site-structure contract says external links must say so.
`rel="external"` is not exposed as a warning to a visitor or screen reader.

**Concrete fix:** Use visible copy such as **Param Factory website (external)**,
or append an external-link icon with accessible text “external site”. Keep the
required “Built by Param Factory” attribution alongside it.

## Copy audit

Counts treat hyphenated terms, URLs, paths, versions, and a keyboard chord as
one word. Punctuation-only symbols do not count. Repeated shared text is listed
once with every location. No sentence exceeds 22 words, no banned marketing
word appears, and terminology is otherwise consistent. The only control-copy
failure is F-1-21.

### Landing page and shared interface

| Location | Exact copy | Words | Flag |
| --- | --- | ---: | --- |
| Title | Listen Back Reader — replay one sentence | 6 | — |
| Meta/OG description | Replay one web sentence at a time while the extension marks your place. | 13 | — |
| Image alt | An ink-and-paper illustration of a marked article sentence looping back through sound waves. | 13 | — |
| Skip link | Skip to main content | 4 | — |
| Wordmark | Listen Back | 2 | — |
| Header link | Demo | 1 | — |
| Header link / section label | How it works | 3 | — |
| Header/footer link | Privacy | 1 | — |
| Hero label | A browser extension that reads one sentence at a time | 10 | — |
| H1 sentence 1 | Replay each sentence. | 3 | — |
| H1 sentence 2 | Keep your place. | 3 | — |
| Audience | For readers who lose their place in dense web text. | 10 | — |
| Primary action | Try it with sample data | 5 | — |
| Action explanation | Open a sample article with one sentence marked. | 8 | — |
| Fact | Listen Back does not send article text to a Listen Back server. | 12 | — |
| Fact | Extension controls work offline after an article loads; speech depends on your browser voice. | 14 | — |
| Fact | Free and account-free. | 3 | — |
| Fact | Extension requires desktop Chrome or Chromium; the demo works on mobile. | 11 | — |
| Caption | Print-style illustration for Listen Back Reader. | 6 | — |
| Section label | The reader | 2 | — |
| H2 | One sentence stays visible while you listen. | 7 | F-1-1 on the first demo screen |
| Preview sentence 1 | The extension marks the source sentence. | 6 | — |
| Preview sentence 2 | Replay it until you understand it, then move to the next sentence. | 12 | — |
| Reader label | Sample article | 2 | — |
| Counter | Sentence 3 / 5 | 3 | F-1-1 |
| Button | Previous sentence | 2 | — |
| Button | Read highlighted sentence | 3 | F-1-1 on mobile first view |
| Button note | Uses your browser voice | 4 | — |
| Dynamic button | Stop reading | 2 | — |
| Button | Next sentence | 2 | — |
| Button | Use 0.8x speed | 3 | — |
| Dynamic button | Use normal speed | 3 | — |
| Dynamic status | Reading sentence 3. | 3 | — |
| Dynamic status | Finished sentence 3. | 3 | — |
| Dynamic status | Reading stopped. | 2 | — |
| Error sentence 1 | Speech is unavailable. | 3 | — |
| Error sentence 2 | Enable a browser voice, then try again. | 7 | — |
| Error sentence 1 | The browser voice could not read this sentence. | 8 | — |
| Error sentence 2 | Enable a browser voice, then try again. | 7 | — |
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
| Limit sentence 1 | Listen Back does not send article text to a Listen Back server, diagnose dyslexia, create voices, or save an account. | 20 | — |
| Limit sentence 2 | It does not read pages that explicitly block copying. | 9 | — |
| Section label | Use it on ordinary web pages | 6 | — |
| H2 | Install the free extension. | 4 | — |
| Compatibility | Desktop Chrome or Chromium only. | 5 | — |
| Install sentence 1 | Download the ZIP and extract it. | 6 | — |
| Install sentence 2 | Open chrome://extensions and enable Developer mode. | 6 | — |
| Install sentence 3 | Choose Load unpacked and select the extracted folder. | 8 | — |
| Download action | Download extension zip | 3 | — |
| Footer sentence | Replay one sentence without losing your place. | 7 | — |
| Footer link | Terms | 1 | — |
| External footer link | Built by Param Factory | 4 | F-3-2: no external cue |
| Footer version | v1.0.0 | 1 | — |
| Live region | Home page | 2 | — |

### Demo-only copy

| Location | Exact copy | Words | Flag |
| --- | --- | ---: | --- |
| Banner | Demo — sample data, nothing is saved. | 6 | — |
| Button | Reset demo | 2 | F-3-1 behavior |
| Button | Start for real | 3 | F-1-21: result not named |
| H1 | Read one highlighted sentence. | 4 | F-1-1: marked sentence is below view |
| Intro sentence 1 | Try browser speech on a city library report. | 8 | — |
| Intro sentence 2 | The sample stays separate from your data. | 8 | — |
| Help | Use the controls above the article to replay, stop, change speed, or move through its sentences. | 16 | — |
| Live region | Demo page | 2 | — |

### README

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
| Body | Use Reset demo to start the sample again. | 8 | F-3-1: does not stop current sample audio |
| Body | Choose Start for real to leave the sample and open the installation steps. | 13 | F-1-21: documents a vague button after the fact |
| H2 | Install the extension | 3 | — |
| Body | Listen Back Reader runs in desktop Chrome or Chromium. | 9 | — |
| Body | It cannot be installed in mobile Chrome. | 7 | — |
| Step | Download `listen-back-reader.zip` from the site. | 5 | — |
| Step | Extract the ZIP to a folder. | 6 | — |
| Step | Open `chrome://extensions` and enable Developer mode. | 6 | — |
| Step | Choose Load unpacked and select the extracted folder. | 8 | — |
| Body | For a local developer build, run `npm run build:extension` and select `.output/chrome-mv3` in step 4. | 15 | — |
| H2 | Develop, test, and build | 4 | — |
| Command | `npm ci` | 2 | — |
| Command | `npm run dev` — landing site | 5 | — |
| Command | `npm run dev:extension` — Chrome extension in development | 7 | — |
| Command | `npm test` | 2 | — |
| Command | `npm run typecheck` | 3 | — |
| Command | `npm run lint` | 3 | — |
| Command | `npm run build` | 3 | — |
| Command | `npm run test:extension` | 3 | — |
| Command | `npm run test:site` | 3 | — |
| Body | `npm run build:site` writes the static site to `dist/site`. | 9 | — |
| Body | The extension ZIP is at `dist/site/downloads/listen-back-reader.zip`. | 6 | — |
| Body | Deploy the site with the repository's deploy script. | 9 | — |
| Command | `npm run deploy:site` | 3 | — |
| H2 | Privacy | 1 | — |
| Body | Your browser or operating system provides speech. | 7 | — |
| Body | Some voices may need a network connection. | 7 | — |
| Body | The extension has no Listen Back server, tracking, accounts, or analytics. | 11 | — |
| Body | Read the included privacy page and terms page. | 8 | — |
| H2 | License | 1 | — |
| Link | MIT | 1 | — |

Terminology is consistent: **sentence** is the spoken unit, **article text** is
the source, **extension** is the installed product, **demo** is the sample,
**marker/highlight** is the position cue, and **browser voice** is the speech
provider.

## Demo and sandbox audit

- One click on **Try it with sample data** opens `/demo?demo=1`.
- The five city-library sentences are realistic and specific.
- The banner is present with Reset and exit actions. F-1-21 covers the exit
  label.
- The read control is visible at 390x844, but the marked sentence is not;
  F-1-1 applies.
- Read, next, and speed controls operate. Reset restores sentence 3 and 1x
  speed, but it does not cancel active speech; F-3-1 applies.
- A seeded `real:sentinel` localStorage value, `real:session` sessionStorage
  value, and `real-data` IndexedDB database were unchanged after interaction,
  Reset, and exit. The demo created no storage keys or databases.
- The live request log contained only the site origin. Read, next, speed, Reset,
  and exit made no request. No analytics, font CDN, AI gateway, or other third
  party was contacted.
- Offline control behavior passed in the packaged extension claim test.

## Claims audit

Every command was run separately from clean clone
`/tmp/listen-back-review3-clean.V0ImDv` at
`c137ee1e0d2e342f30e686311359bc5b445d8785` after `npm ci`.

| Claim ID | Result | Evidence |
| --- | --- | --- |
| `sentence-loop` | PASS | One tagged punctuation and sentence-sequence test passed. |
| `reader-controls` | PASS | One tagged replay/rate/previous/next test passed. |
| `local-speech` | PASS | One tagged browser speech API test passed. |
| `local-text` | PASS | Post-load read/navigation generated zero requests. |
| `offline-controls` | PASS | Packaged extension marker moved offline without requests. |
| `demo-not-saved` | PASS | Storage and same-origin assertions passed; it does not cover active-audio cleanup. |
| `free-account-free` | PASS | Enabled sample and download path required no account or payment. |
| `readable-text` | PASS | Article fixture selection passed. |
| `source-marker` | PASS | Packaged-extension exact range test passed. |
| `keyboard-shortcuts` | PASS | Replay, previous, and next commands passed. |
| `protected-pages` | PASS | No-copy fixture refused reading. |
| `session-memory` | PASS | No browser or extension storage call was found. |
| `active-page-only` | PASS | MV3 permissions and explicit runtime injection passed. |
| `installable-package` | PASS | ZIP, manifest, and landing link passed. |
| `no-remote-services` | PASS | Runtime/dependency inspection passed. |
| `stop-reading` | PASS | Packaged extension cancels active speech. |
| `desktop-chromium-install` | PASS | MV3 package and extracted-folder instructions passed. |
| `mobile-demo` | PASS command, insufficient scope | It checks only banner/read-control visibility, not a visible active sentence, interaction, Reset, or exit cleanup; see F-1-1 and F-3-1. |

Every ID appears in exactly one tagged test. No separate unlisted claim-like
sentence was found on the live landing page or in README. The broad
`mobile-demo` claim remains incompletely tested as described above.

## Earlier-finding verification

| Earlier ID | Live-site and code result |
| --- | --- |
| F-1-1 | **REOPENED / BLOCKING:** realistic data and controls remain, but the marked sentence is below both first viewports. |
| F-1-2 | Fixed: selection-first and viewport-centre initialization remains in `entrypoints/content.ts`; the packaged range test passes. |
| F-1-3 | Fixed: header uses `/#how`; cross-route navigation reaches and focuses `#how-heading`. |
| F-1-4 | Fixed: Back restored the footer Privacy link at y=3192; same-path hash Back restored `#nav-how`. |
| F-1-5 | Fixed: the 390px first screen shows the desktop-only limitation at y=692–742; extraction steps are complete. |
| F-1-6 | Fixed: each live route has its own title, description, canonical, OG, and Twitter values. |
| F-1-7 | Fixed: the HTTP 404 contains the standard header, navigation, legal links, factory attribution, and version. |
| F-1-8 | Fixed: the packaged popup contains the H1 “Read one sentence”; the extension test passes. |
| F-1-9 | Fixed: public provenance assertions are removed; provenance remains in `.factory/design.md`. |
| F-1-10 | Fixed: the clean-checkout outcome promise is absent from README. |
| F-1-11 | Fixed: README states output locations without artifact-equivalence wording. |
| F-1-12 | Fixed: the public README does not make the deployment hash-gate promise. |
| F-1-13 | Fixed: the hero label literally names reading one sentence at a time. |
| F-1-14 | Fixed: “until it lands” remains replaced by “until you understand it”. |
| F-1-15 | Fixed: the heading remains “Read web text in three steps.” |
| F-1-16 | Fixed: “The source page stays the source” remains absent. |
| F-1-17 | Fixed: the live social description plainly names replay and marking. |
| F-1-18 | Fixed: “local-first” remains absent from README. |
| F-1-19 | Fixed: README explains demo separation in user-visible terms. |
| F-1-20 | Fixed: no landing or README sentence exceeds 22 words. |
| F-1-21 | **REOPENED / BLOCKING:** the visible “Start for real” label is back; its destination is not named. |
| F-1-22 | Fixed: the 404 label is “Page not found”. |
| F-1-23 | Fixed: the 404 H1 is “We could not find this page.” |
| F-1-24 | Fixed: the recovery sentence names the home page directly. |
| F-2-1 | Fixed: the privacy promise is narrowed to no Listen Back server; README discloses that some voices need a network. |
| F-2-2 | Fixed: the first screen states the tested offline boundary. |
| F-2-3 | Fixed: missing speech and utterance errors produce actionable live status and restore the read control. |
| F-2-4 | Fixed: landing/demo controls visibly name previous sentence, next sentence, and the target speed. |
| F-2-5 | Fixed: “configured work order” is replaced by “repository's deploy script”. |
| F-2-6 | Fixed for the explicit Stop action: demo and packaged extension cancel speech. Reset/exit cleanup is the separate F-3-1. |

## Structure, links, accessibility, and visual identity

| Check | Result |
| --- | --- |
| Titles and one H1 | PASS on `/`, `/demo`, `/privacy`, `/terms`, and the HTTP 404. |
| Descriptions/canonical/OG/Twitter | PASS with route-specific live values. |
| OG/apple images | PASS: 1200x630 and 180x180; favicon returned 200. |
| `lang`, landmarks, alt text, labels | PASS. |
| Route focus and history | PASS, including exact link focus and scroll restoration. |
| Deep links and fragments | PASS; `/#how` and every `#main` target exist. |
| Link crawl | HTTP destinations pass; the external link lacks the required cue under F-3-2. |
| 404 | PASS: designed response with real HTTP 404 and a home action. |
| Header/footer consistency | PASS apart from F-3-2, which occurs in both footer implementations. |
| Console and axe | PASS: no console/page errors and no serious/critical axe findings at either viewport. |
| Touch, overflow, reduced motion | PASS in the live site verifier. |
| Security/privacy response policy | PASS: CSP including header-level `frame-ancestors 'none'`, HSTS, nosniff, and referrer policy. |
| Visual identity | PASS: paper, ink, vermillion marker, halftone texture, editorial type, and print artwork are product-specific rather than a generic SaaS template. |
| First-load JS | PASS: 65.15 KB gzip, below both 150 KB and 200 KB limits. |

The crawl returned 200 for every linked intended route, the ZIP, and the Param
Factory destination. The deliberately unknown route returned the designed HTTP
404. `/opt/fleet/lib/verify-url.sh` passed with `loadMs=562`, no console errors,
one H1, `lang=en`, one main, complete image alternatives, and labelled buttons.

## Missed leverage

No AI, import/export, or sync feature is justified for this local,
sentence-by-sentence reading job. The useful core additions identified in prior
rounds—starting at the selected/visible sentence and stopping speech—exist and
pass their packaged-extension tests. No provider key, decorative AI feature, or
runtime AI request exists.

The remaining leverage is not a new feature: make the existing demo show its
active sentence immediately and make Reset/exit actually stop it.

## Verification summary

```text
npm ci                                      PASS — 251 packages, 0 vulnerabilities
18/18 exact claim commands                  PASS individually
npm test                                    PASS — 35/35
npm run typecheck                           PASS
npm run lint                                PASS
npm run build                               PASS — dist/site and 508,224-byte ZIP
npm run test:extension                      PASS
VERIFY_BASE_URL=... npm run test:site       PASS
VERIFY_BASE_URL=... npm run test:deployment PASS — live/local ZIP hashes match
/opt/fleet/lib/verify-url.sh                 PASS
```

The built landing JS is 65.15 KB gzip. The live extension ZIP SHA-256 is
`b1b95c19f154d7f105e7478e609efcf9ae54e609a9e0b9e9394af5e01f8961b4` and is
byte-identical to the clean-clone build.

## What would make this perfect

Put the marked sample sentence fully in the 390x844 first demo view. Cancel any
sample utterance on Reset and demo exit. Replace the regressed vague exit label
with one that names installation, and mark the Param Factory link as external.
Then extend the mobile claim test to exercise those exact outcomes and rerun
the full clean-clone, live, history, accessibility, privacy, and link checks.
Perfect means zero findings; this round still has four.
