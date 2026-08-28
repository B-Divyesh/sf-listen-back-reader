import { clampIndex, nextIndex, pageText, previousIndex, splitSentences } from '../src/reader';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    if (document.documentElement.getAttribute('data-listen-back')) return;
    document.documentElement.setAttribute('data-listen-back', 'ready');
    const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content')?.toLowerCase() || '';
    const copyRestricted = robots.includes('noarchive') || Boolean(document.querySelector('[data-listen-back-no-copy]'));
    const sentences = splitSentences(pageText());
    let current = 0;
    let rate = 1;
    let marker: HTMLDivElement | undefined;
    let activeElement: Element | undefined;

    const ensureMarker = () => {
      if (marker) return marker;
      marker = document.createElement('div');
      marker.id = 'listen-back-marker';
      marker.setAttribute('role', 'status');
      marker.setAttribute('aria-live', 'polite');
      marker.setAttribute('aria-label', 'Current sentence marker');
      marker.style.cssText = [
        'position:absolute', 'z-index:2147483647', 'pointer-events:none', 'border-left:8px solid #c2410c',
        'background:repeating-radial-gradient(circle at 3px 3px, rgba(194,65,12,.20) 0 1px, transparent 1.5px 7px)',
        'outline:2px solid rgba(194,65,12,.7)', 'border-radius:5px', 'transition:opacity .18s ease, transform .18s ease',
      ].join(';');
      document.body.append(marker);
      return marker;
    };

    const findElement = (text: string) => {
      const nodes = [...document.querySelectorAll('p, li, blockquote, h1, h2, h3')];
      return nodes.find((node) => node.textContent?.replace(/\s+/g, ' ').includes(text.slice(0, 36)));
    };

    const mark = () => {
      const sentence = sentences[current];
      if (!sentence) return;
      const el = findElement(sentence.text);
      if (!el) return;
      activeElement = el;
      const rect = el.getBoundingClientRect();
      const layer = ensureMarker();
      Object.assign(layer.style, {
        top: `${window.scrollY + rect.top - 4}px`, left: `${window.scrollX + rect.left - 9}px`,
        width: `${rect.width + 18}px`, height: `${rect.height + 8}px`,
      });
      el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    };

    const stop = () => speechSynthesis.cancel();
    const speak = () => {
      const sentence = sentences[current];
      if (!sentence) return;
      stop(); mark();
      const utterance = new SpeechSynthesisUtterance(sentence.text);
      utterance.rate = rate;
      utterance.onend = () => document.dispatchEvent(new CustomEvent('listen-back-ended'));
      speechSynthesis.speak(utterance);
    };
    const sendState = () => browser.runtime.sendMessage({ type: 'listen-back-state', count: sentences.length, current, text: sentences[current]?.text || '', rate }).catch(() => undefined);

    browser.runtime.onMessage.addListener((message) => {
      if (message?.type === 'listen-back-command') {
        if (copyRestricted) return { error: 'This page asks readers not to copy its text. Listen Back will not read it.' };
        if (!sentences.length) return { error: 'No readable text found on this page.' };
        if (message.command === 'next_sentence') current = nextIndex(current, sentences.length);
        if (message.command === 'previous_sentence') current = previousIndex(current, sentences.length);
        if (message.command === 'replay_sentence') speak();
        sendState(); mark();
      }
      if (message?.type === 'listen-back-control') {
        if (copyRestricted) return { error: 'This page asks readers not to copy its text. Listen Back will not read it.' };
        if (message.action === 'start' || message.action === 'replay') speak();
        if (message.action === 'pause') stop();
        if (message.action === 'next') { current = nextIndex(current, sentences.length); speak(); }
        if (message.action === 'previous') { current = previousIndex(current, sentences.length); speak(); }
        if (message.action === 'slow') { rate = rate === .8 ? 1 : .8; speak(); }
        if (typeof message.index === 'number') { current = clampIndex(message.index, sentences.length); mark(); }
        sendState();
      }
      if (message?.type === 'listen-back-get-state') return copyRestricted ? { count: 0, current: 0, text: '', rate, error: 'This page asks readers not to copy its text. Listen Back will not read it.' } : { count: sentences.length, current, text: sentences[current]?.text || '', rate };
    });

    document.addEventListener('keydown', (event) => {
      if (!event.altKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key.toLowerCase() === 'r') { event.preventDefault(); speak(); sendState(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); current = nextIndex(current, sentences.length); speak(); sendState(); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); current = previousIndex(current, sentences.length); speak(); sendState(); }
    });
  },
});
