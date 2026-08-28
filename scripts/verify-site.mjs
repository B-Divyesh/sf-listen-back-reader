import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { preview } from 'vite';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const externalBaseUrl = process.env.VERIFY_BASE_URL?.replace(/\/$/, '');
const server = externalBaseUrl ? undefined : await preview({ configFile: 'vite.config.ts', preview: { host: '127.0.0.1', port: 0 } });
const baseUrl = externalBaseUrl ?? server.resolvedUrls.local[0].replace(/\/$/, '');
const browser = await chromium.launch({ headless: true });

async function verifyViewport(width, height) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', bypassCSP: true });
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  let checkingExpected404 = false;
  page.on('console', (message) => { if (message.type() === 'error' && !checkingExpected404) errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));

  for (const route of ['/', '/demo', '/privacy', '/terms', '/missing-page']) {
    checkingExpected404 = route === '/missing-page';
    await page.goto(`${baseUrl}${route}`);
    if (await page.locator('main').count() !== 1) throw new Error(`${route} does not have exactly one main landmark.`);
    if (await page.locator('h1').count() !== 1) throw new Error(`${route} does not have exactly one h1.`);
    if (!await page.title() || await page.getAttribute('html', 'lang') !== 'en') throw new Error(`${route} is missing title or language metadata.`);
    if (await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) throw new Error(`${route} overflows at ${width}px.`);
    if (await page.locator('img:not([alt])').count()) throw new Error(`${route} has an image without alt text.`);
    await page.addScriptTag({ path: axePath });
    const violations = await page.evaluate(async () => (await globalThis.axe.run()).violations
      .filter((violation) => ['serious', 'critical'].includes(violation.impact))
      .map((violation) => violation.id));
    if (violations.length) throw new Error(`${route} has serious/critical axe violations: ${violations.join(', ')}`);
  }
  checkingExpected404 = false;

  await page.goto(`${baseUrl}/demo`);
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await page.waitForFunction(() => document.activeElement === document.querySelector('main h1'));
  await page.goBack();
  await page.waitForFunction(() => document.activeElement === document.querySelector('main h1'));
  await page.goForward();
  await page.waitForFunction(() => document.activeElement === document.querySelector('main h1'));
  await page.goBack();
  await page.waitForFunction(() => document.activeElement === document.querySelector('main h1'));
  const smallTargets = await page.locator('a:visible, button:visible').evaluateAll((elements) => elements
    .map((element) => ({ label: element.getAttribute('aria-label') || element.textContent?.trim(), width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height }))
    .filter(({ width: targetWidth, height: targetHeight }) => targetWidth < 44 || targetHeight < 44));
  if (smallTargets.length) throw new Error(`Touch targets below 44px at ${width}px: ${JSON.stringify(smallTargets)}`);

  await context.setOffline(true);
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await page.getByRole('heading', { level: 1, name: 'Privacy is local by default.' }).waitFor();
  const motion = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
  if (motion !== 'auto') throw new Error(`Reduced-motion scroll behavior is ${motion}, not auto.`);

  if (errors.length) throw new Error(`Console/page errors at ${width}px: ${errors.join(' | ')}`);
  const remote = requests.filter((url) => new URL(url).origin !== new URL(baseUrl).origin);
  if (remote.length) throw new Error(`Third-party requests at ${width}px: ${remote.join(', ')}`);
  await context.close();
}

try {
  await verifyViewport(1440, 900);
  await verifyViewport(390, 844);
  console.log('Verified production site at 1440px and 390px: keyboard focus, axe, touch targets, privacy, reduced motion, and loaded-shell offline navigation pass.');
} finally {
  await browser.close();
  await server?.close();
}
