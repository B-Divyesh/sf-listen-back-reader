# Listen Back Reader

Replay one web sentence at a time without losing your place.

Listen Back Reader is a free, local-first browser extension for dyslexic readers
and anyone who gets tired while reading dense web text. It uses the voices
already available in your browser. Page text does not leave your device.

## What it does

- Finds readable article text on the current page.
- Reads one sentence at a time with replay, slower speed, back, and next.
- Marks the source sentence on the page as it is read.
- Supports Alt + R to replay, Alt + Left to go back, and Alt + Right to move on.

It does not rewrite text, make a diagnosis, create a voice, or store an account.

## Try the sample

Run the site and open `http://localhost:5173/demo`, or use the deployed
`/demo` route. Demo mode is isolated in memory: sample controls never read or
write extension data.

## Develop

```sh
npm ci
npm run dev             # landing site
npm run dev:extension   # Chrome extension in development
```

The install step runs `wxt prepare`, so tests and type checking work in a clean
checkout without requiring a build first.

## Test and build

```sh
npm test
npm run typecheck
npm run lint
npm run build
npm run test:extension  # loads the production extension in Chromium
npm run test:site       # desktop, 390px, keyboard, axe, privacy, offline shell
```

`npm run build:site` creates the deployable static site in `dist/site`.
`npm run package:extension` puts the extension archive at
`dist/site/downloads/listen-back-reader.zip`.

Deploy the contents of `dist/site` to the configured Azure Static Web App. To
check the deployed identity and browser behavior, run:

```sh
VERIFY_BASE_URL=https://listen-back-reader.sociobot.in npm run test:site
```

For a local Chrome install, run `npm run build:extension`, open
`chrome://extensions`, enable Developer mode, select **Load unpacked**, and
choose `.output/chrome-mv3`.

## Privacy

The speech engine is the browser and operating system speech service. Listen
Back Reader has no server, tracking, accounts, analytics, or cloud text upload.
See the included [privacy page](https://listen-back-reader.sociobot.in/privacy)
and [terms page](https://listen-back-reader.sociobot.in/terms).

## License

[MIT](LICENSE)
