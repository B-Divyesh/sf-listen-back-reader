# Adversarial first-read review 2

**Verdict: FAIL**

Reviewed on 2026-08-29 UTC at
<https://listen-back-reader.sociobot.in> in fresh Chromium contexts at
390×844 and 1440×900. The reviewed repository base was
`450540054fee5706ae8596e9b42fe564dcc80320`. No product code was changed.

There are four blocking findings and five non-blocking findings. Three prior
findings are still only partly fixed. All 15 declared claim commands pass, but
one privacy test does not prove the public wording and one public provenance
claim remains unlisted. A passing automated suite therefore does not support a
PASS verdict.

`.factory/brief.json` is absent from this checkout. The available sources of
truth were `.factory/design.md`, `.factory/claims.json`, the live product, the
README, and all earlier review, polish, verification, and handoff records.

## First screen, before scrolling

The first-screen clarity test passes at both 390×844 and 1440×900:

- What does this do? It is a browser extension that reads one web sentence at
  a time and marks the reader's place.
- For whom? Readers who lose their place in dense web text.
- What should I click first? **Try it with sample data**.

The exact supporting text is “A browser extension that reads one sentence at a
time”, “Replay each sentence. Keep your place.”, “For readers who lose their
place in dense web text.”, and “Try it with sample data”. The action explanation
“Open a sample article with one sentence marked.” is adjacent and visible.

The mobile cold screenshot is `/tmp/listen-back-review-2-mobile-cold.png`; the
desktop screenshot is `/tmp/listen-back-review-2-desktop-cold.png`. The mobile
first screen does not disclose that the extension cannot be installed there;
that remains blocking under F-1-5 below.

## Findings

### Blocking

#### F-1-4 — Back restores scroll but still does not restore focus

**Location:** `src/site.tsx:27-35` and `src/site.tsx:55`.

**Evidence:** On the live home page at 390×844, I focused the footer **Privacy**
link at `scrollY=900`, opened Privacy, then used browser Back. The page returned
to `scrollY=900`, but focus moved to the home H1 instead of the Privacy link.
In a second run, I focused **Demo**, followed **How it works**, then used Back.
The URL and scroll returned to `/` and `scrollY=0`, but focus remained on
“Read web text in three steps.” rather than returning to **Demo**. The router
stores only `document.activeElement.id`; the navigational links have no IDs.
Same-route hash history also does not trigger the route effect.

**Why this fails:** Review 1 required back/forward to restore both scroll and
focus. The repair restores scroll only. Keyboard and screen-reader users return
to a different control than the one from which they navigated. The instruction
for this round makes any half-fixed earlier finding blocking under its original
ID.

**Concrete fix:** Give restorable controls stable IDs or store a stable selector
per history entry. Restore that exact element on `popstate`, including when the
pathname does not change for `/#how`. Add tests that assert the focused element,
not only the H1 and URL, after Back and Forward.

#### F-1-5 — The desktop-only limitation is still absent from the phone's first screen

**Location / quote:** Mobile first screen facts: “Uses your browser's voice.”,
“Text stays on your device.”, and “Free and account-free.” The compatibility
notice “Desktop Chrome or Chromium only.” appears only in the later installation
section (`src/site.tsx:51`).

**Evidence:** At 390×844 the cold first screen ends partway through the hero
art. It does not show the desktop-only notice. Review 1 explicitly required the
notice beside the first-screen facts. The ZIP extraction and Load unpacked
instructions are now complete, but the mobile disclosure was moved several
screens below the decision point rather than into the first screen.

**Why this fails:** A phone visitor can understand and try the product but still
cannot tell within the 30-second first read that the real extension is not
installable on that device. This is a half-fix of the earlier blocking finding.

**Concrete fix:** Put “Extension requires desktop Chrome or Chromium; the demo
works on mobile.” beside the primary action or first-screen facts. Keep the
detailed extraction instructions in the installation section.

#### F-1-9 — The public illustration-provenance claim is still unlisted

**Location / quote:** Footer: “Illustration generated for this product.”

**Evidence:** Review 1 cited the footer provenance line. The repair removed only
the word “Original”; `.factory/claims.json` still contains no artwork-provenance
entry. The remaining sentence still asserts that the art was generated for this
specific product.

**Why this fails:** This is the same public provenance assertion in weakened
form, not a complete removal. This round requires every live claim-like sentence
to be registered and every half-fixed prior finding to remain blocking under its
original ID.

**Concrete fix:** Remove this sentence from the public footer and keep
provenance in `.factory/design.md`, or add a claim whose test verifies the source
prompt record, source asset, and derived public image hashes.

#### F-2-1 — “Text stays on your device” is broader than the privacy test proves

**Location / quotes:** Landing: “Text stays on your device.” README: “Page text
does not leave your device.” README Privacy: “The speech engine is your browser
and operating system speech service.” Claim `local-text`: “Page text stays on
your device and is not uploaded.”

**Evidence:** `src/site.tsx:47` and `entrypoints/content.ts:131-134` pass the text
to the browser's default `SpeechSynthesisUtterance`. They do not select or
require a `SpeechSynthesisVoice` whose `localService` property is true. The
`@claim:local-text` test replaces speech synthesis with a stub and records page
requests, so it proves that Listen Back makes no fetch from the page. It does
not prove that a browser-selected speech service never sends text elsewhere.

**Why this fails:** A privacy-sensitive reader can reasonably interpret the
unqualified sentence as covering the complete read-aloud path. The product
cannot guarantee that for a default browser or operating-system speech service,
and the test removes the component that could violate the promise.

**Concrete fix:** Use the narrower, supportable sentence already present on the
Privacy page: “Listen Back does not send article text to a Listen Back server.”
Update `local-text` to that exact claim. Alternatively, select only voices with
`localService === true`, explain what happens when none exists, and test that
selection without replacing the relevant voice behavior.

### Non-blocking

#### F-2-2 — The first-screen fact list omits an explicit offline fact

**Location:** Hero fact list in `src/site.tsx:51`.

**Evidence:** The three facts cover browser voice, device privacy, and price/
account status. None tells the visitor whether reading works without a network
connection. The attached plain-words first-screen shape requires short privacy,
offline, and price facts.

**Why this matters:** “Uses your browser's voice” does not tell a reader whether
that voice or the extension works offline, especially given the privacy issue in
F-2-1.

**Concrete fix:** Establish and register the actual offline boundary, then use a
literal fact such as “The extension needs no Listen Back server.” If complete
offline speech is promised, require a local voice and add an offline claim test.

#### F-2-3 — Speech failure leaves the demo silent or stuck on “Reading…”

**Location:** `src/site.tsx:47`.

**Evidence:** If `speechSynthesis` is unavailable, the handler returns without
feedback. If an utterance errors, only `onend` can clear `speaking`; there is no
`onerror` handler or live error message.

**Why this matters:** The required one-click demo can appear to do nothing or
remain in a false reading state on a browser with no usable voice. The visitor
is not told what happened or what to do next.

**Concrete fix:** Add an `aria-live` status that says speech is unavailable and
suggests enabling a browser voice. Handle both `onend` and `onerror`, restore the
button state, and test missing-API and utterance-error paths.

#### F-2-4 — Three reader buttons do not visibly name their result

**Location / quotes:** Landing and demo controls: “Back”, “Next”, and “Slow”.

**Evidence:** The previous and next buttons have fuller accessible names, but
the visible labels remain directional fragments. The speed button displays
“0.8× / Slow” before activation and “1× / Normal” afterward.

**Why this matters:** The plain-words rule requires buttons to name their
result. “Back” can mean browser navigation, and “Slow” does not say whether it
changes the current sentence or later speech.

**Concrete fix:** Use visible labels “Previous sentence”, “Next sentence”, and
“Use 0.8× speed” / “Use normal speed”. Preserve the compact mobile layout with
wrapping or a two-row control group rather than abbreviating the result.

#### F-2-5 — The README uses internal deployment jargon

**Location / quote:** README: “Deploy with the configured work order:”

**Why this matters:** “Work order” is factory terminology and does not tell a
new contributor what is configured or where.

**Rewrite:** “Deploy the site with the repository's deploy script:”

#### F-2-6 — The reader has no way to stop current speech

**Location:** Landing/demo reader controls and extension popup controls.

**Evidence:** The UI exposes previous, read/replay, next, and speed controls.
`entrypoints/content.ts:155` supports a `pause` action that calls
`speechSynthesis.cancel()`, but `entrypoints/popup/main.tsx` never sends it. The
popup's local `paused` flag changes **Read sentence** to **Replay sentence**;
the second press restarts speech rather than stopping it.

**Why this matters:** Stopping a sentence is an obvious control for a read-aloud
tool, especially when the user starts the wrong sentence or audio is disruptive.
This is the concrete missed-leverage finding; AI, import/export, and sync would
not fit this local single-page job.

**Concrete fix:** While speech is active, change the primary control to **Stop
reading**, send the existing stop/cancel action, and restore **Read sentence**
after end or error. Add a claim and packaged-extension test for the observable
stop behavior.

## Copy audit

Counts exclude punctuation-only separators and treat paths, versions,
hyphenated terms, and key names as one word. No sentence exceeds 22 words; the
longest prose sentence is the 21-word README audience sentence. Flags below map
to findings above.

### Landing page

| Location | Exact copy | Words | Flag |
| --- | --- | ---: | --- |
| Title | Listen Back Reader — replay one sentence | 6 | — |
| Meta/OG description | Replay one web sentence at a time while the extension marks your place. | 13 | — |
| Skip link | Skip to main content | 4 | — |
| Wordmark | Listen Back | 2 | — |
| Navigation | Demo | 1 | — |
| Navigation | How it works | 3 | — |
| Navigation | Privacy | 1 | — |
| Hero label | A browser extension that reads one sentence at a time | 10 | — |
| H1 | Replay each sentence. Keep your place. | 6 | — |
| Hero sentence | For readers who lose their place in dense web text. | 10 | — |
| Primary action | Try it with sample data | 5 | — |
| Action explanation | Open a sample article with one sentence marked. | 8 | — |
| Fact | Uses your browser's voice. | 4 | F-2-2: not an offline fact |
| Fact | Text stays on your device. | 5 | F-2-1: broader than proof |
| Fact | Free and account-free. | 3 | — |
| Image alt | An ink-and-paper illustration of a marked article sentence looping back through sound waves. | 13 | — |
| Caption | Print-style illustration for Listen Back Reader. | 6 | — |
| Section label | The reader | 2 | — |
| H2 | One sentence stays visible while you listen. | 7 | — |
| Preview | The extension marks the source sentence. | 6 | — |
| Preview | Replay it until you understand it, then move to the next sentence. | 12 | — |
| Reader label | Sample article | 2 | — |
| Counter | Sentence 3 / 5 | 3 | — |
| Button | Back | 1 | F-2-4: ambiguous result |
| Button | Read highlighted sentence | 3 | — |
| Button note | Uses your browser voice | 4 | — |
| Dynamic button | Reading… | 1 | F-2-3: can remain stuck on error |
| Button | Next | 1 | F-2-4: incomplete result |
| Button | 0.8× | 1 | F-2-4: incomplete result |
| Button | Slow | 1 | F-2-4: incomplete result |
| Dynamic button | 1× | 1 | F-2-4: incomplete result |
| Dynamic button | Normal | 1 | F-2-4: incomplete result |
| Sample | On 14 March 2026, Dr. Mira Patel presented the city library's new late-hours plan to the East Ward council. | 19 | — |
| Sample | The pilot keeps the study floor open until 9 p.m. on Tuesdays and Thursdays for six weeks. | 17 | — |
| Sample | Patel said the $2.4 million proposal uses existing staff schedules, not new surveillance software. | 14 | — |
| Sample | The U.S. Census Bureau estimates that 38% of nearby households have no quiet room for study. | 16 | — |
| Sample | Council members will vote after the public comment session on 2 April. | 12 | — |
| Section label | How it works | 3 | — |
| H2 | Read web text in three steps. | 6 | — |
| Step | Open an article. | 3 | — |
| Step | Choose a page with the text you want to hear. | 10 | — |
| Step | Read the sentence. | 3 | — |
| Step | Listen Back finds readable page text and marks the current sentence. | 11 | — |
| Step | Replay or move on. | 4 | — |
| Step | Use the popup or Alt + R, Alt + Left, and Alt + Right. | 11 | — |
| Section label | What it does not do | 5 | — |
| H2 | It reads the article. | 4 | — |
| H2 | It does not rewrite it. | 5 | — |
| Limits | Listen Back does not upload page text, diagnose dyslexia, create voices, or save an account. | 15 | — |
| Limits | It does not read pages that explicitly block copying. | 9 | — |
| Section label | Use it on ordinary web pages | 6 | — |
| H2 | Install the free extension. | 4 | — |
| Compatibility | Desktop Chrome or Chromium only. | 5 | F-1-5: below the phone's first screen |
| Install | Download the ZIP and extract it. | 6 | — |
| Install | Open chrome://extensions and enable Developer mode. | 6 | — |
| Install | Choose Load unpacked and select the extracted folder. | 8 | — |
| Download action | Download extension zip | 3 | — |
| Footer | Replay one sentence without losing your place. | 7 | — |
| Footer link | Privacy | 1 | — |
| Footer link | Terms | 1 | — |
| Footer link | Built by Param Factory | 4 | — |
| Footer | v1.0.0 · Illustration generated for this product. | 6 | F-1-9: unlisted claim |
| Live region | Home page | 2 | — |

### README

Shell commands are instructions rather than sentences; their surrounding
headings and prose are included.

| Location | Exact copy | Words | Flag |
| --- | --- | ---: | --- |
| H1 | Listen Back Reader | 3 | — |
| Lede | Replay one web sentence at a time without losing your place. | 11 | — |
| Introduction | Listen Back Reader is a free browser extension for dyslexic readers and anyone who gets tired while reading dense web text. | 21 | — |
| Introduction | It uses voices already available in your browser. | 8 | — |
| Introduction | Page text does not leave your device. | 7 | F-2-1: broader than proof |
| H2 | What it does | 3 | — |
| Bullet | Finds readable article text on the current page. | 8 | — |
| Bullet | Reads one sentence at a time with replay, slower speed, back, and next. | 13 | — |
| Bullet | Marks the source sentence while it reads. | 7 | — |
| Bullet | Supports Alt + R, Alt + Left, and Alt + Right. | 8 | — |
| Body | The extension reads the active page only after you open its toolbar popup or press Alt + R. | 17 | — |
| Body | It does not request access to every site in advance. | 10 | — |
| Body | It does not rewrite text, make a diagnosis, create a voice, or store an account. | 15 | — |
| H2 | Try the sample | 3 | — |
| Body | Open `/demo?demo=1` on the deployed site, or `http://localhost:5173/demo?demo=1` while developing. | 10 | — |
| Body | The demo keeps its sample separate and does not read or change your extension data. | 15 | — |
| Body | Use Reset demo to start the sample again. | 8 | — |
| H2 | Install the extension | 3 | — |
| Body | Listen Back Reader runs in desktop Chrome or Chromium. | 9 | — |
| Body | It cannot be installed in mobile Chrome. | 7 | F-1-5: disclosed only after first screen |
| Step | Download `listen-back-reader.zip` from the site. | 5 | — |
| Step | Extract the ZIP to a folder. | 6 | — |
| Step | Open `chrome://extensions` and enable Developer mode. | 6 | — |
| Step | Choose Load unpacked and select the extracted folder. | 8 | — |
| Body | For a local developer build, run `npm run build:extension` and select `.output/chrome-mv3` in step 4. | 15 | — |
| H2 | Develop, test, and build | 4 | — |
| Body | `npm run build:site` writes the static site to `dist/site`. | 9 | — |
| Body | The extension ZIP is at `dist/site/downloads/listen-back-reader.zip`. | 6 | — |
| Body | Deploy with the configured work order: | 6 | F-2-5: internal jargon |
| H2 | Privacy | 1 | — |
| Body | The speech engine is your browser and operating system speech service. | 11 | F-2-1: jargon and unsupported privacy boundary |
| Body | Listen Back Reader has no server, tracking, accounts, analytics, or cloud text upload. | 13 | — |
| Body | Read the included privacy page and terms page. | 8 | — |
| H2 | License | 1 | — |
| Link | MIT | 1 | — |

Terminology is otherwise consistent: the unit is a **sentence**, the web
content is an **article/page**, the add-on is an **extension**, the sample mode
is the **demo**, and the visible cue is a **marker/highlight**. No banned
marketing adjective or metaphor remains in the audited landing/README copy.

## Demo and sandbox audit

The required one-click path exists and mostly passes:

- **Try it with sample data** opens `/demo?demo=1` in one click.
- The first 390×844 demo screen shows a city-library report, sentence 3 of 5
  marked, and **Read highlighted sentence** at `y=557`, within the viewport.
- The sample includes a named person, dates, `p.m.`, `$2.4 million`, `U.S.`, and
  a percentage. It is realistic rather than product copy or lorem ipsum.
- The persistent banner says “Demo — sample data, nothing is saved.” and offers
  **Reset demo** and **Install the extension**.
- Next moved to the Census sentence. Reset restored the initial Patel sentence.
- After interaction and reset, localStorage, sessionStorage, and IndexedDB were
  empty. Every recorded request was same-origin.
- The first-view screenshot is `/tmp/listen-back-review-2-demo-first.png`.

The missing speech-error state is F-2-3. The wider browser-service privacy
promise is F-2-1.

## Claims audit

The clean clone was `/tmp/listen-back-review2-clean.zkWsYf` at commit
`450540054fee5706ae8596e9b42fe564dcc80320`. After `npm ci`, every command from
`.factory/claims.json` was run separately and exactly as listed.

| Claim ID | Result | Observable evidence |
| --- | --- | --- |
| `sentence-loop` | PASS | 1 matching test passed; punctuation/sequence unit passed. |
| `reader-controls` | PASS | 1 matching control/rate test passed. |
| `local-speech` | PASS | 1 browser-demo test passed with a speech stub. |
| `local-text` | PASS command, insufficient scope | Same-origin request assertion passed; see F-2-1. |
| `demo-not-saved` | PASS | Storage remained empty and requests remained same-origin. |
| `free-account-free` | PASS | Demo opened enabled with no account or payment UI. |
| `readable-text` | PASS | Article selection fixture passed. |
| `source-marker` | PASS | Packaged-extension range verification passed in Chromium. |
| `keyboard-shortcuts` | PASS | All three shortcut commands passed. |
| `protected-pages` | PASS | Protected-page fixture refused reader action. |
| `session-memory` | PASS | Runtime storage inspection passed. |
| `active-page-only` | PASS | MV3 permissions and explicit injection test passed. |
| `installable-package` | PASS | Built ZIP and MV3 manifest verification passed. |
| `no-remote-services` | PASS | Runtime/dependency static inspection passed. |
| `desktop-chromium-install` | PASS | Package and documented install-path test passed. |

The claim registry maps each ID to exactly one tagged test. F-1-9 is the one
unlisted live claim. F-2-1 is listed but not proven at the breadth used in copy.

## Earlier-finding verification

| Earlier ID | Status in live site and current code |
| --- | --- |
| F-1-1 | Fixed: realistic five-sentence report and read control are in the first mobile demo view. |
| F-1-2 | Fixed: packaged extension selects the browser selection or viewport-centre sentence; browser test passes. |
| F-1-3 | Fixed: **How it works** resolves to `/#how` from Demo, Privacy, and Terms and focuses the heading. |
| F-1-4 | **Still blocking:** scroll restoration works, exact focus restoration does not. |
| F-1-5 | **Still blocking:** install steps are complete, but phone compatibility remains absent from the first screen. |
| F-1-6 | Fixed: route-specific title, description, canonical, OG, and Twitter metadata verified live. |
| F-1-7 | Fixed: the HTTP 404 uses the standard header, navigation, footer, and recovery link. |
| F-1-8 | Fixed: packaged popup has the H1 “Read one sentence”. |
| F-1-9 | **Still blocking:** “Original” was removed, but the footer still makes an unlisted product-specific provenance claim. |
| F-1-10 | Fixed: clean-checkout outcome promise was removed. |
| F-1-11 | Fixed: unsupported artifact-equivalence wording was removed. |
| F-1-12 | Fixed: unsupported release hash-gate wording was removed. |
| F-1-13 | Fixed: hero label now names the one-sentence action. |
| F-1-14 | Fixed: “until it lands” was replaced with literal copy. |
| F-1-15 | Fixed: “three steady steps” was replaced with “three steps”. |
| F-1-16 | Fixed: the source-page slogan was removed. |
| F-1-17 | Fixed: social description is plain language. |
| F-1-18 | Fixed: “local-first” was removed from README. |
| F-1-19 | Fixed: demo separation is described in user-visible terms. |
| F-1-20 | Fixed: no landing or README sentence exceeds 22 words. |
| F-1-21 | Fixed: **Install the extension** names its destination. |
| F-1-22 | Fixed: 404 kicker is “Page not found”. |
| F-1-23 | Fixed: 404 H1 is “We could not find this page.” |
| F-1-24 | Fixed: 404 recovery sentence directly names the home page. |

## Structure, links, accessibility, and visual identity

- `/`, `/demo?demo=1`, `/privacy`, and `/terms` returned 200. A missing route
  returned a designed 404 with HTTP 404.
- Every route has one H1 and one main landmark. Titles follow the route pattern;
  descriptions, canonicals, OG/Twitter fields, favicon, apple-touch icon,
  `robots.txt`, and `sitemap.xml` are present.
- Every same-origin link returned 200, including the extension ZIP
  (`application/zip`, attachment). The external Param Factory link returned 200.
- No console/page errors or third-party requests appeared in the cold, demo, or
  route checks. The loaded shell navigated offline in the repository verifier.
- `/opt/fleet/lib/verify-url.sh` passed: title, `lang=en`, one H1, main landmark,
  alt text, labels, and no console errors. The Playwright axe integration found
  no serious or critical violations at 1440×900 or 390×844.
- Visible interactive targets passed the 44px check, reduced motion resolved to
  `scroll-behavior: auto`, and no route overflowed at 390px.
- The deployed JS transferred 65,139 bytes compressed, below the 150 KB budget.
- The ink, paper, vermillion, mint, halftone texture, editorial type, offset
  shadows, and sentence ruler form a distinct product-specific identity. It is
  not a generic centered-gradient SaaS layout.

Back/forward focus remains the structural failure recorded as F-1-4.

## Build and quality-gate evidence

From the clean clone:

```text
npm ci                  PASS
15/15 claim commands    PASS individually
npm test                PASS — 29/29
npm run typecheck       PASS
npm run lint            PASS
npm run build           PASS — dist/site and 507,744-byte extension ZIP
npm run test:extension  PASS
npm run test:site       PASS locally
live npm run test:site  PASS at 1440×900 and 390×844
verify-url.sh live      PASS
```

The built landing bundle was 205.50 KB raw and 64.76 KB gzip.

## Missed leverage

F-2-6 records the missing stop control. No AI feature, import/export, or sync
feature is warranted for the observed job: they would add data handling without
improving the local, sentence-by-sentence reading loop.

## What would make this perfect

Restore exact focus through browser history, disclose desktop-only installation
on the phone's first screen, remove or test the footer provenance statement,
narrow the privacy promise to what the product can prove, state the truthful
offline boundary, handle speech errors, make every control label name its
result, replace the README's factory jargon, and expose a tested **Stop reading**
control. Re-run the same cold-view, demo, claim, link, history, extension, and
accessibility checks afterward. Until every item is resolved, the verdict
remains **FAIL**.
