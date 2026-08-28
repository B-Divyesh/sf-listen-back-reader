import { describe, expect, it, vi } from 'vitest';
import { clampIndex, nextIndex, pageText, previousIndex, speakSentence, splitSentences } from './reader';
import { isCopyRestricted } from './page-policy';
import { readerShortcutCommand, runReaderShortcut } from './reader-shortcuts';

describe('sentence reading loop', () => {
  it('@claim:sentence-loop keeps source punctuation and makes one sentence per step', () => {
    expect(splitSentences('First source sentence. Second source sentence! Last one?')).toEqual([
      { id: 0, text: 'First source sentence.' },
      { id: 1, text: 'Second source sentence!' },
      { id: 2, text: 'Last one?' },
    ]);
  });

  it('does not leave the available sentence range', () => {
    expect(nextIndex(2, 3)).toBe(2);
    expect(previousIndex(0, 3)).toBe(0);
    expect(clampIndex(3, 3)).toBe(2);
  });

  it('@claim:reader-controls supports replay and slower speech without changing the sentence', () => {
    vi.stubGlobal('SpeechSynthesisUtterance', class {
      text: string;
      rate = 1;
      constructor(text: string) { this.text = text; }
    });
    const speech = { cancel: vi.fn(), speak: vi.fn() } as unknown as SpeechSynthesis;
    const utterance = speakSentence('Keep this sentence.', 0.8, speech);
    expect(speech.cancel).toHaveBeenCalledOnce();
    expect(speech.speak).toHaveBeenCalledWith(utterance);
    expect(utterance.text).toBe('Keep this sentence.');
    expect(utterance.rate).toBe(0.8);
    expect(previousIndex(1, 3)).toBe(0);
    expect(nextIndex(1, 3)).toBe(2);
  });

  it('@claim:readable-text finds readable article text before surrounding page chrome', () => {
    const request = vi.fn();
    vi.stubGlobal('fetch', request);
    document.body.innerHTML = '<nav>Navigation words.</nav><article>Source text stays in this browser.</article><aside>Related links.</aside>';
    expect(pageText()).toBe('Source text stays in this browser.');
    expect(request).not.toHaveBeenCalled();
  });
});

describe('protected page policy', () => {
  it('@claim:protected-pages blocks Alt+R before the no-copy page can create a marker or speak', () => {
    document.head.innerHTML = '<meta name="robots" content="index, noarchive">';
    const perform = vi.fn();
    const command = readerShortcutCommand({ altKey: true, key: 'r' });

    expect(isCopyRestricted(document)).toBe(true);
    expect(runReaderShortcut(command, true, perform)).toBe(false);
    expect(perform).not.toHaveBeenCalled();
  });

  it('@claim:keyboard-shortcuts recognises replay, previous, and next shortcuts', () => {
    const perform = vi.fn();
    expect(runReaderShortcut(readerShortcutCommand({ altKey: true, key: 'r' }), false, perform)).toBe(true);
    expect(runReaderShortcut(readerShortcutCommand({ altKey: true, key: 'ArrowLeft' }), false, perform)).toBe(true);
    expect(runReaderShortcut(readerShortcutCommand({ altKey: true, key: 'ArrowRight' }), false, perform)).toBe(true);
    expect(perform.mock.calls.map(([command]) => command)).toEqual([
      'replay_sentence',
      'previous_sentence',
      'next_sentence',
    ]);
  });
});

describe('content-script protected-page keyboard regression', () => {
  it('does not mark or speak a noarchive page after Alt+R', async () => {
    document.documentElement.removeAttribute('data-listen-back');
    document.head.innerHTML = '<meta name="robots" content="noarchive">';
    document.body.innerHTML = '<main><p>A protected source sentence.</p></main>';

    let main: (() => void) | undefined;
    const speak = vi.fn();
    vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), speak });
    vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(public text: string) {} });
    vi.stubGlobal('browser', {
      runtime: {
        onMessage: { addListener: vi.fn() },
        sendMessage: vi.fn(() => Promise.resolve()),
      },
    });
    vi.stubGlobal('defineContentScript', (definition: { main: () => void }) => {
      main = definition.main;
      return definition;
    });

    vi.resetModules();
    await import('../entrypoints/content');
    expect(main).toBeTypeOf('function');
    main?.();

    const shortcut = new KeyboardEvent('keydown', { altKey: true, key: 'r', bubbles: true, cancelable: true });
    document.dispatchEvent(shortcut);

    expect(shortcut.defaultPrevented).toBe(true);
    expect(document.querySelector('#listen-back-marker')).toBeNull();
    expect(speak).not.toHaveBeenCalled();
  });

  it('@claim:source-marker marks the source element for the sentence it reads', async () => {
    document.documentElement.removeAttribute('data-listen-back');
    document.head.innerHTML = '';
    document.body.innerHTML = '<main><p>First source sentence.</p> <p>Second source sentence.</p></main>';

    let main: (() => void) | undefined;
    const speak = vi.fn();
    vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), speak });
    vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(public text: string) {} });
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    HTMLElement.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal('browser', {
      runtime: {
        onMessage: { addListener: vi.fn() },
        sendMessage: vi.fn(() => Promise.resolve()),
      },
    });
    vi.stubGlobal('defineContentScript', (definition: { main: () => void }) => {
      main = definition.main;
      return definition;
    });

    vi.resetModules();
    await import('../entrypoints/content');
    main?.();
    document.dispatchEvent(new KeyboardEvent('keydown', { altKey: true, key: 'r', bubbles: true, cancelable: true }));

    const marker = document.querySelector<HTMLElement>('#listen-back-marker');
    expect(marker?.getAttribute('aria-label')).toBe('Current sentence marker');
    expect(marker?.style.borderLeft).toContain('8px');
    expect(speak).toHaveBeenCalledOnce();
    expect((speak.mock.calls[0]?.[0] as { text: string }).text).toBe('First source sentence.');
  });
});
