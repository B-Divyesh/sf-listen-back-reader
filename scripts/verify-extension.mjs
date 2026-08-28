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
  const article = request.url === '/boundaries'
    ? 'Dr. Smith reviewed the report at 3 p.m. Then she approved it. The U.S. team met. Next item. A decimal is 3.14. Done.'
    : 'First source sentence. Second source sentence.';
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(`<!doctype html><html lang="en"><head><title>Reader fixture</title>${meta}</head><body><main ${attribute}><p>${article}</p></main></body></html>`);
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
  await activate(normal);
  await normal.keyboard.press('Alt+R');
  await normal.locator('#listen-back-marker').waitFor();
  const firstSentence = await normal.locator('#listen-back-marker').getAttribute('aria-label');
  await normal.keyboard.press('Alt+ArrowRight');
  await normal.waitForFunction((sentence) => document.querySelector('#listen-back-marker')?.getAttribute('aria-label') !== sentence, firstSentence);

  const extensionId = new URL(worker.url()).host;
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popup.locator('button').first().waitFor();
  const undersized = await popup.locator('button').evaluateAll((buttons) => buttons
    .map((button) => ({ label: button.getAttribute('aria-label') || button.textContent?.trim(), height: button.getBoundingClientRect().height }))
    .filter(({ height }) => height < 44));
  if (undersized.length) throw new Error(`Popup touch targets below 44px: ${JSON.stringify(undersized)}`);
  await popup.close();
  await normal.close();

  const boundarySource = 'Dr. Smith reviewed the report at 3 p.m. Then she approved it. The U.S. team met. Next item. A decimal is 3.14. Done.';
  const boundary = await context.newPage();
  await boundary.goto(`${origin}/boundaries`);
  await boundary.waitForTimeout(150);
  if (await boundary.locator('html[data-listen-back]').count()) {
    throw new Error('The dense article was inspected before explicit keyboard invocation.');
  }
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
  console.log('Verified the production extension in Chromium: pages remain untouched until invocation, dense punctuation stays source-faithful, shortcuts advance, protected pages stay unread, and popup controls are at least 44px.');
} finally {
  await context?.close();
  await new Promise((resolveClosed) => server.close(resolveClosed));
  rmSync(profilePath, { recursive: true, force: true });
  rmSync(automationExtensionPath, { recursive: true, force: true });
}
