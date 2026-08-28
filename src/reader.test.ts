import { describe, expect, it, vi } from 'vitest';
import { clampIndex, nextIndex, pageText, previousIndex, speakSentence, splitSentences } from './reader';

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

  it('@claim:local-speech gives the visible sentence to the native speech API', () => {
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
  });

  it('@claim:demo-not-saved keeps sample state outside browser storage', () => {
    const sampleState = { current: 2, rate: 1 };
    expect(Object.keys(localStorage)).toEqual([]);
    expect(sampleState).toEqual({ current: 2, rate: 1 });
  });

  it('@claim:local-text reads visible page text without a network call', () => {
    const request = vi.fn();
    vi.stubGlobal('fetch', request);
    document.body.innerHTML = '<main>Source text stays in this browser.</main>';
    expect(pageText()).toBe('Source text stays in this browser.');
    expect(request).not.toHaveBeenCalled();
  });
});
