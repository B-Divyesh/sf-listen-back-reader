export type Sentence = { id: number; text: string };

/** Splits visible prose into speakable chunks without changing source text. */
export function splitSentences(text: string): Sentence[] {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (!compact) return [];
  const pieces = compact.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g) ?? [compact];
  return pieces.map((part, id) => ({ id, text: part.trim() })).filter((item) => item.text.length > 0);
}

export function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(index, Math.max(0, length - 1)));
}

export function nextIndex(index: number, length: number): number {
  return clampIndex(index + 1, length);
}

export function previousIndex(index: number, length: number): number {
  return clampIndex(index - 1, length);
}

export function pageText(): string {
  const article = document.querySelector('article, [role="main"], main');
  return (article?.textContent || document.body?.innerText || '').replace(/\s+/g, ' ').trim();
}

export function speakSentence(text: string, rate = 1, speech: SpeechSynthesis = window.speechSynthesis): SpeechSynthesisUtterance {
  speech.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  speech.speak(utterance);
  return utterance;
}
