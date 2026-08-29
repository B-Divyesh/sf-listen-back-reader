# Listen Back Reader

Replay one web sentence at a time without losing your place.

Listen Back Reader is a free browser extension for dyslexic readers and anyone
who gets tired while reading dense web text. It uses voices already available
in your browser. Page text does not leave your device.

## What it does

- Finds readable article text on the current page.
- Reads one sentence at a time with replay, slower speed, back, and next.
- Marks the source sentence while it reads.
- Supports Alt + R, Alt + Left, and Alt + Right.

The extension reads the active page only after you open its toolbar popup or
press Alt + R. It does not request access to every site in advance. It does not
rewrite text, make a diagnosis, create a voice, or store an account.

## Try the sample

Open `/demo?demo=1` on the deployed site, or `http://localhost:5173/demo?demo=1`
while developing. The demo keeps its sample separate and does not read or
change your extension data. Use Reset demo to start the sample again.

## Install the extension

Listen Back Reader runs in desktop Chrome or Chromium. It cannot be installed
in mobile Chrome.

1. Download `listen-back-reader.zip` from the site.
2. Extract the ZIP to a folder.
3. Open `chrome://extensions` and enable Developer mode.
4. Choose **Load unpacked** and select the extracted folder.

For a local developer build, run `npm run build:extension` and select
`.output/chrome-mv3` in step 4.

## Develop, test, and build

```sh
npm ci
npm run dev             # landing site
npm run dev:extension   # Chrome extension in development
npm test
npm run typecheck
npm run lint
npm run build
npm run test:extension
npm run test:site
```

`npm run build:site` writes the static site to `dist/site`. The extension ZIP
is at `dist/site/downloads/listen-back-reader.zip`.

Deploy with the configured work order:

```sh
npm run deploy:site
```

## Privacy

The speech engine is your browser and operating system speech service. Listen
Back Reader has no server, tracking, accounts, analytics, or cloud text upload.
Read the included [privacy page](https://listen-back-reader.sociobot.in/privacy)
and [terms page](https://listen-back-reader.sociobot.in/terms).

## License

[MIT](LICENSE)
