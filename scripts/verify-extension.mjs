import { createServer } from 'node:http';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const extensionPath = resolve(process.env.EXTENSION_PATH ?? '.output/chrome-mv3');
const profilePath = mkdtempSync(join(tmpdir(), 'listen-back-extension-'));
const automationExtensionPath = mkdtempSync(join(tmpdir(), 'listen-back-automation-'));
const server = createServer((request, response) => {
  const protection = request.url === '/noarchive'
    ? '<meta name="robots" content="noarchive">'
    : request.url === '/no-copy'
      ? 'data-no-copy'
      : '';
  const meta = protection.startsWith('<meta') ? protection : '';
  const attribute = protection === 'data-no-copy' ? protection : '';
  const article = request.url === '/midway'
    ? Array.from({ length: 12 }, (_, index) => `<p style="height:180px">Sentence ${index + 1} is placed in this long article. </p>`).join('')
    : request.url === '/boundaries'
    ? 'Dr. Smith reviewed the report at 3 p.m. Then she approved it. The U.S. team met. Next item. A decimal is 3.14. Done.'
    : 'First sentence is brief. Second sentence is the current reading target. Third sentence closes the paragraph.';
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(`<!doctype html><html lang="en"><head><title>Reader fixture</title>${meta}<style>p{width:260px;font:20px/1.5 monospace}</style></head><body><main ${attribute}>${request.url === '/midway' ? article : `<p>${article}</p>`}</main></body></html>`);
});

await new Promise((resolveReady) => server.listen(0, '127.0.0.1', resolveReady));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Could not start the extension fixture server.');
const origin = `http://127.0.0.1:${address.port}`;

let context;
try {
  const productionManifest = JSON.parse(readFileSync(join(extensionPath, 'manifest.json'), 'utf8'));
  if (productionManifest.content_scripts || productionManifest.host_permissions) {
    throw new Error('Production extension must not inspect pages through static content scripts or host permissions.');
  }
  if (JSON.stringify(productionManifest.permissions) !== JSON.stringify(['activeTab', 'scripting'])) {
    throw new Error(`Unexpected production permissions: ${JSON.stringify(productionManifest.permissions)}`);
  }

  // Playwright sends keyboard events to the renderer, not Chrome's toolbar
  // command dispatcher, so it cannot create an activeTab grant. Add only the
  // local fixture origin to a disposable copy; the production manifest above
  // remains the artifact under test for permission policy.
  cpSync(extensionPath, automationExtensionPath, { recursive: true });
  writeFileSync(join(automationExtensionPath, 'manifest.json'), JSON.stringify({
    ...productionManifest,
    host_permissions: [`${origin}/*`],
  }));

  context = await chromium.launchPersistentContext(profilePath, {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${automationExtensionPath}`, `--load-extension=${automationExtensionPath}`],
  });
  let worker = context.serviceWorkers()[0];
  if (!worker) worker = await context.waitForEvent('serviceworker');
  const activate = async (page) => {
    await worker.evaluate(async (url) => {
      const tab = (await chrome.tabs.query({})).find((candidate) => candidate.url === url);
      if (!tab?.id) throw new Error(`Could not find fixture tab ${url}`);
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['/content-scripts/content.js'] });
    }, page.url());
    await page.waitForSelector('html[data-listen-back="ready"]');
  };

  const verifyBlocked = async (path) => {
    const page = await context.newPage();
    await page.goto(`${origin}${path}`);
    await page.waitForTimeout(150);
    if (await page.locator('html[data-listen-back]').count()) {
      throw new Error(`${path} was inspected before the reader was explicitly invoked.`);
    }
    await activate(page);
    await page.keyboard.press('Alt+R');
    await page.waitForTimeout(150);
    if (await page.locator('#listen-back-marker').count()) {
      throw new Error(`${path} created a marker after Alt+R.`);
    }
    await page.close();
  };

  const normal = await context.newPage();
  await normal.goto(origin);
  await normal.waitForTimeout(150);
  if (await normal.locator('html[data-listen-back]').count()) {
    throw new Error('The article was inspected before the reader was explicitly invoked.');
  }
  await normal.evaluate(() => {
    const text = document.querySelector('p')?.firstChild;
    if (!text) throw new Error('The fixture lacks source text.');
    const range = document.createRange();
    range.setStart(text, 0); range.setEnd(text, 'First sentence is brief.'.length);
    const selection = getSelection(); selection?.removeAllRanges(); selection?.addRange(range);
  });
  await activate(normal);
  await worker.evaluate(async (url) => {
    const tab = (await chrome.tabs.query({})).find((candidate) => candidate.url === url);
    if (!tab?.id) throw new Error(`Could not find fixture tab ${url}`);
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: 'ISOLATED',
      func: () => {
        class TestUtterance {
          constructor(text) { this.text = text; }
          rate = 1;
          onend = null;
          onerror = null;
        }
        globalThis.__listenBackCancelCount = 0;
        Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', { configurable: true, value: TestUtterance });
        Object.defineProperty(globalThis, 'speechSynthesis', {
          configurable: true,
          value: {
            cancel: () => { globalThis.__listenBackCancelCount += 1; },
            speak: () => undefined,
          },
        });
      },
    });
  }, normal.url());
  await normal.keyboard.press('Alt+R');
  await normal.locator('#listen-back-marker').waitFor();
  await worker.evaluate(async (url) => {
    const tab = (await chrome.tabs.query({})).find((candidate) => candidate.url === url);
    if (!tab?.id) throw new Error(`Could not find fixture tab ${url}`);
    await chrome.tabs.sendMessage(tab.id, { type: 'listen-back-control', action: 'start' });
  }, normal.url());
  await normal.locator('#listen-back-marker[data-listen-back-speaking="true"]').waitFor();
  const cancelCountBeforeStop = await worker.evaluate(async (url) => {
    const tab = (await chrome.tabs.query({})).find((candidate) => candidate.url === url);
    const [result] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, world: 'ISOLATED', func: () => globalThis.__listenBackCancelCount });
    return result.result;
  }, normal.url());
  await worker.evaluate(async (url) => {
    const tab = (await chrome.tabs.query({})).find((candidate) => candidate.url === url);
    if (!tab?.id) throw new Error(`Could not find fixture tab ${url}`);
    await chrome.tabs.sendMessage(tab.id, { type: 'listen-back-control', action: 'stop' });
  }, normal.url());
  await normal.locator('#listen-back-marker[data-listen-back-speaking="false"]').waitFor();
  const cancelCountAfterStop = await worker.evaluate(async (url) => {
    const tab = (await chrome.tabs.query({})).find((candidate) => candidate.url === url);
    const [result] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, world: 'ISOLATED', func: () => globalThis.__listenBackCancelCount });
    return result.result;
  }, normal.url());
  if (cancelCountAfterStop !== cancelCountBeforeStop + 1) throw new Error('Stop reading did not call speechSynthesis.cancel in the packaged extension.');
  const markerSnapshot = async () => {
    await normal.waitForTimeout(220);
    return normal.locator('#listen-back-marker').evaluate((marker) => {
      const label = marker.getAttribute('aria-label');
      const sentence = label?.replace(/^Current sentence: /, '') ?? '';
      const paragraph = document.querySelector('p');
      const text = paragraph?.firstChild;
      if (!(text instanceof Text)) throw new Error('The geometry fixture has no paragraph text node.');
      const start = text.data.indexOf(sentence);
      const expectedRange = document.createRange();
      expectedRange.setStart(text, start);
      expectedRange.setEnd(text, start + sentence.length);
      const expectedFragments = [...expectedRange.getClientRects()].map((rect) => ({
        left: rect.left - 7,
        top: rect.top - 2,
        right: rect.right + 2,
        bottom: rect.bottom + 2,
      }));
      const expectedRectangle = [
        Math.min(...expectedFragments.map(({ left }) => left)),
        Math.min(...expectedFragments.map(({ top }) => top)),
        Math.max(...expectedFragments.map(({ right }) => right)) - Math.min(...expectedFragments.map(({ left }) => left)),
        Math.max(...expectedFragments.map(({ bottom }) => bottom)) - Math.min(...expectedFragments.map(({ top }) => top)),
      ].map((value) => Math.round(value));
      const rectangle = marker.getBoundingClientRect();
      return {
        label,
        rectangle: [rectangle.x, rectangle.y, rectangle.width, rectangle.height].map((value) => Math.round(value)),
        expectedRectangle,
        visibleRanges: marker.querySelectorAll('[data-listen-back-range]').length,
        expectedVisibleRanges: expectedFragments.length,
      };
    });
  };
  const firstMarker = await markerSnapshot();
  await normal.keyboard.press('Alt+ArrowRight');
  await normal.waitForFunction((sentence) => document.querySelector('#listen-back-marker')?.getAttribute('aria-label') !== sentence, firstMarker.label);
  const secondMarker = await markerSnapshot();
  await normal.keyboard.press('Alt+ArrowRight');
  await normal.waitForFunction((sentence) => document.querySelector('#listen-back-marker')?.getAttribute('aria-label') !== sentence, secondMarker.label);
  const thirdMarker = await markerSnapshot();
  await normal.keyboard.press('Alt+ArrowLeft');
  await normal.waitForFunction((sentence) => document.querySelector('#listen-back-marker')?.getAttribute('aria-label') !== sentence, thirdMarker.label);
  const returnedSecondMarker = await markerSnapshot();
  await normal.keyboard.press('Alt+ArrowLeft');
  await normal.waitForFunction((sentence) => document.querySelector('#listen-back-marker')?.getAttribute('aria-label') !== sentence, returnedSecondMarker.label);
  const returnedFirstMarker = await markerSnapshot();

  if ([firstMarker, secondMarker, thirdMarker].some(({ visibleRanges, expectedVisibleRanges }) => visibleRanges < 1 || visibleRanges !== expectedVisibleRanges)) {
    throw new Error(`The marker does not expose visible sentence-range overlays: ${JSON.stringify([firstMarker, secondMarker, thirdMarker])}`);
  }
  if ([firstMarker, secondMarker, thirdMarker].some(({ rectangle, expectedRectangle }) => JSON.stringify(rectangle) !== JSON.stringify(expectedRectangle))) {
    throw new Error(`The marker does not bound the browser's sentence range: ${JSON.stringify([firstMarker, secondMarker, thirdMarker])}`);
  }
  if (JSON.stringify(firstMarker.rectangle) === JSON.stringify(secondMarker.rectangle)
      || JSON.stringify(secondMarker.rectangle) === JSON.stringify(thirdMarker.rectangle)) {
    throw new Error(`The marker did not follow each sentence in one paragraph: ${JSON.stringify([firstMarker, secondMarker, thirdMarker])}`);
  }
  if (JSON.stringify(returnedSecondMarker.rectangle) !== JSON.stringify(secondMarker.rectangle)
      || JSON.stringify(returnedFirstMarker.rectangle) !== JSON.stringify(firstMarker.rectangle)) {
    throw new Error(`Previous did not return the marker to the prior sentence ranges: ${JSON.stringify({ firstMarker, secondMarker, returnedSecondMarker, returnedFirstMarker })}`);
  }

  const extensionId = new URL(worker.url()).host;
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popup.locator('button').first().waitFor();
  if (await popup.locator('main').count() !== 1 || await popup.locator('h1').count() !== 1 || await popup.locator('h1').innerText() !== 'Read one sentence') {
    throw new Error('The popup is missing its semantic Read one sentence heading.');
  }
  const popupEntry = productionManifest.action?.default_popup;
  const popupHtml = popupEntry ? readFileSync(join(extensionPath, popupEntry), 'utf8') : '';
  const popupScript = popupHtml.match(/src="([^"]+\.js)"/)?.[1];
  const popupBundle = popupScript ? readFileSync(join(extensionPath, popupScript.replace(/^\//, '')), 'utf8') : '';
  if (!popupBundle.includes('Stop reading')) throw new Error('The packaged popup does not expose Stop reading while speech is active.');
  const undersized = await popup.locator('button').evaluateAll((buttons) => buttons
    .map((button) => ({ label: button.getAttribute('aria-label') || button.textContent?.trim(), height: button.getBoundingClientRect().height }))
    .filter(({ height }) => height < 44));
  if (undersized.length) throw new Error(`Popup touch targets below 44px: ${JSON.stringify(undersized)}`);
  await popup.close();

  const offline = await context.newPage();
  const offlineRequests = [];
  offline.on('request', (request) => offlineRequests.push(request.url()));
  await offline.goto(`${origin}/offline`);
  await offline.evaluate(() => {
    const text = document.querySelector('p')?.firstChild;
    if (!text) throw new Error('The offline fixture lacks source text.');
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, 'First sentence is brief.'.length);
    const selection = getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  });
  await activate(offline);
  await offline.keyboard.press('Alt+R');
  await offline.locator('#listen-back-marker').waitFor();
  const beforeOffline = await offline.locator('#listen-back-marker').getAttribute('aria-label');
  offlineRequests.length = 0;
  await context.setOffline(true);
  await worker.evaluate(async (url) => {
    const tab = (await chrome.tabs.query({})).find((candidate) => candidate.url === url);
    if (!tab?.id) throw new Error(`Could not find offline fixture tab ${url}`);
    await chrome.tabs.sendMessage(tab.id, { type: 'listen-back-control', action: 'next' });
  }, offline.url());
  await offline.waitForFunction((previous) => document.querySelector('#listen-back-marker')?.getAttribute('aria-label') !== previous, beforeOffline);
  const afterOffline = await offline.locator('#listen-back-marker').getAttribute('aria-label');
  await worker.evaluate(async (url) => {
    const tab = (await chrome.tabs.query({})).find((candidate) => candidate.url === url);
    if (!tab?.id) throw new Error(`Could not find offline fixture tab ${url}`);
    await chrome.tabs.sendMessage(tab.id, { type: 'listen-back-control', action: 'previous' });
  }, offline.url());
  await offline.waitForFunction((previous) => document.querySelector('#listen-back-marker')?.getAttribute('aria-label') !== previous, afterOffline);
  if (offlineRequests.length) throw new Error(`Extension controls requested the network while offline: ${offlineRequests.join(', ')}`);
  await context.setOffline(false);
  await offline.close();
  await normal.close();

  const midway = await context.newPage();
  await midway.goto(`${origin}/midway`);
  await midway.evaluate(() => scrollTo(0, 900));
  await activate(midway);
  await midway.keyboard.press('Alt+R');
  await midway.locator('#listen-back-marker').waitFor();
  const midwayLabel = await midway.locator('#listen-back-marker').getAttribute('aria-label');
  if (!midwayLabel?.includes('Sentence 6') && !midwayLabel?.includes('Sentence 7')) {
    throw new Error(`The reader did not start near the visible viewport centre: ${midwayLabel}`);
  }
  await midway.close();

  const boundarySource = 'Dr. Smith reviewed the report at 3 p.m. Then she approved it. The U.S. team met. Next item. A decimal is 3.14. Done.';
  const boundary = await context.newPage();
  await boundary.goto(`${origin}/boundaries`);
  await boundary.waitForTimeout(150);
  if (await boundary.locator('html[data-listen-back]').count()) {
    throw new Error('The dense article was inspected before explicit keyboard invocation.');
  }
  await boundary.evaluate(() => {
    const text = document.querySelector('p')?.firstChild;
    if (!text) throw new Error('The boundary fixture lacks source text.');
    const range = document.createRange();
    range.setStart(text, 0); range.setEnd(text, 'Dr. Smith reviewed the report at 3 p.m.'.length);
    const selection = getSelection(); selection?.removeAllRanges(); selection?.addRange(range);
  });
  await activate(boundary);
  await boundary.keyboard.press('Alt+R');
  await boundary.locator('#listen-back-marker').waitFor();
  const spoken = [];
  for (let index = 0; index < 6; index += 1) {
    const label = await boundary.locator('#listen-back-marker').getAttribute('aria-label');
    spoken.push(label?.replace(/^Current sentence: /, '') ?? '');
    if (index < 5) {
      await boundary.keyboard.press('Alt+ArrowRight');
      await boundary.waitForFunction((previous) => document.querySelector('#listen-back-marker')?.getAttribute('aria-label') !== previous, label);
    }
  }
  if (spoken.join(' ') !== boundarySource) {
    throw new Error(`Dense punctuation was not source-faithful: ${JSON.stringify(spoken)}`);
  }
  await boundary.close();

  await verifyBlocked('/noarchive');
  await verifyBlocked('/no-copy');
  console.log('Verified the production extension in Chromium: source markers, explicit invocation, punctuation, protected pages, Stop reading, and popup accessibility pass.');
} finally {
  await context?.close();
  await new Promise((resolveClosed) => server.close(resolveClosed));
  rmSync(profilePath, { recursive: true, force: true });
  rmSync(automationExtensionPath, { recursive: true, force: true });
}
