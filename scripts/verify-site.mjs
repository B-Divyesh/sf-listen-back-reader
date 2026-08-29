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

  const routeHeads = {
    '/': ['Listen Back Reader — replay one sentence', 'https://listen-back-reader.sociobot.in/'],
    '/demo?demo=1': ['Demo — Listen Back Reader', 'https://listen-back-reader.sociobot.in/demo'],
    '/privacy': ['Privacy — Listen Back Reader', 'https://listen-back-reader.sociobot.in/privacy'],
    '/terms': ['Terms — Listen Back Reader', 'https://listen-back-reader.sociobot.in/terms'],
    '/missing-page': ['Page not found — Listen Back Reader', 'https://listen-back-reader.sociobot.in/404'],
  };
  for (const [route, [title, canonical]] of Object.entries(routeHeads)) {
    checkingExpected404 = route === '/missing-page';
    await page.goto(`${baseUrl}${route}`);
    if (await page.locator('main').count() !== 1) throw new Error(`${route} does not have exactly one main landmark.`);
    if (await page.locator('h1').count() !== 1) throw new Error(`${route} does not have exactly one h1.`);
    if (await page.title() !== title || await page.getAttribute('html', 'lang') !== 'en') throw new Error(`${route} is missing title or language metadata.`);
    if (await page.locator('link[rel="canonical"]').getAttribute('href') !== canonical) throw new Error(`${route} has the wrong canonical URL.`);
    for (const selector of ['meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:url"]', 'meta[property="og:image"]', 'meta[name="twitter:title"]', 'meta[name="twitter:description"]', 'meta[name="twitter:image"]']) {
      if (!await page.locator(selector).getAttribute('content')) throw new Error(`${route} is missing ${selector}.`);
    }
    if (await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) throw new Error(`${route} overflows at ${width}px.`);
    if (await page.locator('img:not([alt])').count()) throw new Error(`${route} has an image without alt text.`);
    if (!await page.getByRole('link', { name: 'Built by Param Factory (external)' }).isVisible()) {
      throw new Error(`${route} does not identify the Param Factory link as external.`);
    }
    await page.addScriptTag({ path: axePath });
    const violations = await page.evaluate(async () => (await globalThis.axe.run()).violations
      .filter((violation) => ['serious', 'critical'].includes(violation.impact))
      .map((violation) => violation.id));
    if (violations.length) throw new Error(`${route} has serious/critical axe violations: ${violations.join(', ')}`);
  }
  checkingExpected404 = false;

  await page.addInitScript(() => {
    let cancellations = 0;
    class DemoUtterance {
      rate = 1;
      onend = null;
      onerror = null;
      constructor(text) { this.text = text; }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: DemoUtterance });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { cancel: () => { cancellations += 1; }, speak: () => undefined },
    });
    window.__listenBackDemoCancellations = () => cancellations;
  });
  await page.goto(`${baseUrl}/demo?demo=1`);
  const readControl = page.getByRole('button', { name: 'Read highlighted sentence' });
  if (!await readControl.isVisible()) throw new Error('Demo does not expose the read control immediately.');
  const activeSentence = page.locator('[aria-current="true"]');
  if (!await activeSentence.isVisible()) throw new Error('Demo does not expose the marked sentence immediately.');
  if (width <= 390) {
    const activeBox = await activeSentence.boundingBox();
    if (!activeBox || activeBox.y < 0 || activeBox.y + activeBox.height > height) throw new Error('Demo marked sentence is outside the first mobile viewport.');
  }
  await readControl.click();
  const cancellationsBeforeReset = await page.evaluate(() => window.__listenBackDemoCancellations());
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.waitForFunction(() => document.querySelector('.counter')?.textContent?.includes('Sentence 1 / 5'));
  if (await page.evaluate(() => window.__listenBackDemoCancellations()) <= cancellationsBeforeReset) throw new Error('Demo reset did not cancel speech.');
  await page.getByRole('button', { name: 'Read highlighted sentence' }).click();
  const cancellationsBeforeInstall = await page.evaluate(() => window.__listenBackDemoCancellations());
  await page.getByRole('button', { name: 'Install the extension' }).click();
  await page.waitForFunction(() => document.activeElement?.id === 'install-heading');
  if (await page.evaluate(() => window.__listenBackDemoCancellations()) <= cancellationsBeforeInstall) throw new Error('Demo exit did not cancel speech.');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await page.waitForFunction(() => document.activeElement === document.querySelector('main h1'));
  await page.goBack();
  await page.waitForFunction(() => document.activeElement?.id === 'nav-privacy');
  await page.goForward();
  await page.waitForFunction(() => document.activeElement === document.querySelector('main h1'));
  await page.goBack();
  await page.waitForFunction(() => document.activeElement?.id === 'nav-privacy');
  for (const from of ['/demo?demo=1', '/privacy', '/terms']) {
    await page.goto(`${baseUrl}${from}`);
    await page.getByRole('link', { name: 'How it works' }).click();
    if (new URL(page.url()).pathname !== '/') throw new Error(`How it works did not return home from ${from}.`);
    await page.waitForFunction(() => document.activeElement?.id === 'how-heading');
  }
  await page.goto(`${baseUrl}/`);
  await page.locator('#nav-how').focus();
  await page.locator('#nav-how').click();
  await page.waitForFunction(() => document.activeElement?.id === 'how-heading');
  await page.goBack();
  await page.waitForFunction(() => document.activeElement?.id === 'nav-how');
  await page.goForward();
  await page.waitForFunction(() => document.activeElement?.id === 'how-heading');

  await page.goto(`${baseUrl}/`);
  await page.locator('#footer-privacy').scrollIntoViewIfNeeded();
  await page.locator('#footer-privacy').focus();
  const footerScroll = await page.evaluate(() => scrollY);
  await page.locator('#footer-privacy').click();
  await page.waitForFunction(() => document.activeElement?.id === 'privacy-heading');
  await page.goBack();
  await page.waitForFunction(() => document.activeElement?.id === 'footer-privacy');
  const restoredScroll = await page.evaluate(() => scrollY);
  if (Math.abs(restoredScroll - footerScroll) > 2) throw new Error(`Back restored scroll ${restoredScroll}, expected ${footerScroll}.`);

  await page.goto(`${baseUrl}/`);
  const compatibility = page.getByText('Extension requires desktop Chrome or Chromium; the demo works on mobile.');
  if (!await compatibility.isVisible()) throw new Error('The first screen does not disclose desktop-only extension support.');
  if (width <= 390) {
    const box = await compatibility.boundingBox();
    if (!box || box.y + box.height > height) throw new Error('The desktop-only disclosure is below the first mobile viewport.');
  }
  const smallTargets = await page.locator('a:visible, button:visible').evaluateAll((elements) => elements
    .map((element) => ({ label: element.getAttribute('aria-label') || element.textContent?.trim(), width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height }))
    .filter(({ width: targetWidth, height: targetHeight }) => targetWidth < 44 || targetHeight < 44));
  if (smallTargets.length) throw new Error(`Touch targets below 44px at ${width}px: ${JSON.stringify(smallTargets)}`);

  await context.setOffline(true);
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await page.getByRole('heading', { level: 1, name: 'How Listen Back handles article text.' }).waitFor();
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
