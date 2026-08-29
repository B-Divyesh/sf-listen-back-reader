// @vitest-environment node
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

type DemoPage = { context: BrowserContext; page: Page; requests: string[] };
type DemoOptions = { viewport?: { width: number; height: number }; path?: string };

let server: ViteDevServer;
let browser: Browser;
let baseUrl = '';

beforeAll(async () => {
  server = await createServer({ configFile: 'vite.config.ts', clearScreen: false });
  await server.listen();
  baseUrl = server.resolvedUrls?.local?.[0]?.replace(/\/$/, '') ?? 'http://localhost:5173';
  browser = await chromium.launch({ headless: true });
}, 30_000);

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

async function openDemo({ viewport, path = '/demo?demo=1' }: DemoOptions = {}): Promise<DemoPage> {
  const context = await browser.newContext({ viewport });
  const requests: string[] = [];
  context.on('request', (request) => requests.push(request.url()));
  const page = await context.newPage();
  await page.addInitScript(() => {
    const calls: Array<{ text: string; rate: number }> = [];
    let cancellations = 0;
    class DemoUtterance {
      text: string;
      rate = 1;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) { this.text = text; }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: DemoUtterance });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        cancel: () => { cancellations += 1; },
        speak: (utterance: DemoUtterance) => calls.push({ text: utterance.text, rate: utterance.rate }),
      },
    });
    (window as unknown as Window & {
      __listenBackSpeech: { calls: Array<{ text: string; rate: number }>; cancellations: () => number };
    }).__listenBackSpeech = { calls, cancellations: () => cancellations };
  });
  await page.goto(`${baseUrl}${path}`);
  return { context, page, requests };
}

describe('browser demo sandbox', () => {
  it('@claim:mobile-demo keeps the marked sentence, controls, reset, and install exit usable at 390px', async () => {
    const { context, page } = await openDemo({ viewport: { width: 390, height: 844 } });
    try {
      expect(await page.getByText('Demo — sample data, nothing is saved.').isVisible()).toBe(true);
      const control = page.getByRole('button', { name: 'Read highlighted sentence' });
      expect(await control.isVisible()).toBe(true);
      const controlBox = await control.boundingBox();
      expect((controlBox?.y ?? 844) + (controlBox?.height ?? 0)).toBeLessThan(844);
      expect(await page.getByText('Sentence 1 / 5').isVisible()).toBe(true);
      const active = page.locator('[aria-current="true"]');
      await expect(active.innerText()).resolves.toBe("On 14 March 2026, Dr. Mira Patel presented the city library's new late-hours plan to the East Ward council.");
      const activeBox = await active.boundingBox();
      expect(activeBox?.y).toBeGreaterThanOrEqual(0);
      expect((activeBox?.y ?? 844) + (activeBox?.height ?? 1)).toBeLessThanOrEqual(844);

      await control.click();
      await page.waitForFunction(() => (window as unknown as Window & { __listenBackSpeech: { calls: unknown[] } }).__listenBackSpeech.calls.length === 1);
      const beforeReset = await page.evaluate(() => (window as unknown as Window & { __listenBackSpeech: { cancellations: () => number } }).__listenBackSpeech.cancellations());
      await page.getByRole('button', { name: 'Reset demo' }).click();
      await expect(page.getByText('Sentence 1 / 5').isVisible()).resolves.toBe(true);
      await expect(page.getByRole('button', { name: 'Read highlighted sentence' }).isVisible()).resolves.toBe(true);
      await expect(page.locator('[aria-current="true"]').innerText()).resolves.toContain('Dr. Mira Patel');
      expect(await page.evaluate(() => (window as unknown as Window & { __listenBackSpeech: { cancellations: () => number } }).__listenBackSpeech.cancellations())).toBeGreaterThan(beforeReset);

      await page.getByRole('button', { name: 'Read highlighted sentence' }).click();
      await page.waitForFunction(() => (window as unknown as Window & { __listenBackSpeech: { calls: unknown[] } }).__listenBackSpeech.calls.length === 2);
      const beforeInstall = await page.evaluate(() => (window as unknown as Window & { __listenBackSpeech: { cancellations: () => number } }).__listenBackSpeech.cancellations());
      await page.getByRole('button', { name: 'Install the extension' }).click();
      await page.waitForFunction(() => document.activeElement?.id === 'install-heading');
      expect(page.url()).toBe(`${baseUrl}/#install`);
      expect(await page.evaluate(() => (window as unknown as Window & { __listenBackSpeech: { cancellations: () => number } }).__listenBackSpeech.cancellations())).toBeGreaterThan(beforeInstall);
    } finally { await context.close(); }
  });

  it('opens the isolated sample in one click from the landing action', async () => {
    const { context, page } = await openDemo({ viewport: { width: 390, height: 844 }, path: '/' });
    try {
      await page.getByRole('link', { name: 'Try it with sample data' }).click();
      expect(page.url()).toBe(`${baseUrl}/demo?demo=1`);
      await expect(page.getByText('Demo — sample data, nothing is saved.').isVisible()).resolves.toBe(true);
      await expect(page.locator('[aria-current="true"]').innerText()).resolves.toContain('Dr. Mira Patel');
    } finally { await context.close(); }
  });

  it('reads exactly one source sentence per step in the sample', async () => {
    const { context, page } = await openDemo();
    try {
      await expect(page.locator('.sample-text p').allTextContents()).resolves.toEqual([
        "On 14 March 2026, Dr. Mira Patel presented the city library's new late-hours plan to the East Ward council.",
        'The pilot keeps the study floor open until 9 p.m. on Tuesdays and Thursdays for six weeks.',
        'Patel said the $2.4 million proposal uses existing staff schedules, not new surveillance software.',
        'The U.S. Census Bureau estimates that 38% of nearby households have no quiet room for study.',
        'Council members will vote after the public comment session on 2 April.',
      ]);
      await expect(page.locator('[aria-current="true"]').innerText()).resolves.toBe("On 14 March 2026, Dr. Mira Patel presented the city library's new late-hours plan to the East Ward council.");
      await page.getByRole('button', { name: 'Next sentence' }).click();
      expect(await page.getByText('Sentence 2 / 5').isVisible()).toBe(true);
      await expect(page.locator('[aria-current="true"]').innerText()).resolves.toBe('The pilot keeps the study floor open until 9 p.m. on Tuesdays and Thursdays for six weeks.');
      expect(await page.locator('[aria-current="true"]').count()).toBe(1);
    } finally { await context.close(); }
  });

  it('@claim:local-speech gives the visible demo sentence to the browser voice', async () => {
    const { context, page } = await openDemo();
    try {
      const visibleSentence = await page.locator('[aria-current="true"]').innerText();
      await page.getByRole('button', { name: 'Read highlighted sentence' }).click();
      await page.waitForFunction(() => (window as unknown as Window & { __listenBackSpeech: { calls: unknown[] } }).__listenBackSpeech.calls.length === 1);
      await expect(page.evaluate(() => (window as unknown as Window & { __listenBackSpeech: { calls: Array<{ text: string; rate: number }> } }).__listenBackSpeech.calls[0])).resolves.toEqual({ text: visibleSentence, rate: 1 });
    } finally { await context.close(); }
  });

  it('@claim:local-text sends no article text to a Listen Back server', async () => {
    const { context, page, requests } = await openDemo();
    try {
      await page.waitForLoadState('networkidle');
      requests.length = 0;
      await page.getByRole('button', { name: 'Read highlighted sentence' }).click();
      await page.getByRole('button', { name: 'Next sentence' }).click();
      expect(requests).toEqual([]);
    } finally { await context.close(); }
  });

  it('keeps the demo controls working after the site goes offline', async () => {
    const { context, page } = await openDemo();
    try {
      await context.setOffline(true);
      await page.getByRole('button', { name: 'Next sentence' }).click();
      expect(await page.getByText('Sentence 2 / 5').isVisible()).toBe(true);
      await page.getByRole('button', { name: 'Previous sentence' }).click();
      expect(await page.getByText('Sentence 1 / 5').isVisible()).toBe(true);
    } finally { await context.close(); }
  });

  it('@claim:free-account-free opens the complete sample without sign-in or payment', async () => {
    const { context, page, requests } = await openDemo();
    try {
      expect(await page.getByRole('heading', { level: 1, name: 'Read one highlighted sentence.' }).isVisible()).toBe(true);
      expect(await page.getByRole('button', { name: 'Read highlighted sentence' }).isEnabled()).toBe(true);
      expect(await page.locator('form, [href*="login"], [href*="sign-in"], [href*="checkout"], [href*="billing"]').count()).toBe(0);
      await page.getByRole('button', { name: 'Install the extension' }).click();
      expect(await page.getByText('Free and account-free.').isVisible()).toBe(true);
      expect(await page.getByRole('link', { name: 'Download extension zip' }).getAttribute('href')).toBe('/downloads/listen-back-reader.zip');
      expect(requests.every((url) => new URL(url).origin === new URL(baseUrl).origin)).toBe(true);
    } finally { await context.close(); }
  });

  it('@claim:demo-not-saved keeps sample controls out of browser storage', async () => {
    const { context, page, requests } = await openDemo();
    try {
      await page.getByRole('button', { name: 'Use 0.8× speed' }).click();
      await page.getByRole('button', { name: 'Reset demo' }).click();
      await page.reload();
      const storage = await page.evaluate(async () => ({
        local: Object.keys(localStorage),
        session: Object.keys(sessionStorage),
        databases: 'databases' in indexedDB ? (await indexedDB.databases()).map((database) => database.name) : [],
      }));
      expect(storage).toEqual({ local: [], session: [], databases: [] });
      expect(requests.every((url) => new URL(url).origin === new URL(baseUrl).origin)).toBe(true);
    } finally { await context.close(); }
  });

  it('moves focus to the destination heading after SPA navigation', async () => {
    const { context, page } = await openDemo();
    try {
      await page.getByRole('link', { name: 'Privacy' }).first().click();
      expect(page.url()).toBe(`${baseUrl}/privacy`);
      expect(await page.locator('h1').evaluate((heading) => document.activeElement === heading)).toBe(true);
    } finally { await context.close(); }
  });

  it('reports unavailable speech and an utterance error without leaving a false reading state', async () => {
    const unavailableContext = await browser.newContext();
    const unavailable = await unavailableContext.newPage();
    await unavailable.addInitScript(() => {
      Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: undefined });
    });
    try {
      await unavailable.goto(`${baseUrl}/?demo=1`);
      await unavailable.getByRole('button', { name: 'Read highlighted sentence' }).click();
      await expect(unavailable.getByText('Speech is unavailable. Enable a browser voice, then try again.').isVisible()).resolves.toBe(true);
      await expect(unavailable.getByRole('button', { name: 'Read highlighted sentence' }).isVisible()).resolves.toBe(true);
    } finally { await unavailableContext.close(); }

    const errorContext = await browser.newContext();
    const errorPage = await errorContext.newPage();
    await errorPage.addInitScript(() => {
      class ErrorUtterance {
        rate = 1;
        onend: (() => void) | null = null;
        onerror: (() => void) | null = null;
        constructor(public text: string) {}
      }
      Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: ErrorUtterance });
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: { cancel: () => undefined, speak: (utterance: ErrorUtterance) => utterance.onerror?.() },
      });
    });
    try {
      await errorPage.goto(`${baseUrl}/?demo=1`);
      await errorPage.getByRole('button', { name: 'Read highlighted sentence' }).click();
      await expect(errorPage.getByText('The browser voice could not read this sentence. Enable a browser voice, then try again.').isVisible()).resolves.toBe(true);
      await expect(errorPage.getByRole('button', { name: 'Read highlighted sentence' }).isVisible()).resolves.toBe(true);
    } finally { await errorContext.close(); }
  });

  it('stops demo speech and restores the read action', async () => {
    const { context, page } = await openDemo();
    try {
      await page.getByRole('button', { name: 'Read highlighted sentence' }).click();
      await page.getByRole('button', { name: 'Stop reading' }).click();
      await expect(page.getByText('Reading stopped.').isVisible()).resolves.toBe(true);
      await expect(page.getByRole('button', { name: 'Read highlighted sentence' }).isVisible()).resolves.toBe(true);
    } finally { await context.close(); }
  });
});
