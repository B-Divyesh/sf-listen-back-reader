import { describe, expect, it, vi } from 'vitest';
import { clampIndex, nextIndex, pageSentences, pageText, previousIndex, speakSentence, splitSentences } from './reader';
import { isCopyRestricted } from './page-policy';
import { readerShortcutCommand, runReaderShortcut } from './reader-shortcuts';

describe('sentence reading loop', () => {
  it('keeps source punctuation and makes one sentence per step', () => {
    expect(splitSentences('First source sentence. Second source sentence! Last one?')).toEqual([
      { id: 0, text: 'First source sentence.' },
      { id: 1, text: 'Second source sentence!' },
      { id: 2, text: 'Last one?' },
    ]);
  });

  it('never drops text around abbreviations, initialisms, or decimals', () => {
    const source = 'Dr. Smith reviewed the report at 3 p.m. Then she approved it. The U.S. team met. Next item. A decimal is 3.14. Done.';
    const sentences = splitSentences(source);

    expect(sentences.map(({ text }) => text)).toEqual([
      'Dr. Smith reviewed the report at 3 p.m.',
      'Then she approved it.',
      'The U.S. team met.',
      'Next item.',
      'A decimal is 3.14.',
      'Done.',
    ]);
    expect(sentences.map(({ text }) => text).join(' ')).toBe(source);
  });

  it('keeps an initialism joined when it is followed by a capitalized name', () => {
    expect(splitSentences('The U.S. Census Bureau released a report. Readers discussed it.').map(({ text }) => text)).toEqual([
      'The U.S. Census Bureau released a report.',
      'Readers discussed it.',
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

  it('@claim:readable-text finds ordered visible article blocks before surrounding page chrome', () => {
    const request = vi.fn();
    vi.stubGlobal('fetch', request);
    document.body.innerHTML = '<nav>Navigation words.</nav><article><h1>Library update</h1><p>First paragraph ends here.</p><p>Second <em>paragraph starts</em> here.</p><p hidden>Hidden advertising sentence.</p><p style="display:none">CSS-hidden advertising sentence.</p><p aria-hidden="true">Assistive-hidden advertising sentence.</p><p>Third paragraph closes here.</p></article><aside>Related links.</aside>';
    expect(pageText()).toBe('Library update First paragraph ends here. Second paragraph starts here. Third paragraph closes here.');
    expect(pageSentences().map(({ text }) => text)).toEqual([
      'Library update',
      'First paragraph ends here.',
      'Second paragraph starts here.',
      'Third paragraph closes here.',
    ]);
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
  it('cancels active speech when Stop reading is used', async () => {
    document.documentElement.removeAttribute('data-listen-back');
    document.head.innerHTML = '';
    document.body.innerHTML = '<main><p>One sentence to stop.</p></main>';

    let main: (() => void) | undefined;
    let receive: ((message: unknown) => unknown) | undefined;
    const cancel = vi.fn();
    vi.stubGlobal('speechSynthesis', { cancel, speak: vi.fn() });
    vi.stubGlobal('SpeechSynthesisUtterance', class { rate = 1; onend?: () => void; onerror?: () => void; constructor(public text: string) {} });
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    HTMLElement.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal('browser', {
      runtime: {
        onMessage: { addListener: vi.fn((listener) => { receive = listener; }) },
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
    const started = receive?.({ type: 'listen-back-control', action: 'start' }) as { speaking: boolean };
    cancel.mockClear();
    const stopped = receive?.({ type: 'listen-back-control', action: 'stop' }) as { speaking: boolean };

    expect(started.speaking).toBe(true);
    expect(cancel).toHaveBeenCalledOnce();
    expect(stopped.speaking).toBe(false);
  });

  it('@claim:sentence-loop supplies every normalized source character to speech across dense punctuation', async () => {
    document.documentElement.removeAttribute('data-listen-back');
    document.head.innerHTML = '';
    document.body.innerHTML = '<main><p>Dr. Smith reviewed the report at 3 p.m. Then she approved it. The U.S. team met. Next item. A decimal is 3.14. Done.</p></main>';

    let main: (() => void) | undefined;
    let receive: ((message: unknown) => unknown) | undefined;
    const speak = vi.fn();
    vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), speak });
    vi.stubGlobal('SpeechSynthesisUtterance', class { rate = 1; onend?: () => void; constructor(public text: string) {} });
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    HTMLElement.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal('browser', {
      runtime: {
        onMessage: { addListener: vi.fn((listener) => { receive = listener; }) },
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
    const state = receive?.({ type: 'listen-back-get-state' }) as { count: number };
    receive?.({ type: 'listen-back-control', action: 'start' });
    for (let index = 1; index < state.count; index += 1) {
      receive?.({ type: 'listen-back-control', action: 'next' });
    }

    const normalized = pageText();
    const spoken = speak.mock.calls.map(([utterance]) => (utterance as { text: string }).text);
    expect(spoken).toHaveLength(state.count);
    expect(spoken.join(' ')).toBe(normalized);
    expect(spoken).toEqual([
      'Dr. Smith reviewed the report at 3 p.m.',
      'Then she approved it.',
      'The U.S. team met.',
      'Next item.',
      'A decimal is 3.14.',
      'Done.',
    ]);
  });

  it('does not mark or speak a noarchive page after Alt+R', async () => {
    document.documentElement.removeAttribute('data-listen-back');
    document.head.innerHTML = '<meta name="robots" content="noarchive">';
    document.body.innerHTML = '<main><p>A protected source sentence.</p></main>';

    let main: (() => void) | undefined;
    let receive: ((message: unknown) => unknown) | undefined;
    const speak = vi.fn();
    vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), speak });
    vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(public text: string) {} });
    vi.stubGlobal('browser', {
      runtime: {
        onMessage: { addListener: vi.fn((listener) => { receive = listener; }) },
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
    const response = receive?.({ type: 'listen-back-command', command: 'replay_sentence' });

    expect(response).toEqual({ error: 'This page asks readers not to copy its text. Listen Back will not read it.' });
    expect(document.querySelector('#listen-back-marker')).toBeNull();
    expect(speak).not.toHaveBeenCalled();
  });

  it('marks the exact source range for each sentence inside one paragraph', async () => {
    document.documentElement.removeAttribute('data-listen-back');
    document.head.innerHTML = '';
    document.body.innerHTML = '<main><p>First sentence is brief. Second <em>sentence is the current</em> reading target. Third sentence closes the paragraph.</p></main>';
    const selectedText = document.querySelector('p')?.firstChild;
    if (selectedText) {
      const selection = document.getSelection();
      const range = document.createRange();
      range.setStart(selectedText, 0);
      range.setEnd(selectedText, 'First sentence is brief.'.length);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    let main: (() => void) | undefined;
    let receive: ((message: unknown) => unknown) | undefined;
    const speak = vi.fn();
    vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), speak });
    vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(public text: string) {} });
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    HTMLElement.prototype.scrollIntoView = vi.fn();
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value(this: Range) {
        const geometry: Record<string, [number, number, number, number][]> = {
          'First sentence is brief.': [[10, 20, 180, 24]],
          'Second sentence is the current reading target.': [[10, 50, 210, 24], [10, 74, 90, 24]],
          'Third sentence closes the paragraph.': [[100, 74, 160, 24], [10, 98, 130, 24]],
        };
        return (geometry[this.toString()] ?? []).map(([left, top, width, height]) => ({
          left, top, width, height, right: left + width, bottom: top + height,
        }));
      },
    });
    vi.stubGlobal('browser', {
      runtime: {
        onMessage: { addListener: vi.fn((listener) => { receive = listener; }) },
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
    receive?.({ type: 'listen-back-control', action: 'start' });

    const marker = document.querySelector<HTMLElement>('#listen-back-marker');
    expect(marker?.getAttribute('aria-label')).toBe('Current sentence: First sentence is brief.');
    expect(marker?.querySelectorAll('[data-listen-back-range]')).toHaveLength(1);
    const firstGeometry = [marker?.style.left, marker?.style.top, marker?.style.width, marker?.style.height];

    receive?.({ type: 'listen-back-control', action: 'next' });
    expect(marker?.getAttribute('aria-label')).toBe('Current sentence: Second sentence is the current reading target.');
    expect(marker?.querySelectorAll('[data-listen-back-range]')).toHaveLength(2);
    const secondGeometry = [marker?.style.left, marker?.style.top, marker?.style.width, marker?.style.height];
    expect(secondGeometry).not.toEqual(firstGeometry);

    receive?.({ type: 'listen-back-control', action: 'next' });
    expect(marker?.getAttribute('aria-label')).toBe('Current sentence: Third sentence closes the paragraph.');
    expect(marker?.querySelectorAll('[data-listen-back-range]')).toHaveLength(2);
    expect([marker?.style.left, marker?.style.top, marker?.style.width, marker?.style.height]).not.toEqual(secondGeometry);

    receive?.({ type: 'listen-back-control', action: 'previous' });
    expect([marker?.style.left, marker?.style.top, marker?.style.width, marker?.style.height]).toEqual(secondGeometry);
    receive?.({ type: 'listen-back-control', action: 'previous' });
    expect([marker?.style.left, marker?.style.top, marker?.style.width, marker?.style.height]).toEqual(firstGeometry);
    expect(speak.mock.calls.map(([utterance]) => (utterance as { text: string }).text)).toEqual([
      'First sentence is brief.',
      'Second sentence is the current reading target.',
      'Third sentence closes the paragraph.',
      'Second sentence is the current reading target.',
      'First sentence is brief.',
    ]);
  });
});
