// @vitest-environment node
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

type DemoPage = { context: BrowserContext; page: Page; requests: string[] };

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

async function openDemo(): Promise<DemoPage> {
  const context = await browser.newContext();
  const requests: string[] = [];
  context.on('request', (request) => requests.push(request.url()));
  const page = await context.newPage();
  await page.addInitScript(() => {
    const calls: Array<{ text: string; rate: number }> = [];
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
      value: { cancel: () => undefined, speak: (utterance: DemoUtterance) => calls.push({ text: utterance.text, rate: utterance.rate }) },
    });
    (window as unknown as Window & { __listenBackSpeechCalls: Array<{ text: string; rate: number }> }).__listenBackSpeechCalls = calls;
  });
  await page.goto(`${baseUrl}/?demo=1`);
  return { context, page, requests };
}

describe('browser demo sandbox', () => {
  it('enters the isolated sample directly from ?demo=1 and keeps reading controls in the first mobile view', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    try {
      await page.goto(`${baseUrl}/?demo=1`);
      expect(await page.getByText('Demo — sample data, nothing is saved.').isVisible()).toBe(true);
      const control = page.getByRole('button', { name: 'Read highlighted sentence' });
      expect(await control.isVisible()).toBe(true);
      const controlBox = await control.boundingBox();
      expect((controlBox?.y ?? 844) + (controlBox?.height ?? 0)).toBeLessThan(844);
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
      await expect(page.locator('[aria-current="true"]').innerText()).resolves.toBe('Patel said the $2.4 million proposal uses existing staff schedules, not new surveillance software.');
      await page.getByRole('button', { name: 'Next sentence' }).click();
      expect(await page.getByText('Sentence 4 / 5').isVisible()).toBe(true);
      await expect(page.locator('[aria-current="true"]').innerText()).resolves.toBe('The U.S. Census Bureau estimates that 38% of nearby households have no quiet room for study.');
      expect(await page.locator('[aria-current="true"]').count()).toBe(1);
    } finally { await context.close(); }
  });

  it('@claim:local-speech gives the visible demo sentence to the browser voice', async () => {
    const { context, page } = await openDemo();
    try {
      const visibleSentence = await page.locator('[aria-current="true"]').innerText();
      await page.getByRole('button', { name: 'Read highlighted sentence' }).click();
      await page.waitForFunction(() => (window as unknown as Window & { __listenBackSpeechCalls: unknown[] }).__listenBackSpeechCalls.length === 1);
      await expect(page.evaluate(() => (window as unknown as Window & { __listenBackSpeechCalls: Array<{ text: string; rate: number }> }).__listenBackSpeechCalls[0])).resolves.toEqual({ text: visibleSentence, rate: 1 });
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
      expect(await page.getByText('Sentence 4 / 5').isVisible()).toBe(true);
      await page.getByRole('button', { name: 'Previous sentence' }).click();
      expect(await page.getByText('Sentence 3 / 5').isVisible()).toBe(true);
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
