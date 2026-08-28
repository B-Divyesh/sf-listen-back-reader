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
      constructor(text: string) { this.text = text; }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: DemoUtterance });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { cancel: () => undefined, speak: (utterance: DemoUtterance) => calls.push({ text: utterance.text, rate: utterance.rate }) },
    });
    (window as unknown as Window & { __listenBackSpeechCalls: Array<{ text: string; rate: number }> }).__listenBackSpeechCalls = calls;
  });
  await page.goto(`${baseUrl}/demo`);
  return { context, page, requests };
}

describe('browser demo sandbox', () => {
  it('reads exactly one source sentence per step in the sample', async () => {
    const { context, page } = await openDemo();
    try {
      await expect(page.locator('.sample-text p').allTextContents()).resolves.toEqual([
        'A dense page asks readers to hold several ideas at once.',
        "When attention slips, starting at the paragraph's beginning wastes energy.",
        'Listen Back Reader holds one sentence in view.',
        'Replay it, slow it down, or move forward when you are ready.',
        'The source page stays the source.',
      ]);
      await expect(page.locator('[aria-current="true"]').innerText()).resolves.toBe('Listen Back Reader holds one sentence in view.');
      await page.getByRole('button', { name: 'Next sentence' }).click();
      expect(await page.getByText('Sentence 4 / 5').isVisible()).toBe(true);
      await expect(page.locator('[aria-current="true"]').innerText()).resolves.toBe('Replay it, slow it down, or move forward when you are ready.');
      expect(await page.locator('[aria-current="true"]').count()).toBe(1);
    } finally { await context.close(); }
  });

  it('@claim:local-speech gives the visible demo sentence to the browser voice', async () => {
    const { context, page } = await openDemo();
    try {
      const visibleSentence = await page.locator('[aria-current="true"]').innerText();
      await page.getByRole('button', { name: 'Read sentence' }).click();
      await page.waitForFunction(() => (window as unknown as Window & { __listenBackSpeechCalls: unknown[] }).__listenBackSpeechCalls.length === 1);
      await expect(page.evaluate(() => (window as unknown as Window & { __listenBackSpeechCalls: Array<{ text: string; rate: number }> }).__listenBackSpeechCalls[0])).resolves.toEqual({ text: visibleSentence, rate: 1 });
    } finally { await context.close(); }
  });

  it('@claim:local-text keeps demo reading and network requests on this origin', async () => {
    const { context, page, requests } = await openDemo();
    try {
      await page.getByRole('button', { name: 'Read sentence' }).click();
      await page.getByRole('button', { name: 'Next sentence' }).click();
      expect(requests.length).toBeGreaterThan(0);
      expect(requests.every((url) => new URL(url).origin === new URL(baseUrl).origin)).toBe(true);
    } finally { await context.close(); }
  });

  it('@claim:free-account-free opens the complete sample without sign-in or payment', async () => {
    const { context, page, requests } = await openDemo();
    try {
      expect(await page.getByRole('heading', { level: 1, name: 'Hear one sentence at a time.' }).isVisible()).toBe(true);
      expect(await page.getByRole('button', { name: 'Read sentence' }).isEnabled()).toBe(true);
      expect(await page.locator('form, [href*="login"], [href*="sign-in"], [href*="checkout"], [href*="billing"]').count()).toBe(0);
      await page.getByRole('button', { name: 'Start for real' }).click();
      expect(await page.getByText('Free and account-free.').isVisible()).toBe(true);
      expect(await page.getByRole('link', { name: 'Download extension zip' }).getAttribute('href')).toBe('/downloads/listen-back-reader.zip');
      expect(requests.every((url) => new URL(url).origin === new URL(baseUrl).origin)).toBe(true);
    } finally { await context.close(); }
  });

  it('@claim:demo-not-saved keeps sample controls out of browser storage', async () => {
    const { context, page, requests } = await openDemo();
    try {
      await page.getByRole('button', { name: 'Slow' }).click();
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
});
