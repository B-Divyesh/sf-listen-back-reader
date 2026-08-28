import { createServer } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const extensionPath = resolve(process.env.EXTENSION_PATH ?? '.output/chrome-mv3');
const profilePath = mkdtempSync(join(tmpdir(), 'listen-back-extension-'));
const server = createServer((request, response) => {
  const protection = request.url === '/noarchive'
    ? '<meta name="robots" content="noarchive">'
    : request.url === '/no-copy'
      ? 'data-no-copy'
      : '';
  const meta = protection.startsWith('<meta') ? protection : '';
  const attribute = protection === 'data-no-copy' ? protection : '';
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(`<!doctype html><html lang="en"><head><title>Reader fixture</title>${meta}</head><body><main ${attribute}><p>First source sentence.</p> <p>Second source sentence.</p></main></body></html>`);
});

await new Promise((resolveReady) => server.listen(0, '127.0.0.1', resolveReady));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Could not start the extension fixture server.');
const origin = `http://127.0.0.1:${address.port}`;

let context;
try {
  context = await chromium.launchPersistentContext(profilePath, {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });

  const verifyBlocked = async (path) => {
    const page = await context.newPage();
    await page.goto(`${origin}${path}`);
    await page.waitForSelector('html[data-listen-back="ready"]');
    await page.keyboard.press('Alt+R');
    await page.waitForTimeout(150);
    if (await page.locator('#listen-back-marker').count()) {
      throw new Error(`${path} created a marker after Alt+R.`);
    }
    await page.close();
  };

  const normal = await context.newPage();
  await normal.goto(origin);
  await normal.waitForSelector('html[data-listen-back="ready"]');
  await normal.keyboard.press('Alt+R');
  await normal.locator('#listen-back-marker').waitFor();
  const firstTop = await normal.locator('#listen-back-marker').evaluate((marker) => marker.style.top);
  await normal.keyboard.press('Alt+ArrowRight');
  await normal.waitForFunction((top) => document.querySelector('#listen-back-marker')?.style.top !== top, firstTop);

  let worker = context.serviceWorkers()[0];
  if (!worker) worker = await context.waitForEvent('serviceworker');
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

  await verifyBlocked('/noarchive');
  await verifyBlocked('/no-copy');
  console.log('Verified the production extension in Chromium: shortcuts advance normally, protected pages stay untouched, and popup controls are at least 44px.');
} finally {
  await context?.close();
  await new Promise((resolveClosed) => server.close(resolveClosed));
  rmSync(profilePath, { recursive: true, force: true });
}
