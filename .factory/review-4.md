# Adversarial first-read review 4

**Verdict: FAIL**

Reviewed 2026-08-29 UTC against <https://listen-back-reader.sociobot.in> in fresh Chromium contexts at 390×844 and 1440×900. The reviewed checkout was `c18dcf0396c3426c1832524f2b992174aad60c38`. No product code was changed.

`.factory/brief.json` is absent. This review therefore used the live product, `.factory/design.md`, `.factory/claims.json`, README, and all prior review, polish, verification, and handoff records as the available evidence.

## First screen, before scrolling

The first-screen clarity test passes at both viewports.

- **What it does:** a browser extension that replays one web sentence at a time and marks the reader's place.
- **For whom:** readers who lose their place in dense web text.
- **What to click first:** **Try it with sample data**.

The exact visible supporting copy is “A browser extension that reads one sentence at a time”, “Replay each sentence. Keep your place.”, “For readers who lose their place in dense web text.”, and “Try it with sample data”. Its adjacent explanation says “Open a sample article with one sentence marked.” At 390px, all four required facts, including “Extension requires desktop Chrome or Chromium; the demo works on mobile.”, fit before the fold. This is not a clarity blocker.

## Finding

### Minor

#### F-4-1 — The no-rewrite promise is not a registered claim

**Location / quote:** Landing, **What it does not do**: “It reads the article. It does not rewrite it.” README lines 16–18: “It does not rewrite text, make a diagnosis, create a voice, or store an account.”

**Evidence:** `.factory/claims.json` has no `rewrite` / `does-not-rewrite` entry. The closest entry, `no-remote-services`, checks network clients, dependencies, and permissions; it does not assert that an article's DOM text is unchanged before and after extension activation and reading. The clean-clone claim suite consequently cannot prove this visitor-facing promise.

**Why this fails:** A reader can rely on “does not rewrite” when deciding whether to use the extension on a source page. The claims rule requires every such public statement to have a listed, observable test. This is an unlisted claim finding, not a claim-test failure.

**Concrete fix:** Add a `does-not-rewrite` entry and one `@claim:does-not-rewrite` test. In a realistic article fixture, preserve the article element's `textContent` and child markup, activate the extension, then replay, move next, and stop; assert both values remain unchanged. The marker may be asserted separately outside the article. Alternatively, remove “It does not rewrite it.” and “It does not rewrite text” from public copy.

## Copy audit

Counts treat hyphenated terms, keyboard shortcuts, URLs, paths, and version strings as one word. UI labels and headings are included because a visitor reads them as part of the product. Command-only code lines are listed as commands, not sentences. No landing or README sentence exceeds 22 words. No banned marketing adjective, unexplained metaphor, mood heading, inconsistent term, or non-result button was found. The single F-4-1 flag below is the sole copy finding.

### Landing page

| Location | Exact copy | Words | Flag |
| --- | --- | ---: | --- |
| Title | Listen Back Reader — replay one sentence | 6 | — |
| Meta description | Replay one web sentence at a time without losing your place. | 11 | — |
| Skip link | Skip to main content | 4 | — |
| Wordmark | Listen Back | 2 | — |
| Navigation | Demo | 1 | — |
| Navigation | How it works | 3 | — |
| Navigation | Privacy | 1 | — |
| Hero label | A browser extension that reads one sentence at a time | 10 | — |
| H1 | Replay each sentence. | 3 | — |
| H1 | Keep your place. | 3 | — |
| Hero sentence | For readers who lose their place in dense web text. | 10 | — |
| Primary action | Try it with sample data | 5 | — |
| Action explanation | Open a sample article with one sentence marked. | 8 | — |
| Fact | Listen Back does not send article text to a Listen Back server. | 12 | — |
| Fact | Extension controls work offline after an article loads; speech depends on your browser voice. | 14 | — |
| Fact | Free and account-free. | 3 | — |
| Fact | Extension requires desktop Chrome or Chromium; the demo works on mobile. | 11 | — |
| Image alt | An ink-and-paper illustration of a marked article sentence looping back through sound waves. | 13 | — |
| Caption | Print-style illustration for Listen Back Reader. | 6 | — |
| Section label | The reader | 2 | — |
| H2 | One sentence stays visible while you listen. | 7 | — |
| Preview | The extension marks the source sentence. | 6 | — |
| Preview | Replay it until you understand it, then move to the next sentence. | 12 | — |
| Reader label | Sample article | 2 | — |
| Counter | Sentence 3 / 5 | 3 | — |
| Button | Previous sentence | 2 | — |
| Button | Read highlighted sentence | 3 | — |
| Button note | Uses your browser voice | 4 | — |
| Button | Next sentence | 2 | — |
| Button | Use 0.8× speed | 3 | — |
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
| H2 | It does not rewrite it. | 5 | F-4-1 |
| Limit | Listen Back does not send article text to a Listen Back server, diagnose dyslexia, create voices, or save an account. | 20 | — |
| Limit | It does not read pages that explicitly block copying. | 9 | — |
| Section label | Use it on ordinary web pages | 6 | — |
| H2 | Install the free extension. | 4 | — |
| Compatibility | Desktop Chrome or Chromium only. | 5 | — |
| Install | Download the ZIP and extract it. | 6 | — |
| Install | Open chrome://extensions and enable Developer mode. | 6 | — |
| Install | Choose Load unpacked and select the extracted folder. | 8 | — |
| Download action | Download extension zip | 3 | — |
| Footer | Replay one sentence without losing your place. | 7 | — |
| Footer link | Privacy | 1 | — |
| Footer link | Terms | 1 | — |
| External link | Built by Param Factory (external) | 5 | — |
| Version | v1.0.0 | 1 | — |

Dynamic reader status strings are also plain and result-naming: “Stop reading” (2), “Use normal speed” (3), “Speech is unavailable.” (3), “Enable a browser voice, then try again.” (7), “The browser voice could not read this sentence.” (8), and “Reading stopped.” (2).

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
| Body | It does not rewrite text, make a diagnosis, create a voice, or store an account. | 15 | F-4-1 |
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
| Command | `npm ci`; `npm run dev`; `npm run dev:extension`; `npm test`; `npm run typecheck`; `npm run lint`; `npm run build`; `npm run test:extension`; `npm run test:site` | command-only | — |
| Body | `npm run build:site` writes the static site to `dist/site`. | 9 | — |
| Body | The extension ZIP is at `dist/site/downloads/listen-back-reader.zip`. | 6 | — |
| Body | Deploy the site with the repository's deploy script. | 9 | — |
| Command | `npm run deploy:site` | command-only | — |
| H2 | Privacy | 1 | — |
| Body | Your browser or operating system provides speech. | 7 | — |
| Body | Some voices may need a network connection. | 7 | — |
| Body | The extension has no Listen Back server, tracking, accounts, or analytics. | 11 | — |
| Body | Read the included privacy page and terms page. | 8 | — |
| H2 | License | 1 | — |
| Link | MIT | 1 | — |

Terminology is consistent: **sentence** is the reading unit, **article text** is the source, **extension** is the browser add-on, **demo** is the sample mode, **marker** is the visible cue, and **browser voice** is the speech provider.

## Demo and sandbox

The one-click path passes:

- **Try it with sample data** opens `/demo?demo=1` in one action.
- The first post-click screen shows a five-sentence, realistic city-library report with a name, dates, `p.m.`, `$2.4 million`, `U.S.`, and `38%`.
- At 390×844, the **Read highlighted sentence** control is at y=533–598 and the marked first sentence is fully visible at y=718–820.
- The persistent banner says “Demo — sample data, nothing is saved.” and provides **Reset demo** and **Install the extension**.
- Reset restores sentence 1. Demo exit goes to the installation section.
- A fresh context had empty localStorage, sessionStorage, and IndexedDB before and after interaction; the request log was empty after the demo had loaded.
- With a controlled browser voice, Reset and Install each call cancellation; unavailable and error states explain how to enable a browser voice.

Demo state lives only in component state. Code and the `demo-not-saved` claim test confirm it cannot read or write extension storage. The live request log contained only same-origin page assets; it contained no request after demo reading, navigation, or reset. This confirms the stated product privacy boundary and no tracking/network action from the demo.

## Claims and quality gates

A clean local clone was created at `/tmp/listen-back-review4.tBnf0o`; `npm ci` completed with zero vulnerabilities. Each exact command listed in `.factory/claims.json` was run independently. All 18 passed:

| Claim ID | Result |
| --- | --- |
| sentence-loop | PASS |
| reader-controls | PASS |
| local-speech | PASS |
| local-text | PASS |
| offline-controls | PASS |
| demo-not-saved | PASS |
| free-account-free | PASS |
| readable-text | PASS |
| source-marker | PASS |
| keyboard-shortcuts | PASS |
| protected-pages | PASS |
| session-memory | PASS |
| active-page-only | PASS |
| installable-package | PASS |
| no-remote-services | PASS |
| stop-reading | PASS |
| desktop-chromium-install | PASS |
| mobile-demo | PASS |

`npm test` passed 37/37 tests. `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:extension`, and `npm run test:site` passed in the clone. The live `VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site` and `npm run test:deployment` also passed.

All other claim-like public statements map to an existing registered claim: browser voice (`local-speech`), no Listen Back server (`local-text`), offline controls (`offline-controls`), account-free use (`free-account-free`), readable article selection (`readable-text`), visible marker and place restoration (`source-marker`), shortcuts (`keyboard-shortcuts`), protected pages (`protected-pages`), memory-only state (`session-memory`), explicit active-page permission (`active-page-only`), package/install path (`installable-package` and `desktop-chromium-install`), no service/diagnosis/generated voice (`no-remote-services`), and stopping speech (`stop-reading`). F-4-1 is the sole exception.

## Structure, access, and visual identity

The live `/`, `/demo?demo=1`, `/privacy`, `/terms`, and real HTTP 404 each had one `<main>`, one H1, `lang="en"`, a route-appropriate title, description, canonical URL, Open Graph fields, Twitter fields, favicon, and apple-touch icon. The route titles follow the required product-name pattern. `robots.txt` and `sitemap.xml` are present. The static 404 retains the normal header, footer, Privacy, Terms, external-site cue, and a clear home action.

Every discovered internal link returned 200 except the deliberately requested unknown URL, which returned its designed HTTP 404; the extension ZIP returned 200. Header **How it works** navigates from Demo, Privacy, and Terms to `/#how` and focuses its heading. Keyboard navigation restores the original stable control and scroll position on Back/Forward. The live accessibility verifier reported no serious or critical axe violations, no console/page errors, 44px controls, and reduced-motion support.

The design is distinct rather than a generic SaaS template: the warm paper, ink, vermilion sentence ruler, Georgia reading type, square controls, and halftone treatment match the recorded dithered/risograph direction. The illustration is product-specific and has useful alt text. No AI feature is missing: the brief is absent, and the implemented local reading job does not imply an AI, import/export, or sync feature. The product embeds no provider key or decorative AI control.

## Earlier findings rechecked

Every earlier finding was checked on the live site and in the current code. None is unfixed, half-fixed, or regressed.

| Earlier ID | Current verification |
| --- | --- |
| F-1-1 | Direct demo opens an original realistic report; the mobile first view contains control and marked sentence. |
| F-1-2 | `content.ts` starts from selection, otherwise viewport centre; packaged marker test covers both. |
| F-1-3 | Every header link uses `/#how`; live non-home navigation reaches and focuses `how-heading`. |
| F-1-4 | Route state saves scroll and stable focus IDs; live keyboard Back/Forward restores both. |
| F-1-5 | Mobile hero visibly states desktop-only extension support; README gives extract/Load unpacked steps. |
| F-1-6 | Live Demo, Privacy, Terms, and 404 each update title, description, canonical, OG, and Twitter fields. |
| F-1-7 | The real HTTP 404 has shared header/footer, legal links, attribution, and recovery action. |
| F-1-8 | Packaged popup has one `main` and H1, “Read one sentence”. |
| F-1-9 | No public illustration provenance claim remains; provenance is limited to the design record. |
| F-1-10 | README gives commands without the former clean-checkout outcome promise. |
| F-1-11 | README now states output locations; the downloadable MV3 artifact is separately claimed and tested. |
| F-1-12 | No public deployment hash-gate assertion remains. |
| F-1-13 | Hero label plainly names one-sentence reading. |
| F-1-14 | “Until it lands” is absent; preview says “until you understand it”. |
| F-1-15 | Heading is “Read web text in three steps.” |
| F-1-16 | The former source-page slogan is absent. |
| F-1-17 | Live social description is plain and route-specific. |
| F-1-18 | “Local-first” is absent from README. |
| F-1-19 | Demo explanation states the user-visible separation, not implementation jargon. |
| F-1-20 | Full audit above has no sentence over 22 words. |
| F-1-21 | Banner action is “Install the extension” and focuses the installation section. |
| F-1-22 | 404 label is “Page not found”. |
| F-1-23 | 404 H1 is “We could not find this page.” |
| F-1-24 | 404 copy plainly directs the visitor to the home page. |
| F-2-1 | Privacy wording is narrowly “does not send article text to a Listen Back server”. |
| F-2-2 | The first screen names the tested offline boundary. |
| F-2-3 | Missing/error speech states are live, announced, and restore the read control. |
| F-2-4 | Visible controls now name Previous sentence, Next sentence, and selected speed. |
| F-2-5 | README says “repository's deploy script”, not factory jargon. |
| F-2-6 | Demo and packaged popup expose Stop reading; the packaged claim test observes cancellation. |
| F-3-1 | Reset, demo exit, and unmount cancel speech before reset/navigation. |
| F-3-2 | Factory link visibly and accessibly says “(external)”. |

## What would make this perfect

Register and test the no-rewrite promise in F-4-1 (or remove it from both public locations). With that one claim-map repair and a passing tagged test, there would be no remaining finding from this review.
