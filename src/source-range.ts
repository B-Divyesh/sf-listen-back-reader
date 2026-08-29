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

function mappedText(element: Element): MappedText {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const characters: MappedCharacter[] = [];
  const normalized: string[] = [];
  let pendingWhitespace: MappedCharacter | undefined;
  let node = walker.nextNode() as Text | null;

  while (node) {
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
  const descendants = [...root.querySelectorAll<HTMLElement>(proseSelector)];
  const leaves = descendants.filter((element) => !element.querySelector(proseSelector));
  if (leaves.length) return leaves;
  return root instanceof HTMLElement ? [root] : [];
}

/**
 * Maps normalized reader sentences back onto their exact source text nodes.
 * The ranges do not wrap or replace source content, so links and selection
 * remain usable while the visual overlay is present.
 */
export function locateSentenceSources(sentences: string[], root: Element): Array<SentenceSource | undefined> {
  const elements = proseElements(root).map((element) => ({ element, mapped: mappedText(element) }));
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
