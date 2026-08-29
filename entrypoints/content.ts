import { clampIndex, nextIndex, pageSourceElement, pageText, previousIndex, splitSentences } from '../src/reader';
import { copyRestrictedMessage, isCopyRestricted } from '../src/page-policy';
import { readerShortcutCommand, runReaderShortcut, type ReaderCommand } from '../src/reader-shortcuts';
import { locateSentenceSources } from '../src/source-range';

export default defineContentScript({
  registration: 'runtime',
  runAt: 'document_idle',
  main() {
    if (document.documentElement.getAttribute('data-listen-back')) return;
    document.documentElement.setAttribute('data-listen-back', 'ready');
    const copyRestricted = isCopyRestricted(document);
    const sentences = copyRestricted ? [] : splitSentences(pageText());
    const sourceElement = pageSourceElement();
    const sources = sourceElement ? locateSentenceSources(sentences.map(({ text }) => text), sourceElement) : [];
    const initialSentence = () => {
      const selection = document.getSelection();
      if (selection?.rangeCount && selection.anchorNode?.isConnected) {
        const chosen = selection.getRangeAt(0);
        const selected = sources.findIndex((source) => Boolean(source && (source.range.intersectsNode(chosen.startContainer) || source.range.intersectsNode(chosen.endContainer))));
        if (selected >= 0) return selected;
      }
      const centre = window.innerHeight / 2;
      let nearest = 0;
      let distance = Number.POSITIVE_INFINITY;
      sources.forEach((source, index) => {
        if (!source) return;
        const { range } = source;
        const rects = typeof range.getClientRects === 'function' ? [...range.getClientRects()] : [];
        if (!rects.length) return;
        const top = Math.min(...rects.map((rect) => rect.top));
        const bottom = Math.max(...rects.map((rect) => rect.bottom));
        const candidate = centre < top ? top - centre : centre > bottom ? centre - bottom : 0;
        if (candidate < distance) { distance = candidate; nearest = index; }
      });
      return nearest;
    };
    let current = initialSentence();
    let rate = 1;
    let marker: HTMLDivElement | undefined;
    let observedElement: Element | undefined;
    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => mark()) : undefined;

    const ensureMarker = () => {
      if (marker) return marker;
      marker = document.createElement('div');
      marker.id = 'listen-back-marker';
      marker.setAttribute('role', 'status');
      marker.setAttribute('aria-live', 'polite');
      marker.setAttribute('aria-label', 'Current sentence marker');
      marker.style.cssText = [
        'position:absolute', 'z-index:2147483647', 'pointer-events:none', 'overflow:visible',
        `transition:${matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'top .18s ease, left .18s ease, width .18s ease, height .18s ease'}`,
      ].join(';');
      document.body.append(marker);
      return marker;
    };

    const mark = () => {
      const sentence = sentences[current];
      if (!sentence) return;
      const source = sources[current];
      if (!source) {
        resizeObserver?.disconnect();
        observedElement = undefined;
        marker?.remove();
        marker = undefined;
        return;
      }
      if (source.element !== observedElement) {
        resizeObserver?.disconnect();
        resizeObserver?.observe(source.element);
        observedElement = source.element;
      }
      const clientRects = typeof source.range.getClientRects === 'function'
        ? [...source.range.getClientRects()].filter(({ width, height }) => width > 0 && height > 0)
        : [];
      if (!clientRects.length) {
        marker?.remove();
        marker = undefined;
        return;
      }
      const expanded = clientRects.map((rect) => ({
        left: rect.left - 7,
        top: rect.top - 2,
        right: rect.right + 2,
        bottom: rect.bottom + 2,
      }));
      const bounds = {
        left: Math.min(...expanded.map(({ left }) => left)),
        top: Math.min(...expanded.map(({ top }) => top)),
        right: Math.max(...expanded.map(({ right }) => right)),
        bottom: Math.max(...expanded.map(({ bottom }) => bottom)),
      };
      const layer = ensureMarker();
      layer.setAttribute('aria-label', `Current sentence: ${sentence.text}`);
      layer.replaceChildren(...expanded.map((rect) => {
        const visibleRange = document.createElement('span');
        visibleRange.dataset.listenBackRange = '';
        visibleRange.setAttribute('aria-hidden', 'true');
        Object.assign(visibleRange.style, {
          position: 'absolute',
          left: `${rect.left - bounds.left}px`,
          top: `${rect.top - bounds.top}px`,
          width: `${rect.right - rect.left}px`,
          height: `${rect.bottom - rect.top}px`,
          borderLeft: '7px solid #c2410c',
          borderRadius: '4px',
          background: 'repeating-radial-gradient(circle at 3px 3px, rgba(194,65,12,.20) 0 1px, transparent 1.5px 7px)',
          outline: '2px solid rgba(194,65,12,.7)',
          boxSizing: 'border-box',
        });
        return visibleRange;
      }));
      Object.assign(layer.style, {
        top: `${window.scrollY + bounds.top}px`,
        left: `${window.scrollX + bounds.left}px`,
        width: `${bounds.right - bounds.left}px`,
        height: `${bounds.bottom - bounds.top}px`,
      });
      layer.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    };

    window.addEventListener('resize', mark, { passive: true });

    let speaking = false;
    let speechError = '';
    const state = () => ({
      count: sentences.length,
      current,
      text: sentences[current]?.text || '',
      rate,
      speaking,
      speechError,
    });
    const sendState = () => browser.runtime.sendMessage({ type: 'listen-back-state', ...state() }).catch(() => undefined);
    const stop = () => {
      speechSynthesis.cancel();
      speaking = false;
      marker?.setAttribute('data-listen-back-speaking', 'false');
      sendState();
    };
    const speak = () => {
      const sentence = sentences[current];
      if (!sentence) return;
      speechSynthesis.cancel();
      speechError = '';
      mark();
      const utterance = new SpeechSynthesisUtterance(sentence.text);
      utterance.rate = rate;
      utterance.onend = () => {
        speaking = false;
        marker?.setAttribute('data-listen-back-speaking', 'false');
        sendState();
        document.dispatchEvent(new CustomEvent('listen-back-ended'));
      };
      utterance.onerror = () => {
        speaking = false;
        marker?.setAttribute('data-listen-back-speaking', 'false');
        speechError = 'The browser voice could not read this sentence. Enable a browser voice, then try again.';
        sendState();
      };
      speaking = true;
      marker?.setAttribute('data-listen-back-speaking', 'true');
      try {
        speechSynthesis.speak(utterance);
      } catch {
        speaking = false;
        marker?.setAttribute('data-listen-back-speaking', 'false');
        speechError = 'The browser voice could not read this sentence. Enable a browser voice, then try again.';
      }
    };

    const runCommand = (command: ReaderCommand, speakAfterMove = false) => {
      if (command === 'next_sentence') current = nextIndex(current, sentences.length);
      if (command === 'previous_sentence') current = previousIndex(current, sentences.length);
      if (command === 'replay_sentence' || speakAfterMove) speak();
      sendState(); mark();
    };

    browser.runtime.onMessage.addListener((message: unknown) => {
      const request = message as { type?: string; command?: ReaderCommand; action?: string; index?: number };
      if (request.type === 'listen-back-command') {
        if (copyRestricted) return { error: copyRestrictedMessage };
        if (!sentences.length) return { error: 'No readable text found on this page.' };
        if (request.command) runCommand(request.command, true);
      }
      if (request.type === 'listen-back-control') {
        if (copyRestricted) return { error: copyRestrictedMessage };
        if (request.action === 'start' || request.action === 'replay') speak();
        if (request.action === 'stop' || request.action === 'pause') stop();
        if (request.action === 'next') { current = nextIndex(current, sentences.length); speak(); }
        if (request.action === 'previous') { current = previousIndex(current, sentences.length); speak(); }
        if (request.action === 'slow') { rate = rate === .8 ? 1 : .8; speak(); }
        if (typeof request.index === 'number') { current = clampIndex(request.index, sentences.length); mark(); }
        sendState();
        return state();
      }
      if (request.type === 'listen-back-get-state') return copyRestricted ? { ...state(), count: 0, text: '', error: copyRestrictedMessage } : state();
    });

    document.addEventListener('keydown', (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const command = readerShortcutCommand(event);
      if (!command) return;
      event.preventDefault();
      runReaderShortcut(command, copyRestricted, (shortcut) => {
        if (!sentences.length) return;
        runCommand(shortcut, true);
      });
    });
  },
});
