# Adversarial first-read review 1

**Verdict: FAIL**

Reviewed on 2026-08-29 UTC at
<https://listen-back-reader.sociobot.in> in fresh Chromium contexts at
390×844 and 1440×900. The review used repository base
`70a6d4739244fad336296f225d5d33fbfce77fce`. No product code was changed.

There are five blocking findings and nineteen non-blocking findings. A passing
claim suite does not override the demo, product-start, routing, and installation
failures below.

## First screen, before scrolling

The first screen is clear enough to answer all three required questions on both
viewports:

- What does it do? It is a browser extension that reads or replays one web
  sentence at a time and keeps the sentence marked.
- For whom? Readers who lose their place in dense web text.
- What should I click first? **Try it with sample data**.

The exact text that supplies those answers is “A browser extension for steady
reading”, “Replay each sentence. Keep your place.”, “For readers who lose their
place in dense web text.”, and “Try it with sample data”. The hero therefore
does not receive a first-screen clarity blocker. Its copy still has the smaller
plain-language findings listed below.

## Findings

### Blocking

#### F-1-1 — The one-click demo is not a realistic, immediately operable example

**Location / quote:** Landing hero: “Hear a sample sentence now.” `/demo`:
“A dense page asks readers to hold several ideas at once. … Listen Back Reader
holds one sentence in view. … The source page stays the source.”

**Evidence:** The sample is five sentences of self-referential product copy,
not a plausible article. At 390×844 the first demo screen shows the marked text,
but the **Read sentence** control is below the fold. Clicking the hero action
does not play a sentence; hearing one requires scrolling and a second click.

**Why this fails:** The demo rule requires realistic sample data and the first
post-click screen to show the actual job in use. The current sample avoids the
dense names, dates, abbreviations, or argument structure that would demonstrate
the reader on real material. The adjacent “Hear … now” promise is also not the
result of the click. A weak demo is blocking.

**Concrete fix:** Seed `/demo` with a short, original, real-looking article
excerpt containing names, a date, an abbreviation, and a decimal. Keep the
active sentence visible and put **Read highlighted sentence** above the article
or in a visible sticky control row at 390×844. Change the hero explanation to
“Open a sample article with one sentence marked.” Do not autoplay audio.

#### F-1-2 — The demo hides that the real extension loses the reader’s current place

**Location / quote:** Demo: “Sentence 3 / 5” and “Listen Back Reader holds one
sentence in view.” Real extension: `entrypoints/content.ts:16` sets
`let current = 0`; the popup receives that state at `entrypoints/content.ts:140`.

**Evidence:** The demo deliberately starts at index 2. The production extension
always starts at index 0, regardless of the selected text or current viewport.
The first real **Read sentence** action therefore marks and scrolls to the first
sentence in the detected article.

**Why this fails:** A reader invokes this tool where attention slipped. Sending
them to the beginning contradicts “Keep your place” and makes the demo materially
more helpful than the shipped extension.

**Concrete fix:** On activation, choose the sentence containing the browser
selection; otherwise choose the visible sentence nearest the viewport centre.
Keep first-sentence fallback only when neither can be resolved. Add an extension
test that opens midway through a long article and asserts the visible/selected
sentence is marked and spoken first.

#### F-1-3 — “How it works” is a dead navigation link on every non-home route

**Location / quote:** Header link “How it works”; `src/site.tsx:19` uses
`href="#how"` without routing home.

**Evidence:** On `/privacy`, activating the link produces
`/privacy#how`. That document has no `#how` target and remains on the Privacy
page. The same defect exists on `/demo` and `/terms`.

**Why this fails:** This is broken routing in the persistent primary navigation.
The route requirement explicitly makes broken routing blocking.

**Concrete fix:** Link to `/#how` and route to `/` before focusing and scrolling
the `#how` heading. Add a test from `/demo`, `/privacy`, and `/terms` that asserts
the destination path, target, and focus.

#### F-1-4 — Browser Back does not restore the previous page position

**Location:** SPA route effect at `src/site.tsx:33` always focuses the new H1.

**Evidence:** After scrolling the live home page to `scrollY=900`, navigating to
Privacy, and pressing Back, the home page returned to `scrollY=67`, not 900.
Focus returned to the H1, which forced the page toward the top.

**Why this fails:** The required history behaviour is “back/forward restore
scroll and focus.” A reader loses their place after ordinary browser navigation.
This is broken routing and is blocking.

**Concrete fix:** Store scroll and focused-element state per history entry. On
push navigation, move focus to the destination H1 and start at the top. On
`popstate`, restore the saved scroll position and appropriate prior focus instead
of unconditionally focusing the H1. Add a back/forward scroll regression.

#### F-1-5 — The advertised install path is not usable end to end from the reviewed phone

**Location / quote:** “Install the free extension.” “Download the packaged
extension, then load it in your browser’s extension developer mode.” Button:
“Download extension zip”. README: “select Load unpacked, and choose
`.output/chrome-mv3`.”

**Evidence:** The live action downloads a ZIP. Chrome’s **Load unpacked** requires
an extracted directory, but the landing page never says to extract it. The
README points at a build directory that a visitor who downloaded the ZIP does
not have. The 390px experience never states that common mobile Chrome cannot
load this desktop extension.

**Why this fails:** A first-time visitor can try a demo but cannot complete the
real job from the supplied instructions. On the explicitly reviewed phone, the
main product is unavailable without an honest compatibility notice.

**Concrete fix:** State “Desktop Chrome/Chromium only” beside the first-screen
facts. Give the deployed-download path in full: download ZIP, extract it, open
`chrome://extensions`, enable Developer mode, choose **Load unpacked**, and pick
the extracted folder. Make **Start for real** lead to those steps. Keep the local
build-directory instructions as a separate developer path.

### Non-blocking

#### F-1-6 — Canonical and social metadata are wrong or incomplete off the home route

**Location:** `/demo`, `/privacy`, and `/terms` heads.

**Evidence:** Their titles update correctly, but all retain the home canonical,
home Open Graph title, and home Open Graph description. `og:image` is the
relative `/og-image.jpg`. Only `twitter:card` exists; Twitter title,
description, and image fields are absent. The 404 has no description, canonical,
Open Graph, Twitter, or apple-touch metadata.

**Why:** Shared links and search results can identify a legal or demo URL as the
home page, which gives visitors the wrong destination and description.

**Concrete fix:** Set route-specific description, canonical, OG title,
description, URL, and absolute image URL on every route. Add Twitter title,
description, and image fields. Give the designed 404 its non-indexed metadata.
Test the rendered head on every deep link.

#### F-1-7 — The designed 404 does not use the site’s standard header and footer

**Location:** `public/404.html:29-36`.

**Evidence:** The 404 header has only the wordmark. Its footer has no Privacy,
Terms, “Built by Param Factory”, version, or illustration provenance. All normal
routes have those elements.

**Why:** A visitor who arrives through a bad link loses the normal navigation,
legal links, and product context precisely when recovery matters.

**Concrete fix:** Reuse the normal header navigation and complete footer on the
static 404 while keeping its real HTTP 404 status.

#### F-1-8 — The extension popup has no heading

**Location:** `entrypoints/popup/main.tsx:32-44`.

**Evidence:** The popup has one `<main>` but no H1 or any heading; “Listen Back”
is a `<strong>`.

**Why:** A screen-reader user cannot navigate to or identify the popup’s main
task by heading.

**Concrete fix:** Make the popup name a concise H1, such as “Read one sentence”,
and keep the product wordmark outside the heading. Add the packaged popup to the
semantic accessibility test.

#### F-1-9 — The artwork provenance claim is not listed in `claims.json`

**Location / quote:** “Original print-style illustration for Listen Back
Reader.” Footer: “Original illustration generated for this product.”

**Why:** “Original” is a provenance assertion, but the public claim registry
does not tell a verifier how to prove it.

**Concrete fix:** Either remove “Original” or add one claim entry whose test
checks the recorded source prompt/provenance and the shipped derivative files.

#### F-1-10 — The clean-checkout setup claim is not listed in `claims.json`

**Location / quote:** README: “The install step runs `wxt prepare`, so tests and
type checking work in a clean checkout without requiring a build first.”

**Why:** A contributor may rely on this setup guarantee, but it is outside the
required claim suite.

**Concrete fix:** Add a clean-clone claim test that runs `npm ci`, `npm test`, and
`npm run typecheck`, or state only the observable setup fact without promising
the later commands work.

#### F-1-11 — The build-artifact equivalence claims are not listed in `claims.json`

**Location / quote:** README: “`npm run build:site` creates the complete
deployable static site … including the tested extension archive …” and
“`npm run package:extension` produces the same complete artifact.”

**Why:** “Complete”, “tested”, and “same” are observable release guarantees that
the registry does not name or independently run.

**Concrete fix:** Add a claim that runs both commands in clean directories and
asserts required site files plus byte-identical extension archives, or narrow
the README to the already-listed installable-package claim.

#### F-1-12 — The deployment hash-gate claim is not listed in `claims.json`

**Location / quote:** README: “The release command builds the archive, deploys
that directory, and refuses success unless the public download is an HTTP 200
ZIP with the same byte hash”.

**Why:** This is a concrete safety guarantee for release operators, but it is
not part of the required claim run.

**Concrete fix:** Add a recorded/local deployment-fixture claim that proves the
command fails on status, archive, and hash mismatch. Do not make a live deploy
part of a normal claim test.

#### F-1-13 — “Steady reading” is vague hero copy

**Location / quote:** “A browser extension for steady reading”.

**Why:** “Steady” does not name an action or result.

**Rewrite:** “A browser extension that reads one sentence at a time.”

#### F-1-14 — “Until it lands” is a metaphor

**Location / quote:** “Replay it until it lands, then move one sentence at a
time.”

**Why:** “Lands” does not tell a reader whether the tool waits, records
understanding, or simply replays audio.

**Rewrite:** “Replay it until you understand it, then move to the next sentence.”

#### F-1-15 — “Three steady steps” adds mood instead of information

**Location / quote:** “Read web text in three steady steps.”

**Why:** “Steady” adds tone but no usable instruction.

**Rewrite:** “Read web text in three steps.”

#### F-1-16 — “The source page stays the source” is a slogan

**Location / quote:** Demo and landing preview: “The source page stays the
source.”

**Why:** The repeated noun sounds memorable but does not plainly state what the
extension leaves unchanged.

**Rewrite:** “Listen Back never changes the article text.”

#### F-1-17 — The social description uses unexplained jargon

**Location / quote:** `og:description`: “A private, source-anchored read-aloud
loop for dense web text.”

**Why:** “Source-anchored” and “loop” require interpretation in the small amount
of copy a social visitor sees.

**Rewrite:** “Replay one web sentence at a time while the extension marks your
place.”

#### F-1-18 — “Local-first” is README jargon

**Location / quote:** “Listen Back Reader is a free, local-first browser
extension …”

**Why:** “Local-first” does not tell a general reader exactly where text goes.

**Rewrite:** “Listen Back Reader is a free browser extension for dyslexic
readers. It does not send page text to us.”

#### F-1-19 — The README explains the demo with implementation jargon

**Location / quote:** “Demo mode is isolated in memory: sample controls never
read or write extension data.”

**Why:** “Isolated in memory” and “extension data” describe implementation, not
the user-visible privacy result.

**Rewrite:** “The demo keeps its sample separate and does not read or change
your extension data.”

#### F-1-20 — One README sentence exceeds 22 words

**Location / quote (26 words):** “The release command builds the archive,
deploys that directory, and refuses success unless the public download is an
HTTP 200 ZIP with the same byte hash”.

**Why:** The sentence asks a release operator to hold four actions and two
validation conditions in one line.

**Rewrite:** “The release command builds and deploys `dist/site`. It then checks
that the public download is a ZIP with the same byte hash.”

#### F-1-21 — “Start for real” does not name its result

**Location:** Demo banner button.

**Evidence:** It only returns to `/`; it does not start reading or installation.

**Why:** The visitor cannot predict that the button merely returns home.

**Concrete fix:** Route it to complete installation steps and label it
**Install the extension**, or keep the current destination and label it
**Leave demo**.

#### F-1-22 — The 404 kicker is brand lore rather than a section name

**Location / quote:** “Ink lost its line”.

**Why:** It does not name the error without knowledge of the product’s visual
metaphor.

**Rewrite:** “Page not found”.

#### F-1-23 — The 404 headline describes the error through a product metaphor

**Location / quote:** “This page is not in the reader.”

**Why:** A visitor needs to know that the URL is missing, not where a page sits
inside a metaphorical reader.

**Rewrite:** “We could not find this page.”

#### F-1-24 — The 404 recovery sentence continues the metaphor

**Location / quote:** “Go back to the place where the sentence starts.”

**Why:** It does not plainly name the destination of the recovery action.

**Rewrite:** “Return to the Listen Back Reader home page.”

## Copy audit

Word counts treat hyphenated terms, version numbers, paths, URLs, and keyboard
key names as one word; punctuation-only symbols are not words. Headings,
controls, metadata, alt text, and screen-reader-only route text are included so
the audit covers all user-facing landing copy. Findings are referenced in the
last column.

### Landing page

| Copy | Words | Flag |
| --- | ---: | --- |
| Listen Back Reader — replay one sentence | 6 | — |
| Replay one web sentence at a time without losing your place. | 11 | — |
| A private, source-anchored read-aloud loop for dense web text. | 9 | F-1-17: jargon |
| An ink-and-paper illustration of a marked article sentence looping back through sound waves. | 12 | — |
| Skip to main content | 4 | — |
| Listen Back | 2 | — |
| Demo | 1 | — |
| How it works | 3 | F-1-3: broken off-home link |
| Privacy | 1 | — |
| A browser extension for steady reading | 6 | F-1-13: vague adjective |
| Replay each sentence. | 3 | — |
| Keep your place. | 3 | — |
| For readers who lose their place in dense web text. | 10 | — |
| Try it with sample data | 5 | — |
| Hear a sample sentence now. | 5 | F-1-1: result does not occur on click |
| Uses your browser’s voice. | 4 | — |
| Text stays on your device. | 5 | — |
| Free and account-free. | 3 | — |
| Original print-style illustration for Listen Back Reader. | 7 | F-1-9: unlisted claim |
| The reading loop | 3 | — |
| One sentence stays visible while you listen. | 7 | — |
| The extension marks the source sentence. | 6 | — |
| Replay it until it lands, then move one sentence at a time. | 11 | F-1-14: metaphor |
| Sample article | 2 | — |
| Sentence 3 / 5 | 3 | — |
| A dense page asks readers to hold several ideas at once. | 11 | F-1-1: synthetic sample |
| When attention slips, starting at the paragraph’s beginning wastes energy. | 10 | F-1-1: synthetic sample |
| Listen Back Reader holds one sentence in view. | 8 | F-1-1, F-1-2 |
| Replay it, slow it down, or move forward when you are ready. | 11 | F-1-1: synthetic sample |
| The source page stays the source. | 6 | F-1-16: slogan |
| Back | 1 | — |
| Read sentence | 2 | — |
| Alt + R replays | 3 | — |
| Next | 1 | — |
| 0.8× | 1 | — |
| Slow | 1 | — |
| How it works | 3 | — |
| Read web text in three steady steps. | 7 | F-1-15: mood word |
| Open an article. | 3 | — |
| Choose a page with the text you want to hear. | 10 | — |
| Read the sentence. | 3 | — |
| Listen Back finds readable page text and marks the current sentence. | 10 | — |
| Replay or move on. | 4 | — |
| Use the popup or Alt + R, Alt + Left, and Alt + Right. | 11 | — |
| What it does not do | 5 | — |
| It reads the source. | 4 | — |
| It does not rewrite it. | 5 | — |
| Listen Back does not upload page text, diagnose dyslexia, create voices, or save an account. | 15 | — |
| It does not read pages that explicitly block copying. | 9 | — |
| Use it on ordinary web pages | 6 | — |
| Install the free extension. | 4 | F-1-5: incomplete install path |
| Download the packaged extension, then load it in your browser’s extension developer mode. | 13 | F-1-5: missing compatibility/extraction |
| Download extension zip | 3 | — |
| Replay one sentence without losing your place. | 7 | — |
| Privacy | 1 | — |
| Terms | 1 | — |
| Built by Param Factory | 4 | — |
| v1.0.0 · Original illustration generated for this product. | 7 | F-1-9: unlisted claim |
| Home page | 2 | — |

### README

| Copy | Words | Flag |
| --- | ---: | --- |
| Listen Back Reader | 3 | — |
| Replay one web sentence at a time without losing your place. | 11 | — |
| Listen Back Reader is a free, local-first browser extension for dyslexic readers and anyone who gets tired while reading dense web text. | 22 | F-1-18: jargon |
| It uses the voices already available in your browser. | 9 | — |
| Page text does not leave your device. | 7 | — |
| What it does | 3 | — |
| Finds readable article text on the current page. | 8 | — |
| Reads one sentence at a time with replay, slower speed, back, and next. | 13 | — |
| Marks the source sentence on the page as it is read. | 11 | — |
| Supports Alt + R to replay, Alt + Left to go back, and Alt + Right to move on. | 16 | — |
| The extension reads the active page only after you open its toolbar popup or press Alt + R. | 17 | — |
| It does not request access to every site in advance. | 10 | — |
| It does not rewrite text, make a diagnosis, create a voice, or store an account. | 15 | — |
| Try the sample | 3 | — |
| Run the site and open `http://localhost:5173/demo`, or use the deployed `/demo` route. | 13 | — |
| Demo mode is isolated in memory: sample controls never read or write extension data. | 14 | F-1-19: jargon |
| Develop | 1 | — |
| `npm ci` | 2 | — |
| `npm run dev` — landing site | 5 | — |
| `npm run dev:extension` — Chrome extension in development | 7 | — |
| The install step runs `wxt prepare`, so tests and type checking work in a clean checkout without requiring a build first. | 21 | F-1-10: unlisted claim |
| Test and build | 3 | — |
| `npm test` | 2 | — |
| `npm run typecheck` | 3 | — |
| `npm run lint` | 3 | — |
| `npm run build` | 3 | — |
| `npm run test:extension` — loads the production extension in Chromium | 9 | — |
| `npm run test:site` — desktop, 390px, keyboard, axe, privacy, offline shell | 10 | — |
| `npm run build:site` creates the complete deployable static site in `dist/site`, including the tested extension archive at `dist/site/downloads/listen-back-reader.zip`. | 18 | F-1-11: unlisted claim |
| `npm run package:extension` produces the same complete artifact. | 8 | F-1-11: unlisted claim |
| Deploy the exact `dist/site` directory (including `downloads/`) to the configured Azure Static Web App. | 14 | — |
| The release command builds the archive, deploys that directory, and refuses success unless the public download is an HTTP 200 ZIP with the same byte hash. | 26 | F-1-12 and F-1-20 |
| `npm run deploy:site` | 3 | — |
| To independently check the deployed archive, site identity, and browser behavior, run: | 12 | — |
| `VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site` | 8 | — |
| `VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:deployment` | 8 | — |
| For a local Chrome install, run `npm run build:extension`, open `chrome://extensions`, enable Developer mode, select Load unpacked, and choose `.output/chrome-mv3`. | 21 | F-1-5: does not document deployed ZIP |
| Privacy | 1 | — |
| The speech engine is the browser and operating system speech service. | 11 | — |
| Listen Back Reader has no server, tracking, accounts, analytics, or cloud text upload. | 13 | — |
| See the included privacy page and terms page. | 8 | — |
| License | 1 | — |
| MIT | 1 | — |

No banned marketing word from the supplied list appears. The only sentence over
22 words is the 26-word release-command sentence. The main terminology is mostly
consistent: **sentence** for the spoken unit, **article/page text** for the
source, **demo** for the sample, and **extension** for the shipped product.
“Local-first”, “source-anchored”, “steady”, and “isolated in memory” are the
exceptions handled above.

## Demo and sandbox evidence

- The hero opens `/demo` in one click.
- The demo banner is present with Reset and exit actions.
- Next, slow speech, and Read produced sentence 4 at rate 0.8 in a mocked native
  speech engine.
- Reset restored sentence 3 and normal speed.
- A pre-existing `real:sentinel=keep-me` localStorage item was unchanged after
  the demo and after leaving it.
- Demo interaction created no sessionStorage or IndexedDB data.
- The request log contained only the product origin. No analytics, gateway,
  font, or other third-party request occurred.
- The sample-content and one-click-operability defects remain F-1-1; isolation
  itself passes.

## Claims audit

Every command was run separately from clean clone
`/tmp/listen-back-review-clone.utTx8z` after `npm ci`.

| Claim ID | Result |
| --- | --- |
| `sentence-loop` | PASS |
| `reader-controls` | PASS |
| `local-speech` | PASS |
| `local-text` | PASS |
| `demo-not-saved` | PASS |
| `free-account-free` | PASS |
| `readable-text` | PASS |
| `source-marker` | PASS |
| `keyboard-shortcuts` | PASS |
| `protected-pages` | PASS |
| `session-memory` | PASS |
| `active-page-only` | PASS |
| `installable-package` | PASS |
| `no-remote-services` | PASS |

Each ID occurs in exactly one test tag. Findings F-1-9 through F-1-12 are the
claim-like landing/README statements that have no registry entry. No listed
claim was left untested.

## History verification

No earlier `.factory/review-*.md` or `.factory/polish-*.md` exists. The previous
handoff records two repaired findings:

| Earlier finding | Live and code confirmation |
| --- | --- |
| Exact sentence-range marker | CONFIRMED FIXED — `@claim:source-marker` passed from the clean clone; production code uses browser `Range` rectangles rather than a paragraph outline. |
| Framing response policy | CONFIRMED FIXED — the live CSP response contains `frame-ancestors 'none'`. |

The handoff’s broader “none found” conclusion is not confirmed because this
from-scratch review found F-1-1 through F-1-24.

## Structure, accessibility, and visual identity

| Check | Result |
| --- | --- |
| Per-route title pattern and one H1 | PASS on `/`, `/demo`, `/privacy`, `/terms`, and the HTTP 404 |
| `lang`, main landmark, image alt, focus styles | PASS |
| Route-change H1 focus | PASS for push navigation |
| Back/forward scroll restoration | FAIL — F-1-4 |
| Deep links | PASS for direct `/demo`, `/privacy`, `/terms`; header fragment routing fails — F-1-3 |
| Link crawl | All HTTP links returned 200; the off-home `#how` target is dead — F-1-3 |
| Route canonical/social metadata | FAIL — F-1-6 |
| Designed 404 | Visual treatment and HTTP 404 pass; standard skeleton and copy fail — F-1-7, F-1-22 to F-1-24 |
| Header/footer consistency | PASS on SPA routes; FAIL on 404 — F-1-7 |
| Serious/critical axe issues | PASS at desktop and 390px |
| Touch targets and reduced motion | PASS in the site verifier |
| Popup heading structure | FAIL — F-1-8 |
| Visual identity | PASS — the ink/paper risograph system, orange sentence ruler, typography, and original art are distinct rather than generic SaaS |
| First-load JS | PASS — 64.00 KB gzip |
| OG image and apple-touch size | PASS — 1200×630 and 180×180 |

`VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site`
passed at both viewports. `/opt/fleet/lib/verify-url.sh` passed with no console
errors, `lang=en`, one H1, one main, alt text, and labelled buttons. These broad
checks do not exercise the broken fragment destination or scroll restoration.

## Missed leverage

F-1-2 is the obvious missing capability implied by the job: start at the
reader’s selected or currently visible sentence. This needs deterministic local
logic, not AI. An AI feature would add privacy and cost without improving the
core place-keeping job, so no Sociobot gateway feature is recommended. No
provider key or decorative AI path exists in the product.

`.factory/brief.json` is absent in this checkout. The missed-leverage assessment
therefore uses the live promise, README, implementation, and the supplied product
contract; no unavailable brief detail was invented.

## Verification summary

- All 14 exact claim commands: PASS.
- `npm test`: PASS, 26/26.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/site/` and the 507,002-byte extension ZIP were
  produced.
- Live site verifier: PASS at 1440px and 390px.
- Live request/privacy observation: same-origin only.
- Live route, history, metadata, demo realism, first-sentence behaviour, and
  install usability: FAIL as detailed above.

## What would make this perfect

Resolve every finding above, then rerun this review from a fresh context. The
critical sequence is: start the real reader at the user’s place; replace and
surface the realistic demo; make the desktop-only ZIP installation honest and
complete; fix cross-route `#how` and history restoration; then close metadata,
404, popup semantics, claim registry, and every copy flag. Perfect means the
next report contains zero findings, not merely a passing automated suite.
