# Listen Back Reader handoff

## Delivered

- A WXT / MV3 browser extension with a source-faithful sentence loop.
  It extracts readable `article`, `main`, or page text; speaks one sentence with
  the browser's native voice; and places a high-visibility marker at the source
  paragraph. The popup provides read, replay, slow, previous, and next controls.
- Keyboard shortcuts: `Alt + R` replays, `Alt + Left` moves back, and
  `Alt + Right` moves forward. Pages that signal no archival/copy use through
  `noarchive` robots metadata or `data-listen-back-no-copy` are declined.
- A static landing site and try-in-one-click `/demo` reader. The demo has an
  in-memory sample only, with a persistent demo banner, reset, and start-for-
  real actions.
- Landing, demo, privacy, terms, and styled 404 routes; original dithered-print
  illustration; social image; favicon; sitemap; robots; and security headers.
- The packaged extension is emitted at
  `dist/site/downloads/listen-back-reader.zip` by `npm run build`.

## Verification

Run from a clean clone:

```sh
npm install
npm test
npm run build
```

Completed locally on 2026-08-28:

- `npm test`: 5 passing tests, including all four claim tags.
- `npx tsc --noEmit`: passes.
- `npm run build`: passes; static output is `dist/site/` and includes `index.html`.
- Browser smoke checks on `/`, `/demo`, `/privacy`, and `/terms`: one h1 per
  page, route-specific title, no console or page errors.
- axe-core through Playwright: 0 violations on all four routes.
- Lighthouse, production static preview, desktop default: Performance **99**,
  Accessibility **100**, Best Practices **100**, SEO **100**; LCP **2.1 s**;
  CLS **0**. Initial site JavaScript is 63.77 KB gzip, CSS 2.56 KB gzip, and
  hero image 137 KB WebP.

## Known gaps / next steps

- Sentence splitting is intentionally conservative. Abbreviations and unusual
  punctuation can split imperfectly; a future release can use browser locale
  segmentation when it is broadly reliable.
- Some websites do not expose article text or block content scripts. The popup
  reports this rather than attempting to bypass the page.
- The browser/OS controls available voices. A voice picker is out of v1 scope.
