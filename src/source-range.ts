export type SentenceSource = {
  element: HTMLElement;
  range: Range;
};

type Boundary = {
  node: Text;
  offset: number;
};

type MappedCharacter = {
  start: Boundary;
  end: Boundary;
};

type MappedText = {
  text: string;
  characters: MappedCharacter[];
};

const proseSelector = 'p, li, blockquote, h1, h2, h3, h4, h5, h6';

function isVisible(element: Element): boolean {
  if (element.closest('[hidden], [aria-hidden="true"], script, style, template, noscript')) return false;
  for (let current: Element | null = element; current; current = current.parentElement) {
    if (!(current instanceof HTMLElement) || current.hidden) return false;
    const style = getComputedStyle(current);
    if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') return false;
  }
  return true;
}

function mappedText(element: Element): MappedText {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const characters: MappedCharacter[] = [];
  const normalized: string[] = [];
  let pendingWhitespace: MappedCharacter | undefined;
  let node = walker.nextNode() as Text | null;

  while (node) {
    if (!node.parentElement || !isVisible(node.parentElement)) {
      node = walker.nextNode() as Text | null;
      continue;
    }
    for (let offset = 0; offset < node.data.length; offset += 1) {
      const value = node.data[offset]!;
      const boundary = { node, offset };
      if (/\s/.test(value)) {
        if (normalized.length) {
          pendingWhitespace ??= { start: boundary, end: { node, offset: offset + 1 } };
          pendingWhitespace.end = { node, offset: offset + 1 };
        }
        continue;
      }

      if (pendingWhitespace) {
        normalized.push(' ');
        characters.push(pendingWhitespace);
        pendingWhitespace = undefined;
      }
      normalized.push(value);
      characters.push({ start: boundary, end: { node, offset: offset + 1 } });
    }
    node = walker.nextNode() as Text | null;
  }

  return { text: normalized.join(''), characters };
}

function proseElements(root: Element): HTMLElement[] {
  const descendants = [...root.querySelectorAll<HTMLElement>(proseSelector)].filter(isVisible);
  const leaves = descendants.filter((element) => ![...element.querySelectorAll<HTMLElement>(proseSelector)].some(isVisible));
  if (leaves.length) return leaves;
  return root instanceof HTMLElement && isVisible(root) ? [root] : [];
}

function mappedProse(root: Element) {
  return proseElements(root)
    .map((element) => ({ element, mapped: mappedText(element) }))
    .filter(({ mapped }) => Boolean(mapped.text));
}

/**
 * Returns the ordered, visible reading units used for both speech and source
 * markers. Each block boundary stays explicit, even in minified HTML.
 */
export function readableSourceUnits(root: Element): Array<{ element: HTMLElement; text: string }> {
  return mappedProse(root).map(({ element, mapped }) => ({ element, text: mapped.text }));
}

/** Normalized visible article text with a space at each prose-block boundary. */
export function readableText(root: Element): string {
  return readableSourceUnits(root).map(({ text }) => text).join(' ');
}

/**
 * Maps normalized reader sentences back onto their exact source text nodes.
 * The ranges do not wrap or replace source content, so links and selection
 * remain usable while the visual overlay is present.
 */
export function locateSentenceSources(sentences: string[], root: Element): Array<SentenceSource | undefined> {
  const elements = mappedProse(root);
  const located: Array<SentenceSource | undefined> = [];
  let elementIndex = 0;
  let textOffset = 0;

  for (const sentence of sentences) {
    let source: SentenceSource | undefined;
    for (let index = elementIndex; index < elements.length; index += 1) {
      const candidate = elements[index];
      if (!candidate) continue;
      const from = index === elementIndex ? textOffset : 0;
      const start = candidate.mapped.text.indexOf(sentence, from);
      if (start < 0) continue;

      const first = candidate.mapped.characters[start];
      const last = candidate.mapped.characters[start + sentence.length - 1];
      if (!first || !last) continue;
      const range = document.createRange();
      range.setStart(first.start.node, first.start.offset);
      range.setEnd(last.end.node, last.end.offset);
      source = { element: candidate.element, range };
      elementIndex = index;
      textOffset = start + sentence.length;
      break;
    }
    located.push(source);
  }

  return located;
}
