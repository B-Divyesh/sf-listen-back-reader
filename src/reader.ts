import { readableSourceUnits, readableText } from './source-range';

export type Sentence = { id: number; text: string };

/** Splits visible prose into speakable chunks without changing source text. */
export function splitSentences(text: string): Sentence[] {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (!compact) return [];

  const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
  const segmented = [...segmenter.segment(compact)]
    .map(({ segment }) => segment.trim())
    .filter(Boolean);

  // V8 treats an honorific as a complete sentence. Join it to the following
  // segment so a reader hears "Dr. Smith", rather than an isolated "Dr.".
  const pieces: string[] = [];
  for (const segment of segmented) {
    const previous = pieces.at(-1);
    if (previous && /(?:(?:^|\s)(?:Mr|Mrs|Ms|Mx|Dr|Prof|Sr|Jr|St|Mt|Capt|Gen|Lt|Col|Sgt|Rev|Hon)\.|(?:[A-Z]\.){2,})$/.test(previous)) {
      pieces[pieces.length - 1] = `${previous} ${segment}`;
    } else {
      pieces.push(segment);
    }
  }

  // Sentence boundaries may vary across browser engines. Never let a
  // segmenter result omit or rewrite normalized source characters.
  const lossless = pieces.join(' ') === compact ? pieces : [compact];
  return lossless.map((part, id) => ({ id, text: part }));
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
  const source = pageSourceElement();
  return source ? readableText(source) : '';
}

export function pageSourceElement(): Element | null {
  return document.querySelector('article, [role="main"], main') || document.body;
}

/**
 * Split each visible prose block independently. This protects a source-unit
 * boundary in minified article HTML and keeps every spoken sentence mappable.
 */
export function pageSentences(): Sentence[] {
  const source = pageSourceElement();
  if (!source) return [];
  return readableSourceUnits(source)
    .flatMap(({ text }) => splitSentences(text))
    .map(({ text }, id) => ({ id, text }));
}

export function speakSentence(text: string, rate = 1, speech: SpeechSynthesis = window.speechSynthesis): SpeechSynthesisUtterance {
  speech.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  speech.speak(utterance);
  return utterance;
}
